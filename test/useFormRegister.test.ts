import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basic2DArraySchema, basicArraySchema, basicSchema, fieldWithArraySchema, objectArraySchema, objectSchema, twoDimensionalArraySchema } from './testUtils'

describe('register a field or fieldArray', () => {
  it('should register a field', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    expect(name.modelValue.value).toEqual(null)

    expect(form.state.value).toEqual({
      name: null,
    })
  })

  it('should register a field which has already been registered', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    name.setValue('John')

    const name2 = form.register('name')

    expect(name.modelValue.value).toEqual('John')
    expect(name2.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      name: 'John',
    })
  })

  it('should register a field with a default value', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },

    })

    const name = form.register('name', 'John')

    expect(name.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      name: 'John',
    })
  })

  it('should register a field with a default value from the initial state', () => {
    const form = useForm({
      schema: basicSchema,
      initialState: {
        name: 'John',
      },
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    expect(name.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      name: 'John',
    })
  })

  it('should register a nested field', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    form.register('a')
    const b = form.register('a.b')

    expect(b.modelValue.value).toEqual(null)

    expect(form.state.value).toEqual({
      a: {
        b: null,
      },
    })
  })

  it('should register a nested field with a default value', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    form.register('a')
    const b = form.register('a.b', 'John')

    expect(b.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      a: {
        b: 'John',
      },
    })
  })

  it('should register a nested field without its parent being registed', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const b = form.register('a.b')

    expect(b.modelValue.value).toEqual(null)

    expect(form.state.value).toEqual({
      a: {
        b: null,
      },
    })
  })

  it('should register an array field', () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')

    expect(array.modelValue.value).toEqual([])

    expect(form.state.value).toEqual({
      array: [],
    })
  })

  it('should register an array field with a default value', () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },

    })

    const array = form.registerArray('array', ['John'])

    expect(array.modelValue.value).toEqual(['John'])

    expect(form.state.value).toEqual({
      array: ['John'],
    })
  })

  it('should register an array field with an initial state', () => {
    const form = useForm({
      schema: basicArraySchema,
      initialState: {
        array: ['John'],
      },
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')

    expect(array.modelValue.value).toEqual(['John'])

    expect(form.state.value).toEqual({
      array: ['John'],
    })
  })

  it('should register a nested array field', () => {
    const form = useForm({
      schema: objectArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array0Name = form.register('array.0.name')

    expect(array0Name.modelValue.value).toEqual(null)

    expect(form.state.value).toEqual({
      array: [
        {
          name: null,
        },
      ],
    })
  })

  it('should register a nested array field with a default value', () => {
    const form = useForm({
      schema: twoDimensionalArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('array.0.0.name', 'John')

    expect(name.modelValue.value).toEqual('John')

    expect(form.state.value).toEqual({
      array: [
        [
          {
            name: 'John',
          },
        ],
      ],
    })
  })

  it('should register a field as a fieldArray', () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const arrayAsField = form.register('array', ['John'])
    const arrayAsArray = form.registerArray('array')

    expect(form.state.value).toEqual({
      array: ['John'],
    })

    expect(arrayAsField.modelValue.value).toEqual(['John'])
    expect(arrayAsArray.modelValue.value).toEqual(['John'])

    arrayAsField.setValue(['Doe'])

    expect(form.state.value).toEqual({
      array: ['Doe'],
    })

    expect(arrayAsField.modelValue.value).toEqual(['Doe'])
    expect(arrayAsArray.modelValue.value).toEqual(['Doe'])

    arrayAsArray.append('John')

    expect(form.state.value).toEqual({
      array: ['Doe', 'John'],
    })

    expect(arrayAsField.modelValue.value).toEqual(['Doe', 'John'])
    expect(arrayAsArray.modelValue.value).toEqual(['Doe', 'John'])
  })

  it('should register a fieldArray as a field', () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const arrayAsArray = form.registerArray('array', ['John'])
    const arrayAsField = form.register('array')

    expect(form.state.value).toEqual({
      array: ['John'],
    })

    expect(arrayAsField.modelValue.value).toEqual(['John'])
    expect(arrayAsArray.modelValue.value).toEqual(['John'])

    arrayAsField.setValue(['Doe'])

    expect(form.state.value).toEqual({
      array: ['Doe'],
    })

    expect(arrayAsField.modelValue.value).toEqual(['Doe'])
    expect(arrayAsArray.modelValue.value).toEqual(['Doe'])

    arrayAsArray.append('John')

    expect(form.state.value).toEqual({
      array: ['Doe', 'John'],
    })

    expect(arrayAsField.modelValue.value).toEqual(['Doe', 'John'])
    expect(arrayAsArray.modelValue.value).toEqual(['Doe', 'John'])
  })

  it('should register a 2D array field with a default value', () => {
    const form = useForm({
      schema: basic2DArraySchema,
      onSubmit: (data) => {
        return data
      },

    })

    const array = form.registerArray('array', [[]])

    expect(array.modelValue.value).toEqual([[]])

    expect(form.state.value).toEqual({
      array: [[]],
    })

    array.register('0', ['John'])

    expect(array.modelValue.value).toEqual([['John']])
  })

  it('should be able to register a field that registers an array field', () => {
    const form = useForm({
      schema: fieldWithArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const field = form.register('field')
    const array = field.registerArray('array', [])

    expect(array.modelValue.value).toEqual([])
    expect(field.modelValue.value).toEqual({
      array: [],
    })

    array.append('John')

    expect(array.modelValue.value).toEqual(['John'])
    expect(field.modelValue.value).toEqual({ array: ['John'] })
  })

  it('should be able to register an array field that registers an array field', () => {
    const form = useForm({
      schema: twoDimensionalArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array', [])
    const array2 = array.registerArray('0', [{ name: 'Wouter' }])

    expect(array.modelValue.value).toEqual([
      [
        {
          name: 'Wouter',
        },
      ],
    ])
    expect(array2.modelValue.value).toEqual([
      {
        name: 'Wouter',
      },
    ])

    array.append([{ name: 'Robbe' }])

    expect(array.modelValue.value).toEqual([
      [
        {
          name: 'Wouter',
        },
      ],
      [
        {
          name: 'Robbe',
        },
      ],

    ])
  })
})
