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
    return this.retry.operation(() => super.login())
  }

  async submitItems(payload: api.ImportPayload): Promise<number> {
    return this.retry.operation(() => super.submitItems(payload))
  }

  async fetchStoreProducts(store: api.Store): Promise<api.StoreProduct[]> {
    return this.retry.operation(() => super.fetchStoreProducts(store))
  }
}
