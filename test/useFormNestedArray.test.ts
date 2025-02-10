import { describe, expect, it } from 'vitest'
import { useForm } from '../src'
import { nestedArraySchema } from './testUtils'

describe('when appending and registering a nested array', () => {
  it('should fill up the data with undefined if you register an index that does not exist', async () => {
    const form = useForm({
      schema: nestedArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const users = form.registerArray('users')
    const classRoom = users.registerArray('0')

    expect(classRoom.modelValue.value).toEqual([])

    classRoom.register('5')

    // Undefined is when a field has not been registered yet
    expect(classRoom.modelValue.value).toEqual([undefined, undefined, undefined, undefined, undefined, null])
  })

  it('should fill up the data with null if you register an index that does not exist', async () => {
    const form = useForm({
      schema: nestedArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const users = form.registerArray('users')
    const classRoom = users.registerArray('0')

    expect(classRoom.modelValue.value).toEqual([])

    classRoom.register('0')
    classRoom.register('1')
    classRoom.register('2')
    classRoom.register('3')

    expect(classRoom.modelValue.value).toEqual([null, null, null, null])
  })

  it('the array should fill up with the correct data', async () => {
    const form = useForm({
      schema: nestedArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const users = form.registerArray('users')
    const classRoom = users.registerArray('0')

    expect(classRoom.modelValue.value).toEqual([])

    classRoom.register('2')

    // Undefined is when a field has not been registered yet
    expect(classRoom.modelValue.value).toEqual([undefined, undefined, null])

    classRoom.append({ name: 'Peter' })

    // Append does append at the end of the array
    expect(classRoom.modelValue.value).toEqual([undefined, undefined, null, { name: 'Peter' }])

    classRoom.register('1', { name: 'Doe' })

    // Retroactively registering a field should put the data in the correct spot
    expect(classRoom.modelValue.value).toEqual([
      undefined,
      {
        name: 'Doe',
      },
      null,
      {
        name: 'Peter',
      },
    ])
    expect(form.state.value).toEqual({
      users: [
        [
          undefined,
          {
            name: 'Doe',
          },
          null,
          {
            name: 'Peter',
          },
        ],
      ],
    })
  })
})
