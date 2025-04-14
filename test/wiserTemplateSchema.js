import { z } from 'zod';
export var TemplateType;
(function (TemplateType) {
    TemplateType["INDIVIDUAL"] = "individual";
    TemplateType["PEER_REVIEW"] = "peer_review";
})(TemplateType || (TemplateType = {}));
export const templateFormTypeEnum = z.nativeEnum(TemplateType);
export const choiceUuidSchema = z.string().uuid().brand('ChoiceUuid');
export const questionUuidSchema = z.string().uuid().brand('QuestionUuid');
const baseTemplateFormQuestionSchema = z.object({
    uuid: questionUuidSchema.nullable(),
    title: z.string().min(1),
    hasExtraInformation: z.boolean(),
    isRequired: z.boolean().default(true),
    description: z.string().nullable(),
});
export const templateChoiceSchema = z.object({
    uuid: choiceUuidSchema.nullable(),
    sortIndex: z.number(),
    text: z.string().min(1),
});
export var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["OPEN"] = "open";
    QuestionType["SCORE"] = "score";
    QuestionType["SINGLE_CHOICE"] = "single_choice";
})(QuestionType || (QuestionType = {}));
const templateFormOpenQuestionSchema = baseTemplateFormQuestionSchema
    .merge(z.object({ questionType: z.literal(QuestionType.OPEN) }));
const templateFormScoreQuestionSchema = baseTemplateFormQuestionSchema.merge(z.object({
    labelMax: z.string().nullable(),
    labelMin: z.string().nullable(),
    maxScore: z.number().nullable(),
    questionType: z.literal(QuestionType.SCORE),
}));
const templateFormSingleChoiceQuestionSchema = baseTemplateFormQuestionSchema.merge(z.object({
    choices: templateChoiceSchema.array().min(2),
    questionType: z.literal(QuestionType.SINGLE_CHOICE),
}));
const templateFormMultipleChoiceQuestionSchema = baseTemplateFormQuestionSchema.merge(z.object({
    choices: z.array(templateChoiceSchema).min(2),
    maxChoices: z.number().nullable(),
    minChoices: z.number().nullable(),
    questionType: z.literal(QuestionType.MULTIPLE_CHOICE),
}));
export const templateFormQuestionSchema = z.discriminatedUnion('questionType', [
    templateFormOpenQuestionSchema,
    templateFormScoreQuestionSchema,
    templateFormSingleChoiceQuestionSchema,
    templateFormMultipleChoiceQuestionSchema,
]);
export const templateStepFormSchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable(),
    questions: z.array(templateFormQuestionSchema),
});
export const templateUpdateFormSchema = z.object({
    title: z.string().min(1),
    isOneTimeUse: z.boolean(),
    steps: templateStepFormSchema.array(),
    type: templateFormTypeEnum,
});
