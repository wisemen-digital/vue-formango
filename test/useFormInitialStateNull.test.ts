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

describe('initial state type allows nulls', () => {
  it('initial state primitive is correct', () => {
    const form = useForm({
      initialState: { name: 'Joe' },
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.state.value).toEqual({ name: 'Joe' })
  })

  it('initial state primitive is nullable', () => {
    const form = useForm({
      initialState: { name: null },
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.state.value).toEqual({ name: null })
  })

  it('initial state primitive errors with wrong value', () => {
    const form = useForm({
      initialState: {
        // @ts-expect-error - Throws error because a expect a string and a number is given
        name: 123,
      },
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.state.value).toEqual({ name: 123 })
  })

  it('initial state object is nullable', () => {
    const form = useForm({
      initialState: { a: null },
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.state.value).toEqual({ a: null })
  })

  it('initial state object errors with wrong value', () => {
    const form = useForm({
      initialState: {
        // @ts-expect-error - Throws error because a is an object and a string is given
        a: '123',
      },
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.state.value).toEqual({ a: '123' })
  })

  it('initial state object nested values are nullable', () => {
    const form = useForm({
      initialState: {
        a: {
          b: null,
          bObj: null,
        },
      },
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.state.value).toEqual({
      a: {
        b: null,
        bObj: null,
      },
    })
  })

  it('initial state object nested values errors with wrong value', () => {
    const form = useForm({
      initialState: {
        a: {
          b: '123',
          // @ts-expect-error - Throws error bObject an object and a string is given
          bObj: '123',
        },
      },
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.state.value).toEqual({
      a: {
        b: '123',
        bObj: '123',
      },
    })
  })

  it('initial state object is correct', () => {
    const form = useForm({
      initialState: {
        a: {
          b: '123',
          bObj: { c: '123' },
        },
      },
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.state.value).toEqual({
      a: {
        b: '123',
        bObj: { c: '123' },
      },
    })
  })
})
