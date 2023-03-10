import { describe, expect, it } from 'vitest'
import { watch } from 'vue'
import { z } from 'zod'
import { useForm } from '../src'

describe('useForm', () => {
  describe('when a field is registered', () => {
    it('should register the field', () => {
      const form = useForm(z.object({
        firstName: z.string().min(1),
      }), {
        onSubmit: () => {},
      })

      const firstName = form.register('firstName', 'Foo')

      watch(() => form.isReady, () => {
        expect(firstName).toEqual({
          '_path': 'firstName',
          'modelValue': 'Foo',
          'isDirty': false,
          'isTouched': false,
          'isChanged': false,
          'errors': undefined,
          'onUpdate:modelValue': expect.any(Function),
          'setValue': expect.any(Function),
          'onBlur': expect.any(Function),
          'onChange': expect.any(Function),
        })
      })
    })

    it('should update the modelValue and be dirty', () => {
      const form = useForm(z.object({
        firstName: z.string().min(1),
      }), {
        onSubmit: () => {},
      })

      const firstName = form.register('firstName', 'Foo')

      firstName['onUpdate:modelValue']('Bar')

      expect(firstName.modelValue).toBe('Bar')
      expect(firstName.isDirty).toBe(true)

      firstName.setValue('Baz')

      expect(firstName.modelValue).toBe('Baz')
    })

    it('should unregister an array index correctly', () => {
      const form = useForm(z.object({
        tags: z.array(z.string()),
      }), {
        onSubmit: () => {},
      })

      form.register('tags.0', 'Foo')
      const tagBar = form.register('tags.1', 'Bar')
      const tags = form.register('tags')

      expect(tags.modelValue).toEqual(['Foo', 'Bar'])

      form.unregister('tags.0')

      expect(tags.modelValue).toEqual(['Bar'])

      expect(tagBar._path).toBe('tags.0')
    })

    it('should validate the form', () => {
      const form = useForm(z.object({
        firstName: z.string().min(1),
      }), {
        onSubmit: () => {},
      })

      const firstName = form.register('firstName', 'Foo')

      watch(() => form.isReady, () => {
        expect(form.isValid).toBe(true)
        expect(firstName.errors).toBeUndefined()

        firstName['onUpdate:modelValue']('')

        expect(form.isValid).toBe(false)
        expect(firstName.errors).toBeDefined()
      })
    })

    it('should be ready after onPrepare is resolved', async () => {
      const form = useForm(z.object({
        firstName: z.string().min(1),
      }), {
        onSubmit: () => {},
        onPrepare: () => ({
          firstName: 'Foo',
        }),
      })

      expect(form.isReady).toBe(false)

      watch(() => form.isReady, () => {
        expect(form.isReady).toBe(true)
      })
    })

    it('should prepare the form', () => {
      const form = useForm(z.object({
        firstName: z.string().min(1),
      }), {
        onSubmit: () => {},
        onPrepare: () => ({
          firstName: 'Foo',
        }),
      })

      watch(() => form.isReady, () => {
        expect(form.isValid).toBe(true)
        expect(form.errors).toEqual({})
        expect(form.isDirty).toBe(false)
        expect(form.isSubmitting).toBe(false)
      })
    })

    it('should set the form values', () => {
      const form = useForm(z.object({
        firstName: z.string().min(1),
      }), {
        onSubmit: () => {},
      })

      const firstName = form.register('firstName', 'Foo')

      expect(firstName.modelValue).toBe('Foo')

      form.setValues({
        firstName: 'Bar',
      })

      expect(firstName.modelValue).toBe('Bar')
    })

    it('should set the form errors', () => {
      const form = useForm(z.object({
        firstName: z.string().min(1),
      }), {
        onSubmit: () => {},
      })

      const firstName = form.register('firstName', 'Foo')

      expect(firstName.errors).toBeUndefined()

      form.setErrors({
        firstName: {
          _errors: ['Error'],
        },
      })

      expect(firstName.errors).toEqual({
        _errors: ['Error'],
      })
    })

    it('should submit the form', async () => {
      const form = useForm(z.object({
        firstName: z.string().min(1),
      }), {
        onSubmit: () => {},
      })

      const firstName = form.register('firstName', 'Foo')

      expect(form.isSubmitting).toBe(false)

      await form.submit()

      setTimeout(() => {
        expect(form.isSubmitting).toBe(false)
        expect(form.isValid).toBe(true)
        expect(form.isDirty).toBe(false)
        expect(firstName.errors).toBeUndefined()
      })
    })
  })
})
