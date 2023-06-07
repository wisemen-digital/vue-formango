import type { z } from 'zod'
import type { DeepPartial } from './utils.type'
import type { FieldPath, FieldPathValue } from './eager.type'

export type MaybePromise<T> = T | Promise<T>

type ArrayElement<ArrayType extends any[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

/**
 * Represents a form field.
 *
 * @typeparam T The type of the field value.
 */
export interface Field<T> {
  /**
   * The current path of the field. This can change if fields are unregistered.
   */
  _path: string | null
  /**
   * The unique id of the field.
   */
  _id: string
  /**
   * The current value of the field.
   */
  modelValue: T
  /**
   * The errors associated with the field and its children.
   */
  errors: z.ZodFormattedError<T> | undefined
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

/**
 * Represents a form field array.
 *
 * @typeparam T The type of the form schema.
 */
export interface FieldArray<T extends any[]> {
  /**
   * The current path of the field. This can change if fields are unregistered.
   */
  _path: string
  /**
   * The unique id of the field.
   */
  _id: string
  /**
   * The current value of the field.
   */
  modelValue: T
  /**
   * Array of unique ids of the fields.
   */
  fields: string[]
  /**
   * The errors associated with the field and its children.
   */
  errors: z.ZodFormattedError<T> | undefined
  /**
   * Indicates whether the field value is different from its initial value.
   */
  isDirty: boolean
  /**
   * Insert a new field at the given index.
   * @param index The index of the field to insert.
   */
  insert: (index: number, value?: ArrayElement<T>) => void
  /**
   * Remove a field at the given index.
   * @param index The index of the field to remove.
   */
  remove: (index: number) => void
  /**
   * Add a new field at the beginning of the array.
   */
  prepend: (value?: ArrayElement<T>) => void
  /**
   * Add a new field at the end of the array.
   */
  append: (value?: ArrayElement<T>) => void
  /**
   * Remove the last field of the array.
   */
  pop: () => void
  /**
   * Remove the first field of the array.
   */
  shift: () => void
  /**
   * Move a field from one index to another.
   */
  move: (from: number, to: number) => void
  /**
   * Empty the array.
   */
  empty: () => void
  /**
   * Set the current value of the field.
   */
  setValue: (value: T) => void
}

export type Register<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
  V extends FieldPathValue<z.infer<T>, P>,
>(field: P, defaultValue?: FieldPathValue<z.infer<T>, P>) => Field<V>

export type RegisterArray<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
  V extends FieldPathValue<z.infer<T>, P>,
>(field: P) => FieldArray<V>

export type Unregister<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
>(field: P) => void

export interface Form<T extends z.ZodType> {
  /**
   * The current state of the form.
   */
  _state: Readonly<DeepPartial<z.infer<T>>>
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
   * If the `initialise` option is provided when creating the form, the form will be considered ready
   * once the promise returned by `initialise` resolves.
   */
  isReady: boolean
  /**
   * Indicates whether the form is currently submitting or not.
   */
  isSubmitting: boolean
  /**
   * Indicates whether the form has been attempted to submit.
   */
  hasAttemptedToSubmit: boolean
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
   * Registers a new form field array.
   *
   * @returns A `FieldArray` instance that can be used to interact with the field array.
   */
  registerArray: RegisterArray<T>
  /**
   * Unregisters a previously registered field.
   *
   * @param path The path of the field to unregister.
   */
  unregister: Unregister<T>
  /**
   * Sets errors in the form.
   *
   * @param errors The new errors for the form fields.
   */
  setErrors: (errors: DeepPartial<z.ZodFormattedError<z.infer<T>>>) => void
  /**
   * Sets values in the form.
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

/**
 * Represents a form instance.
 *
 * @typeparam T The type of the form schema.
 */
export interface UseForm<T extends z.ZodType> {
  /**
   * The form is considered ready once this promise resolves.
   */
  // onInitForm: (cb: () => MaybePromise<Partial<z.infer<T> > | null>) => void

  /**
   * Called when the form is valid and submitted.
   * @param data The current form data.
   */
  onSubmitForm: (cb: (data: z.infer<T>) => MaybePromise<z.ZodFormattedError<z.infer<T>> | null>) => void

  /**
   * The actual form instance.
   */
  form: Form<T>
}
