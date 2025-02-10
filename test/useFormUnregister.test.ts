import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { useForm } from '../src/lib/useForm'
import { basicArraySchema, basicSchema } from './testUtils'

describe('unregister a field or fieldArray', () => {
  it('should unregister a field', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    form.register('name', 'John')
    form.unregister('name')

    expect(form.state.value).toEqual({})
  })

  it('should register a field on the same index after unregistering', () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')
    array.append('John')
    array.register('0')

    array.remove(0)

    array.append('Doe')

    array.register('0')

    expect(form.state.value).toEqual({
      array: ['Doe'],
    })
  })

  it('should unregister an array index', () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')
    array.append('John')

    array.remove(0)

    expect(form.state.value).toEqual({
      array: [],
    })

    array.append('Doe')

    expect(form.state.value).toEqual({
      array: ['Doe'],
    })

    form.unregister('array.0')
  })

  it('should unregister an array index with a subfield', () => {
    const form = useForm({
      schema: z.object({
        questions: z.object({
          choices: z.object({
            text: z.string(),
          }).array(),
        }).array(),
      }),
      onSubmit: (data) => {
        return data
      },
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

    // expect(form.state.value).toEqual({
    //   choices: [],
    // })
  })
})
