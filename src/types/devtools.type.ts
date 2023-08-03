export type NodeTypes = 'form' | 'field'

export interface SelectedNodeForm {
  type: 'form'
  formId: string
}

export interface SelectedNodeField {
  type: 'field'
  formId: string
  fieldId: string
}

export interface EncodedNode {
  type: NodeTypes
  id: string
}

export type SelectedNode = SelectedNodeForm | SelectedNodeField
