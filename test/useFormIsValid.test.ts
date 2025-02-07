import { describe, expect, it } from 'vitest'
import { useForm } from '../src/lib/useForm'
import { basicSchema, objectSchema, sleep, twoDimensionalArraySchema } from './testUtils'

describe('isValid', () => {
  it('should be false by default when form is not valid', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    await sleep(0)

    expect(form.isValid.value).toEqual(false)
  })

  it('should be true if all fields are valid', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    await sleep(0)

    expect(form.isValid.value).toEqual(false)

    form.register('name', 'John')

    await sleep(0)

    expect(form.isValid.value).toEqual(true)
  })

  it('an field with object isValid value should be based on its children being valid', async () => {
    const form = useForm({
      schema: objectSchema,
      onSubmit: (data) => {
        return data
      },
    })
    const a = form.register('a')
    const ab = form.register('a.b')
    const abObj = form.register('a.bObj')
    const abObjC = form.register('a.bObj.c')

    await sleep(0)

    expect(form.isValid.value).toEqual(false)
    expect(a.isValid.value).toEqual(false)
    expect(ab.isValid.value).toEqual(false)
    expect(abObj.isValid.value).toEqual(false)
    expect(abObjC.isValid.value).toEqual(false)

    abObjC.setValue('John')
    abObj.setValue({ c: 'John' })

    await sleep(0)

    expect(form.isValid.value).toEqual(false)
    expect(a.isValid.value).toEqual(false)
    expect(ab.isValid.value).toEqual(false)
    expect(abObj.isValid.value).toEqual(true)
    expect(abObjC.isValid.value).toEqual(true)

    ab.setValue('John')

    await sleep(0)

    expect(form.isValid.value).toEqual(true)
    expect(a.isValid.value).toEqual(true)
    expect(ab.isValid.value).toEqual(true)
    expect(abObj.isValid.value).toEqual(true)
    expect(abObjC.isValid.value).toEqual(true)
  })

  it('should be false if an element of a fieldArray is invalid', async () => {
    const form = useForm({
      schema: twoDimensionalArraySchema,
      onSubmit: (data) => {
        return data
      },
    })

    const array = form.registerArray('array')
    const array0 = array.register('0')
    const array1 = array.register('1')
    const array00 = array0.register('0')
    const array00Name = array00.register('name')
    const array01 = array0.register('1')
    const array01Name = array01.register('name')

    await sleep(0)

    expect(form.isValid.value).toEqual(false)
    expect(array.isValid.value).toEqual(false)
    expect(array0.isValid.value).toEqual(false)
    expect(array00.isValid.value).toEqual(false)
    expect(array00Name.isValid.value).toEqual(false)
    expect(array01.isValid.value).toEqual(false)
    expect(array01Name.isValid.value).toEqual(false)
    expect(array1.isValid.value).toEqual(false)

    array00Name.setValue('John')

    await sleep(0)

    expect(form.isValid.value).toEqual(false)
    expect(array.isValid.value).toEqual(false)
    expect(array0.isValid.value).toEqual(false)
    expect(array01.isValid.value).toEqual(false)
    expect(array01Name.isValid.value).toEqual(false)
    expect(array1.isValid.value).toEqual(false)

    expect(array00.isValid.value).toEqual(true)
    expect(array00Name.isValid.value).toEqual(true)

    array01.setValue({ name: 'John' })

    await sleep(0)

    expect(form.isValid.value).toEqual(false)
    expect(array.isValid.value).toEqual(false)
    expect(array1.isValid.value).toEqual(false)

    expect(array0.isValid.value).toEqual(true)
    expect(array01.isValid.value).toEqual(true)
    expect(array01Name.isValid.value).toEqual(true)
    expect(array00.isValid.value).toEqual(true)

    array1.setValue([{ name: 'John' }])

    await sleep(0)

    expect(form.isValid.value).toEqual(true)
    expect(array.isValid.value).toEqual(true)
    expect(array0.isValid.value).toEqual(true)
    expect(array1.isValid.value).toEqual(true)
    expect(array00.isValid.value).toEqual(true)
    expect(array01.isValid.value).toEqual(true)
    expect(array01Name.isValid.value).toEqual(true)
  })
})
