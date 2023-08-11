import type {
  App,
  CustomInspectorNode,
  DevtoolsPluginApi,
} from '@vue/devtools-api'
import {
  setupDevtoolsPlugin,
} from '@vue/devtools-api'
import { getCurrentInstance, nextTick, onUnmounted } from 'vue'
import type { Field, Form } from '../types'
import type { EncodedNode, FieldNode, FormNode, ObjectWithPossiblyFieldRecursive } from '../types/devtools.type'
import { throttle } from '../utils'
import { buildFieldState, buildFormState } from './devtoolsBuilders'

let API: DevtoolsPluginApi<Record<string, any>> | undefined
const INSPECTOR_ID = 'formango-inspector'
const DEVTOOLS_FORMS: Record<string, { name: string; form: Form<any> }> = {}
const DEVTOOLS_FIELDS: Record<string, { formId: string; field: Field<any, any> & { __ID__?: string } }> = {}

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

let IS_INSTALLED = false

function mapFieldsToObject(fields: Field<any, any>[]): ObjectWithPossiblyFieldRecursive {
  const obj = {}
  fields.forEach((field) => {
    if (!field._path)
      return
    const path = field._path
    const pathArray = path?.split('.')
    if (!pathArray)
      return
    const lastKey = pathArray.pop() as keyof typeof lastObj
    const lastObj = pathArray.reduce<any>((obj, key) => obj[key] = obj[key] || {}, obj)
    if (!lastObj[lastKey])
      lastObj[lastKey] = {}
    lastObj[lastKey].__FIELD__ = field
  })
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
        label: hasError ? 'Invalid' : 'Valid',
        textColor: COLORS.white,
        backgroundColor: hasError ? COLORS.error : COLORS.success,
      }

      const tags = []
      if (hasError)
        tags.push(validTag)

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
            label: 'Not registered',
            textColor: COLORS.white,
            backgroundColor: COLORS.orange,
          },
        ],
        children: mapObjectToCustomInspectorNode(value),
      }
    }
  })
}

const calculateNodes = (): CustomInspectorNode[] => {
  nonFieldsCounter = 0
  return Object.keys(DEVTOOLS_FORMS).map((formId: string) => {
    const form = DEVTOOLS_FORMS[formId]

    const allFormFields = Object.keys(DEVTOOLS_FIELDS).filter((key) => {
      const field = DEVTOOLS_FIELDS[key]
      return form.form._id === field.formId
    }).map((key) => {
      const field = DEVTOOLS_FIELDS[key]
      field.field.__ID__ = key
      return field.field
    })

    const mappedAsObject = mapFieldsToObject(allFormFields)
    const formChildren = mapObjectToCustomInspectorNode(mappedAsObject)
    const validTag = {
      label: form.form.isValid ? 'Valid' : 'Invalid',
      textColor: COLORS.white,
      backgroundColor: form.form.isValid ? COLORS.success : COLORS.error,
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

let interval: ReturnType<typeof setInterval> | null = null
const removeRefreshInterval = () => {
  if (interval)
    clearInterval(interval)
  interval = null
}
const setRefreshInterval = () => {
  removeRefreshInterval()
  interval = setInterval(() => {
    refreshInspector()
  }, 1500)
}

function installDevtoolsPlugin(app: App) {
  if (process.env.NODE_ENV === 'development') {
    setupDevtoolsPlugin(
      {
        id: 'formango-devtools-plugin',
        label: 'Formango Plugin',
        packageName: 'formango',
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
    label: 'formango',
    noSelectionText: 'Select a form node to inspect',
  })

  api.on.getInspectorTree((payload, ctx) => {
    if (payload.inspectorId !== INSPECTOR_ID)
      return

    if (ctx.currentTab !== `custom-inspector:${INSPECTOR_ID}`) {
      removeRefreshInterval()
      return
    }
    setRefreshInterval()
    const calculatedNodes = calculateNodes()
    payload.rootNodes = calculatedNodes
  })

  api.on.getInspectorState((payload, ctx) => {
    if (payload.inspectorId !== INSPECTOR_ID)
      return

    if (ctx.currentTab !== `custom-inspector:${INSPECTOR_ID}`) {
      removeRefreshInterval()
      return
    }
    setRefreshInterval()
    const decodedNode = decodeNodeId(payload.nodeId)
    if (decodedNode?.type === 'form' && decodedNode?.form)
      payload.state = buildFormState(decodedNode.form)
    else if (decodedNode?.type === 'field' && decodedNode?.field?.field)
      payload.state = buildFieldState(decodedNode?.field.field)
  })
  setRefreshInterval()
}

const installPlugin = () => {
  const vm = getCurrentInstance()
  if (!IS_INSTALLED) {
    IS_INSTALLED = true
    const app = vm?.appContext.app
    if (!app)
      return
    installDevtoolsPlugin(app)
  }
}

export function registerFormWithDevTools(form: Form<any>, name?: string) {
  installPlugin()
  if (!form?._id)
    return

  const encodedForm = encodeNodeId({ type: 'form', id: form._id, name: name ?? 'Unknown form' })
  DEVTOOLS_FORMS[encodedForm] = { name: name ?? 'Unknown form', form }
  onUnmounted(() => {
    const formFields = Object.keys(DEVTOOLS_FIELDS).filter((fieldId: string) => {
      const field = DEVTOOLS_FIELDS[fieldId]
      return field.formId === form?._id
    })
    delete DEVTOOLS_FORMS[encodedForm]
    formFields.forEach((formFieldId: string) => {
      delete DEVTOOLS_FIELDS[formFieldId]
    })
    refreshInspector()
  })
  refreshInspector()
}

export function registerFieldWithDevTools(formId: string, field: Field<any, any>) {
  installPlugin()
  const encodedField = encodeNodeId({ type: 'field', id: field._id })
  DEVTOOLS_FIELDS[encodedField] = {
    formId,
    field,
  }
  refreshInspector()
}

export const unregisterFieldWithDevTools = (field: Field<any, any>) => {
  const encodedField = encodeNodeId({ type: 'field', id: field._id })
  delete DEVTOOLS_FIELDS[encodedField]
}

function encodeNodeId(node: EncodedNode): string {
  return btoa(encodeURIComponent(JSON.stringify(node)))
}

function decodeNodeId(nodeId: string): FormNode | FieldNode | null {
  try {
    const decodedNode = JSON.parse(decodeURIComponent(atob(nodeId))) as EncodedNode
    if (!decodedNode)
      throw new Error('Invalid node id')
    if (decodedNode.type === 'form' && DEVTOOLS_FORMS[nodeId]) {
      return {
        form: DEVTOOLS_FORMS[nodeId].form,
        name: decodedNode.name,
        type: 'form',
      }
    }
    else {
      return {
        field: DEVTOOLS_FIELDS[nodeId],
        type: 'field',
      }
    }
  }
  catch (err) {
    // console.error(`Devtools: [vee-validate] Failed to parse node id ${nodeId}`);
  }
  return null
}
