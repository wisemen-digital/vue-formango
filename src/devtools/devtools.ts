/* eslint-disable node/prefer-global/process */
import type {
  App,
  CustomInspectorNode,
  DevtoolsPluginApi,
} from '@vue/devtools-api'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import type { UnwrapRef } from 'vue'
import {
  getCurrentInstance,
  nextTick,
  onUnmounted,
  ref,
  watch,
} from 'vue'

import type {
  Field,
  Form,
} from '../types'
import type {
  EncodedNode,
  FieldNode,
  FormNode,
  ObjectWithPossiblyFieldRecursive,
} from '../types/devtools.type'
import { throttle } from '../utils'
import {
  buildFieldState,
  buildFormState,
} from './devtoolsBuilder'

let API: DevtoolsPluginApi<Record<string, any>> | undefined
const INSPECTOR_ID = 'formango-inspector'
const DEVTOOLS_FORMS = ref<Record<string, { name: string
  form: Form<any> }>>({})
const DEVTOOLS_FIELDS = ref<Record<string, { formId: string
  field: Field<any, any> & { __ID__?: string } }>>({})

const COLORS = {
  black: 0x00_00_00,
  blue: 0x03_53_97,
  error: 0xBD_4B_4B,
  gray: 0xBB_BF_CA,
  orange: 0xF5_A9_62,
  purple: 0xB9_80_F0,
  success: 0x06_D7_7B,
  unknown: 0x54_43_6B,
  white: 0xFF_FF_FF,
}

let IS_INSTALLED = false

function mapFieldsToObject(fields: UnwrapRef<Field<any, any>[]>): ObjectWithPossiblyFieldRecursive {
  const obj = {}

  for (const field of fields) {
    if (!field._path) {
      continue
    }
    const path = field._path
    const pathArray = path?.split('.')

    if (!pathArray) {
      continue
    }
    const lastKey = pathArray.pop() as keyof typeof lastObj
    const lastObj = pathArray.reduce<any>((obj, key) => obj[key] = obj[key] || {}, obj)

    if (!lastObj[lastKey]) {
      lastObj[lastKey] = {}
    }

    lastObj[lastKey].__FIELD__ = field
  }

  return obj
}

// recursively map the mappedObjects to a CustomInspectorNode
let nonFieldsCounter = 0

function mapObjectToCustomInspectorNode(obj: ObjectWithPossiblyFieldRecursive): CustomInspectorNode[] {
  return Object.keys(obj).map((key) => {
    const value = obj[key]

    if (value.__FIELD__) {
      const field = value.__FIELD__
      const hasError = field.errors && Object.values(field.errors).length > 0
      const validTag = {
        backgroundColor: hasError ? COLORS.error : COLORS.success,
        label: hasError ? 'Invalid' : 'Valid',
        textColor: COLORS.white,
      }

      const tags = []

      if (hasError) {
        tags.push(validTag)
      }

      delete value.__FIELD__

      return {
        id: field.__ID__,
        label: key,
        tags,
        children: mapObjectToCustomInspectorNode(value),
      }
    }
    else {
      nonFieldsCounter++

      return {
        id: `non-field-${nonFieldsCounter}`,
        label: key,
        tags: [
          {
            backgroundColor: COLORS.orange,
            label: 'Not registered',
            textColor: COLORS.white,
          },
        ],
        children: mapObjectToCustomInspectorNode(value),
      }
    }
  })
}

function calculateNodes(): CustomInspectorNode[] {
  nonFieldsCounter = 0

  return Object.keys(DEVTOOLS_FORMS.value).map((formId: string) => {
    const form = DEVTOOLS_FORMS.value[formId]
    const actualForm = form.form as unknown as UnwrapRef<Form<any>>

    const foundFieldKeys = Object.keys(DEVTOOLS_FIELDS.value).filter((key) => {
      const field = DEVTOOLS_FIELDS.value[key]

      return form.form._id === field.formId
    })

    const allFormFields = foundFieldKeys.map((key) => {
      const field = DEVTOOLS_FIELDS.value[key]

      field.field.__ID__ = key

      return field.field
    }) as unknown as UnwrapRef<Field<any, any>>[]

    const mappedAsObject = mapFieldsToObject(allFormFields)
    const formChildren = mapObjectToCustomInspectorNode(mappedAsObject)

    const validTag = {
      backgroundColor: actualForm.isValid ? COLORS.success : COLORS.error,
      label: actualForm.isValid ? 'Valid' : 'Invalid',
      textColor: COLORS.white,
    }

    return {
      id: formId,
      label: `${form.name}`,
      tags: [
        validTag,
      ],
      children: formChildren,
    }
  })
}

export const refreshInspector = throttle(() => {
  setTimeout(async () => {
    await nextTick()

    API?.sendInspectorState(INSPECTOR_ID)
    API?.sendInspectorTree(INSPECTOR_ID)
  }, 100)
}, 100)

const isDevMode = process.env.NODE_ENV === 'development'

function installDevtoolsPlugin(app: App) {
  if (!isDevMode) {
    return
  }

  setupDevtoolsPlugin(
    {
      id: 'formango-devtools-plugin',
      app,
      homepage: 'https://github.com/wisemen-digital/vue-formango',
      label: 'Formango Plugin',
      logo: 'https://wisemen-digital.github.io/vue-formango/assets/mango_no_shadow.svg',
      packageName: 'formango',
    },
    setupApiHooks,
  )
}

function setupApiHooks(api: DevtoolsPluginApi<Record<string, any>>) {
  API = api

  api.addInspector({
    id: INSPECTOR_ID,
    icon: 'rule',
    label: 'formango',
    noSelectionText: 'Select a form node to inspect',
  })

  api.on.getInspectorTree((payload) => {
    if (payload.inspectorId !== INSPECTOR_ID) {
      return
    }

    try {
      const calculatedNodes = calculateNodes()

      payload.rootNodes = calculatedNodes
    }
    catch (error) {
      console.error('Error with calculating devtools nodes')
      console.error(error)
    }
  })

  api.on.getInspectorState((payload) => {
    if (payload.inspectorId !== INSPECTOR_ID) {
      return
    }

    const decodedNode = decodeNodeId(payload.nodeId)

    if (decodedNode?.type === 'form' && decodedNode?.form) {
      payload.state = buildFormState(decodedNode.form as unknown as UnwrapRef<Form<any>>)
    }
    else if (decodedNode?.type === 'field' && decodedNode?.field?.field) {
      payload.state = buildFieldState(decodedNode?.field.field as unknown as UnwrapRef<Field<any, any>>)
    }
  })
}

function installPlugin() {
  if (!isDevMode) {
    return
  }

  const vm = getCurrentInstance()

  if (!IS_INSTALLED) {
    IS_INSTALLED = true

    const app = vm?.appContext.app

    if (!app) {
      return
    }

    installDevtoolsPlugin(app)
  }
}

export function registerFormWithDevTools(form: Form<any>, name?: string) {
  if (!isDevMode) {
    return
  }

  installPlugin()

  if (!form?._id) {
    return
  }

  // get component name from the instance
  const componentName = getCurrentInstance()?.type.__name

  const encodedForm = encodeNodeId({
    id: form._id,
    name: name ?? 'Unknown form',
    type: 'form',
  })

  DEVTOOLS_FORMS.value[encodedForm] = {
    name: componentName ?? 'Unknown form',
    form,
  }
  onUnmounted(() => {
    const formFields = Object.keys(DEVTOOLS_FIELDS.value).filter((fieldId: string) => {
      const field = DEVTOOLS_FIELDS.value[fieldId]

      return field.formId === form?._id
    })

    delete DEVTOOLS_FORMS.value[encodedForm]
    // eslint-disable-next-line unicorn/no-array-for-each
    formFields.forEach((formFieldId: string) => {
      delete DEVTOOLS_FIELDS.value[formFieldId]
    })
  })
}

export function registerFieldWithDevTools(formId: string, field: Field<any, any>) {
  if (!isDevMode) {
    return
  }

  installPlugin()

  const encodedField = encodeNodeId({
    id: field._id,
    type: 'field',
  })

  DEVTOOLS_FIELDS.value[encodedField] = {
    formId,
    field,
  }
}

export function unregisterFieldWithDevTools(fieldId: string) {
  if (!isDevMode) {
    return
  }

  const encodedField = encodeNodeId({
    id: fieldId,
    type: 'field',
  })

  delete DEVTOOLS_FIELDS.value[encodedField]
}

function encodeNodeId(node: EncodedNode): string {
  return btoa(encodeURIComponent(JSON.stringify(node)))
}

function decodeNodeId(nodeId: string): FieldNode | FormNode | null {
  try {
    const decodedNode = JSON.parse(decodeURIComponent(atob(nodeId))) as EncodedNode

    if (!decodedNode) {
      throw new Error('Invalid node id')
    }
    if (decodedNode.type === 'form' && DEVTOOLS_FORMS.value[nodeId]) {
      return {
        name: decodedNode.name,
        form: DEVTOOLS_FORMS.value[nodeId].form,
        type: 'form',
      }
    }
    else {
      return {
        field: DEVTOOLS_FIELDS.value[nodeId],
        type: 'field',
      }
    }
  }
  catch {
    // console.error(`Devtools: [vee-validate] Failed to parse node id ${nodeId}`);
  }

  return null
}

if (isDevMode) {
  watch([
    DEVTOOLS_FORMS.value,
    DEVTOOLS_FIELDS.value,
  ], refreshInspector, { deep: true })
}
