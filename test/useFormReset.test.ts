import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema, sleep } from './testUtils'

describe('reset form', () => {
  it('should reset the form with initial state', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
      initialState: {
        name: 'John',
      },
    })

    const name = form.register('name')

    sleep(0)

    expect(name.attrs.modelValue.value).toEqual('John')
    name.setValue('Doe')

    sleep(0)

    expect(name.attrs.modelValue.value).toEqual('Doe')
    form.reset()

    sleep(0)

    expect(name.attrs.modelValue.value).toEqual('John')
  })

  it('should throw error when resetting the form without initial state', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },

    })

    expect(() => form.reset()).toThrowError()
  })
})
