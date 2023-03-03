import { z } from 'zod'

import {
  computed,
  reactive,
  ref,
  watch,
} from 'vue'

import type {
  Callbacks,
  Register,
  UseForm,
} from '../types'

export default <T extends z.ZodType>(schema: T, {
  onPrepare,
  onSubmit,
}: Callbacks<T>): UseForm<T> => {
  const form = reactive<any>({})
  const errors = ref<z.ZodFormattedError<T>>({} as any)
  const registeredFields = new Map<string, ReturnType<Register<any>>>()

  const isValid = ref(false)
  const isReady = ref(onPrepare == null)
  const isSubmitting = ref(false)

  const initialState = ref<any>(null)

  const setObjectValueByPath = (obj: any, path: Array<string | number>, value: any): void => {
    if (path.length === 1) {
      obj[path[0]] = value

      return
    }

    const nextPath = path.slice(1)

    const isString = isNaN(Number(nextPath[0]))

    if (obj[path[0]] == null)
      obj[path[0]] = isString ? {} : []

    setObjectValueByPath(obj[path[0]], path.slice(1), value)
  }

  const register: Register<T> = (fieldPath, defaultValue: unknown = null) => {
    const exists = [...registeredFields.keys()].some(key => key.includes(fieldPath))

    if (!exists)
      setObjectValueByPath(form, fieldPath.split('.'), defaultValue)

    const existingField = registeredFields.get(fieldPath)

    if (existingField != null) {
      if (defaultValue != null)
        console.warn(`[useForm] Field "${fieldPath}" has already been registered, but a default value was provided. This will be ignored.`)

      return existingField
    }
    const fieldErrors = computed(
      () => (errors as any)[fieldPath],
    )

    const field = reactive<any>({
      'modelValue': form[fieldPath],
      'errors': fieldErrors,
      'isTouched': false,
      'isDirty': false,
      'onBlur': () => {
        field.isTouched = true
      },
      'onUpdate:modelValue': (value: unknown) => {
        const v = value === '' ? null : value

        field.modelValue = v

        setObjectValueByPath(form, fieldPath.split('.'), v)
      },
    })

    registeredFields.set(fieldPath, field)

    watch(() => form[fieldPath], () => {
      field.modelValue = form[fieldPath]
    })

    watch(() => field.modelValue, () => {
      field.isDirty = JSON.stringify(field.modelValue) !== JSON.stringify(defaultValue)
    }, { deep: true })

    return field
  }

  const isDirty = computed(() => JSON.stringify(form) !== JSON.stringify(initialState.value))

  watch(form, async () => {
    try {
      await schema.parseAsync(form)

      errors.value = {}
      isValid.value = true
    }
    catch (e) {
      if (e instanceof z.ZodError) {
        isValid.value = false
        errors.value = e.format()
      }
    }
  }, {
    deep: true,
    immediate: true,
  })

  const setValues = (values: { [K in keyof z.infer<T>]?: z.infer<T>[K] }): void => {
    const set = (obj: any, set: any): void => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] != null && set[key] != null)
          return set(obj[key], set[key])

        if (set[key] != null)
          obj[key] = set[key]
      }
    }

    set(form, values)
  }

  const setErrors = (err: { [K in keyof z.infer<T>]?: string[] }): void => {
    const set = (obj: any, set: any): void => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] != null && set[key] != null)
          return set(obj[key], set[key])

        if (set[key] != null)
          obj[key] = set[key]
      }
    }

    set(errors.value, err)
  }

  const prepare = async (): Promise<void> => {
    const values = await onPrepare?.()

    if (values != null)
      setValues(values)

    initialState.value = JSON.parse(JSON.stringify(form))

    setTimeout(() => {
      isReady.value = true
    })
  }

  const blurAll = (): void => {
    for (const fieldPath of registeredFields.values())
      fieldPath.onBlur()
  }

  const submit = async (): Promise<void> => {
    blurAll()

    if (!isValid.value)
      return

    isSubmitting.value = true

    const errors = await onSubmit(schema.parse(form))

    if (errors !== null)
      setErrors(errors)

    isSubmitting.value = false
    initialState.value = JSON.parse(JSON.stringify(form))
  }

  return reactive<any>({
    register,
    isValid,
    isDirty,
    isSubmitting,
    isReady,
    setValues,
    setErrors,
    prepare,
    submit,
    errors,
  })
}
