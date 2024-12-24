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

  it('should blur all fields', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },

    })

    const name = form.register('name', 'John')

    expect(name.attrs.isTouched.value).toEqual(false)

    await sleep(0)
    await form.submit()

    expect(name.attrs.isTouched.value).toEqual(true)
  })

  it('should not submit if there are errors', async () => {
    let submitted = false
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        submitted = true
        expect(data).toEqual({
          name: 'Jon',
        })

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
})
