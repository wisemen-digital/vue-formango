# Formango

## 3.0.0

### Major changes

- Form is now the root object that is returned by useForm, instead { form, ... }
- FieldArray type now requires a single generic to be passed, instead of an array of it
- FieldArray now returns a type with generic never if passed a non-array path
- Added onSubmitError callback to useForm, which passes the data and errors to the callback function
- Added onSubmit callback to useForm, which passes the data to the callback function
- Added rawErrors to useForm, which is an array of objects with a message and path, which are the raw errors from StandardSchemaV1
- Added formatErrorsToZodFormattedError to format the errors to ZodFormattedError, which can handle both FormattedError and StandardSchemaV1 Issues
- Added reset function to useForm, which resets the form to the initial state
- Removed the onSubmitFormError callback from useForm, as it is now handled by onSubmitError
- Removed the onSubmitForm callback from useForm, as it is now handled by onSubmit
- Refactored internal code to use StandardSchemaV1 instead of Zod, which means Zod, ArkType and Valibot are now supported
- Refactored internal code to use Ref and ComputedRef instead of Reactive
- Refactored errors to custom formatting, that is an array of objects with a message and path


## 2.0.34

### Minor changes

- Allow for nested object values to be nullable in initialState

## 2.0.25

### Major changes

- Reimplemented vue devtools

## 2.0.0

### Major Changes

- Implemented Register function on the Field object and the FieldArray object, meaning you create subforms more easily. Visit the [documentation](https://wisemen-digital.github.io/vue-formango/examples/subforms) for an example.
- Changed the useForm API to use a single object. For future updates / features the API doesn't need breaking changes this way.
- Added tests.
- Refactored library based on tests.
- Updated docs for 2.0 and added more examples.
