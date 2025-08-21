import {
  describe,
  expect,
  it,
} from 'vitest'

import { useForm } from '../src/lib/useForm'
import {
  basicSchema,
  objectSchema,
} from './testUtils'

describe('isTouched', () => {
  it('should be false by default', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    expect(name.isTouched.value).toBeFalsy()
  })

  it('should be true when `onBlur` is called', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    name.onBlur()

    expect(name.isTouched.value).toBeTruthy()
  })

  it('should be touched when a child field is touched', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const b = a.register('b')

    b.onBlur()

    expect(a.isTouched.value).toBeTruthy()
  })
})
