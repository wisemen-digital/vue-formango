
## Installation


```bash
pnpm i formango
```

> The validation of this package relies on [Zod](https://zod.dev/).

## Documentation

Refer to the [documentation](https://wouterlms.github.io/forms/) for a more in depth look.
## Usage Example

```vue
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
const { form } = useForm(exampleForm,
  // Loads the form with initial data
  {
    name: 'Foo',
    email: 'foo@mail.com',
  },
)

// Now you can register fields on the form, which are fully typed.
// These fields will handle the actual data-binding
const name = form.register('name')
</script>

<template>
  <CustomInput v-bind="name" />
  <CustomInput v-bind="form.register('email')" />
</template>
```

