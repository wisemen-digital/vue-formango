import {
  describe,
  expect,
  it,
} from 'vitest'

import { useForm } from '../src/lib/useForm'
import {
  basicSchema,
  objectSchema,
  sleep,
  twoDimensionalArraySchema,
} from './testUtils'

describe('isValid', () => {
  it('should be false by default when form is not valid', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    await sleep(0)

    expect(form.isValid.value).toBeFalsy()
  })

  it('should be true if all fields are valid', async () => {
    const form = useForm({
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    await sleep(0)

    expect(form.isValid.value).toBeFalsy()

    form.register('name', 'John')

    await sleep(0)

    expect(form.isValid.value).toBeTruthy()
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

    expect(form.isValid.value).toBeFalsy()
    expect(a.isValid.value).toBeFalsy()
    expect(ab.isValid.value).toBeFalsy()
    expect(abObj.isValid.value).toBeFalsy()
    expect(abObjC.isValid.value).toBeFalsy()

    abObjC.setValue('John')
    abObj.setValue({ c: 'John' })

    await sleep(0)

    expect(form.isValid.value).toBeFalsy()
    expect(a.isValid.value).toBeFalsy()
    expect(ab.isValid.value).toBeFalsy()
    expect(abObj.isValid.value).toBeTruthy()
    expect(abObjC.isValid.value).toBeTruthy()

    ab.setValue('John')

    await sleep(0)

    expect(form.isValid.value).toBeTruthy()
    expect(a.isValid.value).toBeTruthy()
    expect(ab.isValid.value).toBeTruthy()
    expect(abObj.isValid.value).toBeTruthy()
    expect(abObjC.isValid.value).toBeTruthy()
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

    expect(form.isValid.value).toBeFalsy()
    expect(array.isValid.value).toBeFalsy()
    expect(array0.isValid.value).toBeFalsy()
    expect(array00.isValid.value).toBeFalsy()
    expect(array00Name.isValid.value).toBeFalsy()
    expect(array01.isValid.value).toBeFalsy()
    expect(array01Name.isValid.value).toBeFalsy()
    expect(array1.isValid.value).toBeFalsy()

    array00Name.setValue('John')

    await sleep(0)

    expect(form.isValid.value).toBeFalsy()
    expect(array.isValid.value).toBeFalsy()
    expect(array0.isValid.value).toBeFalsy()
    expect(array01.isValid.value).toBeFalsy()
    expect(array01Name.isValid.value).toBeFalsy()
    expect(array1.isValid.value).toBeFalsy()

    expect(array00.isValid.value).toBeTruthy()
    expect(array00Name.isValid.value).toBeTruthy()

    array01.setValue({ name: 'John' })

    await sleep(0)

    expect(form.isValid.value).toBeFalsy()
    expect(array.isValid.value).toBeFalsy()
    expect(array1.isValid.value).toBeFalsy()

    expect(array0.isValid.value).toBeTruthy()
    expect(array01.isValid.value).toBeTruthy()
    expect(array01Name.isValid.value).toBeTruthy()
    expect(array00.isValid.value).toBeTruthy()

    array1.setValue([
      { name: 'John' },
    ])

    await sleep(0)

    expect(form.isValid.value).toBeTruthy()
    expect(array.isValid.value).toBeTruthy()
    expect(array0.isValid.value).toBeTruthy()
    expect(array1.isValid.value).toBeTruthy()
    expect(array00.isValid.value).toBeTruthy()
    expect(array01.isValid.value).toBeTruthy()
    expect(array01Name.isValid.value).toBeTruthy()
  })
})
