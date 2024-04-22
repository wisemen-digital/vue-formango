import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
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

    it('should register a field with a default value from the initial state', () => {
      const { form } = useForm({
        schema: basicSchema,
        initialState: {
          name: 'John',
        },
      })

      const name = form.register('name')

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

    it('should register an array field with an initial state', () => {
      const { form } = useForm({
		    schema: basicArraySchema,
		    initialState: {
		      array: ['John'],
		    },
		  })

		  const array = form.registerArray('array')

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

  describe('unregister a field or fieldArray', () => {
    it('should unregister a field', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      form.register('name', 'John')
      form.unregister('name')

      expect(form.state).toEqual({})
    })

    it('should register a field on the same index after unregistering', () => {
      const { form } = useForm({
        schema: basicArraySchema,
      })

      const array = form.registerArray('array')
      array.append('John')
      array.register('0')

      array.remove(0)

      array.append('Doe')

      array.register('0')

      expect(form.state).toEqual({
        array: ['Doe'],
      })
    })

    it('should unregister an array index', () => {
      const { form } = useForm({
        schema: basicArraySchema,
      })

      const array = form.registerArray('array')
      array.append('John')

      array.remove(0)

      expect(form.state).toEqual({
        array: [],
      })

      array.append('Doe')

      expect(form.state).toEqual({
        array: ['Doe'],
      })

      form.unregister('array.0')
    })

    it('should unregister an array index with a subfield', () => {
      const { form } = useForm({
        schema: z.object({
          questions: z.object({
            choices: z.object({
              text: z.string(),
            }).array(),
          }).array(),
        }),
      })

      const questions = form.registerArray('questions')

      questions.append()

      const question0 = form.register('questions.0')

      const choices = question0.registerArray('choices')
      choices.append()

      const choice = form.register('questions.0.choices.0')

      choice.register('text')

      choices.remove(0)

      // const choices = form.registerArray('choices')

      // choices.append()

      // const choice = form.register('choices.0')

      // choice.register('text')

      // choices.remove(0)

      // expect(form.state).toEqual({
      //   choices: [],
      // })
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

    it('should register a fieldArray with a default value from a field', async () => {
      const { form } = useForm({
        schema: z.object({
          obj: z.object({
            array: z.array(z.string()),
          }),
        }),
      })

      const obj = form.register('obj')
      const array = obj.registerArray('array', ['John'])

      expect(array.modelValue).toEqual(['John'])
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

    it('should register a field from an array field', () => {
      const { form } = useForm({
        schema: basicArraySchema,
      })

      const array = form.registerArray('array')

      const array0Name = array.register('0')

      expect(array0Name.modelValue).toEqual(null)

      expect(form.state).toEqual({
        array: [null],
      })
    })
  })

  describe('array field modifiers', () => {
    it('should move a field in an array', () => {
      const { form } = useForm({
        schema: basicArraySchema,
      })

      const array = form.registerArray('array')

      array.append('John')
      array.append('Doe')

      array.move(1, 0)

      expect(form.state).toEqual({
        array: ['Doe', 'John'],
      })
    })

    it('shoud move a field in an array and back', async () => {
      const { form } = useForm({
        schema: basicArraySchema,
      })

      const array = form.registerArray('array')

      array.append('John')
      array.append()

      array.move(1, 0)

      await sleep(0)

      array.move(0, 1)

      expect(form.state).toEqual({
        array: ['John', null],
      })
    })
  })

  describe('set a value of a field', () => {
    it('should set a value of a field with `onUpdate:modelValue`', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      name['onUpdate:modelValue']('John')

      expect(name.modelValue).toEqual('John')

      expect(form.state).toEqual({
        name: 'John',
      })
    })

    it('should set a value of a field with `setValue`', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      name.setValue('John')

      expect(name.modelValue).toEqual('John')

      expect(form.state).toEqual({
        name: 'John',
      })
    })

    it('should set a value of a field with `form.setValues`', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      form.setValues({
        name: 'John',
      })

      expect(name.modelValue).toEqual('John')

      expect(form.state).toEqual({
        name: 'John',
      })
    })

    it('should set a nested value of a field with `form.setValues`', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      const b = form.register('a.b')

      form.setValues({
        a: {
          b: 'John',
        },
      })

      expect(b.modelValue).toEqual('John')

      expect(form.state).toEqual({
        a: {
          b: 'John',
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

    it('should be true when `onBlur` is called', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      name.onBlur()

      expect(name.isTouched).toEqual(true)
    })

    it('should be touched when a child field is touched', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      const a = form.register('a')
      const b = a.register('b')

      b.onBlur()

      expect(a.isTouched).toEqual(true)
    })
  })

  describe('isChanged', () => {
    it('should be false by default', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      expect(name.isChanged).toEqual(false)
    })

    it('should be true when `onChange` is called', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name')

      name.onChange()

      expect(name.isChanged).toEqual(true)
    })
  })

  describe('errors', () => {
    it('should not have any errors when all fields are valid', async () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name', 'John')

      await sleep(0)

      expect(form.errors).toEqual({})
      expect(name.errors).toBeUndefined()
    })

    it('should have errors when a field is invalid', async () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name', 'Jon')

      await sleep(0)

      expect(form.errors).toBeDefined()
      expect(name.errors).toBeDefined()
    })

    it('should have errors when a nested field is invalid', async () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      const a = form.register('a')
      a.register('b')

      await sleep(0)

      expect(a.errors).toBeDefined()
      expect(form.errors).toBeDefined()
    })

    it('should set errors with `addErrors`', () => {
      const { form } = useForm({
        schema: basicSchema,
      })

      form.addErrors({
        name: {
          _errors: ['Invalid name'],
        },
      })

      expect(form.errors).toEqual({
        name: {
          _errors: ['Invalid name'],
        },
      })
    })

    it('should set nested errors with `addErrors` while existing errors remain', () => {
      const { form } = useForm({
        schema: objectSchema,
      })

      form.addErrors({
        a: {
          b: {
            _errors: ['Invalid name'],
          },
        },
      })

      expect(form.errors).toEqual({
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

      expect(form.errors).toEqual({
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

  describe('submit', () => {
    it('should submit', async () => {
      const { form, onSubmitForm } = useForm({
        schema: basicSchema,
      })

      form.register('name', 'John')

      let submitted = false

      onSubmitForm(() => {
        submitted = true
      })

      await sleep(0)
      await form.submit()

      expect(submitted).toEqual(true)
      expect(form.hasAttemptedToSubmit).toEqual(true)
    })

    it('should blur all fields', async () => {
      const { form, onSubmitForm } = useForm({
        schema: basicSchema,
      })

      const name = form.register('name', 'John')

      expect(name.isTouched).toEqual(false)

      onSubmitForm(() => {})

      await sleep(0)
      await form.submit()

      expect(name.isTouched).toEqual(true)
    })

    it('should not submit if there are errors', async () => {
      const { form, onSubmitForm } = useForm({
        schema: basicSchema,
      })

      let submitted = false

      form.register('name', 'Jon')

      onSubmitForm(() => {
        submitted = true
      })

      await sleep(0)
      await form.submit()

      expect(submitted).toEqual(false)
    })
  })

  describe('reactive initial state', () => {
    it('should update the state when the initial state is updated', async () => {
      const initialState = ref({
        name: 'John',
      })

      const { form } = useForm({
        schema: basicSchema,
        initialState,
      })

      const name = form.register('name')

      expect(name.modelValue).toEqual('John')

      initialState.value = {
        name: 'Joe',
      }

      await sleep(0)

      expect(name.modelValue).toEqual('Joe')
    })
  })
})
