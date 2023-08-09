# useForm

Initializes a form from a Zod schema and returns a form object and a onSubmitForm callback function.

## Usage Default

```ts
import { z } from 'zod'
import { useForm } from '@appwise/forms'
const exampleSchema = z.object({
  name: z.string().min(3).max(255),
})

const {
  form,
  onSubmitForm,
} = useForm(exampleSchema)

onSubmitForm((values) => {
  console.log(values)
})

form.register('name', 'default name')
```

### Form object

| State           | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| errors        | `Object` | Current errors on the form                              |
| hasAttemptedToSubmit    | `Boolean`  | Boolean indicating if the form has been submitted.     |
| isDirty | `Boolean` | Boolean indicating if the form is currently dirty (does not get set if you enter initial values in the form) |
| isSubmitting | `Boolean` | Boolean indicating if the form is currently submitting |
| isValid | `Boolean`| Boolean indicating if the form is currently valid |
| register | `Function` | Register function to register a field, default value is optional. E.g: ```form.register('email', 'default email')```|
| registerArray | `Function` | Register function to register an array field. E.g: ```form.registerArray('emails')``` |
| unregister | `Function` | Unregister function to unregister a field. E.g: ```form.unregister('email')``` |
| addErrors | `Function` | Manually set errors on fields. |
| setValues | `Function` | Manually set values on fields. |
| state | `Object` | Current state of the form |
| submit | `Function` | Submit function to submit the form, which triggers the onSubmitForm callback if it is valid |

## Usage Advanced

```ts
import { z } from 'zod'
import { useForm } from '@appwise/forms'

const exampleSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(255),
  emails: z.array(z.string().email()),
})

const {
  form,
  onSubmitForm,
} = useForm(exampleSchema,
  // Optional initial values
  {
    email: '',
    password: '',
    name: 'Robbe',
    emails: [],
  },
)

onSubmitForm((values) => {
  /* Values type is inferred from the schema
  {
    email: string
    password: string
    name: string
    emails: string[]
  }
  */
  console.log(values)
})

const email = form.register('email', 'default email')
const emails = form.registerArray('emails')
onUnmounted(() => {
  form.unregister('email')
})

// Manually set errors on fields
form.addErrors({
  email: {
    _errors: ['Invalid email'],
  },
})

// Manually set values on fields
form.setValues({
  email: '',
  password: '',
  name: 'Robbe',
  emails: ['email@test.be']
})

/* Current state of the form
  {
    email: string
    password: string
    name: string
    emails: string[]
  },
*/
form.state

// Triggers onSubmitForm callback if form is valid
form.submit()
```

## Source

[Source](https://github.com/wouterlms/forms/blob/main/src/composables/useForm.ts) - [Types](https://github.com/wouterlms/forms/blob/main/src/types/form.type.ts)