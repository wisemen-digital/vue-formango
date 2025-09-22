/* eslint-disable unicorn/no-keyword-prefix */
import deepClone from 'clone-deep'
import type {
  ComputedRef,
  MaybeRefOrGetter,
  Ref,
} from 'vue'
import {
  computed,
  ref,
  shallowReactive,
  toValue,
  watch,
} from 'vue'

import {
  registerFieldWithDevTools,
  registerFormWithDevTools,
  unregisterFieldWithDevTools,
} from '../devtools/devtools'
import type {
  DeepPartial,
  Field,
  FieldArray,
  Form,
  FormattedError,
  MaybePromise,
  NestedNullableKeys,
  Path,
  Register,
  RegisterArray,
  StandardSchemaV1,
  Unregister,
} from '../types'
import {
  generateId,
  get,
  isSubPath,
  set,
  unset,
} from '../utils'

interface UseFormOptions<TSchema extends StandardSchemaV1> {
  /**
   * The initial state of the form
   */
  initialState?: MaybeRefOrGetter<NestedNullableKeys<StandardSchemaV1.InferOutput<TSchema>> | null>
  /**
   * The zod schema of the form.
   */
  schema: TSchema
  /**
   * Called when the form is valid and submitted.
   * @param data The current form data.
   */
  onSubmit: (data: StandardSchemaV1.InferOutput<TSchema>) => void
  /**
   * Called when the form is attempted to be submitted, but is invalid.
   * Only called for client-side validation.
   */
  onSubmitError?: ({
    data, errors,
  }: { data: DeepPartial<NestedNullableKeys<StandardSchemaV1.InferOutput<TSchema>>>
    errors: FormattedError<StandardSchemaV1.InferOutput<TSchema>>[] }) => void
}

export function useForm<TSchema extends StandardSchemaV1>(
  {
    initialState,
    schema,
    onSubmit,
    onSubmitError,
  }: UseFormOptions<TSchema>,
): Form<TSchema> {
  // Generate a unique id for the form
  // Used in devtools
  const formId = generateId()
  // The current state of the form
  // When a field is registered, it will be added to this object
  // The form will only be submitted if this state matches the schema
  const form = ref<DeepPartial<StandardSchemaV1.InferOutput<TSchema>>>(
    {} as DeepPartial<StandardSchemaV1.InferOutput<TSchema>>,
  ) as Ref<Record<string, unknown>>

  // The errors of the form
  const rawErrors = ref<readonly StandardSchemaV1.Issue[]>([])
  const formattedErrors = computed<FormattedError<StandardSchemaV1.InferOutput<TSchema>>[]>(() => {
    return rawErrors.value.map((error) => {
      if (error.path == null) {
        return error
      }

      const mappedPath = error.path
        ?.map((item) => (typeof item === 'object' ? item.key : item))
        .join('.')

      return {
        message: error.message,
        path: mappedPath,
      }
    }) as FormattedError<StandardSchemaV1.InferOutput<TSchema>>[]
  })

  const onSubmitCb: ((data: StandardSchemaV1.InferOutput<TSchema>) => MaybePromise<void>) | null = onSubmit
  const onSubmitFormErrorCb: (({
    data, errors,
  }: { data: DeepPartial<NestedNullableKeys<StandardSchemaV1.InferOutput<TSchema>>>
    errors: FormattedError<StandardSchemaV1.InferOutput<TSchema>>[] }) => void) | undefined = onSubmitError

  const isSubmitting = ref<boolean>(false)
  const hasAttemptedToSubmit = ref<boolean>(false)

  // The initial state of the form
  // This is used to keep track of whether a field has been modified (isDirty)
  const initialFormState = ref<DeepPartial<StandardSchemaV1.InferOutput<TSchema>> | null>(initialState
    ? deepClone(toValue(initialState)) as DeepPartial<StandardSchemaV1.InferOutput<TSchema>>
    : null) as Ref<DeepPartial<StandardSchemaV1.InferInput<TSchema>> | null>

  // Tracks all the registered paths (id, path)
  const paths = ref(new Map<string, string>())

  // Tracks all the paths by id with a computed value
  // Because of how Vue works, we need to track the computed value
  // Otherwise, when a component is unmounted, the computed value will be lost
  const trackedDependencies = new Map<string, ComputedRef<unknown>>()

  // Tracks all the registered fields
  // Used so that we don't need to re-register a field when it is already registered
  const registeredFields = shallowReactive(new Map<string, Field<any, any>>())
  const registeredFieldArrays = shallowReactive(new Map<string, FieldArray<any>>())

  if (initialState != null) {
    Object.assign(form.value, deepClone(toValue(initialState)))
  }

  const isDirty = computed<boolean>(() => {
    return [
      ...registeredFields.values(),
      ...registeredFieldArrays.values(),
    ].some((field) => toValue(field.isDirty))
  })

  const isValid = computed<boolean>(() => {
    return rawErrors.value.length === 0
  })

  watch(() => toValue(initialState), (newInitialState) => {
    if (!isDirty.value && newInitialState != null) {
      initialFormState.value = deepClone(toValue(newInitialState)) as DeepPartial<StandardSchemaV1.InferOutput<TSchema>>
      Object.assign(form.value, deepClone(toValue(newInitialState)))
    }
  }, { deep: true })

  function getIdByPath(
    paths: Map<string, string>,
    path: string,
  ): string | null {
    return [
      ...paths.entries(),
    ].find(([
      , p,
    ]) => p === path)?.[0] ?? null
  }

  // form.register('array.0')
  // form.register('array.1')
  // form.unregister('array.0') --> array.1 is now array.0
  // form.register('array.1') --> should work since array.1 -> array.0
  function updatePaths(path: string): void {
    const isArray = !Number.isNaN(path.split('.').pop())

    if (isArray) {
      const index = Number.parseInt(path.split('.').pop() ?? '0', 10)
      const parentPath = path.split('.').slice(0, -1).join('.')

      // Find all paths that start with the parent path
      const matchingPaths = [
        ...paths.value.entries(),
      ].filter(([
        , p,
      ]) => p.startsWith(parentPath))

      for (const [
        id,
        p,
      ] of matchingPaths) {
        // Only update paths that have a number after the parent path
        if (!p.startsWith(`${parentPath}.`)) {
          continue
        }

        // Only keep the number part of the path, in case there are other characters after it
        const i = Number.parseInt(p.replace(`${parentPath}.`, ''), 10)

        if (i > index) {
          const newPath = `${parentPath}.${i - 1}`
          const suffixPath = p.slice(newPath.length)

          paths.value.set(id, `${newPath}${suffixPath}`)
        }
        else if (i === index) {
          paths.value.delete(id)
        }
      }
    }
    else {
      const id = getIdByPath(paths.value, path) ?? null

      if (id === null) {
        throw new Error('Path not found')
      }

      paths.value.delete(id)
    }
  }

  function getChildPaths(path: string): (Field<any, any> | FieldArray<any>)[] {
    return [
      ...registeredFields.values(),
      ...registeredFieldArrays.values(),
    ].filter((field) => {
      if (field._path.value == null) {
        return false
      }

      const { isPart } = isSubPath({
        childPath: field._path.value,
        parentPath: path,
      })

      return isPart
    })
  }

  function createField(
    id: string,
    path: string,
    defaultOrExistingValue: unknown,
  ): Field<any, any> {
    const field: Field<any, any> = {
      '_id': id,
      'isChanged': ref(false),
      'isDirty': computed(() => false),
      'isTouched': computed(() => false),
      'isValid': computed(() => false),
      '_isTouched': ref(false),

      '_path': computed(() => path),
      'blurAll': () => {
        field._isTouched.value = true

        for (const registeredField of [
          ...registeredFields.values(),
        ].filter((registeredField) => {
          if (field._path.value == null || registeredField._path.value == null) {
            return false
          }

          const { isPart } = isSubPath({
            childPath: registeredField._path.value,
            parentPath: field._path.value,
          })

          return isPart
        })) {
          registeredField.blurAll()
        }
      },
      'errors': computed(() => []),
      'modelValue': computed(() => defaultOrExistingValue),
      'rawErrors': computed(() => []),
      'register': (childPath, defaultValue) => {
        const currentPath = paths.value.get(id)
        const fullPath = `${currentPath}.${childPath}` as Path<TSchema>

        // eslint-disable-next-line ts/no-use-before-define
        return register(fullPath, defaultValue) as Field<any, any>
      },
      'registerArray': (childPath, defaultValue) => {
        const currentPath = paths.value.get(id) as string

        const fullPath = `${currentPath}.${childPath}` as Path<StandardSchemaV1.InferOutput<TSchema>>

        // eslint-disable-next-line ts/no-use-before-define
        return registerArray(fullPath, defaultValue) as FieldArray<any>
      },
      'setValue': (newValue) => {
        field['onUpdate:modelValue'](newValue)
      },
      'value': computed(() => defaultOrExistingValue),
      'onBlur': () => {
        field._isTouched.value = true
      },
      'onChange': () => {
        field.isChanged.value = true
      },
      'onUpdate:modelValue': (newValue) => {
        if (field._path.value === null) {
          return
        }

        set(form.value, field._path.value, newValue)
      },
    }

    return field
  }

  function createFieldArray(
    id: string,
    path: string,
    defaultOrExistingValue: unknown[],
  ): FieldArray<any> {
    const fields = ref<string[]>([])

    for (let i = 0; i < defaultOrExistingValue.length; i++) {
      const fieldId = generateId()

      fields.value.push(fieldId)
    }

    function insert(index: number, value: unknown): Field<any, any> {
      const path = paths.value.get(id) as string

      fields.value[index] = generateId()

      // eslint-disable-next-line ts/no-use-before-define
      return register(`${path}.${index}` as Path<TSchema>, value as any)
    }

    function remove(index: number): void {
      const currentPath = paths.value.get(id) as string

      fields.value.splice(index, 1)

      // eslint-disable-next-line ts/no-use-before-define
      unregister(`${currentPath}.${index}` as Path<StandardSchemaV1.InferOutput<TSchema>>)
    }

    function prepend(value: unknown): void {
      insert(0, value)
    }

    function append(value: unknown): Field<any, any> {
      return insert(fields.value.length, value)
    }

    function pop(): void {
      remove(fields.value.length - 1)
    }

    function shift(): void {
      remove(0)
    }

    function move(from: number, to: number): void {
      [
        fields.value[from],
        fields.value[to],
      ] = [
        fields.value[to],
        fields.value[from],
      ]

      const currentPath = paths.value.get(id) as string

      const currentValue = get(form.value, currentPath)
      const value = currentValue[from]

      currentValue[from] = currentValue[to]
      currentValue[to] = value

      set(form.value, currentPath, currentValue)

      const fromPath = `${currentPath}.${from}`
      const toPath = `${currentPath}.${to}`

      const fromId = getIdByPath(paths.value, fromPath)
      const toId = getIdByPath(paths.value, toPath)

      if (fromId === null || toId === null) {
        throw new Error('Path not found')
      }

      for (const [
        id,
        p,
      ] of paths.value.entries()) {
        if (p.startsWith(fromPath)) {
          const newPath = p.replace(fromPath, toPath)

          paths.value.set(id, newPath)
        }
        else if (p.startsWith(toPath)) {
          const newPath = p.replace(toPath, fromPath)

          paths.value.set(id, newPath)
        }
      }

      paths.value.set(fromId, toPath)
      paths.value.set(toId, fromPath)
    }

    function empty(): void {
      for (let i = fields.value.length - 1; i >= 0; i--) {
        remove(i)
      }
    }

    function setValue(value: unknown): void {
      empty()

      for (const arrayValue of value as unknown[]) {
        append(arrayValue)
      }
    }

    const fieldArray: FieldArray<any> = ({
      _id: id,
      isDirty: computed(() => false),
      isTouched: computed(() => false),
      isValid: computed(() => false),
      _path: computed(() => path),
      append,
      blurAll: () => {
        for (const registeredField of [
          ...registeredFields.values(),
        ].filter((registeredField) => {
          if (fieldArray._path.value == null || registeredField._path.value == null) {
            return false
          }

          const { isPart } = isSubPath({
            childPath: registeredField._path.value,
            parentPath: fieldArray._path.value,
          })

          return isPart
        })) {
          registeredField.blurAll()
        }
      },
      empty,
      errors: computed(() => []),
      fields,
      insert,
      modelValue: computed(() => defaultOrExistingValue),
      move,
      pop,
      prepend,
      rawErrors: computed(() => []),
      register: (childPath, defaultValue) => {
        const currentPath = paths.value.get(id) as string
        const fullPath = `${currentPath}.${childPath}` as Path<TSchema>

        for (let i = 0; i <= Number(childPath.split('.').pop()); i += 1) {
          if (fields.value[i] === undefined) {
            fields.value[i] = generateId()
          }
        }

        // eslint-disable-next-line ts/no-use-before-define
        const field = register(fullPath, defaultValue) as Field<any, any>

        return field
      },
      registerArray: (childPath, defaultValue) => {
        const currentPath = paths.value.get(id) as string

        const fullPath = `${currentPath}.${childPath}` as Path<StandardSchemaV1.InferOutput<TSchema>>

        for (let i = 0; i <= Number(childPath.split('.').pop()); i += 1) {
          if (fields.value[i] === undefined) {
            fields.value[i] = generateId()
          }
        }

        // eslint-disable-next-line ts/no-use-before-define
        return registerArray(fullPath, defaultValue) as FieldArray<any>
      },
      remove,
      setValue,
      shift,
      value: computed(() => defaultOrExistingValue),
    })

    return fieldArray
  }

  function isField(field: Field<any, any> | FieldArray<any>): field is Field<any, any> {
    return (field as Field<any, any>)._isTouched !== undefined
  }

  function getFieldWithTrackedDependencies<TFieldArray extends Field<any, any> | FieldArray<any>>(
    field: TFieldArray,
    initialValue: unknown,
  ): TFieldArray {
    const parsedStringifiedInitialValue = JSON.parse(JSON.stringify(initialValue))

    field._path = computed<string | null>(() => {
      const path = paths.value.get(field._id) ?? null

      return path
    })

    field.modelValue = computed<unknown>(() => {
      if (field._path.value === null) {
        return null
      }

      return get(form.value, field._path.value)
    })

    field.value = computed(() => toValue(field.modelValue.value))
    field.isValid = computed<boolean>(() => {
      if (field._path.value === null) {
        return false
      }

      return field.rawErrors.value.length === 0
    })

    field.isDirty = computed<boolean>(() => {
      if (field._path.value === null) {
        return false
      }

      const initialValue = get(initialFormState.value, field._path.value) ?? parsedStringifiedInitialValue

      // if (field.modelValue instanceof File) {
      //   const currentFile = field.modelValue
      //   const initialFile = initialValue as File | null

      //   return currentFile.name !== initialFile?.name
      // }

      if (field.modelValue.value === '' && initialValue === null) {
        return false
      }

      return JSON.stringify(field.modelValue.value) !== JSON.stringify(initialValue)
    })

    field.isTouched = computed<boolean>(() => {
      if (field._path.value === null) {
        return false
      }

      const children = getChildPaths(field._path.value)

      const areAnyOfItsChildrenTouched = children.some((child) => child.isTouched.value)

      if (areAnyOfItsChildrenTouched) {
        return true
      }

      if (isField(field)) {
        return field._isTouched.value
      }

      return false
    })

    field.rawErrors = computed<StandardSchemaV1.Issue[]>(() => {
      if (field._path.value === null) {
        return []
      }

      // Return all errors that have the field path as a prefix
      const filteredRawErrors = rawErrors.value.filter((error) => {
        const dottedPath = error.path
          ?.map((item) => (typeof item === 'object' ? item.key : item))
          .join('.')

        if (dottedPath == null || field._path.value == null) {
          return false
        }

        const { isPart } = isSubPath({
          childPath: dottedPath,
          parentPath: field._path.value,
        })

        if (dottedPath === field._path.value) {
          return true
        }

        return isPart
      }).map((error) => {
        const normalizedPath = error.path
          ?.map((item) => (typeof item === 'object' ? item.key : item))

        if (normalizedPath == null || field._path.value == null) {
          return error
        }

        const joinedNormalizedPath = normalizedPath.join('.')
        const {
          isPart, relativePath,
        } = isSubPath({
          childPath: joinedNormalizedPath,
          parentPath: field._path.value,
        })

        if (!isPart) {
          return {
            ...error,
            path: [],
          }
        }

        // Remove the field path from the error path

        return {
          ...error,
          path: relativePath?.split('.') ?? [],
        }
      })

      return filteredRawErrors
    })

    field.errors = computed<FormattedError<any>[]>(() => {
      if (field._path.value === null) {
        return []
      }

      const formattedErrors = rawErrors.value.filter((error) => {
        const dottedPath = error.path
          ?.map((item) => (typeof item === 'object' ? item.key : item))
          .join('.')

        if (dottedPath == null || field._path.value == null) {
          return false
        }

        const { isPart } = isSubPath({
          childPath: dottedPath,
          parentPath: field._path.value,
        })

        if (dottedPath === field._path.value) {
          return true
        }

        return isPart
      }).map((error: StandardSchemaV1.Issue) => {
        const normalizedPath = error.path
          ?.map((item) => (typeof item === 'object' ? item.key : item))

        if (normalizedPath == null || field._path.value == null) {
          return {
            message: error.message,
            path: null,
          }
        }

        const joinedNormalizedPath = normalizedPath.join('.')

        if (joinedNormalizedPath === field._path.value) {
          return {
            message: error.message,
            path: null,

          }
        }

        const {
          isPart, relativePath,
        } = isSubPath({
          childPath: joinedNormalizedPath,
          parentPath: field._path.value,
        })

        if (!isPart) {
          return {
            message: error.message,
            path: null,
          }
        }

        return {
          message: error.message,
          path: relativePath,
        }
      })

      return formattedErrors as FormattedError<any>[]
    })

    return field
  }

  function registerParentPaths(path: string): void {
    const pathParts = path.split('.')

    for (let i = pathParts.length - 1; i >= 0; i--) {
      const part = pathParts[i]

      if (!Number.isNaN(Number(part))) {
        const arrayPath = pathParts.slice(0, i + 1).join('.')

        // eslint-disable-next-line ts/no-use-before-define
        register(arrayPath as Path<TSchema>)
      }
    }
  }

  // eslint-disable-next-line func-style
  const register: Register<TSchema> = (path, defaultValue) => {
    const existingId = getIdByPath(paths.value, path)

    const clonedDefaultValue = deepClone(defaultValue)

    // Check if the field is already registered
    if (existingId !== null) {
      let field = registeredFields.get(existingId) ?? null

      if (field === null) {
        const value = get(form.value, path)

        field = createField(existingId, path, value)
      }

      // Check if value of the field is null or empty array, if so, set default value
      const isEmpty = field.modelValue.value === null
        || (Array.isArray(field.modelValue.value) && field.modelValue.value.length === 0)

      if (isEmpty && defaultValue !== undefined) {
        field.setValue(clonedDefaultValue)
      }

      // If it is, check if it is still being tracked
      // const existingTrackedDependency = getIsTrackedbyId(trackedDependencies, existingId)
      // If it is, return the field
      // if (existingTrackedDependency)
      //   return field

      // If it isn't being tracked anymore, retrack it
      return getFieldWithTrackedDependencies(field, clonedDefaultValue ?? null)
    }

    // If it isn't registered, register it

    // Even if the field is not registered, it might already have a value
    const value = get(form.value, path)

    // If the value is undefined, set it to the default value
    if (value == null) {
      set(form.value, path, clonedDefaultValue ?? null)
    }

    const id = generateId()

    // Track the path
    paths.value.set(id, path)

    const field = createField(id, path, value)

    // Register the field
    registeredFields.set(id, field)

    // If registered path is child of an array, we also need to register the array index
    // So e.g. if we register `array.0.foo`, we also need to register `array.0`
    // It should work for nested arrays. So e.g. `array.0.test.0.foo` should also register `array.0.test.0`
    registerParentPaths(path)
    registerFieldWithDevTools(formId, field)

    // Track the field
    return getFieldWithTrackedDependencies(field, clonedDefaultValue ?? null)
  }

  // eslint-disable-next-line func-style
  const registerArray: RegisterArray<TSchema> = (path, defaultValue) => {
    const existingId = getIdByPath(paths.value, path)
    const clonedDefaultValue = deepClone(defaultValue)

    // Check if the field is already registered
    if (existingId !== null) {
      // Check if it is registered as a field array
      let fieldArray = registeredFieldArrays.get(existingId) ?? null

      if (fieldArray === null) {
        const value = get(form.value, path)

        fieldArray = createFieldArray(existingId, path, value ?? [])
      }

      // Check if it is still being tracked
      // const existingTrackedDependency = getIsTrackedbyId(trackedDependencies, existingId)

      // If it is, return the field
      // if (existingTrackedDependency)
      //   return fieldArray

      // If it isn't being tracked anymore, retrack it
      return getFieldWithTrackedDependencies(fieldArray, [])
    }

    // If it isn't registered, register it
    // Even if the field is not registered, it might already have a value
    const value = get(form.value, path)

    // If the value is undefined, set it to the default value
    if (value == null) {
      set(form.value, path, [])
    }

    const id = generateId()

    // Track the path
    paths.value.set(id, path)

    const fieldArray = createFieldArray(id, path, value ?? [])

    // If a default value is set, register each key
    // If a value already exists, we don't want to overwrite it
    const shouldSetDefaultValue = clonedDefaultValue !== undefined && (value == null || value.length === 0)

    if (shouldSetDefaultValue) {
      const defaultValueAsArray = clonedDefaultValue as unknown[]

      for (const value of defaultValueAsArray) {
        fieldArray.append(value)
      }
    }

    // Register the field
    registeredFieldArrays.set(id, fieldArray)

    // If registered path is child of an array, we also need to register the array index
    // So e.g. if we register `array.0.foo`, we also need to register `array.0`
    // It should work for nested arrays. So e.g. `array.0.test.0.foo` should also register `array.0.test.0`
    registerParentPaths(path)

    // Track the field
    return getFieldWithTrackedDependencies(fieldArray, [])
  }

  // eslint-disable-next-line func-style
  const unregister: Unregister<TSchema> = (path) => {
    const id = getIdByPath(paths.value, path)

    unset(form.value, path)

    if (id === null) {
      return
    }

    updatePaths(path)

    registeredFields.delete(id)
    trackedDependencies.delete(id)
    paths.value.delete(id)
    unregisterFieldWithDevTools(id)
  }

  function blurAll(): void {
    for (const field of registeredFields.values()) {
      field.onBlur()
    }
  }

  async function submit(): Promise<void> {
    hasAttemptedToSubmit.value = true

    blurAll()

    if (!isValid.value) {
      onSubmitFormErrorCb?.({
        data: form.value as DeepPartial<StandardSchemaV1.InferOutput<TSchema>>,
        errors: formattedErrors.value,
      })

      return
    }

    // We need to keep track of the current form state, because the form might change while submitting
    const currentFormState = deepClone(form)

    isSubmitting.value = true

    if (onSubmitCb == null) {
      throw new Error('Attempted to submit form but `onSubmitForm` callback is not registered')
    }

    const validatedResult = await schema['~standard'].validate(form.value)

    if (validatedResult.issues) {
      onSubmitFormErrorCb?.({
        data: form.value as DeepPartial<StandardSchemaV1.InferOutput<TSchema>>,
        errors: formattedErrors.value,
      })

      return
    }

    initialFormState.value = deepClone(currentFormState.value) as DeepPartial<StandardSchemaV1.InferOutput<TSchema>>

    await onSubmitCb(validatedResult.value)

    isSubmitting.value = false
  }

  function setValues(values: DeepPartial<StandardSchemaV1.InferOutput<TSchema>>): void {
    for (const path in values) {
      set(form.value, path, values[path])
    }
  }

  function addErrors(err: FormattedError<StandardSchemaV1.InferOutput<TSchema>>[]): void {
    const standardErrors = err.map((error) => {
      if (error.path == null) {
        return {
          ...error,
          path: [],
        }
      }

      const newPath = error.path.split('.')

      return {
        ...error,
        path: newPath,
      }
    })

    rawErrors.value = [
      ...rawErrors.value,
      ...standardErrors,
    ]
  }

  watch(() => form.value, async () => {
    const result = await schema['~standard'].validate(form.value)

    const hasErrors = result.issues != null && result.issues.length > 0

    if (hasErrors) {
      rawErrors.value = result.issues

      return
    }

    rawErrors.value = []
  }, {
    deep: true,
    immediate: true,
  })

  function reset() {
    if (initialState == null) {
      throw new Error('In order to reset the form, you need to provide an initial state')
    }

    Object.assign(form.value, deepClone(toValue(initialState)))

    for (const [
      _,
      field,
    ] of registeredFields) {
      field._isTouched.value = false
    }

    hasAttemptedToSubmit.value = false
  }

  const formObject: Form<TSchema> = {
    _id: formId,
    hasAttemptedToSubmit: computed(() => hasAttemptedToSubmit.value),
    isDirty: computed(() => isDirty.value),
    isSubmitting: computed(() => isSubmitting.value),
    isValid,
    addErrors,
    blurAll,
    errors: computed(() => formattedErrors.value),
    rawErrors: computed(() => rawErrors.value) as ComputedRef<StandardSchemaV1.Issue[]>,
    register,
    registerArray,
    reset,
    setValues,
    state: computed(() => form.value as DeepPartial<StandardSchemaV1.InferOutput<TSchema>>),
    submit,
    unregister,
  }

  registerFormWithDevTools(formObject)

  return formObject
}
