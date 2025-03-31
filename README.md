# Getting started

## Installation


```bash
pnpm i formango
```

> The validation of this package relies on [Zod](https://zod.dev/), [Valibot](https://valibot.dev/) or [ArkType](https://arktype.io/), or any other schema library that implements the [standard schema spec](https://github.com/standard-schema/standard-schema).

## Why Go Bananas for Formango

Formango takes the hassle out of form validation in your Vue applications, providing solid benefits that enhance your development process:
1. <b>Type-Safe Confidence</b>: Formango is built with TypeScript at its core, ensuring that your form validations are robust and free from type-related surprises. Catch errors at compile-time and enjoy a more confident development experience.
2. <b>Built-in Standard Schema Spec Integration</b>: Formango is built to integrate with Standard Schema Spec, which means it works with Zod, Valibot and ArkType. This means you can define your data structures with any of these libraries and effortlessly apply these schemas to your Vue forms using Formango.
3. <b>Clean and Maintainable</b>: Say goodbye to tangled validation logic. Formango promotes a clean and declarative approach to form validation, making your codebase easier to understand and maintain.
4. <b>Flexibility in Your Hands</b>: As a headless validation library, Formango adapts to your needs, whether it's handling complex and custom forms or a simple login form. Customize the validation to fit your specific use cases without compromising on quality.
5. <b>Vue Ecosystem Friendly</b>: Built-in devtools makes it easy to debug your complex forms.
6. <b>Fruity</b>: It follows the trend of fruit-based Vue libraries.


## Usage Example

```vue
<script setup lang="ts">
import { useForm } from 'formango'
import { z } from 'zod'
import { toFormField } from './toFormField'

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
    /* Data type is inferred from the schema, hande your submit logic here.
      Will only get here if the form is fully valid.
      {
        email: string
        name: string
      }
    */
    console.log(values)
  }
})

// Now you can register fields on the form, which are fully typed.
// These fields will handle the actual data-binding
const name = form.register('name')
const email = form.register('email')
</script>

<template>
  <CustomInput v-bind="toFormField(name)" />
  <CustomInput v-bind="toFormField(email)" />
  <button @click="form.submit">
    Submit
  </button>
</template>
```

Refer to the [form](https://wisemen-digital.github.io/vue-formango/api/useForm), [field](https://wisemen-digital.github.io/vue-formango/api/field) and [array field](https://wisemen-digital.github.io/vue-formango/api/field-array) API for more details.