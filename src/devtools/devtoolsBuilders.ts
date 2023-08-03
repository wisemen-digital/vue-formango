import type { Field, Form } from '../types'

export function buildFormState(form: Form<any>) {
  return {
    'Form state': [
      {
        key: 'state',
        value: form._state,
      },
      {
        key: 'errors',
        value: form.errors,
      },
      {
        key: 'isDirty',
        value: form.isDirty,
      },
      {
        key: 'hasAttemptedToSubmit',
        value: form.hasAttemptedToSubmit,
      },
      {
        key: 'isReady',
        value: form.isReady,
      },
      {
        key: 'isSubmitting',
        value: form.isSubmitting,
      },
      {
        key: 'isValid',
        value: form.isValid,
      },
    ],
  }
}

export function buildFieldState(field: Field<any>) {
  return {
    'Field state': [
      {
        key: 'value',
        value: field.modelValue,
      },
      {
        key: 'path',
        value: field._path,
      },
      {
        key: 'errors',
        value: field.errors,
      },
      {
        key: 'isChanged',
        value: field.isChanged,
      },
      {
        key: 'isDirty',
        value: field.isDirty,
      },
      {
        key: 'isTouched',
        value: field.isTouched,
      },
    ],
  }
}
