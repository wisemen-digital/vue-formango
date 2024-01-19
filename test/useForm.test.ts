import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'

const basicSchema = z.object({
  name: z.string().min(4),
})

const objectSchema = z.object({
  a: z.object({
    b: z.string(),
    bObj: z.object({
      c: z.string(),
    }),
  }),
})

const basicArraySchema = z.object({
  array: z.array(z.string()),
})

const objectArraySchema = z.object({
  array: z.array(
    z.object({
      name: z.string(),
    }),
  ),
})

const twoDimensionalArraySchema = z.object({
  array: z.array(z.array(z.object({
    name: z.string(),
  }))),
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('useForm', () => {
  describe('register a field or fieldArray', () => {
    it('should register a field', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      expect(name.modelValue).toEqual(null)

      expect(form.state).toEqual({
        name: null,
      })
    })

    it('should register a field which has already been registered', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      name.setValue('John')

      const name2 = form.register('name')

      expect(name.modelValue).toEqual('John')
      expect(name2.modelValue).toEqual('John')

      expect(form.state).toEqual({
        name: 'John',
      })
    })

    it('should register a field with a default value', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name', 'John')

      expect(name.modelValue).toEqual('John')

      expect(form.state).toEqual({
        name: 'John',
      })
    })

    it('should register a nested field', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      form.register('a')
      const b = form.register('a.b')

      expect(b.modelValue).toEqual(null)

      expect(form.state).toEqual({
        a: {
          b: null,
        },
      })
    })

    it('should register a nested field with a default value', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      form.register('a')
      const b = form.register('a.b', 'John')

      expect(b.modelValue).toEqual('John')

      expect(form.state).toEqual({
        a: {
          b: 'John',
        },
      })
    })

    it('should register a nested field without its parent being registed', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      const b = form.register('a.b')

      expect(b.modelValue).toEqual(null)

      expect(form.state).toEqual({
        a: {
          b: null,
        },
      })
    })

    it('should register an array field', () => {
      const { form } = useForm({
        schema: basicArraySchema,
      })

      const array = form.registerArray('array')

      expect(array.modelValue).toEqual([])

      expect(form.state).toEqual({
        array: [],
      })
    })

    it('should register an array field which has already been registered', () => {
      const { form } = useForm({
        schema: basicArraySchema,
      })

      const array = form.registerArray('array')

      array.append('John')

      const array2 = form.registerArray('array')

      expect(array.modelValue).toEqual(['John'])
      expect(array2.modelValue).toEqual(['John'])

      expect(form.state).toEqual({
        array: ['John'],
      })
    })

    it('should register an array field with a default value', () => {
      const { form } = useForm({
        schema: basicArraySchema,
      })

      const array = form.registerArray('array', ['John'])

      expect(array.modelValue).toEqual(['John'])

      expect(form.state).toEqual({
        array: ['John'],
      })
    })

    it('should register a nested array field', () => {
      const { form } = useForm({
        schema: objectArraySchema,
      })

      const array0Name = form.register('array.0.name')

      expect(array0Name.modelValue).toEqual(null)

      expect(form.state).toEqual({
        array: [
          {
            name: null,
          },
        ],
      })
    })

    it('should register a nested array field with a default value', () => {
      const { form } = useForm({
        schema: twoDimensionalArraySchema,
      })

      const name = form.register('array.0.0.name', 'John')

      expect(name.modelValue).toEqual('John')

      expect(form.state).toEqual({
        array: [
          [
            {
              name: 'John',
            },
          ],
        ],
      })
    })
  })

  describe('register a field from a field or fieldArray', () => {
    it('should register a field from a field', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      const a = form.register('a')
      const b = a.register('b')

      expect(b.modelValue).toEqual(null)

      expect(form.state).toEqual({
        a: {
          b: null,
        },
      })
    })

    it('should register a field from a field with a default value', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      const a = form.register('a')
      const b = a.register('b', 'John')

      expect(b.modelValue).toEqual('John')

      expect(form.state).toEqual({
        a: {
          b: 'John',
        },
      })
    })

    it('should register a field from a field which has been registered from a field', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      const a = form.register('a')
      const b = a.register('bObj')
      const c = b.register('c')

      expect(c.modelValue).toEqual(null)

      expect(form.state).toEqual({
        a: {
          bObj: {
            c: null,
          },
        },
      })
    })
  })

  describe('isDirty', () => {
    it('should be false by default', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      expect(form.isDirty).toEqual(false)
    })

    it('should be false when a default state is provided', () => {
      const { form } = useForm({
        schema: basicSchema,
        initialState: {
          name: 'John',
        },
      })

      expect(form.isDirty).toEqual(false)
    })

    it('should be false when a field is registered with a default value', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name', 'John')

      expect(name.isDirty).toEqual(false)
      expect(form.isDirty).toEqual(false)
    })

    it('should be true when a field is changed', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      name.setValue('John')

      expect(name.isDirty).toEqual(true)
      expect(form.isDirty).toEqual(true)
    })

    it('should be false when a field is changed back to its initial value', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      name.setValue('John')
      name.setValue(null)

      expect(name.isDirty).toEqual(false)
      expect(form.isDirty).toEqual(false)
    })

    it('should be false when a field is changed back to its initial value', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name', 'John')

      name.setValue('Joe')
      name.setValue('John')

      expect(name.isDirty).toEqual(false)
      expect(form.isDirty).toEqual(false)
    })

    it('should be false after the form has been submitted', async () => {
      const { form, onSubmitForm } = useForm({
        schema: basicSchema,
      })

      onSubmitForm(() => {})

      const name = form.register('name')

      name.setValue('John')

      await form.submit()

      expect(name.isDirty).toEqual(false)
      expect(form.isDirty).toEqual(false)
    })
  })

  describe('isTouched', () => {
    it('should be false by default', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      expect(name.isTouched).toEqual(false)
    })

    it('should be true when field is blurred', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      name.onBlur()

      expect(name.isTouched).toEqual(true)
    })
  })

  describe('errors', () => {
    it('should not have any errors when all fields are valid', async () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name', 'Jon')

      await sleep(0)

      expect(form.errors).toBeDefined()
      expect(name.errors).toBeDefined()
    })
  })
})
