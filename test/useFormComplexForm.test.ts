import {
  describe,
  expect,
  it,
} from 'vitest'

import { useForm } from '../src'
import type { TemplateFormOpenQuestion } from './wiserTemplateSchema'
import {
  QuestionType,
  templateUpdateFormSchema,
} from './wiserTemplateSchema'

const EMPTY_QUESTION = {
  uuid: null,
  title: '',
  hasExtraInformation: false,
  isRequired: true,
  description: null,
  questionType: QuestionType.OPEN,
} satisfies TemplateFormOpenQuestion

describe('when using a complex schema', () => {
  it('should work with nested arrays', () => {
    const form = useForm({
      schema: templateUpdateFormSchema,
      onSubmit: (data) => {
        return data
      },

    })
    const steps = form.registerArray('steps')
    const questions = steps.registerArray('0.questions')

    questions.append(EMPTY_QUESTION)

    expect(questions.modelValue.value).toEqual([
      EMPTY_QUESTION,
    ])
  })
})
