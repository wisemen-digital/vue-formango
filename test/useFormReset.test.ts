import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema, objectArraySchema, sleep } from './testUtils'

describe('reset form', () => {
  it('should reset the form with initial state', async () => {
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

    await sleep(0)

    expect(name.modelValue.value).toEqual('John')
    name.setValue('Doe')

    await sleep(0)

    expect(name.modelValue.value).toEqual('Doe')
    form.reset()

    await sleep(0)

    expect(name.modelValue.value).toEqual('John')
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

  it('should reset the isTouched state of all fields', async () => {
    const form = useForm({
      schema: objectArraySchema,
      onSubmit: (data) => {
        return data
      },
      initialState: {
        array: [
          {
            name: null,
          },
          {
            name: null,
          },
        ],
      },
    })

    const firstName = form.register('array.0.name')
    const secondName = form.register('array.1.name')

    firstName.onBlur()

    await sleep(0)

    expect(firstName.isTouched.value).toEqual(true)
    expect(secondName.isTouched.value).toEqual(false)

    secondName.onBlur()

    await sleep(0)

    expect(firstName.isTouched.value).toEqual(true)
    expect(secondName.isTouched.value).toEqual(true)

    form.reset()

    await sleep(0)

    expect(firstName.isTouched.value).toEqual(false)
    expect(secondName.isTouched.value).toEqual(false)

    secondName.onBlur()

    await sleep(0)

    expect(firstName.isTouched.value).toEqual(false)
    expect(secondName.isTouched.value).toEqual(true)
  })
})
