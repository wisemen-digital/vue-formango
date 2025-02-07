import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema, basicWithSimilarNamesSchema, objectSchema, sleep } from './testUtils'

describe('errors', () => {
  it('should not have any errors when all fields are valid', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name', 'John')

    await sleep(0)

    expect(form.errors.value).toEqual([])
    expect(name.errors.value).toEqual([])
  })

  it('should have errors when a field is invalid', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name', 'Jon')

    await sleep(0)

    expect(form.errors.value).toEqual([{
      message: 'String must contain at least 4 character(s)',
      path: 'name',
    }])

    expect(name.errors.value).toEqual([{
      message: 'String must contain at least 4 character(s)',
      path: null,
    }])
  })

  it('should have errors when a nested field is invalid', async () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },

    })

    const a = form.register('a')
    a.register('b')

    await sleep(0)

    a.errors.value.find(error => error.path === null)
    expect(a.errors.value).toBeDefined()
    expect(form.errors.value).toBeDefined()
  })

  it('should set errors with `addErrors`', () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    form.addErrors([{
      path: 'name',
      message: 'Invalid name',
    }])

    expect(form.errors.value).toEqual([{
      path: 'name',
      message: 'Invalid name',
    }])
  })

  it('should set nested errors with `addErrors` while existing errors remain', () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    form.addErrors([{
      path: 'a.b',
      message: 'Invalid name',
    }])

    expect(form.errors.value).toEqual([{
      path: 'a.b',
      message: 'Invalid name',
    }])

    form.addErrors([{
      path: 'a.bObj.c',
      message: 'Invalid name',
    }])

    expect(form.errors.value).toEqual([
      {
        path: 'a.b',
        message: 'Invalid name',
      },
      {
        path: 'a.bObj.c',
        message: 'Invalid name',
      },
    ])
  })

  it('form should have raw errors', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    form.addErrors([{
      path: 'name',
      message: 'Invalid name',
    }])

    await sleep(0)

    expect(form.rawErrors.value).toEqual(
      [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Required',
          path: [
            'name',
          ],
          received: 'undefined',
        },
      ],
    )
  })

  it('form should have no raw errors when all fields are valid', async () => {
    const form = useForm({
      schema: basicSchema,
      initialState: {
        name: 'I am a name',
      },
      onSubmit: (data) => {
        return data
      },
    })

    await sleep(0)

    expect(form.rawErrors.value).toEqual([])
  })

  it('form should have nested raw errors', async () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })

    await sleep(0)

    expect(form.rawErrors.value).toEqual([
      {
        code: 'invalid_type',
        expected: 'object',
        message: 'Required',
        path: [
          'a',
        ],
        received: 'undefined',
      },
    ])

    form.addErrors([{
      path: 'a.b',
      message: 'Invalid name',
    }])

    expect(form.rawErrors.value).toEqual([
      {
        code: 'invalid_type',
        expected: 'object',
        message: 'Required',
        path: [
          'a',
        ],
        received: 'undefined',
      },
      {
        message: 'Invalid name',
        path: [
          'a',
          'b',
        ],
      },
    ])
  })

  it('field should have raw errors', async () => {
    const form = useForm({
      schema: basicSchema,
      initialState: {
        name: null,
      },
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    await sleep(0)

    expect(name.rawErrors.value).toEqual([{
      code: 'invalid_type',
      expected: 'string',
      message: 'Expected string, received null',
      path: [],
      received: 'null',
    }])
  })

  it('field should have nested raw errors', async () => {
    const form = useForm({
      schema: objectSchema,
      initialState: {
        a: {
          b: null,
          bObj: {
            c: null,
          },
        },
      },
      onSubmit: (data) => {
        return data
      },
    })

    const a = form.register('a')

    await sleep(0)

    expect(a.rawErrors.value).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'null',
        path: ['b'],
        message: 'Expected string, received null',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'null',
        path: ['bObj', 'c'],
        message: 'Expected string, received null',
      },
    ])

    form.addErrors([{
      path: 'a.b',
      message: 'Invalid name',
    }])

    expect(a.rawErrors.value).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'null',
        path: ['b'],
        message: 'Expected string, received null',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'null',
        path: ['bObj', 'c'],
        message: 'Expected string, received null',
      },
      {
        path: ['b'],
        message: 'Invalid name',
      },
    ])
  })

  it('fields with a similar name should not have shared errors', async () => {
    const form = useForm({
      schema: basicWithSimilarNamesSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const nameFirst = form.register('nameFirst', 'a')
    const nameSecond = form.register('nameSecond', 'a')
    const name = form.register('name', 'a')

    await sleep(0)

    expect(nameFirst.errors.value).toEqual([{
      message: 'String must contain at least 4 character(s)',
      path: null,
    }])
    expect(nameSecond.errors.value).toEqual([{
      message: 'String must contain at least 4 character(s)',
      path: null,
    }])
    expect(name.errors.value).toEqual([])
  })
})

it('fields should share errors with its parents', async () => {
  const form = useForm({
    schema: objectSchema,
    onSubmit: (data) => {
      return data
    },
  })

  const aBObjC = form.register('a.bObj.c')
  const aBObj = form.register('a.bObj')
  const a = form.register('a')
  const ab = form.register('a.b')

  await sleep(0)

  expect(aBObjC.errors.value).toEqual([{ message: 'Expected string, received null', path: null }])
  expect(aBObj.errors.value).toEqual([{ message: 'Expected string, received null', path: 'c' }])
  expect(ab.errors.value).toEqual([{ message: 'Expected string, received null', path: null }])
  expect(a.errors.value).toEqual([
    { message: 'Expected string, received null', path: 'b' },
    { message: 'Expected string, received null', path: 'bObj.c' },
  ])
})
