import type {
  Field,
  Form,
} from '.'

export type NodeTypes = 'field' | 'form'

export interface SelectedNodeForm {
  formId: string
  name: string
  type: 'form'
}

export interface SelectedNodeField {
  fieldId: string
  formId: string
  type: 'field'
}

export interface EncodedNode {
  id: string
  name?: string
  type: NodeTypes
}

export type SelectedNode = SelectedNodeField | SelectedNodeForm

interface ObjectWithPossiblyField {
  __FIELD__?: Field<any, any> & { __ID__: string }
}

export type ObjectWithPossiblyFieldRecursive = ObjectWithPossiblyField & {
  [x: string]: ObjectWithPossiblyFieldRecursive
}

export interface FormNode {
  name?: string
  form: Form<any>
  type: 'form'
}

export interface FieldNode {
  field: {
    formId: string
    field: Field<any, any>
  }
  type: 'field'
}
