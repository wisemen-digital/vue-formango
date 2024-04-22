import type { ComputedRef, MaybeRefOrGetter, UnwrapRef } from 'vue'
import { computed, reactive, ref, toValue, watch } from 'vue'
import { z } from 'zod'
import deepClone from 'deep-clone'
import type { DeepPartial, Field, FieldArray, Form, MaybePromise, NullableKeys, Path, Register, RegisterArray, Unregister } from '../types'
import { generateId, get, set, unset } from '../utils'
import { registerFieldWithDevTools, registerFormWithDevTools, unregisterFieldWithDevTools } from '../devtools/devtools'

interface UseFormReturnType<TSchema extends z.ZodType> {
  /**
   * Called when the form is valid and submitted.
   * @param data The current form data.
   */
  onSubmitForm: (cb: (data: z.infer<TSchema>) => void) => void
  /**
   * The form instance itself.
   */
  form: Form<TSchema>
}

interface UseFormOptions<TSchema extends z.ZodType> {
  schema: TSchema
  initialState?: MaybeRefOrGetter<NullableKeys<z.infer<TSchema>>>
}

export function useForm<TSchema extends z.ZodType>(
  {
    schema,
    initialState,
  }: UseFormOptions<TSchema>): UseFormReturnType<TSchema> {
  // Generate a unique id for the form
  // Used in devtools
  const formId = generateId()

  // The current state of the form
  // When a field is registered, it will be added to this object
  // The form will only be submitted if this state matches the schema
  const form = reactive<DeepPartial<z.infer<TSchema>>>({} as DeepPartial<z.infer<TSchema>>)

  // The errors of the form
  const errors = ref<z.ZodFormattedError<TSchema>>({} as z.ZodFormattedError<TSchema>)

  let onSubmitCb: ((data: z.infer<TSchema>) => MaybePromise<void>) | null = null

  const isSubmitting = ref<boolean>(false)
  const hasAttemptedToSubmit = ref<boolean>(false)

  // The initial state of the form
  // This is used to keep track of whether a field has been modified (isDirty)
  const initialFormState = ref<DeepPartial<z.infer<TSchema>> | null>(initialState ? deepClone(toValue(initialState)) : null)

  // Tracks all the registered paths (id, path)
  const paths = reactive(new Map<string, string>())

  // Tracks all the paths by id with a computed value
  // Because of how Vue works, we need to track the computed value
  // Otherwise, when a component is unmounted, the computed value will be lost
  const trackedDepencies = reactive(new Map<string, ComputedRef<unknown>>())

  // Tracks all the registered fields
  // Used so that we don't need to re-register a field when it is already registered
  const registeredFields = reactive(new Map<string, Field<any, any>>())
  const registeredFieldArrays = reactive(new Map<string, FieldArray<any>>())

  if (initialState != null)
    Object.assign(form, deepClone(toValue(initialState)))

  const isDirty = computed<boolean>(() => {
    return [
      ...registeredFields.values(),
      ...registeredFieldArrays.values(),
    ].some(field => field.isDirty)
  })

  const isValid = computed<boolean>(() => Object.keys(errors.value).length === 0)

  watch(() => initialState, (newInitialState) => {
    if (!isDirty.value && newInitialState != null) {
      initialFormState.value = deepClone(toValue(newInitialState))
      Object.assign(form, deepClone(toValue(newInitialState)))
    }
  }, {
    deep: true,
  })

  const getIdByPath = (
    paths: Map<string, string>,
    path: string,
  ): string | null => [...paths.entries()].find(([, p]) => p === path)?.[0] ?? null

  const getIsTrackedbyId = (
    trackedDepencies: Map<string, ComputedRef<unknown>>,
    pathId: string,
  ): boolean => trackedDepencies.get(pathId)?.effect.active ?? false

  // form.register('array.0')
  // form.register('array.1')
  // form.unregister('array.0') --> array.1 is now array.0
  // form.register('array.1') --> should work since array.1 -> array.0
  const updatePaths = (path: string): void => {
    const isArray = !Number.isNaN(path.split('.').pop())

    if (isArray) {
      const index = parseInt(path.split('.').pop() ?? '0', 10)
      const parentPath = path.split('.').slice(0, -1).join('.')

      // Find all paths that start with the parent path
      const matchingPaths = [...paths.entries()].filter(([, p]) => p.startsWith(parentPath))

      for (const [id, p] of matchingPaths) {
        // Only update paths that have a number after the parent path
        if (!p.startsWith(`${parentPath}.`))
          continue

        // Only keep the number part of the path, in case there are other characters after it
        const i = parseInt(p.replace(`${parentPath}.`, ''), 10)

        if (i > index) {
          const newPath = `${parentPath}.${i - 1}`
          const suffixPath = p.slice(newPath.length)

          paths.set(id, `${newPath}${suffixPath}`)
        }
        else if (i === index) {
          paths.delete(id)
        }
      }
    }
    else {
      const id = getIdByPath(paths, path) ?? null

      if (id === null)
        throw new Error('Path not found')

      paths.delete(id)
    }
  }

  const getChildPaths = (path: string): (Field<any, any> | FieldArray<any>)[] => {
    return [
      ...registeredFields.values(),
      ...registeredFieldArrays.values(),
    ].filter((field) => {
      return field._path?.startsWith(path) && field._path !== path
    })
  }

  const createField = (
    id: string,
    path: string,
    defaultOrExistingValue: unknown,
  ): Field<any, any> => {
    const field = reactive<Field<any, any>>({
      '_id': id,
      '_path': path,
      'isValid': false,
      '_isTouched': false,
      'isDirty': false,
      'isTouched': false,
      'isChanged': false,
      'modelValue': defaultOrExistingValue,
      'errors': undefined,
      'onUpdate:modelValue': (newValue) => {
        set(form, field._path as string, newValue)
      },
      'onBlur': () => {
        field._isTouched = true
      },
      'onChange': () => {
        field.isChanged = true
      },
      'setValue': (newValue) => {
        field['onUpdate:modelValue'](newValue)
      },
      'register': (childPath, defaultValue) => {
        const currentPath = paths.get(id) as string
        const fullPath = `${currentPath}.${childPath}` as Path<TSchema>

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return register(fullPath, defaultValue) as Field<any, any>
      },
      'registerArray': (childPath, defaultValue) => {
        const currentPath = paths.get(id) as string

        const fullPath = `${currentPath}.${childPath}` as Path<TSchema>

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return registerArray(fullPath, defaultValue) as FieldArray<any>
      },
    })

    return field
  }

  const createFieldArray = (
    id: string,
    path: string,
    defaultOrExistingValue: unknown[],
  ): FieldArray<any> => {
    const fields = reactive<string[]>([])

    for (let i = 0; i < defaultOrExistingValue.length; i++) {
      const fieldId = generateId()
      fields.push(fieldId)
    }

    const insert = (index: number, value: unknown) => {
      const path = paths.get(id) as string

      fields[index] = generateId()
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      register(`${path}.${index}` as Path<TSchema>, value as any)
    }

    const remove = (index: number): void => {
      const currentPath = paths.get(id) as string

      fields.splice(index, 1)

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      unregister(`${currentPath}.${index}` as Path<TSchema>)
    }

    const prepend = (value: unknown): void => {
      insert(0, value)
    }

    const append = (value: unknown): void => {
      insert(fields.length, value)
    }

    const pop = (): void => {
      remove(fields.length - 1)
    }

    const shift = (): void => {
      remove(0)
    }

    const move = (from: number, to: number): void => {
      [fields[from], fields[to]] = [fields[to], fields[from]]

      const currentPath = paths.get(id) as string

      const currentValue = get(form, currentPath)
      const value = currentValue[from]

      currentValue[from] = currentValue[to]
      currentValue[to] = value

      set(form, currentPath, currentValue)

      const fromPath = `${currentPath}.${from}`
      const toPath = `${currentPath}.${to}`

      const fromId = getIdByPath(paths, fromPath)
      const toId = getIdByPath(paths, toPath)

      if (fromId === null || toId === null)
        throw new Error('Path not found')

      for (const [id, p] of paths.entries()) {
        if (p.startsWith(fromPath)) {
          const newPath = p.replace(fromPath, toPath)
          paths.set(id, newPath)
        }
        else if (p.startsWith(toPath)) {
          const newPath = p.replace(toPath, fromPath)
          paths.set(id, newPath)
        }
      }

      paths.set(fromId, toPath)
      paths.set(toId, fromPath)
    }

    const empty = (): void => {
      for (let i = fields.length - 1; i >= 0; i--)
        remove(i)
    }

    const setValue = (value: unknown): void => {
      empty()

      for (const arrayValue of value as unknown[])
        append(arrayValue)
    }

    const fieldArray = reactive<FieldArray<any>>({
      _id: id,
      _path: path,
      isValid: false,
      isDirty: false,
      isTouched: false,
      modelValue: defaultOrExistingValue,
      errors: undefined,
      append,
      fields,
      insert,
      pop,
      prepend,
      remove,
      shift,
      move,
      empty,
      setValue,
      register: (childPath, defaultValue) => {
        const currentPath = paths.get(id) as string
        const fullPath = `${currentPath}.${childPath}` as Path<TSchema>

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return register(fullPath, defaultValue) as Field<any, any>
      },
      registerArray: (childPath) => {
        const currentPath = paths.get(id) as string

        const fullPath = `${currentPath}.${childPath}` as Path<TSchema>

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return registerArray(fullPath) as FieldArray<any>
      },
    })

    return fieldArray
  }

  const isField = (field: Field<any, any> | FieldArray<any>): field is Field<any, any> => {
    return (field as Field<any, any>)._isTouched !== undefined
  }

  const getFieldWithTrackedDepencies = <TFieldArray extends Field<any, any> | FieldArray<any>>(
    field: TFieldArray,
    initialValue: unknown,
  ): TFieldArray => {
    const parsedStringifiedInitialValue = JSON.parse(JSON.stringify(initialValue))

    field._path = computed<string | null>(() => {
      const path = paths.get(field._id) ?? null

      return path
    }) as unknown as string | null

    field.modelValue = computed<unknown>(() => {
      if (field._path === null)
        return null

      return get(form, field._path)
    })

    field.isValid = computed<boolean>(() => {
      if (field._path === null)
        return false

      return get(errors.value, field._path) === undefined
    }) as unknown as boolean

    field.isDirty = computed<boolean>(() => {
      if (field._path === null)
        return false

      const initialValue = get(initialFormState.value, field._path) ?? parsedStringifiedInitialValue

      // if (field.modelValue instanceof File) {
      //   const currentFile = field.modelValue
      //   const initialFile = initialValue as File | null

      //   return currentFile.name !== initialFile?.name
      // }

      if (field.modelValue === '' && initialValue === null)
        return false

      return JSON.stringify(field.modelValue) !== JSON.stringify(initialValue)
    }) as unknown as boolean

    field.isTouched = computed<boolean>(() => {
      if (field._path === null)
        return false

      const children = getChildPaths(field._path)

      const areAnyOfItsChildrenTouched = children.some(child => child.isTouched)

      if (areAnyOfItsChildrenTouched)
        return true

      if (isField(field))
        return field._isTouched

      return false
    }) as unknown as boolean

    field.errors = computed<z.ZodFormattedError<TSchema>>(() => {
      if (field._path === null)
        return {}

      return get(errors.value, field._path)
    }) as unknown as z.ZodFormattedError<TSchema>

    return field
  }

  const registerParentPaths = (path: string): void => {
    const pathParts = path.split('.')

    for (let i = pathParts.length - 1; i >= 0; i--) {
      const part = pathParts[i]

      if (!isNaN(Number(part))) {
        const arrayPath = pathParts.slice(0, i + 1).join('.')

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        register(arrayPath as Path<TSchema>)
      }
    }
  }

  const register: Register<TSchema> = (path, defaultValue) => {
    const existingId = getIdByPath(paths, path)

    const clonedDefaultValue = deepClone(defaultValue)

    // Check if the field is already registered
    if (existingId !== null) {
      const field = registeredFields.get(existingId) ?? null

      if (field === null)
        throw new Error(`${path} is already registered as a field array`)

      // If it is, check if it is still being tracked
      const existingTrackedDependency = getIsTrackedbyId(trackedDepencies, existingId)
      // If it is, return the field
      if (existingTrackedDependency)
        return field

      // If it isn't being tracked anymore, retrack it
      return getFieldWithTrackedDepencies(field, clonedDefaultValue ?? null)
    }

    // If it isn't registered, register it

    // Even if the field is not registered, it might already have a value
    const value = get(form, path)

    // If the value is undefined, set it to the default value
    if (value == null)
      set(form, path, clonedDefaultValue ?? null)

    const id = generateId()

    // Track the path
    paths.set(id, path)

    const field = createField(id, path, value)

    // Register the field
    registeredFields.set(id, field)

    // If registered path is child of an array, we also need to register the array index
    // So e.g. if we register `array.0.foo`, we also need to register `array.0`
    // It should work for nested arrays. So e.g. `array.0.test.0.foo` should also register `array.0.test.0`
    registerParentPaths(path)
    registerFieldWithDevTools(formId, field)

    // Track the field
    return getFieldWithTrackedDepencies(field, clonedDefaultValue ?? null)
  }

  const registerArray: RegisterArray<TSchema> = (path, defaultValue) => {
    const existingId = getIdByPath(paths, path)
    const clonedDefaultValue = deepClone(defaultValue)

    // Check if the field is already registered
    if (existingId !== null) {
      // Check if it is registered as a field array
      const fieldArray = registeredFieldArrays.get(existingId) ?? null

      if (fieldArray === null)
        throw new Error(`${path} is already registered as a field`)

      // Check if it is still being tracked
      const existingTrackedDependency = getIsTrackedbyId(trackedDepencies, existingId)

      // If it is, return the field
      if (existingTrackedDependency)
        return fieldArray

      // If it isn't being tracked anymore, retrack it
      return getFieldWithTrackedDepencies(fieldArray, [])
    }

    // If it isn't registered, register it
    // Even if the field is not registered, it might already have a value
    const value = get(form, path)

    // If the value is undefined, set it to the default value
    if (value == null)
      set(form, path, [])

    const id = generateId()

    // Track the path
    paths.set(id, path)

    const fieldArray = createFieldArray(id, path, value ?? [])

    // If a default value is set, register each key
    // If a value already exists, we don't want to overwrite it
    const shouldSetDefaultValue = clonedDefaultValue !== undefined && (value == null || value.length === 0)

    if (shouldSetDefaultValue) {
      const defaultValueAsArray = clonedDefaultValue as unknown[]

      defaultValueAsArray.forEach((value) => {
        fieldArray.append(value)
      })
    }

    // Register the field
    registeredFieldArrays.set(id, fieldArray)

    // If registered path is child of an array, we also need to register the array index
    // So e.g. if we register `array.0.foo`, we also need to register `array.0`
    // It should work for nested arrays. So e.g. `array.0.test.0.foo` should also register `array.0.test.0`
    registerParentPaths(path)

    // Track the field
    return getFieldWithTrackedDepencies(fieldArray, [])
  }

  const unregister: Unregister<TSchema> = (path) => {
    const id = getIdByPath(paths, path)

    unset(form, path)

    if (id === null)
      return

    updatePaths(path)

    registeredFields.delete(id)
    trackedDepencies.delete(id)
    paths.delete(id)
    unregisterFieldWithDevTools(id)
  }

  const blurAll = (): void => {
    for (const field of registeredFields.values())
      field.onBlur()
  }

  const submit = async (): Promise<void> => {
    hasAttemptedToSubmit.value = true

    blurAll()

    if (!isValid.value)
      return

    // We need to keep track of the current form state, because the form might change while submitting
    const currentFormState = deepClone(form)

    isSubmitting.value = true

    if (onSubmitCb == null)
      throw new Error('Attempted to submit form but `onSubmitForm` callback is not registered')

    await onSubmitCb(schema.parse(form))

    initialFormState.value = deepClone(currentFormState)

    isSubmitting.value = false
  }

  const setValues = (values: DeepPartial<z.infer<TSchema>>): void => {
    for (const path in values)
      set(form, path, values[path])
  }

  const addErrors = (err: DeepPartial<z.ZodFormattedError<z.infer<TSchema>>>): void => {
    const mergeErrors = (
      existingErrors: DeepPartial<z.ZodFormattedError<z.infer<TSchema>>>,
      err: DeepPartial<z.ZodFormattedError<z.infer<TSchema>>>,
    ): void => {
      for (const key in err) {
        if (key === '_errors') {
          existingErrors[key] = err[key]
          continue
        }

        if (existingErrors[key] == null) {
          existingErrors[key] = {
            _errors: [],
          } as any
        }

        mergeErrors(existingErrors[key] as any, err[key] as any)
      }
    }

    mergeErrors(
      errors.value as DeepPartial<z.ZodFormattedError<z.infer<TSchema>>>,
      err,
    )
  }

  watch(form, async () => {
    try {
      await schema.parseAsync(form)

      errors.value = {} as UnwrapRef<z.ZodFormattedError<z.infer<TSchema>>>
    }
    catch (e) {
      if (e instanceof z.ZodError)
        errors.value = e.format() as UnwrapRef<z.ZodFormattedError<z.infer<TSchema>>>
    }
  }, {
    deep: true,
    immediate: true,
  })

  const formObject = reactive<any>({
    _id: formId,
    state: form as DeepPartial<z.infer<TSchema>>,
    errors: errors as unknown as z.ZodFormattedError<z.infer<TSchema>>,
    isDirty: isDirty as unknown as boolean,
    isValid: isValid as unknown as boolean,
    isSubmitting: isSubmitting as unknown as boolean,
    hasAttemptedToSubmit: hasAttemptedToSubmit as unknown as boolean,
    register,
    registerArray,
    unregister,
    submit,
    setValues,
    addErrors,
  })

  registerFormWithDevTools(formObject)

  return {
    form: formObject,
    onSubmitForm: (cb: (data: z.infer<TSchema>) => MaybePromise<void>) => {
      onSubmitCb = cb
    },
  }
}
