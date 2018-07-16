import { injectable } from 'inversify'

import { container } from '../core/container'
import { StoreDataImporter } from '../core/StoreDataImporter'
import { IClientSettings, IDataReader } from '../interfaces'
import { logger } from '../utils/logger'
import { everyPromiseOneByOne } from '../utils/promise-extra'

import * as api from '.'

@injectable()
export class ClientImporter {
  private stores: api.Store[]
  private reader: IDataReader

  constructor(private client: IClientSettings, private importer: StoreDataImporter) {
    this.stores = client.stores.map(store => ({ accountId: client.account, storeId: store }))
    this.reader = container.get<IDataReader>(client.posType)
  }

  async import(): Promise<void> {
    try {
      logger.log(`Starting ${this.client.name} importer...`)

      let data = await this.reader.readData()
      if (!data || !data.items || data.items.length === 0) return // not found

      await this.importer.import(data, this.stores)

      logger.log(`Finished ${this.client.name} importer successfully`)
    } catch (err) {
      logger.log(`Finished ${this.client.name} importer with exception`)
      throw err
    }
  }

  async checkForUpdates(): Promise<void> {
    const checkEveryStore = this.stores.map(store => this.importer.checkForUpdates(store))
    await Promise.all(checkEveryStore)
  }
}

export function toImporter(client: IClientSettings) {
  return new ClientImporter(client, container.get(StoreDataImporter))
}

export async function importClients(clients: IClientSettings[]) {
  const importTasks = clients.map(toImporter).map(x => () => x.import())
  await everyPromiseOneByOne(importTasks)
}
