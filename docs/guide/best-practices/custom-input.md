# Custom input

Instead of binding all the events in the native input, it is best to create a wrapper around an input which handles all the bindings.
Here is a custom input which shows the error if the user has focused and blurred the input.

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

const model = defineModel<string | number | null>()
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
