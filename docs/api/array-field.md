# Array field

Array field that gets returned when you register an array with the registerArray function.

## Usage Default

::: code-group

```vue [ExampleArray.vue]
<script setup lang="ts">
import { useForm } from 'formango'
import { arrayForm } from './array.model'

const { form } = useForm(arrayForm)

const emails = form.registerArray('emails')
</script>

<template>
  <div>
    <ArrayTestField
      v-for="(emailField, key) in emails.fields"
      :key="emailField"
      :form="form"
      :index="key"
      @remove-field="emails.remove(key)"
    />
    <button @click="emails.append()">
      Add email
    </button>
  </div>
</template>
```

```vue [ExampleArrayField.vue]
<script setup lang="ts">
import type { Form } from 'formango'
import type { arrayForm } from './array.model'

interface Props {
  form: Form<typeof arrayForm>
  index: number
}

const { form, index } = defineProps<Props>()
const emits = defineEmits<{
  'removeField': []
}>()

const email = form.register(`emails.${index}`, '')
</script>

<template>
  <div>
    <label for="email">{{ index }}</label>
    <button @click="emits('removeField')">
      Remove
    </button>
    <FormInputField v-bind="email" />
  </div>
</template>
```

```ts [example.model.ts]
import { z } from 'zod'

export const arrayForm = z.object({
  emails: z.array(z.string().email()),
})

export type ArrayForm = z.infer<typeof arrayForm>
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
| isDirty | `Boolean` | Boolean indicating if the array is currently dirty |
| isValid | `Boolean` | Boolean indicating if the array is currently valid |
| modelValue | `T` | The value of the array |
| setValue | `Function` | Sets the value of the array |

## Source

[Source](https://github.com/wouterlms/forms/blob/main/src/composables/useForm.ts) - [Types](https://github.com/wouterlms/forms/blob/main/src/types/form.type.ts)