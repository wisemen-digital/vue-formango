# Subforms

## How to

Using the addErrors function on the Form object, you can add external errors to the form.

## Example

::: code-group

```vue [LoginForm.vue]
<script setup lang="ts">
import { useForm } from 'formango'

import { loginFormSchema } from './loginForm.model'

const { form, onSubmitForm } = useForm({
  schema: loginFormSchema,
})

const email = form.register('email')
const password = form.register('password')

onSubmitForm(async (user) => {
  // Handle user create
  const response = await fetch('loginUrl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
  const data = await response.json()

  if (!response.ok) {
    /* Response is not ok, set form errors, response example:
     {
        'password': 'Credentials are invalid',
     }

    **/
    const passwordError = (await data.json()).password
    // Sets the errors to the password field, so the user can see them
    form.addErrors({
      password: passwordError,
    })
    return
  }

  console.log(data)
})
</script>

<template>
  <div>
    <CustomInput v-bind="email" />
    <CustomInput v-bind="password" />
  </div>
</template>
```

```ts [loginForm.model.ts]
import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type LoginForm = z.infer<typeof loginFormSchema>
```

:::