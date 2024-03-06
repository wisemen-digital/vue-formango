# useForm

Initializes a form from a Zod schema and returns a form object and a onSubmitForm callback function.

### Form object

| State           | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| errors        | `ZodFormattedError` | Current errors on the form, refer to Zod                              |
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
import { useForm } from 'formango'

const exampleSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(255),
  emails: z.array(z.string().email()),
})

const {
  form,
  onSubmitForm,
} = useForm(
  {
    schema: exampleSchema,
    initialData: {
      email: '',
      password: '',
      name: 'Robbe',
      emails: [],
    },
  }
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

// Manually set errors on fields, for example if you get errors from your backend
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

## Type definitions
 
::: code-group

```ts [UseFormReturnType]
interface UseFormReturnType<TSchema extends z.ZodType> {
  /**
   * Called when the form is valid and submitted.
   * @param data The current form data.
   */
  onSubmitForm: (cb: (data: z.infer<TSchema>) => void) => void
  /**
   * The form instance itself.
   */
  form: Form<TSchema>
}
```


```ts [UseFormOptions]
interface UseFormOptions<TSchema extends z.ZodType> {
  /**
   * Zod schema to be parsed
   */
  schema: TSchema
  /**
   * Initial state that infers the type from the Zod schema
   */
  initialState?: z.infer<TSchema>
}
```

```ts [Form]
interface Form<T extends z.ZodType> {
  /**
   * The current state of the form.
   */
  state: Readonly<DeepPartial<z.infer<T>>>
  /**
   * The collection of all registered fields' errors.
   */
  errors: z.ZodFormattedError<z.infer<T>>
  /**
   * Indicates whether the form is dirty or not.
   *
   * A form is considered dirty if any of its fields have been changed.
   */
  isDirty: boolean
  /**
   * Indicates whether the form is currently submitting or not.
   */
  isSubmitting: boolean
  /**
   * Indicates whether the form has been attempted to submit.
   */
  hasAttemptedToSubmit: boolean
  /**
   * Indicates whether the form is currently valid or not.
   *
   * A form is considered valid if all of its fields are valid.
   */
  isValid: boolean
  /**
   * Registers a new form field.
   *
   * @returns A `Field` instance that can be used to interact with the field.
   */
  register: Register<T>
  /**
   * Registers a new form field array.
   *
   * @returns A `FieldArray` instance that can be used to interact with the field array.
   */
  registerArray: RegisterArray<T>
  /**
   * Unregisters a previously registered field.
   *
   * @param path The path of the field to unregister.
   */
  unregister: Unregister<T>
  /**
   * Sets errors in the form.
   *
   * @param errors The new errors for the form fields.
   */
  addErrors: (errors: DeepPartial<z.ZodFormattedError<z.infer<T>>>) => void
  /**
   * Sets values in the form.
   *
   * @param values The new values for the form fields.
   */
  setValues: (values: DeepPartial<z.infer<T>>) => void
  /**
   * Submits the form.
   *
   * @returns A promise that resolves once the form has been successfully submitted.
   */
  submit: () => Promise<void>
}
```

```ts [Register]
// Returns a Field, read the Field API documentation for more info
export type Register<TSchema extends z.ZodType> = <
  TPath extends FieldPath<z.infer<TSchema>>,
  TValue extends FieldPathValue<z.infer<TSchema>, TPath>,
  TDefaultValue extends FieldPathValue<z.infer<TSchema>, TPath> | undefined,
>(field: TPath, defaultValue?: TDefaultValue) => Field<TValue, TDefaultValue>
```

```ts [RegisterArray]
// Returns a FieldArray, read the FieldArray API documentation for more info
export type RegisterArray<TSchema extends z.ZodType> = <
  TPath extends FieldPath<z.infer<TSchema>>,
  TValue extends FieldPathValue<z.infer<TSchema>, TPath>,
  TDefaultValue extends FieldPathValue<z.infer<TSchema>, TPath> | undefined,
>(field: TPath, defaultValue?: TDefaultValue) => FieldArray<TValue>
```

```ts [Unregister]
export type Unregister<T extends z.ZodType> = <
  P extends FieldPath<z.infer<T>>,
>(field: P) => void
```

:::

## Source

[Source](https://github.com/wisemen-digital/vue-formango/blob/main/src/lib/useForm.ts) - [Types](https://github.com/wouterlms/forms/blob/main/src/types/form.type.ts)