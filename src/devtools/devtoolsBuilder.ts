import type { Field, Form } from '../types'

export function buildFormState(form: Form<any>) {
  return {
    'Form state': [
      {
        key: 'state',
        value: form.state.value,
      },
      {
        key: 'errors',
        value: form.errors.value,
      },
      {
        key: 'isDirty',
        value: form.isDirty.value,
      },
      {
        key: 'hasAttemptedToSubmit',
        value: form.hasAttemptedToSubmit.value,
      },
      {
        key: 'isSubmitting',
        value: form.isSubmitting.value,
      },
      {
        key: 'isValid',
        value: form.isValid.value,
      },
    ],
  }
}

export function buildFieldState(field: Field<any, any>) {
  return {
    'Field state': [
      {
        key: 'value',
        value: field.modelValue.value,
      },
      {
        key: 'path',
        value: field._path.value,
      },
      {
        key: 'errors',
        value: field.errors.value,
      },
      {
        key: 'isChanged',
        value: field.isChanged.value,
      },
      {
        key: 'isDirty',
        value: field.isDirty.value,
      },
      {
        key: 'isTouched',
        value: field.isTouched.value,
      },
    ],
  }
}
