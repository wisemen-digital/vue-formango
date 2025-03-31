import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicArraySchema, sleep } from './testUtils'

describe('array field modifiers', () => {
  it('should move a field in an array', () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')

    array.append('John')
    array.append('Doe')

    array.move(1, 0)

    expect(form.state.value).toEqual({
      array: ['Doe', 'John'],
    })
  })

  it('shoud move a field in an array and back', async () => {
    const form = useForm({
      schema: basicArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')

    array.append('John')
    array.append()

    array.move(1, 0)

    await sleep(0)

    array.move(0, 1)

    expect(form.state.value).toEqual({
      array: ['John', null],
    })
  })
})
