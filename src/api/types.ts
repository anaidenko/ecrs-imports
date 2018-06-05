// <sellr-api>/modules/importer/types.ts

export interface ImportPayload {
  accountId: number
  storeId: number
  items: ImportItem[]
  source?: string
  metadata?: POSMetadata
  email?: string
  rules?: Rule[]
  saveRules?: boolean
  validateUpcs?: boolean
}

export type ImportItem =
    MPowerImportItem
  | PCAmericaImportItem
  | RiteImportItem
  | ECRSImportItem
  | FairwayImportItem
  | StandardImportItem

export type StandardImportItem = {
  name?: string
  description?: string
  inventory?: string
  type?: string
  size?: string
  price?: string | number
  salePrice?: string | number
  tag?: string,
  upc?: string | number
  status?: string
}

export type MPowerImportItem = {
  SkuNumber: number | string
  UPC: number
  Item: string
  Description: string
  Size: string
  Price?: number
  Retail?: number
  FIELD7?: string
  Type?: string
}

export type PCAmericaImportItem = {
  ItemNum: string
  ItemName: string
  Store_ID: string
  Cost: string
  Price: string
  Sale_Price: string
  In_Stock: string
  Description: string
  OnSale: string
  Tag: string
  isDeleted: string
  Inactive: string
  AltSKU: string
  FIELD14: string
  FIELD15: string
}

export type RiteImportItem = {
  type: string
  name: string
  description: string
  upc: number
  price: number
  size: string
}

export type ECRSImportItem = {
  'Item ID': number
  'Receipt Alias': string
  Store: string
  'On Hand': number | string
  'Avg Cost': string
  'Last Cost': string
  'Base Price': string
}

export type FairwayImportItem = {
  Type: string
  UPC: number
  Name: string
}

export interface ImportOptions {
  items: ImportItems
  config: ImportConfig
  rules: Rule[]
  metadata: POSMetadata
  results?: ImportResults
  ruleSummary?: any
  validateUpcs?: boolean
}

export interface ImportItems {
  productsToBeImported: any[]
  upcString: string
  notImported: any[]
  productsToBeDeleted: any[]
  newProducts?: number
  existingProducts?: number
  hasValidUpcs?: boolean
}

export interface ImportResults {
  message: string
  newProducts: number
  existingProducts: number
  notImported: {
    count: number
    products: any[]
  }
  summary?: any
}

export interface ImportConfig {
  accountId: number
  storeId: number
  source: string
  email?: string
  saveRules?: boolean
}

export interface Rule {
  name: string
  order: number
  enabled: boolean
}

export interface POSMetadata {
  posProvider?: string
  fileName?: string
  sync?: boolean
}

export interface SortedProducts {
  products: Product[]
  upcString: string
  notImported: any[]
  hasValidUpcs?: boolean
}

export interface Product {
  upc: string
  price?: number
}

export type Size = {
  sizeId?: number
  size: string
  variations: string
}

export type dbUpcs = {
  upcId: number
  productId: number
  upc: string
}

export type CompareResult = {
  matches: any[]
  noMatches: any[]
}
