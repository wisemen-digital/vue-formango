import {
  describe,
  expect,
  it,
} from 'vitest'
import { ref } from 'vue'

import { useForm } from '../src/lib/useForm'
import {
  basicSchema,
  sleep,
} from './testUtils'

describe('reactive initial state', () => {
  it('should update the state when the initial state is updated', async () => {
    const initialState = ref({ name: 'John' })

    const form = useForm({
      initialState,
      schema: basicSchema,
      onSubmit: (data) => {
        return data
      },
    })

    const name = form.register('name')

    expect(name.modelValue.value).toBe('John')

    initialState.value = { name: 'Joe' }

    await sleep(0)

    expect(name.modelValue.value).toBe('Joe')
  })
})
