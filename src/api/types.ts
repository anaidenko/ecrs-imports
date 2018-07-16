export interface ImportPayload {
  accountId?: number
  storeId?: number
  items: ImportItem[]
  source: string
  metadata: {
    fileName: string
  }
}

export type ImportItem = {
  upc: string
  name: string
  description?: string
  inventory: string
  type: string
  price: string
  size?: string
  salePrice?: string
  status?: string
}

export interface Store {
  accountId?: number
  storeId?: number
}

export interface SearchResponse {
  hits: StoreProduct[]
}

export interface StoreProduct {
  upc: string
  name: string
  productId: number
  visibility: string
}
