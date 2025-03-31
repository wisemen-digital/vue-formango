import type { UnwrapRef } from 'vue'
import type { Field, Form } from '../types'

export function buildFormState(form: UnwrapRef<Form<any>>) {
  return {
    'Form state': [
      {
        key: 'state',
        value: form.state,
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

export function buildFieldState(field: UnwrapRef<Field<any, any>>) {
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
