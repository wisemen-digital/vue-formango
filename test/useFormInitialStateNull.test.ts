import { describe, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema, objectSchema } from './testUtils'

describe('initial state type allows nulls', () => {
  it('initial state primitive is correct', async () => {
    useForm({
      schema: basicSchema,
      initialState: {
        name: 'Joe',
      },
      onSubmit: (data) => {
        return data
      },
    })
  })

  it('initial state primitive is nullable', async () => {
    useForm({
      schema: basicSchema,
      initialState: {
        name: null,
      },
      onSubmit: (data) => {
        return data
      },
    })
  })

  it('initial state primitive errors with wrong value', async () => {
    useForm({
      schema: basicSchema,
      initialState: {
        // @ts-expect-error - Throws error because a expect a string and a number is given
        name: 123,
      },
      onSubmit: (data) => {
        return data
      },
    })
  })

  it('initial state object is nullable', async () => {
    useForm({
      schema: objectSchema,
      initialState: {
        a: null,
      },
      onSubmit: (data) => {
        return data
      },
    })
  })

  it('initial state object errors with wrong value', async () => {
    useForm({
      schema: objectSchema,
      initialState: {
        // @ts-expect-error - Throws error because a is an object and a string is given
        a: '123',
      },
      onSubmit: (data) => {
        return data
      },
    })
  })

  it('initial state object nested values are nullable', async () => {
    useForm({
      onSubmit: (data) => {
        return data
      },
      schema: objectSchema,
      initialState: {
        a: {
          b: null,
          bObj: null,
        },
      },
    })
  })

  it('initial state object nested values errors with wrong value', async () => {
    useForm({
      schema: objectSchema,
      initialState: {
        a: {
          b: '123',
          // @ts-expect-error - Throws error bObject an object and a string is given
          bObj: '123',
        },
      },
      onSubmit: (data) => {
        return data
      },
    })
  })

  it('initial state object is correct', async () => {
    useForm({
      schema: objectSchema,
      initialState: {
        a: {
          b: '123',
          bObj: {
            c: '123',
          },
        },
      },
      onSubmit: (data) => {
        return data
      },
    })
  })
})
