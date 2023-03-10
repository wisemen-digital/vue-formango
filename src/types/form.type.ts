import type { z } from 'zod'
import type { DeepPartial } from './utils.type'
import type { FieldPath, FieldPathValue } from './eager.type'

type MaybePromise<T> = T | Promise<T>

export interface Field<T> {
  _path: string
  modelValue: T
  errors: z.ZodFormattedError<T>
  isTouched: boolean
  isDirty: boolean
  isChanged: boolean
  'onUpdate:modelValue': (value: T) => void
  'setValue': (value: T) => void
  onBlur: () => void
  onChange: () => void
}

export type Register<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
  V extends FieldPathValue<z.infer<T>, P>,
>(field: P, defaultValue?: FieldPathValue<z.infer<T>, P>) => Field<V>

export type Unregister<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
>(field: P) => void

export interface UseForm<T extends z.ZodType> {
  errors: z.ZodFormattedError<z.infer<T>>
  isDirty: boolean
  isReady: boolean
  isSubmitting: boolean
  isValid: boolean
  register: Register<T>
  setErrors: (errors: DeepPartial<z.ZodFormattedError<z.infer<T>>>) => void
  setValues: (values: DeepPartial<z.infer<T>>) => void
  submit: () => Promise<void>
  unregister: Unregister<T>
}

export interface Callbacks<T extends z.ZodType> {
  onPrepare?: () => MaybePromise<z.infer<T>> | void
  onSubmit: (data: z.infer<T>) => MaybePromise<DeepPartial<z.ZodFormattedError<z.infer<T>>>> | void
}
