import type { ComputedRef, Ref } from 'vue'
import type { DeepPartial } from './utils.type'
import type { FieldPath, FieldPathValue, FieldValues } from './eager.type'
import type { StandardSchemaV1 } from './standardSpec.type'

export type MaybePromise<T> = T | Promise<T>

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
  _path: ComputedRef<string | null>
  /**
   * The unique id of the field.
   */
  _id: string
  /**
   * Internal flag to track if the field has been touched (blurred).
   */
  _isTouched: Ref<boolean>
  /**
   * The current value of the field.
   */
  modelValue: ComputedRef<TDefaultValue extends undefined ? TValue | null : TValue>
  /**
    * Updates the current value of the field.
    *
    * @param value The new value of the field.
    */
  'onUpdate:modelValue': (value: TValue | null) => void

  /**
   * The current value of the field.
   *
   * This is an alias of `attrs.modelValue`.
  */
  value: ComputedRef<TDefaultValue extends undefined ? TValue | null : TValue>
  /**
  * The errors associated with the field and its children.
  */
  errors: ComputedRef<FormattedError<TValue>[]>
  /**
  * The raw errors associated with the field and its children.
  */
  rawErrors: ComputedRef<StandardSchemaV1.Issue[]>
  /**
    * Indicates whether the field has any errors.
    */
  isValid: ComputedRef<boolean>
  /**
    * Indicates whether the field has been touched (blurred).
    */
  isTouched: ComputedRef<boolean>
  /**
    * Indicates whether the field has been changed.
    * This flag will remain `true` even if the field value is set back to its initial value.
    */
  isChanged: Ref<boolean>
  /**
    * Indicates whether the field value is different from its initial value.
    */
  isDirty: ComputedRef<boolean>
  /**
     * Called when the field input is blurred.
     */
  onBlur: () => void
  /**
     * Called when the field input value is changed.
    */
  onChange: () => void

  /**
   * Sets the current value of the field.
   *
   * This is an alias of `onUpdate:modelValue`.
   *
   * @param value The new value of the field.
   */
  setValue: (value: TValue | null) => void
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
    TPath extends TValue extends FieldValues ? FieldPath<TValue> : never,
    TChildDefaultValue extends TValue extends FieldValues ? FieldPathValue<TValue, TPath> | undefined : never,
  >(
    path: TPath,
    defaultValue?: TChildDefaultValue,
  ) => FieldArray<FieldPathValue<TValue, TPath> extends Array<any> ? FieldPathValue<TValue, TPath>[number] : never>

  // registerArray: <
  //   TValueAsFieldValues extends TValue extends FieldValues ? TValue : never,
  //   TPath extends FieldPath<TValueAsFieldValues>,
  //   TChildDefaultValue extends FieldPathValue<TValueAsFieldValues, TPath> | undefined,
  // >(
  //   path: TPath,
  //   defaultValue?: TChildDefaultValue,
  // ) => FieldArray<FieldPathValue<TValueAsFieldValues, TPath>>
}

/**
 * Represents a form field array.
 *
 * @typeparam T The type of the form schema.
 */
export interface FieldArray<TValue> {
  /**
   * The current path of the field. This can change if fields are unregistered.
   */
  _path: ComputedRef<string | null>
  /**
   * The unique id of the field.
   */
  _id: string
  /**
   * Array of unique ids of the fields.
   */
  fields: Ref<string[]>
  /**
   * The errors associated with the field and its children.
   */
  errors: ComputedRef<FormattedError<TValue[]>[]>
  /**
  * The raw errors associated with the field and its children.
  */
  rawErrors: ComputedRef<StandardSchemaV1.Issue[]>
  /**
   * The current value of the field.
   */
  modelValue: ComputedRef<TValue[]>
  /**
  * Indicates whether the field has any errors.
  */
  isValid: ComputedRef<boolean>
  /**
  * Indicates whether the field has been touched (blurred).
  */
  isTouched: ComputedRef<boolean>
  /**
  * Indicates whether the field value is different from its initial value.
  */
  isDirty: ComputedRef<boolean>
  /**
   * The current value of the field.
   *
   * This is an alias of `attrs.modelValue`.
  */
  value: ComputedRef<TValue[]>
  /**
   * Insert a new field at the given index.
   * @param index The index of the field to insert.
   */
  insert: (index: number, value?: TValue) => void
  /**
   * Remove a field at the given index.
   * @param index The index of the field to remove.
   */
  remove: (index: number) => void
  /**
   * Add a new field at the beginning of the array.
   */
  prepend: (value?: TValue) => void
  /**
   * Add a new field at the end of the array.
   */
  append: (value?: TValue) => void
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
  setValue: (value: TValue[]) => void

  register: <
    TChildPath extends TValue[] extends FieldValues ? FieldPath<TValue[]> : never,
    TChildDefaultValue extends TValue[] extends FieldValues ? FieldPathValue<TValue[], TChildPath> | undefined : never,
  >(
    path: TChildPath,
    defaultValue?: TChildDefaultValue
  ) => TValue[] extends FieldValues ? Field<FieldPathValue<TValue[], TChildPath>, any> : never

  registerArray: <
    TPath extends TValue[] extends FieldValues ? FieldPath<TValue[]> : never,
    TChildDefaultValue extends TValue[] extends FieldValues ? FieldPathValue<TValue[], TPath> | undefined : never,
  >(
    path: TPath,
    defaultValue?: TChildDefaultValue,
  ) => TValue extends FieldValues ? FieldArray<FieldPathValue<TValue, TPath extends FieldPath<TValue> ? TPath : never>> : never
}

export type Register<TSchema> = <
  TPath extends FieldPath<TSchema>,
  TValue extends FieldPathValue<TSchema, TPath>,
  TDefaultValue extends FieldPathValue<TSchema, TPath> | undefined,
>(field: TPath, defaultValue?: TDefaultValue) => Field<TValue, TDefaultValue>

export type RegisterArray<TSchema extends StandardSchemaV1> = <
  TPath extends FieldPath<StandardSchemaV1.InferOutput<TSchema>>,
  TValue extends FieldPathValue<StandardSchemaV1.InferOutput<TSchema>, TPath>,
  TSingleValue extends TValue extends Array<any> ? TValue[number] : never,
  TDefaultValue extends FieldPathValue<StandardSchemaV1.InferOutput<TSchema>, TPath> | undefined,
>(field: TPath, defaultValue?: TDefaultValue) => FieldArray<TSingleValue>

export type Unregister<T extends StandardSchemaV1> = <
  P extends FieldPath<StandardSchemaV1.InferOutput<T>>,
>(field: P) => void

export interface Form<TSchema extends StandardSchemaV1> {
  /**
   * Internal id of the form, to track it in the devtools.
   */
  _id: string
  /**
   * The current state of the form.
   */
  state: ComputedRef<Readonly<DeepPartial<StandardSchemaV1.InferOutput<TSchema>>>>
  /**
   * The collection of all registered fields' errors.
   */
  errors: ComputedRef<FormattedError<StandardSchemaV1.InferOutput<TSchema>>[]>
  /**
  * The raw errors associated with the field and its children.
  */
  rawErrors: ComputedRef<StandardSchemaV1.Issue[]>

  /**
   * Indicates whether the form is dirty or not.
   *
   * A form is considered dirty if any of its fields have been changed.
   */
  isDirty: ComputedRef<boolean>
  /**
   * Indicates whether the form is currently submitting or not.
   */
  isSubmitting: ComputedRef<boolean>
  /**
   * Indicates whether the form has been attempted to submit.
   */
  hasAttemptedToSubmit: ComputedRef<boolean>
  /**
   * Indicates whether the form is currently valid or not.
   *
   * A form is considered valid if all of its fields are valid.
   */
  isValid: ComputedRef<boolean>
  /**
   * Registers a new form field.
   *
   * @returns A `Field` instance that can be used to interact with the field.
   */
  register: Register<StandardSchemaV1.InferOutput<TSchema>>
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
  addErrors: (errors: FormattedError<StandardSchemaV1.InferOutput<TSchema>>[]) => void
  /**
   * Sets values in the form.
   *
   * @param values The new values for the form fields.
   */
  setValues: (values: DeepPartial<StandardSchemaV1.InferOutput<TSchema>>) => void
  /**
   * Submits the form.
   *
   * @returns A promise that resolves once the form has been successfully submitted.
   */
  submit: () => Promise<void>
  /**
   * Resets the form to the initial state.
   */
  reset: () => void
  /**
   * Blurs all inputs in the form.
   */
  blurAll: () => void
}

/**
 * Represents a form instance.
 *
 * @typeparam T The type of the form schema.
 */
export interface UseForm<T extends StandardSchemaV1> {
  /**
   * Called when the form is valid and submitted.
   * @param data The current form data.
   */
  onSubmitForm: (cb: (data: StandardSchemaV1.InferOutput<T>) => void) => void
  /**
   * The form instance itself.
   */
  form: Form<T>
}

export interface FormattedError<
 TType,
> {
  path: FieldPath<TType extends FieldValues ? TType : never>

  message: string
}
