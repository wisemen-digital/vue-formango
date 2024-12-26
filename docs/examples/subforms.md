# Subforms

## How to

Using the Field register function, it is possible to create reusable subforms that manage their own state.

## Example

::: code-group

```ts [userForm.model.ts]
import { z } from 'zod'

import { addressSchema } from './address.model'

export const userSchema = z.object({
  email: z.string().email(),
  shippingAddress: addressSchema,
  invoiceAddress: addressSchema,
})

export type User = z.infer<typeof userSchema>
```

```ts [address.model.ts]
import { z } from 'zod'

export const addressSchema = z.object({
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
})

export type Address = z.infer<typeof addressSchema>
```

```vue [UserForm.vue]
<script setup lang="ts">
import { useForm } from 'formango'

import { toFormField } from './toFormField'
import AddressForm from './AddressForm.vue'
import { userSchema } from './userForm.model'

const form = useForm({
  schema: userSchema,
  onSubmit: (data) => {
    // Handle user create
    console.log(user)
  }
})

const email = form.register('email')

const invoiceAddress = form.register('invoiceAddress')
const shippingAddress = form.register('shippingAddress')
</script>

<template>
  <div>
    <CustomInput v-bind="toFormField(email)" />
    <AddressForm
      :address="invoiceAddress"
      label="Invoice Address"
    />

    <AddressForm
      :address="shippingAddress"
      label="Shipping Address"
    />
  </div>
</template>
```

```vue [AddressForm.vue]
<script setup lang="ts">
import type { Field } from 'formango'
import { toFormField } from './toFormField'

import type { Address } from './address.model'

interface Props {
  label: string
  address: Field<Address>
}

const props = defineProps<Props>()

const street = props.address.register('street')
const city = props.address.register('city')
const state = props.address.register('country')
const postalCode = props.address.register('postalCode')
</script>

<template>
  <div>
    <p>
      {{ label }}
    </p>
    <CustomInput v-bind="toFormField(street)" />
    <CustomInput v-bind="toFormField(city)" />
    <CustomInput v-bind="toFormField(state)" />
    <CustomInput v-bind="toFormField(postalCode)" />
  </div>
</template>
```