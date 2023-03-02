import type { z } from 'zod'
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
  setValues: (values: { [K in keyof z.infer<T>]?: z.infer<T>[K] }) => void
  setErrors: (errors: { [K in keyof z.infer<T>]?: string[] }) => void
  submit: () => Promise<void>
  prepare: () => Promise<void>
}

export interface Callbacks<T extends z.ZodType> {
  onPrepare?: () => MaybePromise<{ [K in keyof z.infer<T>]?: z.infer<T>[K] } | null>
  onSubmit: (data: z.infer<T>) => MaybePromise<{ [K in keyof z.infer<T>]?: string[] } | null>
}
