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
