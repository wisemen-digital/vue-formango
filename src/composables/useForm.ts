import { z } from 'zod'

import {
  computed,
  reactive,
  readonly,
  ref,
  watch,
} from 'vue'

import {
  generateId,
  get,
  set,
  unset,
} from '../utils'

import type {
  Callbacks,
  DeepPartial,
  Field,
  Register,
  Unregister,
  UseForm,
} from '../types'

export default <T extends z.ZodType>(schema: T, {
  onPrepare,
  onSubmit,
}: Callbacks<T>): UseForm<T> => {
  const form = reactive<DeepPartial<z.infer<T>>>({} as any)
  const errors = ref<z.ZodFormattedError<T>>({} as any)

  const isSubmitting = ref(false)
  const isReady = ref(onPrepare == null)

  const initialState = ref<any>(null)

  const isDirty = computed(() => {
    return JSON.stringify(form) !== JSON.stringify(initialState.value)
  })

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  const paths = reactive(new Map<string, string>())
  const registeredFields = reactive(new Map<string, Field<any>>())

  const getPathId = (path: string) => [...paths.entries()].find(([, p]) => p === path)?.[0]

  // * form.register('array.0')
  // * form.register('array.1')
  // ! form.unregister('array.0') --> array.1 is now array.0
  // * form.register('array.1') --> should work since array.1 -> array.0
  const updatePaths = (path: string): void => {
    const isArray = !Number.isNaN(path.split('.').pop())

    if (isArray) {
      const index = parseInt(path.split('.').pop() ?? '0', 10)
      const prefix = path.replace(`.${index}`, '')
      const matchingPaths = [...paths.entries()].filter(([, p]) => p.startsWith(prefix))

      for (const [id, p] of matchingPaths) {
        const i = parseInt(p.split('.').pop() ?? '0', 10)

        if (i > index) {
          const newPath = p.replace(`.${i}`, `.${i - 1}`)

          paths.set(id, newPath)
        }
      }
    }

    const id = getPathId(path)!

    paths.delete(id)
  }

  const createField = (
    id: string,
    defaultValue: unknown = null,
  ): Field<any> => {
    const path = computed(() => paths.get(id)!)

    const value = computed(() => {
      return get(form, path.value)
    })

    if (value.value == null)
      set(form, path.value, defaultValue ?? null)

    const fieldErrors = computed<z.ZodFormattedError<T>>(() => {
      return get(errors.value, path.value)
    })

    const isDirty = (value: unknown) => {
      return JSON.stringify(value) !== JSON.stringify(get(initialState.value, path.value))
    }

    const field = reactive<Field<any>>({
      '_path': path as any,
      'isDirty': false,
      'isTouched': false,
      'isChanged': false,
      'modelValue': value,
      'onUpdate:modelValue': (value: unknown) => {
        // If the value is an empty string, set it to null to make sure the field is not dirty
        const valueOrNull = value === '' ? null : value
        set(form, path.value, valueOrNull)
      },
      'errors': fieldErrors as any,
      'onBlur': () => {
        field.isTouched = true
      },
      'onChange': () => {
        field.isChanged = true
      },
      'setValue': (value: unknown) => {
        field['onUpdate:modelValue'](value)
      },
    })

    field.isDirty = computed(() => isDirty(field.modelValue)) as any

    return field
  }

  const register: Register<T> = (path, defaultValue) => {
    const [existingFieldId] = [...paths.entries()].find(([, p]) => p === path) ?? [null]

    if (existingFieldId !== null) {
      if (defaultValue != null)
        console.warn(`Path ${path} is already registered, default value will be ignored`)

      return registeredFields.get(existingFieldId)!
    }

    const id = generateId()

    paths.set(id, path)

    const field = createField(id, defaultValue)

    registeredFields.set(id, field)

    return field
  }

  const unregister: Unregister<T> = (path) => {
    const id = getPathId(path)

    if (id == null)
      throw new Error(`Path ${path} is not registered`)

    updatePaths(path)
    unset(form, path)

    registeredFields.delete(id)
    paths.delete(id)
  }

  const setValues = (values: DeepPartial<z.infer<T>>): void => {
    for (const key in values) {
      const value = values[key]

      if (typeof value === 'object')
        setValues(value as any)
      else
        set(form, key, value)
    }
  }

  const setErrors = (err: DeepPartial<z.ZodFormattedError<z.infer<T>>>): void => {
    const mergeErrors = (
      existingErrors: DeepPartial<z.ZodFormattedError<z.infer<T>>>,
      err: DeepPartial<z.ZodFormattedError<z.infer<T>>>,
    ): void => {
      for (const key in err) {
        if (key === '_errors') {
          existingErrors[key] = err[key]
        }
        else {
          if (existingErrors[key] == null) {
            existingErrors[key] = {
              _errors: [],
            } as any
          }

          mergeErrors(existingErrors[key] as any, err[key] as any)
        }
      }
    }

    mergeErrors(errors.value, err)
  }

  const prepare = async (): Promise<void> => {
    const values = await onPrepare?.()

    if (values != null)
      Object.assign(form, values)

    initialState.value = JSON.parse(JSON.stringify(form))

    setTimeout(() => {
      isReady.value = true
    })
  }

  const blurAll = (): void => {
    for (const field of registeredFields.values())
      field.onBlur()
  }

  const submit = async (): Promise<void> => {
    blurAll()

    if (!isValid.value)
      return

    isSubmitting.value = true

    const customErrors = await onSubmit?.(schema.parse(form))

    if (errors.value != null)
      Object.assign(errors.value, customErrors)

    isSubmitting.value = false
    initialState.value = JSON.parse(JSON.stringify(form))
  }

  watch(form, async () => {
    try {
      await schema.parseAsync(form)

      errors.value = {}
    }
    catch (e) {
      if (e instanceof z.ZodError)
        errors.value = e.format()
    }
  }, {
    deep: true,
    immediate: true,
  })

  prepare()

  return reactive<any>({
    _state: readonly(form),
    errors,
    isDirty,
    isReady,
    isSubmitting,
    isValid,
    register,
    submit,
    unregister,
    setValues,
    setErrors,
  })
}
