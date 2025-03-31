import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema } from './testUtils'

describe('isDirty', () => {
  it('should be false by default', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.isDirty.value).toEqual(false)
  })

  it('should be false when a default state is provided', () => {
    const form = useForm({
      schema: basicSchema,
      initialState: {
        name: 'John',
      },
      onSubmit: (data) => {
        return data
      },
    })

    expect(form.isDirty.value).toEqual(false)
  })

  it('should be false when a field is registered with a default value', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name', 'John')

    expect(name.isDirty.value).toEqual(false)
    expect(form.isDirty.value).toEqual(false)
  })

  it('should be true when a field is changed', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    name.setValue('John')

    expect(name.isDirty.value).toEqual(true)
    expect(form.isDirty.value).toEqual(true)
  })

  it('should be false when a field is changed back to its initial value', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    name.setValue('John')
    name.setValue(null)

    expect(name.isDirty.value).toEqual(false)
    expect(form.isDirty.value).toEqual(false)
  })

  it('should be false when a field is changed back to its initial value', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name', 'John')

    name.setValue('Joe')
    name.setValue('John')

    expect(name.isDirty.value).toEqual(false)
    expect(form.isDirty.value).toEqual(false)
  })

  it('should be false after the form has been submitted', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },

    })

    const name = form.register('name')

    name.setValue('John')

    await form.submit()

    expect(name.isDirty.value).toEqual(false)
    expect(form.isDirty.value).toEqual(false)
  })
})
