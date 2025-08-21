import {
  describe,
  expect,
  it,
} from 'vitest'

import { useForm } from '../src'
import {
  nestedArraySchema,
  objectSchema,
} from './testUtils'

describe('when calling blurAll', () => {
  it('on an array, it should blur all its children and nested objects', () => {
    const form = useForm({
      schema: nestedArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const users = form.registerArray('users')
    const room = users.registerArray('0')
    const roomFive = room.register('5')
    const name = roomFive.register('name')

    users.blurAll()

    expect(roomFive.isTouched.value).toBeTruthy()
    expect(name.isTouched.value).toBeTruthy()
  })

  it('on a nested object, it should not blur its peers', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const bObject = form.register('a.bObj')
    const b = a.register('b')
    const c = bObject.register('c')

    b.blurAll()

    expect(a.isTouched.value).toBeTruthy()
    expect(b.isTouched.value).toBeTruthy()
    expect(c.isTouched.value).toBeFalsy()
    expect(bObject.isTouched.value).toBeFalsy()
  })

  it('on a nested object, it should blur its children', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const bObject = form.register('a.bObj')
    const b = a.register('b')
    const c = bObject.register('c')

    a.blurAll()

    expect(a.isTouched.value).toBeTruthy()
    expect(b.isTouched.value).toBeTruthy()
    expect(c.isTouched.value).toBeTruthy()
    expect(bObject.isTouched.value).toBeTruthy()
  })

  it('on a nested object, it should blur its children of a field', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')
    const bObject = form.register('a.bObj')
    const b = a.register('b')
    const c = bObject.register('c')

    bObject.blurAll()

    expect(a.isTouched.value).toBeTruthy()
    expect(b.isTouched.value).toBeFalsy()
    expect(c.isTouched.value).toBeTruthy()
    expect(bObject.isTouched.value).toBeTruthy()
  })
})
