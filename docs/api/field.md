# Field

Field that gets returned from the register field function from the form object. Ideally you build a custom input field which handles all the bindings of the field, so you can just v-bind the entire object.

## Usage Default

```ts
const field = form.register('name', 'default name')
```

```vue
<template>
  <CustomInput v-bind="field" />
  <CustomInput v-bind="form.register('email')" />
</template>
```

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
| onUpdate:modelValue | `Function` | Handles the updating of modelValue event, used to bind v-model|
| setValue | `Function` | Sets modelValue |

## Example input

Visit the [best practice page](../guide/best-practices/custom-input.md) to view an example of a custom input consuming the field API.

## Source

[Source](https://github.com/wouterlms/forms/blob/main/src/composables/useForm.ts) - [Types](https://github.com/wouterlms/forms/blob/main/src/types/form.type.ts)