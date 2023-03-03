import type { z } from 'zod'
import type { DeepPartial } from './utils.type'
import type { FieldPath, FieldPathValue } from './eager.type'

type MaybePromise<T> = T | Promise<T>

export type Register<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
  V extends FieldPathValue<z.infer<T>, P>,
>(field: P, defaultValue?: FieldPathValue<z.infer<T>, P>) => {
  modelValue: V
  errors: z.ZodFormattedError<V>
  isTouched: boolean
  isDirty: boolean
  'onUpdate:modelValue': (value: V) => void
  onBlur: () => void
}

export interface UseForm<T extends z.ZodType> {
  state: z.infer<T>
  isDirty: boolean
  isValid: boolean
  isReady: boolean
  isSubmitting: boolean
  errors: z.ZodFormattedError<z.infer<T>>
  register: Register<T>
  setValues: (values: DeepPartial<z.infer<T>>) => void
  setErrors: (errors: DeepPartial<z.ZodFormattedError<z.infer<T>>>) => void
  submit: () => Promise<void>
  prepare: () => Promise<void>
}

export interface Callbacks<T extends z.ZodType> {
  onPrepare?: () => MaybePromise<z.infer<T> | null>
  onSubmit: (data: z.infer<T>) => MaybePromise<DeepPartial<z.ZodFormattedError<z.infer<T>>> | null>
}
