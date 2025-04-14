import {
  describe,
  expect,
  it,
} from 'vitest'

import { useForm } from '../src/lib/useForm'
import {
  basicSchema,
  objectArraySchema,
  sleep,
} from './testUtils'

describe('reset form', () => {
  it('should reset the form with initial state', async () => {
    const form = useForm({
      initialState: { name: 'John' },
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    await sleep(0)

    expect(name.modelValue.value).toBe('John')
    name.setValue('Doe')

    await sleep(0)

    expect(name.modelValue.value).toBe('Doe')
    form.reset()

    await sleep(0)

    expect(name.modelValue.value).toBe('John')
  })

  it('should throw error when resetting the form without initial state', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },

    })

    expect(() => form.reset()).toThrow('In order to reset the form, you need to provide an initial state')
  })

  it('should reset the isTouched state of all fields', async () => {
    const form = useForm({
      initialState: {
        array: [
          { name: null },
          { name: null },
        ],
      },
      schema: objectArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const firstName = form.register('array.0.name')
    const secondName = form.register('array.1.name')

    firstName.onBlur()

    await sleep(0)

    expect(firstName.isTouched.value).toBeTruthy()
    expect(secondName.isTouched.value).toBeFalsy()

    secondName.onBlur()

    await sleep(0)

    expect(firstName.isTouched.value).toBeTruthy()
    expect(secondName.isTouched.value).toBeTruthy()

    form.reset()

    await sleep(0)

    expect(firstName.isTouched.value).toBeFalsy()
    expect(secondName.isTouched.value).toBeFalsy()

    secondName.onBlur()

    await sleep(0)

    expect(firstName.isTouched.value).toBeFalsy()
    expect(secondName.isTouched.value).toBeTruthy()
  })
})
