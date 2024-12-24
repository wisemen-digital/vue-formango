import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { objectArraySchema, objectSchema } from './testUtils'

describe('modelValue and value stay in sync', () => {
  it('should update both when setting value', async () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const b = form.register('a.b')

    a.setValue({
      b: 'John',
      bObj: {
        c: '123',
      },
    })

    expect(a.modelValue.value).toEqual({
      b: 'John',
      bObj: {
        c: '123',
      },
    })

    expect(a.value.value).toEqual({
      b: 'John',
      bObj: {
        c: '123',
      },
    })

    expect(b.modelValue.value).toEqual('John')
    expect(b.value.value).toEqual('John')
  })

  it('should update both when setting initial value', async () => {
    const form = useForm({
      schema: objectSchema,
      initialState: {
        a: {
          b: 'John',
          bObj: {
            c: '123',
          },
        },
      },
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const b = form.register('a.b')

    expect(a.modelValue.value).toEqual({
      b: 'John',
      bObj: {
        c: '123',
      },
    })

    expect(a.value.value).toEqual({
      b: 'John',
      bObj: {
        c: '123',
      },
    })

    expect(b.modelValue.value).toEqual('John')
    expect(b.value.value).toEqual('John')
  })

  it('should update array when setting value', async () => {
    const form = useForm({
      schema: objectArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')

    array.setValue([{ name: 'John' }])

    expect(array.modelValue.value).toEqual([{ name: 'John' }])
    expect(array.value.value).toEqual([{ name: 'John' }])
  })
})
