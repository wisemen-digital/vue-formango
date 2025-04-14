import { z } from 'zod'

export enum TemplateType {
  INDIVIDUAL = 'individual',
  PEER_REVIEW = 'peer_review',
}

export const templateFormTypeEnum = z.nativeEnum(TemplateType)
export const choiceUuidSchema = z.string().uuid().brand('ChoiceUuid')
export const questionUuidSchema = z.string().uuid().brand('QuestionUuid')

const baseTemplateFormQuestionSchema = z.object({
  uuid: questionUuidSchema.nullable(),
  title: z.string().min(1),
  hasExtraInformation: z.boolean(),
  isRequired: z.boolean().default(true),
  description: z.string().nullable(),
})

export const templateChoiceSchema = z.object({
  uuid: choiceUuidSchema.nullable(),
  sortIndex: z.number(),
  text: z.string().min(1),
})

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN = 'open',
  SCORE = 'score',
  SINGLE_CHOICE = 'single_choice',
}

const templateFormOpenQuestionSchema = baseTemplateFormQuestionSchema
  .merge(z.object({ questionType: z.literal(QuestionType.OPEN) }))

const templateFormScoreQuestionSchema = baseTemplateFormQuestionSchema.merge(z.object({
  labelMax: z.string().nullable(),
  labelMin: z.string().nullable(),
  maxScore: z.number().nullable(),
  questionType: z.literal(QuestionType.SCORE),
}))

const templateFormSingleChoiceQuestionSchema = baseTemplateFormQuestionSchema.merge(z.object({
  choices: templateChoiceSchema.array().min(2),
  questionType: z.literal(QuestionType.SINGLE_CHOICE),
}))

const templateFormMultipleChoiceQuestionSchema = baseTemplateFormQuestionSchema.merge(z.object({
  choices: z.array(templateChoiceSchema).min(2),
  maxChoices: z.number().nullable(),
  minChoices: z.number().nullable(),
  questionType: z.literal(QuestionType.MULTIPLE_CHOICE),
}))

export const templateFormQuestionSchema = z.discriminatedUnion('questionType', [
  templateFormOpenQuestionSchema,
  templateFormScoreQuestionSchema,
  templateFormSingleChoiceQuestionSchema,
  templateFormMultipleChoiceQuestionSchema,
])

export const templateStepFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  questions: z.array(templateFormQuestionSchema),
})

export const templateUpdateFormSchema = z.object({
  title: z.string().min(1),
  isOneTimeUse: z.boolean(),
  steps: templateStepFormSchema.array(),
  type: templateFormTypeEnum,
})

export type TemplateUpdateForm = z.infer<typeof templateUpdateFormSchema>
export type TemplateChoice = z.infer<typeof templateChoiceSchema>

export type TemplateFormQuestion = z.infer<typeof templateFormQuestionSchema>
export type TemplateFormOpenQuestion = z.infer<typeof templateFormOpenQuestionSchema>
export type TemplateFormScoreQuestion = z.infer<typeof templateFormScoreQuestionSchema>
export type TemplateFormSingleChoiceQuestion = z.infer<typeof templateFormSingleChoiceQuestionSchema>
export type TemplateFormMultipleChoiceQuestion = z.infer<typeof templateFormMultipleChoiceQuestionSchema>
export type ChoiceUuid = z.infer<typeof choiceUuidSchema>
