import type { z } from 'zod'
import type { DeepPartial } from './utils.type'
import type { FieldPath, FieldPathValue } from './eager.type'

type MaybePromise<T> = T | Promise<T>

/**
 * Represents a form field.
 *
 * @typeparam T The type of the field value.
 */
export interface Field<T> {
  /**
   * The current path of the field. This can change if fields are unregistered.
   */
  _path: string
  /**
   * The current value of the field.
   */
  modelValue: T
  /**
   * The errors associated with the field and its children.
   */
  errors: z.ZodFormattedError<T>
  /**
   * Indicates whether the field has been touched (blurred).
   */
  isTouched: boolean
  /**
   * Indicates whether the field has been changed.
   *
   * This flag will remain `true` even if the field value is set back to its initial value.
   */
  isChanged: boolean
  /**
   * Indicates whether the field value is different from its initial value.
   */
  isDirty: boolean
  /**
   * Updates the current value of the field.
   *
   * @param value The new value of the field.
   */
  'onUpdate:modelValue': (value: T) => void
  /**
   * Sets the current value of the field.
   *
   * This is an alias of `onUpdate:modelValue`.
   *
   * @param value The new value of the field.
   */
  'setValue': (value: T) => void
  /**
   * Called when the field input is blurred.
   */
  onBlur: () => void
  /**
   * Called when the field input value is changed.
   */
  onChange: () => void
}

export type Register<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
  V extends FieldPathValue<z.infer<T>, P>,
>(field: P, defaultValue?: FieldPathValue<z.infer<T>, P>) => Field<V>

export type Unregister<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
>(field: P) => void

/**
 * Represents a form instance.
 *
 * @typeparam T The type of the form schema.
 */
export interface UseForm<T extends z.ZodType> {
  /**
   * The collection of all registered fields' errors.
   */
  errors: z.ZodFormattedError<z.infer<T>>
  /**
   * Indicates whether the form is dirty or not.
   *
   * A form is considered dirty if any of its fields have been changed.
   */
  isDirty: boolean
  /**
   * Indicates whether the form is ready or not.
   *
   * If the `onPrepare` option is provided when creating the form, the form will be considered ready
   * once the promise returned by `onPrepare` resolves.
   */
  isReady: boolean
  /**
   * Indicates whether the form is currently submitting or not.
   */
  isSubmitting: boolean
  /**
   * Indicates whether the form is currently valid or not.
   *
   * A form is considered valid if all of its fields are valid.
   */
  isValid: boolean
  /**
   * Registers a new form field.
   *
   * @returns A `Field` instance that can be used to interact with the field.
   */
  register: Register<T>
  /**
   * Unregisters a previously registered field.
   *
   * @param path The path of the field to unregister.
   */
  unregister: Unregister<T>
  /**
   * Sets the current errors of the form.
   *
   * @param errors The new errors for the form fields.
   */
  setErrors: (errors: DeepPartial<z.ZodFormattedError<z.infer<T>>>) => void
  /**
   * Sets the current values of the form fields.
   *
   * @param values The new values for the form fields.
   */
  setValues: (values: DeepPartial<z.infer<T>>) => void
  /**
   * Submits the form.
   *
   * @returns A promise that resolves once the form has been successfully submitted.
   */
  submit: () => Promise<void>
}

export interface Callbacks<T extends z.ZodType> {
  onPrepare?: () => MaybePromise<z.infer<T>> | MaybePromise<void>
  onSubmit: (data: z.infer<T>) =>
  MaybePromise<DeepPartial<z.ZodFormattedError<z.infer<T>>>>
  | MaybePromise<void>
}
