// InsomniaNode interface
export interface InsomniaNode {
  _type: 'request' | 'request_group' | 'workspace'
  _id: string
  parentId: string
  modified: number
  created: number
  name: string
  description?: string
  environment: object
  environmentPropertyOrder?: string
  metaSortKey: number
  url?: string
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Header[]
  parameters?: Parameter[]
  authentication?: object
  body?: {
    mimeType?: string
    text?: string
  }
}

// Header interface
export interface Header {
  name: string
  value: string
  description?: string
}

// Parameter interface
export interface Parameter {
  name: string
  value: string
  description?: string
  disabled: boolean
}
