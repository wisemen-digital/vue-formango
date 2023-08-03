import type {
  App,
  CustomInspectorNode,
  DevtoolsPluginApi,
} from '@vue/devtools-api'
import {
  setupDevtoolsPlugin,
} from '@vue/devtools-api'
import { getCurrentInstance, nextTick, onUnmounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type { Field, Form } from '../types'
import type { EncodedNode } from '../types/devtools.type'
import { throttle } from '../utils'
import { buildFieldState, buildFormState } from './devtoolsBuilders'

let API: DevtoolsPluginApi<Record<string, any>> | undefined
const INSPECTOR_ID = 'appwise-forms-inspector'
const DEVTOOLS_FORMS = ref<Record<string, Form<any>>>({})
const DEVTOOLS_FIELDS = ref<Record<string, { formId: string; field: Field<any, any> }>>({})

const COLORS = {
  error: 0xBD4B4B,
  success: 0x06D77B,
  unknown: 0x54436B,
  white: 0xFFFFFF,
  black: 0x000000,
  blue: 0x035397,
  purple: 0xB980F0,
  orange: 0xF5A962,
  gray: 0xBBBFCA,
}

const calculateNodes = (): CustomInspectorNode[] => {
  let counter = 0
  return Object.keys(DEVTOOLS_FORMS.value).map((formId: string) => {
    const form = DEVTOOLS_FORMS.value[formId]
    const formFields = Object.keys(DEVTOOLS_FIELDS.value).filter((fieldId: string) => {
      const field = DEVTOOLS_FIELDS.value[fieldId]
      return field.formId === form?._id
    })
    counter++
    const validTag = {
      label: form.isValid ? 'Valid' : 'Invalid',
      textColor: COLORS.white,
      backgroundColor: form.isValid ? COLORS.success : COLORS.error,
    }
    return {
      id: formId,
      label: `Form ${counter}`,
      tags: [
        validTag,
      ],
      children: formFields.map((fieldId: string) => {
        const field = DEVTOOLS_FIELDS.value[fieldId]
        const hasErrors = field.field.errors && Object.values(field.field.errors).length > 0
        const errorTag = {
          label: 'Has error',
          textColor: COLORS.white,
          backgroundColor: COLORS.error,
        }

        const tags = []
        if (hasErrors)
          tags.push(errorTag)

        return {
          id: fieldId,
          label: field.field._path ?? 'Unknown field',
          tags,
        }
      }),
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

function installDevtoolsPlugin(app: App) {
  if (process.env.NODE_ENV === 'development') {
    setupDevtoolsPlugin(
      {
        id: 'appwise-forms-devtools-plugin',
        label: 'Appwise Forms Plugin',
        packageName: '@appwise/forms',
        homepage: 'https://github.com/wouterlms/forms',
        app,
        logo: 'https://ca.slack-edge.com/T060KMU2G-U01EJUUGLN9-b30972b08900-512',
      },
      setupApiHooks,
    )
  }
}

function setupApiHooks(api: DevtoolsPluginApi<Record<string, any>>) {
  API = api

  api.addInspector({
    id: INSPECTOR_ID,
    icon: 'rule',
    label: 'appwise-forms',
    noSelectionText: 'Select a form node to inspect',
  })

  api.on.getInspectorTree((payload) => {
    if (payload.inspectorId !== INSPECTOR_ID)
      return
    const calculatedNodes = calculateNodes()
    payload.rootNodes = calculatedNodes
  })

  api.on.getInspectorState((payload, ctx) => {
    if (payload.inspectorId !== INSPECTOR_ID || ctx.currentTab !== `custom-inspector:${INSPECTOR_ID}`)
      return
    const decodedNode = decodeNodeId(payload.nodeId)
    if (decodedNode?.type === 'form' && decodedNode?.form)
      payload.state = buildFormState(decodedNode.form)
    else if (decodedNode?.type === 'field' && decodedNode?.field?.field)
      payload.state = buildFieldState(decodedNode?.field.field)
  })
  watchDebounced(() => [DEVTOOLS_FORMS.value], () => {
    refreshInspector()
  }, { deep: true, debounce: 500 })
}

export function registerFormWithDevTools(form: Form<any>) {
  const vm = getCurrentInstance()
  if (!API) {
    const app = vm?.appContext.app
    if (!app)
      return
    installDevtoolsPlugin(app as unknown as App)
  }
  if (!form?._id)
    return
  const encodedForm = encodeNodeId({ type: 'form', id: form._id })
  DEVTOOLS_FORMS.value[encodedForm] = form
  onUnmounted(() => {
    const formFields = Object.keys(DEVTOOLS_FIELDS.value).filter((fieldId: string) => {
      const field = DEVTOOLS_FIELDS.value[fieldId]
      return field.formId === form?._id
    })
    delete DEVTOOLS_FORMS.value[encodedForm]
    formFields.forEach((formFieldId: string) => {
      delete DEVTOOLS_FIELDS.value[formFieldId]
    })
    refreshInspector()
  })
  refreshInspector()
}

export function registerFieldWithDevTools(formId: string, field: Field<any, any>) {
  const vm = getCurrentInstance()
  if (!API) {
    const app = vm?.appContext.app
    if (!app)
      return
    installDevtoolsPlugin(app as unknown as App)
  }
  const encodedField = encodeNodeId({ type: 'field', id: field._id })
  DEVTOOLS_FIELDS.value[encodedField] = {
    formId,
    field,
  }
  refreshInspector()
}

function encodeNodeId(node: EncodedNode): string {
  return btoa(encodeURIComponent(JSON.stringify(node)))
}

interface FormNode {
  type: 'form'
  form: Form<any>
}

interface FieldNode {
  type: 'field'
  field: {
    formId: string
    field: Field<any, any>
  }
}

function decodeNodeId(nodeId: string): FormNode | FieldNode | null {
  try {
    const decodedNode = JSON.parse(decodeURIComponent(atob(nodeId))) as EncodedNode
    if (!decodedNode)
      throw new Error('Invalid node id')
    if (decodedNode.type === 'form' && DEVTOOLS_FORMS.value[nodeId]) {
      return {
        form: DEVTOOLS_FORMS.value[nodeId],
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
  catch (err) {
    // console.error(`Devtools: [vee-validate] Failed to parse node id ${nodeId}`);
  }
  return null
}
