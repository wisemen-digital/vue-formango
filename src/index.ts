import { z } from 'zod'
import { useForm } from './lib'

export * from './lib'
export type { UseForm, Field, FieldArray, Form } from './types'

export const schemaTest = z.object({
  name: z.string().min(4),
})

const form = useForm({
  schema: schemaTest,
  onSubmit: (data) => {
    return data
  },
})

form.register('name')
