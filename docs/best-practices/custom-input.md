# Custom input

Instead of binding all the events in the native input, it is best to create a wrapper around an input which handles all the bindings.
Here is a custom input which shows the error if the user has focused and blurred the input.

In this example your v-model, blur and errors automatically get bound by using v-bind on a Field.
This is a very basic example as a starting point.


::: code-group
```vue [CustomInput.vue]
<script setup lang="ts">
import type { ZodFormattedError } from 'zod'
import { computed } from 'vue'

interface InputFormProps<T extends InputType> extends Omit<InputProps<T>, 'isInvalid'> {
  /**
   * The error messages associated with the component, if any.
   * It should be an object with an "_errors" property containing an array of strings.
   */
  errors?: ZodFormattedError<string> | null | undefined

  /**
   * Determines if the component has emitted a `blur` event.
   */
  isTouched: boolean
}

const {
  isTouched = false,
  errors = { _errors: [] },
} = defineProps<Props>()

const emits = defineEmits<{
  blur: []
}>()

const model = defineModel<string | number | null>({
  required: true,
})
const errorShown = computed(() => errors._errors.length > 0 && (isTouched))
</script>

<template>
  <div>
    <input
      v-model="model"
      @blur="emits('blur')"
    >
    <p v-if="errorShown">
      {{ errors._errors[0] }}
    </p>
  </div>
</template>
```

```vue [FormView.vue]
<script setup lang="ts">
import { useForm } from 'formango'
import { z } from 'zod'

// Create a schema
const exampleForm = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

// Parse the schema to `useForm` along with a function to handle the submit.
// Optionally, you can also pass an object to prepare the form.
const form = useForm({
  schema: exampleForm,
  initialState: {
    name: 'Foo',
    email: 'foo@mail.com',
  },
  onSubmit: (data) => {
  /* Values type is inferred from the schema, hande your submit logic here.
    Will only get here if the form is fully valid.
    {
      email: string
      name: string
    }
  */
    // Handle form submit
  },
})

// Now you can register fields on the form, which are fully typed.
// These fields will handle the actual data-binding
const name = form.register('name')
const email = form.register('email')

// A mapper function to map these values to your input
function toFormField<TValue, TDefaultValue>(field: Field<TValue, TDefaultValue>): {
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
</script>

<template>
  <CustomInput v-bind="toFormField(name)" />
  <CustomInput v-bind="toFormField(email)" />
  <button @click="form.submit">
    Submit
  </button>
</template>
```
:::