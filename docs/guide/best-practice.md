# Best practices

## I18n

To translate your error messages, you can use the vue-i18n package and zod to set global, translated messaged.

::: code-group

```ts [zod.config.ts]
import { z } from 'zod'
import i18n from '@/plugins/i18n'

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  const t = i18n.global.t
  if (issue.code === z.ZodIssueCode.invalid_type)
    return { message: t('errors.invalid_type') }

  if (issue.code === z.ZodIssueCode.invalid_union)
    return { message: t('errors.invalid_union') }
  if (issue.code === z.ZodIssueCode.invalid_string) {
    if (issue.validation === 'email')
      return { message: t('errors.invalid_email') }
    if (issue.validation === 'url')
      return { message: t('errors.invalid_url') }
    if (issue.validation === 'uuid')
      return { message: t('errors.invalid_uuid') }
    if (issue.validation === 'regex')
      return { message: t('errors.invalid_regex') }
    if (issue.validation === 'datetime')
      return { message: t('errors.invalid_datetime') }

    return { message: t('errors.invalid_string') }
  }

  if (issue.code === z.ZodIssueCode.invalid_date)
    return { message: t('errors.invalid_date') }
  if (issue.code === z.ZodIssueCode.too_big) {
    if (issue.type === 'string')
      return { message: t('errors.too_big_string', { max: issue.maximum }) }
    if (issue.type === 'number')
      return { message: t('errors.too_big_number', { max: issue.maximum }) }
    if (issue.type === 'array')
      return { message: t('errors.too_big_array', { max: issue.maximum }) }
    if (issue.type === 'date')
      return { message: t('errors.too_big_date', { max: issue.maximum }) }
    return { message: t('errors.too_big', { max: issue.maximum }) }
  }
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === 'string')
      return { message: t('errors.too_small_string', { min: issue.minimum }) }
    if (issue.type === 'number')
      return { message: t('errors.too_small_number', { min: issue.minimum }) }
    if (issue.type === 'array')
      return { message: t('errors.too_small_array', { min: issue.minimum }) }
    if (issue.type === 'date')
      return { message: t('errors.too_small_date', { min: issue.minimum }) }
    return { message: t('errors.too_small', { min: issue.minimum }) }
  }

  return { message: ctx.defaultError }
}

z.setErrorMap(customErrorMap)

const setupZod = (): void => {
  z.setErrorMap(customErrorMap)
}

export default setupZod
```

```json [nl.json]
{
  "errors": {
    "invalid_type": "Het veld is verplicht.",
    "invalid_type_string": "Het type moet een tekst zijn.",
    "invalid_type_number": "Het type moet een nummer zijn.",
    "invalid_type_boolean": "Het type moet juist of onjuist zijn.",
    "invalid_type_array": "Het type moet een lijst zijn.",
    "invalid_type_object": "Het type moet een object zijn.",
    "invalid_type_date": "Het type moet een datum zijn.",
    "invalid_type_null": "Het type moet ongelding zijn.",
    "invalid_type_undefined": "Het type moet niet gedefineerd zijn.",
    "invalid_type_nan": "Het type moet niet een nummer zijn.",
    "invalid_union": "Een ongeldige samenstelling.",
    "invalid_email": "Ongeldig e-mailadres.",
    "invalid_url": "Ongeldige URL.",
    "invalid_uuid": "Ongeldige UUID.",
    "invalid_regex": "Ongeldige REGEX.",
    "invalid_datetime": "Ongeldige datetime.",
    "invalid_string": "Ongeldige tekst.",
    "invalid_date": "Ongeldige datum.",
    "too_big_string": "Max. {max} karakters lang.",
    "too_big_number": "Max. {max} groot.",
    "too_big_array": "Max. {max} elementen.",
    "too_big_date": "Max. {max} datum.",
    "too_big": "Max. {max} groot.",
    "too_small_string": "Dit veld is verplicht. | Dit veld is verplicht. | Min. {min} karakters lang.",
    "too_small_number": "Min. {min} groot.",
    "too_small_array": "Min. {min} elementen.",
    "too_small_date": "Min. {min} datum.",
    "too_small": "Min. {min} lang.",
    "invalid_type_function": "Het type moet een functie zijn.",
    "invalid_type_symbol": "Het type moet een symbool zijn.",
    "invalid_type_bigint": "Het type moet een bigint zijn.",
    "invalid_type_integer": "Het type moet een geheel getal zijn."
  }
}
```

```ts [main.ts]
import './configs/zod.config'
```
:::

## Custom input

Example of a custom input which shows the error if the user has focused and blurred the input.

```vue
<script setup lang="ts">
import type { ZodFormattedError } from 'zod'
import { computed } from 'vue'

interface Props {
  isTouched?: boolean
  isDirty?: boolean
  errors?: ZodFormattedError<string> | undefined
}

const {
  isTouched = false,
  isDirty = false,
  errors = { _errors: [] },
} = defineProps<Props>()

const emits = defineEmits<{
  blur: []
}>()

const model = defineModel<TModel>()
const errorShown = computed(() => errors._errors.length > 0 && (isTouched || isDirty))
</script>

<template>
  <div>
    <input
      v-model="model"
      @blur="emits('blur')"
    >
    <p v-if="errorShown">
      {{ errors._errors[0] }}
    </p>
  </div>
</template>
```
