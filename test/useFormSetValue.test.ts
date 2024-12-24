import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema, objectSchema } from './testUtils'

describe('set a value of a field', () => {
  it('should set a value of a field with `onUpdate:attrs.modelValue.value`', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    name.attrs['onUpdate:modelValue']('John')

    expect(name.attrs.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      name: 'John',
    })
  })

  it('should set a value of a field with `setValue`', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    name.setValue('John')

    expect(name.attrs.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      name: 'John',
    })
  })

  it('should set a value of a field with `form.setValues`', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    form.setValues({
      name: 'John',
    })

    expect(name.attrs.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      name: 'John',
    })
  })

  it('should set a nested value of a field with `form.setValues`', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const b = form.register('a.b')

    form.setValues({
      a: {
        b: 'John',
      },
    })

    expect(b.attrs.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      a: {
        b: 'John',
      },
    })
  })
})
