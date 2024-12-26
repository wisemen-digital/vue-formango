# Array field

Array field that gets returned when you register an array with the registerArray function.

## Usage Default

::: code-group

```vue [ExampleArray.vue]
<script setup lang="ts">
import { useForm } from 'formango'

import { arrayFormSchema } from './example.model'
import ExampleArrayField from './ExampleArrayField.vue'

const form = useForm({
  schema: arrayFormSchema,
})

const emails = form.registerArray('emails')

function onRemoveEmail(index: number): void {
  emails.remove(index)
}

function onAddEmail(): void {
  emails.append()
}
</script>

<template>
  <div>
    <ExampleArrayField
      v-for="(emailField, key) in emails.fields"
      :key="emailField"
      :emails="emails"
      :index="key"
      @remove-field="onRemoveEmail(key)"
    />
    <button @click="onAddEmail()">
      Add email
    </button>
  </div>
</template>
```

```vue [ExampleArrayField.vue]
<script setup lang="ts">
import type { FieldArray } from 'formango'

import type { Email } from './example.model'

interface Props {
  emails: FieldArray<Email[]>
  index: number
}

const { emails, index } = defineProps<Props>()
const emits = defineEmits<{
  removeField: []
}>()

const email = emails.register(`${index}`)
</script>

<template>
  <div>
    <label for="email">{{ index }}</label>
    <button @click="emits('removeField')">
      Remove
    </button>
    <CustomInput v-bind="email" />
  </div>
</template>
```

```ts [example.model.ts]
import { z } from 'zod'

export const emailSchema = z.string().email()
export const arrayFormSchema = z.object({
  emails: z.array(emailSchema),
})

export type ArrayForm = z.infer<typeof arrayFormSchema>
export type Email = z.infer<typeof emailSchema>
```

:::

### Array field object

| State           | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| fields | `Function` | Array of unique indexes which should be used in a v-for to render all the fields |
| append | `Function` | Adds a field to the end of the array |
| prepend | `Function` | Adds a field to the start of the array |
| insert | `Function` | Adds a field to the a specified location of the array |
| pop | `Function` | Removes the last field of the array |
| remove | `Function` | Removes a field of the array at a specified position |
| shift | `Function` | Removes the first field of the array |
| move | `Function` | Swaps the position of two elements of the array |
| empty | `Function` | Empties the array |
| errors | `Object` | Current errors on the array |
| isDirty | `ComputedRef<Boolean>` | Boolean indicating if the array is currently dirty |
| isValid | `ComputedRef<Boolean>` | Boolean indicating if the array is currently valid |
| modelValue | `ComputedRef<T>` | The value of the array |
| setValue | `Function` | Sets the value of the array |
| register | `Function` | Function to register any fields under this field |


## Type definitions
 
```ts
/**
 * Represents a form field array.
 *
 * @typeparam T The type of the form schema.
 */
export interface FieldArray<TValue extends any[]> {
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
  errors: ComputedRef<FormattedError<TValue>[]>
  /**
  * The raw errors associated with the field and its children.
  */
  rawErrors: ComputedRef<StandardSchemaV1.Issue[]>
  /**
   * The current value of the field.
   */
  modelValue: ComputedRef<TValue>
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
  value: ComputedRef<TValue>
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
```
## Source

[Source](https://github.com/wouterlms/forms/blob/main/src/composables/useForm.ts) - [Types](https://github.com/wouterlms/forms/blob/main/src/types/form.type.ts)