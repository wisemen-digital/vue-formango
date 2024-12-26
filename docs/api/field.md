# Field

Field that gets returned from the register field function from the form object. You can build a mapper, that maps the field to a custom input field, so you can just v-bind the entire object.

## Usage Default

```ts
// Registers and returns a field
import type { Field } from 'formango'
import { formatErrorsToZodFormattedError } from 'formango'
import type {
  ZodFormattedError,
} from 'zod'

const name = form.register('name', 'default name')
const email = form.register('email')

export function toFormField<TValue, TDefaultValue>(field: Field<TValue, TDefaultValue>): {
  'isTouched': boolean | undefined
  'errors': ZodFormattedError<TValue>
  'modelValue': TDefaultValue extends undefined ? TValue | null : TValue
  'onBlur': () => void
  'onUpdate:modelValue': (value: TValue | null) => void
} {
  return {
    'isTouched': field.isTouched.value,
    'errors': formatErrorsToZodFormattedError(field.errors.value),
    'modelValue': field.modelValue.value,
    'onBlur': field.onBlur,
    'onUpdate:modelValue': field['onUpdate:modelValue'],
  }
}
```

```vue
<template>
  <CustomInput v-bind="toFormField(field)" />
  <CustomInput v-bind="toFormField(email)" />
</template>
```
## Example input

Visit the [best practice page](../best-practices/custom-input.md) to view an example of a custom input consuming the Field API.


### Field object

| State           | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| errors        | `ComputedRef<FormattedError<TValue>[]>` | Current errors on the field                              |
| isChanged    | `ComputedRef<Boolean>`  | Boolean indicating if the value of the field in changed.
| isDirty | `ComputedRef<Boolean>` | Boolean indicating if the field is currently dirty |
| isTouched | `ComputedRef<Boolean>` | Boolean indicating if the field is touched |
| isValid | `ComputedRef<Boolean>` | Boolean indicating if the field is currently valid |
| modelValue | `ComputedRef<TValue>` | The value of the field, used to bind v-model |
| value | `ComputedRef<TValue>` | The value of the field, alias for modelValue |
| onBlur | `Function` | Handles the onBlur event, used to bind the event |
| onChange | `Function` | Handles the onChange event, used to bind the event |
| onUpdate:modelValue | `Function` | Handles the updating of modelValue event, used to bind v-model |
| setValue | `Function` | Sets modelValue manually |
| register | `Function` | Function to register any fields under this field |


## Type definitions
 
::: code-group

```ts [Field]
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
    TValueAsFieldValues extends TValue extends FieldValues ? TValue : never,
    TPath extends FieldPath<TValueAsFieldValues>,
    TChildDefaultValue extends FieldPathValue<TValueAsFieldValues, TPath> | undefined,
  >(
    path: TPath,
    defaultValue?: TChildDefaultValue,
  ) => FieldArray<FieldPathValue<TValueAsFieldValues, TPath>>
}
```

:::
## Source

[Source](https://github.com/wisemen-digital/vue-formango/blob/main/src/lib/useForm.ts) - [Types](https://github.com/wouterlms/forms/blob/main/src/types/form.type.ts)