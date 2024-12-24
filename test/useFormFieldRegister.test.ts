import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { useForm } from '../src/lib/useForm'
import { basicArraySchema, objectArraySchema, objectSchema } from './testUtils'

describe('register a field from a field or fieldArray', () => {
  it('should register a field from a field', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const b = a.register('b')

    expect(b.modelValue.value).toEqual(null)

    expect(form.state.value).toEqual({
      a: {
        b: null,
      },
    })
  })

  it('should register a field from a field with a default value', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const b = a.register('b', 'John')

    expect(b.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      a: {
        b: 'John',
      },
    })
  })

  it('should register a fieldArray with a default value from a field', async () => {
    const form = useForm({
      schema: z.object({
        obj: z.object({
          array: z.array(z.string()),
        }),
      }),
      onSubmit: (data) => {
        return data
      },
    })

    const obj = form.register('obj')
    const array = obj.registerArray('array', ['John'])

    expect(array.modelValue.value).toEqual(['John'])
  })

  it('should register a field from a field which has been registered from a field', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const b = a.register('bObj')
    const c = b.register('c')

    expect(c.modelValue.value).toEqual(null)

    expect(form.state.value).toEqual({
      a: {
        bObj: {
          c: null,
        },
      },
    })
  })

  it('should register a field from an array field', () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')

    const array0Name = array.register('0')

    expect(array0Name.modelValue.value).toEqual(null)

    expect(form.state.value).toEqual({
      array: [null],
    })
  })

  // Bug report:
  // When an object array is registered with a default value, and its children are not registered
  // It's not possible to remove an array index

  it('should be possible to modify a field array without registering its children', () => {
    const form = useForm({
      schema: objectArraySchema,
      initialState: {
        array: [
          { name: 'John' },
          { name: 'Doe' },
        ],
      },
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')

    array.register('0')

    array.remove(1)

    expect(form.state.value).toEqual({
      array: [{ name: 'John' }],
    })
  })
})
