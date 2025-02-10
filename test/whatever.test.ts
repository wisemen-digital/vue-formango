import { describe, it } from 'vitest'
import { z } from 'zod'
import { useForm } from '../src'

describe('test', () => {
  it('nested new test', async () => {
    const form = useForm({
      schema: z.object({
        users: z.array(
          z.array(
            z.object({
              name: z.string(),
            }),
          ),
        ),
      }),
      onSubmit: (data) => {
        return data
      },
    })

    const users = form.registerArray('users')
    const classRoom = users.registerArray('0')
    const john = classRoom.register('2')

    // john.register('name', 'John')

    classRoom.append({ name: 'Peter' })

    classRoom.register('1', { name: 'Doe' })

    console.log(JSON.stringify(form.state.value, null, 2))

    // const form = useForm({
    //   schema: twoDimensionalArraySchema,
    //   onSubmit: (data) => {
    //     return data
    //   },
    // })

    // const firstArray = form.registerArray('array')
    // const firstArrayIndex0 = firstArray.registerArray('0')
    // const person = firstArrayIndex0.register('0')
    // const name = person.register('name', 'John')

    // firstArrayIndex0.append({ name: 'Peter' })

    // expect(name.modelValue.value).toEqual('John')

    // await sleep(0)

    // console.log(firstArrayIndex0.modelValue.value)

    // expect(form.state.value).toEqual({
    //   array: [
    //     [
    //       {
    //         name: 'John',
    //       },
    //     ],
    //   ],
    // })
  })
})
