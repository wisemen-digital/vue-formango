import type { Field, Form } from '.'

export type NodeTypes = 'form' | 'field'

export interface SelectedNodeForm {
  type: 'form'
  formId: string
  name: string
}

export interface SelectedNodeField {
  type: 'field'
  formId: string
  fieldId: string
}

export interface EncodedNode {
  type: NodeTypes
  id: string
  name?: string
}

export type SelectedNode = SelectedNodeForm | SelectedNodeField

interface ObjectWithPossiblyField {
  __FIELD__?: Field<any, any> & { __ID__: string }
}

export type ObjectWithPossiblyFieldRecursive = ObjectWithPossiblyField & {
  [x: string]: ObjectWithPossiblyFieldRecursive
}

export interface FormNode {
  type: 'form'
  form: Form<any>
  name?: string
}

export interface FieldNode {
  type: 'field'
  field: {
    formId: string
    field: Field<any, any>
  }
}
