# useForm

Initializes a form from a Zod schema and returns a form object and a onSubmitForm callback function.

### Form object

| State           | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| errors        | `ComputedRef<FormattedError<SchemaType>[]>` | Current errors on the form, refer to Zod                              |
| hasAttemptedToSubmit    | `ComputedRef<boolean>`  | Boolean indicating if the form has been submitted.
| isDirty | `ComputedRef<boolean>` | Boolean indicating if the form is currently dirty (does not get set if you enter initial values in the form) |
| isSubmitting | `ComputedRef<boolean>` | Boolean indicating if the form is currently submitting |
| isValid | `ComputedRef<boolean>`| Boolean indicating if the form is currently valid |
| register | `Function` | Register function to register a field, default value is optional. E.g: ```form.register('email', 'default email')```|
| registerArray | `Function` | Register function to register an array field. E.g: ```form.registerArray('emails')``` |
| unregister | `Function` | Unregister function to unregister a field. E.g: ```form.unregister('email')``` |
| addErrors | `Function` | Manually set errors on fields. |
| setValues | `Function` | Manually set values on fields. |
| state | `ComputedRef<SchemaType>` | Current state of the form |
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

const form = useForm(
  {
    schema: exampleSchema,
    onSubmit: (data) => {
      /* Data type is inferred from the schema
      {
        email: string
        password: string
        name: string
        emails: string[]
      }
      */
      // Handle form submit
    },
    initialData: {
      email: '',
      password: '',
      name: 'Robbe',
      emails: [],
    },
  }
)

const email = form.register('email', 'default email')
const emails = form.registerArray('emails')
onUnmounted(() => {
  form.unregister('email')
})

// Manually set errors on fields, for example if you get errors from your backend
form.addErrors([{
  path: 'email',
  message: 'Invalid email',
}])

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
form.state.value

// Triggers onSubmitForm callback if form is valid
form.submit()
```

## Type definitions
 
::: code-group
```ts [UseFormOptions]
interface UseFormOptions<TSchema extends StandardSchemaV1> {
  /**
   * The schema of the form.
   */
  schema: TSchema
  /**
   * The initial state of the form
   */
  initialState?: MaybeRefOrGetter<NestedNullableKeys<StandardSchemaV1.InferOutput<TSchema>>>
  /**
   * Called when the form is valid and submitted.
   * @param data The current form data.
   */
  onSubmit: (data: StandardSchemaV1.InferOutput<TSchema>) => void
  /**
     * Called when the form is attempted to be submitted, but is invalid.
     * Only called for client-side validation.
     */
  onSubmitError?: ({ data, errors }: { data: DeepPartial<NestedNullableKeys<StandardSchemaV1.InferOutput<TSchema>>>; errors: FormattedError<StandardSchemaV1.InferOutput<TSchema>>[] }) => void
}
```

```ts [Form]
export interface Form<TSchema extends StandardSchemaV1> {
  /**
   * Internal id of the form, to track it in the devtools.
   */
  _id: string
  /**
   * The current state of the form.
   */
  state: ComputedRef<Readonly<DeepPartial<StandardSchemaV1.InferOutput<TSchema>>>>
  /**
   * The collection of all registered fields' errors.
   */
  errors: ComputedRef<FormattedError<StandardSchemaV1.InferOutput<TSchema>>[]>
  /**
  * The raw errors associated with the field and its children.
  */
  rawErrors: ComputedRef<StandardSchemaV1.Issue[]>

  /**
   * Indicates whether the form is dirty or not.
   *
   * A form is considered dirty if any of its fields have been changed.
   */
  isDirty: ComputedRef<boolean>
  /**
   * Indicates whether the form is currently submitting or not.
   */
  isSubmitting: ComputedRef<boolean>
  /**
   * Indicates whether the form has been attempted to submit.
   */
  hasAttemptedToSubmit: ComputedRef<boolean>
  /**
   * Indicates whether the form is currently valid or not.
   *
   * A form is considered valid if all of its fields are valid.
   */
  isValid: ComputedRef<boolean>
  /**
   * Registers a new form field.
   *
   * @returns A `Field` instance that can be used to interact with the field.
   */
  register: Register<StandardSchemaV1.InferOutput<TSchema>>
  /**
   * Registers a new form field array.
   *
   * @returns A `FieldArray` instance that can be used to interact with the field array.
   */
  registerArray: RegisterArray<TSchema>
  /**
   * Unregisters a previously registered field.
   *
   * @param path The path of the field to unregister.
   */
  unregister: Unregister<TSchema>
  /**
   * Sets errors in the form.
   *
   * @param errors The new errors for the form fields.
   */
  addErrors: (errors: FormattedError<StandardSchemaV1.InferOutput<TSchema>>[]) => void
  /**
   * Sets values in the form.
   *
   * @param values The new values for the form fields.
   */
  setValues: (values: DeepPartial<StandardSchemaV1.InferOutput<TSchema>>) => void
  /**
   * Submits the form.
   *
   * @returns A promise that resolves once the form has been successfully submitted.
   */
  submit: () => Promise<void>
  /**
   * Resets the form to the initial state.
   */
  reset: () => void
}
```

```ts [Register]
// Returns a Field, read the Field API documentation for more info
export type Register<TSchema> = <
  TPath extends FieldPath<TSchema>,
  TValue extends FieldPathValue<TSchema, TPath>,
  TDefaultValue extends FieldPathValue<TSchema, TPath> | undefined,
>(field: TPath, defaultValue?: TDefaultValue) => Field<TValue, TDefaultValue>
```

```ts [RegisterArray]
// Returns a FieldArray, read the FieldArray API documentation for more info
export type RegisterArray<TSchema extends StandardSchemaV1> = <
  TPath extends FieldPath<StandardSchemaV1.InferOutput<TSchema>>,
  TValue extends FieldPathValue<StandardSchemaV1.InferOutput<TSchema>, TPath>,
  TDefaultValue extends FieldPathValue<StandardSchemaV1.InferOutput<TSchema>, TPath> | undefined,
>(field: TPath, defaultValue?: TDefaultValue) => FieldArray<TValue>
```

```ts [Unregister]
export type Unregister<T extends StandardSchemaV1> = <
  P extends FieldPath<StandardSchemaV1.InferOutput<T>>,
>(field: P) => void
```

:::

## Source

[Source](https://github.com/wisemen-digital/vue-formango/blob/main/src/lib/useForm.ts) - [Types](https://github.com/wouterlms/forms/blob/main/src/types/form.type.ts)