# Field

Field that gets returned from the register field function from the form object. Ideally you build a custom input field which handles all the bindings of the field, so you can just v-bind the entire object.

## Usage Default

```ts
// Registers and returns a field
const name = form.register('name', 'default name')
const email = form.register('email')
```

```vue
<template>
  <CustomInput v-bind="field" />
  <CustomInput v-bind="email" />
</template>
```
## Example input

Visit the [best practice page](../best-practices/custom-input.md) to view an example of a custom input consuming the Field API.


### Field object

| State           | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| errors        | `Object` | Current errors on the field                              |
| isChanged    | `Boolean`  | Boolean indicating if the value of the field in changed.     |
| isDirty | `Boolean` | Boolean indicating if the field is currently dirty |
| isTouched | `Boolean` | Boolean indicating if the field is touched |
| isValid | `Boolean` | Boolean indicating if the field is currently valid |
| modelValue | `T`| The value of the field, used to bind v-model |
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
interface Field<TValue, TDefaultValue = undefined> {
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
  'setValue': (value: TDefaultValue extends undefined ? TValue | null : TValue) => void
  /**
   * Called when the field input is blurred.
   */
  onBlur: () => void
  /**
   * Called when the field input value is changed.
   */
  onChange: () => void

  /**
   * Register any field that is a child of this field.
   */
  register: <
    TChildPath extends TValue extends FieldValues ? FieldPath<TValue> : never,
    TChildDefaultValue extends TValue extends FieldValues ? FieldPathValue<TValue, TChildPath> | undefined : never,
  >(
    path: TChildPath,
    defaultValue?: TChildDefaultValue
  ) => TValue extends FieldValues ? Field<FieldPathValue<TValue, TChildPath>, any> : never

  /**
   * Register any array that is a child of this field.
   */
  registerArray: <TPath extends TValue extends FieldValues ? FieldPath<TValue> : never>(
    path: TPath
  ) => TValue extends FieldValues ? FieldArray<FieldPathValue<TValue, TPath>> : never
}
```

:::
## Source

[Source](https://github.com/wisemen-digital/vue-formango/blob/main/src/lib/useForm.ts) - [Types](https://github.com/wouterlms/forms/blob/main/src/types/form.type.ts)