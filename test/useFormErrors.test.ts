import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema, objectSchema, sleep } from './testUtils'

describe('errors', () => {
  it('should not have any errors when all fields are valid', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name', 'John')

    await sleep(0)

    expect(form.errors.value).toEqual({})
    expect(name.errors.value).toBeUndefined()
  })

  it('should have errors when a field is invalid', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name', 'Jon')

    await sleep(0)

    expect(form.errors.value).toBeDefined()
    expect(name.errors.value).toBeDefined()
  })

  it('should have errors when a nested field is invalid', async () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },

    })

    const a = form.register('a')
    a.register('b')

    await sleep(0)

    expect(a.errors.value).toBeDefined()
    expect(form.errors.value).toBeDefined()
  })

  it('should set errors with `addErrors`', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    form.addErrors({
      name: {
        _errors: ['Invalid name'],
      },
    })

    expect(form.errors.value).toEqual({
      name: {
        _errors: ['Invalid name'],
      },
    })
  })

  it('should set nested errors with `addErrors` while existing errors remain', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    form.addErrors({
      a: {
        b: {
          _errors: ['Invalid name'],
        },
      },
    })

    expect(form.errors.value).toEqual({
      a: {
        _errors: [],
        b: {
          _errors: ['Invalid name'],
        },
      },
    })

    form.addErrors({
      a: {
        bObj: {
          c: {
            _errors: ['Invalid name'],
          },
        },
      },
    })

    expect(form.errors.value).toEqual({
      a: {
        _errors: [],
        b: {
          _errors: ['Invalid name'],
        },
        bObj: {
          _errors: [],
          c: {
            _errors: ['Invalid name'],
          },
        },
      },
    })
  })
})
