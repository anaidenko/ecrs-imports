export interface ImportPayload {
  accountId: number
  storeId: number
  items: ECRSImportItem[]
}

export type ECRSImportItem = {
  upc: string,
  name: string,
  description?: string,
  inventory: string,
  type: string,
  price: string,
  size?: string,
  salePrice?: string,
  status?: string
}
