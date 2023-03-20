### Install

    npm install @appwise/forms

`@appwise/forms` uses Zod for validation (https://zod.dev/)

    npm install zod

### Usage

## Creating a schema

```ts
import { useForm } from '@appwise/forms'
import { z } from 'zod'

// Create a schema
const exampleForm = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

// Parse the schema to `useForm` along with a function to handle the submit.
// Optionally, you can also pass a function to prepare the form.
const form = useForm(loginForm, {
  // The form will not be considered dirty until this promise has been resolved.
  onPrepare: () => {
    // TODO: E.g. Fetch data from an api

    return {
      name: 'Foo',
      email: 'foo@mail.com',
    }
  },
  onSubmit: (values) => {
    console.log(values)
  },
})
```

---

## useForm()

```ts
// Registers a new form field. You can optionally provide a default value.
form.register('firstName')
form.register('firstName', 'Foo')
form.register('foo.bar.0')

// Unregisters a previously registered field.
form.unregister('firstName')

// Set form values.
form.setValues({
  firstName: 'Foo'
})

// Set form errors.
form.setErrors({
  firstName: {
    _errors: ['Custom error']
  }
})

// A promise that resolves once the form has been successfully submitted.
form.submit()

// The collection of all registered fields' errors.
form.errors

// Indicates whether the form is dirty or not.
form.isDirty

// Indicates whether the form is ready or not.
// Will be `true` once onPrepare has been called.
// If `onPrepare` was not provided, the form will immediately be ready.
form.isReady

// Indicates whether the form is currently submitting or not.
form.isSubmitting

// Indicates whether the form is currently valid or not.
form.isValid
```

---


## form.register()

```ts
const field = form.register('...')

// Updates the current value of the field.
field['onUpdate:modelValue']()

// Sets the current value of the field.
// This is an alias of `onUpdate:modelValue`.
field.setValue()

// Called when the field input is blurred.
field.onBlur()

// Called when the field input value is changed.
field.onChange()

// The current value of the field.
field.modelValue

// The errors associated with the field and its children.
field.errors

// Indicates whether the field has been touched (blurred).
field.isTouched

// Indicates whether the field has been changed.
// This flag will remain `true` even if the field value is set back to its initial value.
field.isChanged

// Indicates whether the field value is different from its initial value.
field.isDirty
```