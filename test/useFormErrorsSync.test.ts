import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { objectArraySchema, objectSchema, sleep } from './testUtils'

describe('root and attrs errors should stay in sync', () => {
  it('should update both when setting value', async () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    await sleep(0)

    expect(a.attrs.errors.value).toEqual(a.errors.value)

    a.setValue({
      b: 'John',
      bObj: {
        c: '123',
      },
    })
    await sleep(0)

    expect(a.attrs.errors.value).toEqual(undefined)
    expect(a.errors.value).toEqual(undefined)
  })

  it('should update both when setting initial value', async () => {
    const form = useForm({
      schema: objectSchema,
      initialState: {
        a: {
          b: 'John',
          bObj: {
            c: '123',
          },
        },
      },
      onSubmit: (data) => {
        return data
      },

    })

    const a = form.register('a')
    await sleep(0)

    expect(a.attrs.errors.value).toEqual(a.errors.value)
  })

  it('should update array when setting value', async () => {
    const form = useForm({
      schema: objectArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')
    await sleep(0)

    expect(array.attrs.errors.value).toEqual(array.errors.value)

    array.setValue([{ name: 'John' }])
    await sleep(0)

    expect(array.attrs.errors.value).toEqual(undefined)
    expect(array.errors.value).toEqual(undefined)
  })
})
