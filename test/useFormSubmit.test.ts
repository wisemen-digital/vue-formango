import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema, sleep } from './testUtils'

describe('submit', () => {
  it('should submit', async () => {
    let submitted = false
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        submitted = true
        return data
      },
    })

    form.register('name', 'John')

    await sleep(0)
    await form.submit()

    expect(submitted).toEqual(true)
    expect(form.hasAttemptedToSubmit.value).toEqual(true)
  })

  it('should submit with data', async () => {
    let submitted = false
    let submittedData = null
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        submitted = true
        submittedData = data

        return data
      },
    })

    form.register('name', 'John')

    await sleep(0)

    form.submit()

    await sleep(0)

    expect(submitted).toEqual(true)
    expect(submittedData).toEqual({
      name: 'John',
    })
  })

  it('should blur all fields', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },

    })

    const name = form.register('name', 'John')

    expect(name.isTouched.value).toEqual(false)

    await sleep(0)
    await form.submit()

    expect(name.isTouched.value).toEqual(true)
  })

  it('should not submit if there are errors', async () => {
    let submitted = false
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        submitted = true

        return data
      },

    })

    form.register('name', 'Jon')

    await sleep(0)
    await form.submit()

    expect(submitted).toEqual(false)
  })

  it('should call `onSubmitError` if there are errors', async () => {
    let isCalled = false

    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
      onSubmitError: () => {
        isCalled = true
      },
    })

    form.register('name', 'Jon')

    await sleep(0)
    await form.submit()

    expect(isCalled).toEqual(true)
  })

  it('should call `onSubmitError` if there are errors and pass data and errors to the callback function', async () => {
    let isCalled = false
    let submittedErrorData = null
    let submittedErrors = null

    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
      onSubmitError: ({ data, errors }) => {
        isCalled = true
        submittedErrorData = data
        submittedErrors = errors
      },
    })

    form.register('name', 'Jon')

    await sleep(0)
    await form.submit()

    expect(submittedErrorData).toEqual({
      name: 'Jon',
    })

    expect(submittedErrors).toEqual([
      {
        message: 'String must contain at least 4 character(s)',
        path: 'name',
      },
    ])

    expect(isCalled).toEqual(true)
  })
})
