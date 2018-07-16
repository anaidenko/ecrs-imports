import { injectable } from 'inversify'

import { RetryPolicy } from '../core/RetryPolicy'

import { Client } from './client'
import * as api from './types'

@injectable()
export class ClientFaultTolerant extends Client {
  constructor(private retry: RetryPolicy) {
    super()
  }

  async login() {
    return this.retry.operation(() => super.login(), 'api.login')
  }

  async submitItems(payload: api.ImportPayload): Promise<number> {
    return this.retry.operation(() => super.submitItems(payload), 'api.submitItems')
  }

  async fetchStoreProducts(store: api.Store): Promise<api.StoreProduct[]> {
    return this.retry.operation(() => super.fetchStoreProducts(store), 'api.fetchStoreProducts')
  }
}
