import type { z } from 'zod'
import type { DeepPartial } from './utils.type'
import type { FieldPath, FieldPathValue, FieldValues } from './eager.type'

export type MaybePromise<T> = T | Promise<T>

type ArrayElement<ArrayType extends any[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

/**
 * Represents a form field.
 *
 * @typeparam TValue The type of the field value.
 * @typeparam TDefaultValue The type of the field default value.
 */
export interface Field<TValue, TDefaultValue = undefined> {
  /**
   * The current path of the field. This can change if fields are unregistered.
   */
  _path: string
  /**
   * The unique id of the field.
   */
  _id: string
  /**
   * Internal flag to track if the field has been touched (blurred).
   */
  _isTouched: boolean
  /**
   * The current value of the field.
   */
  modelValue: TDefaultValue extends undefined ? TValue | null : TValue
  /**
   * The errors associated with the field and its children.
   */
  errors: z.ZodFormattedError<TValue> | undefined
  /**
   * Indicates whether the field has any errors.
   */
  isValid: boolean
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
  'onUpdate:modelValue': (value: TValue) => void
  /**
   * Sets the current value of the field.
   *
   * This is an alias of `onUpdate:modelValue`.
   *
   * @param value The new value of the field.
   */
  setValue: (value: TDefaultValue extends undefined ? TValue | null : TValue) => void
  /**
   * Called when the field input is blurred.
   */
  onBlur: () => void
  /**
   * Called when the field input value is changed.
   */
  onChange: () => void

  register: <
    TValueAsFieldValues extends TValue extends FieldValues ? TValue : never,
    TChildPath extends FieldPath<TValueAsFieldValues>,
    TChildDefaultValue extends FieldPathValue<TValueAsFieldValues, TChildPath> | undefined,
  >(
    path: TChildPath,
    defaultValue?: TChildDefaultValue
  ) => Field<
    FieldPathValue<TValueAsFieldValues, TChildPath>,
    TChildDefaultValue
  >

  registerArray: <
    TValueAsFieldValues extends TValue extends FieldValues ? TValue : never,
    TPath extends FieldPath<TValueAsFieldValues>,
  >(
    path: TPath
  ) => FieldArray<FieldPathValue<TValueAsFieldValues, TPath>>
}

/**
 * Represents a form field array.
 *
 * @typeparam T The type of the form schema.
 */
export interface FieldArray<TValue extends any[]> {
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
  modelValue: TValue
  /**
   * Array of unique ids of the fields.
   */
  fields: string[]
  /**
   * The errors associated with the field and its children.
   */
  errors: z.ZodFormattedError<TValue> | undefined
  /**
   * Indicates whether the field has any errors.
   */
  isValid: boolean
  /**
   * Indicates whether the field or any of its children have been touched (blurred).
   */
  isTouched: boolean
  /**
   * Indicates whether the field value is different from its initial value.
   */
  isDirty: boolean
  /**
   * Insert a new field at the given index.
   * @param index The index of the field to insert.
   */
  insert: (index: number, value?: ArrayElement<TValue>) => void
  /**
   * Remove a field at the given index.
   * @param index The index of the field to remove.
   */
  remove: (index: number) => void
  /**
   * Add a new field at the beginning of the array.
   */
  prepend: (value?: ArrayElement<TValue>) => void
  /**
   * Add a new field at the end of the array.
   */
  append: (value?: ArrayElement<TValue>) => void
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
  setValue: (value: TValue) => void

  register: <
    TChildPath extends TValue extends FieldValues ? FieldPath<TValue> : never,
    TChildDefaultValue extends TValue extends FieldValues ? FieldPathValue<TValue, TChildPath> | undefined : never,
  >(
    path: TChildPath,
    defaultValue?: TChildDefaultValue
  ) => TValue extends FieldValues ? Field<FieldPathValue<TValue, TChildPath>, any> : never

  registerArray: <TPath extends TValue extends FieldValues ? FieldPath<TValue> : never>(
    path: TPath
  ) => TValue extends FieldValues ? FieldArray<FieldPathValue<TValue, TPath>> : never
}

export type Register<TSchema extends FieldValues> = <
  TPath extends FieldPath<TSchema>,
  TValue extends FieldPathValue<TSchema, TPath>,
  TDefaultValue extends FieldPathValue<TSchema, TPath> | undefined,
>(field: TPath, defaultValue?: TDefaultValue) => Field<TValue, TDefaultValue>

export type RegisterArray<TSchema extends z.ZodType> = <
  TPath extends FieldPath<z.infer<TSchema>>,
  TValue extends FieldPathValue<z.infer<TSchema>, TPath>,
  TDefaultValue extends FieldPathValue<z.infer<TSchema>, TPath> | undefined,
>(field: TPath, defaultValue?: TDefaultValue) => FieldArray<TValue>

export type Unregister<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
>(field: P) => void

export interface Form<TSchema extends z.ZodType> {
  /**
   * Internal id of the form, to track it in the devtools.
   */
  // _id: string
  /**
   * The current state of the form.
   */
  state: Readonly<DeepPartial<z.infer<TSchema>>>
  /**
   * The collection of all registered fields' errors.
   */
  errors: z.ZodFormattedError<z.infer<TSchema>>
  /**
   * Indicates whether the form is dirty or not.
   *
   * A form is considered dirty if any of its fields have been changed.
   */
  isDirty: boolean
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
  register: Register<z.infer<TSchema>>
  /**
   * Registers a new form field array.
   *
   * @returns A `FieldArray` instance that can be used to interact with the field array.
   */
  registerArray: RegisterArray<TSchema>
  /**
   * Unregisters a previously registered field.
   *
   * @param path The path of the field to unregister.
   */
  unregister: Unregister<TSchema>
  /**
   * Sets errors in the form.
   *
   * @param errors The new errors for the form fields.
   */
  addErrors: (errors: DeepPartial<z.ZodFormattedError<z.infer<TSchema>>>) => void
  /**
   * Sets values in the form.
   *
   * @param values The new values for the form fields.
   */
  setValues: (values: DeepPartial<z.infer<TSchema>>) => void
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
   * Called when the form is valid and submitted.
   * @param data The current form data.
   */
  onSubmitForm: (cb: (data: z.infer<T>) => void) => void
  /**
   * The form instance itself.
   */
  form: Form<T>
}
