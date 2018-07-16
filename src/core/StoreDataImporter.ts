import { inject, injectable } from 'inversify'
import * as _ from 'lodash'
import * as moment from 'moment'

import * as api from '../api'
import * as config from '../config'
import { logger } from '../utils/logger'
import { everyPromiseOneByOne } from '../utils/promise-extra'

import { AggregateError } from './AggregateError'
import { RedisClient } from './RedisClient'

@injectable()
export class StoreDataImporter {
  constructor(private api: api.Client, @inject(config.TYPES.RedisClient) private redis: RedisClient) {}

  async import(data: api.ImportPayload, stores: api.Store[]): Promise<number> {
    try {
      await this.api.login()

      const importTasks = stores.map(store => () => this.importStoreData(store, data))
      await everyPromiseOneByOne(importTasks)

      return data.items.length
    } catch (err) {
      if (err instanceof AggregateError && err.errors.length > 0) {
        _.each(err.errors, innerErr => {
          logger.error('Import Error', innerErr)
        })
      } else {
        logger.error('Import Error', err)
      }

      throw err
    }
  }

  async checkForUpdates(store: api.Store) {
    try {
      if (config.JaxCronCheckNoUpdatesDuration.valueOf() === 0) return

      const prefix = store.storeId + '.'
      let checkFailed = (await this.redis.getAsync(prefix + 'latestImport.checkForUpdatesFailed')) === 'true'
      if (checkFailed) return // already reported

      let latestImport = await this.getLatestImport(store)
      if (!latestImport) return // ok

      let timePassed = moment.duration(moment().diff(latestImport.timestamp))
      if (timePassed > config.JaxCronCheckNoUpdatesDuration) {
        await this.redis.setAsync(prefix + 'latestImport.checkForUpdatesFailed', true)
        throw new Error(
          `No updates from POS at store=${
            store.storeId
          } for the last ${config.JaxCronCheckNoUpdatesDuration.asHours()} hours`
        )
      }
    } catch (err) {
      logger.error('Check for Updates', err)
      throw err
    }
  }

  private async importStoreData(store: api.Store, data: api.ImportPayload) {
    let payload = this.preparePayload(store, data)
    let response = await this.submitUpdates(store, payload)
    await this.saveImport(data, String(store.storeId))
    return response
  }

  private async submitUpdates(store: api.Store, payload: api.ImportPayload): Promise<number> {
    let existingProducts = await this.api.fetchStoreProducts(store)
    this.mergeProductDetails(payload.items, existingProducts)
    let updated = await this.api.submitItems(payload)
    return updated
  }

  private mergeProductDetails(importProducts: api.ImportItem[], existingProducts: api.StoreProduct[]) {
    _.each(existingProducts, existing => {
      let importProduct = _.find(importProducts, {
        upc: existing.upc
      }) as api.ImportItem
      if (importProduct) {
        importProduct.status = existing.visibility // listed|unlisted|featured
      }
    })

    _.each(importProducts, importProduct => {
      importProduct.status = importProduct.status || 'listed' // by default

      if (config.UnlistOutOfStock) {
        let inventory = Number(importProduct.inventory)
        if (isNaN(inventory) || inventory <= 0) {
          importProduct.status = 'unlisted'
        }
      }
    })
  }

  private async saveImport(payload: api.ImportPayload, scope: string = '') {
    logger.debug('marking import as completed in redis db...')
    const prefix = scope ? '.' + scope : ''
    await this.redis.setAsync(prefix + 'latestImport.timestamp', moment.utc().format())
    await this.redis.setAsync(prefix + 'latestImport.filename', payload.metadata.fileName)
    await this.redis.setAsync(prefix + 'latestImport.checkForUpdatesFailed', false)
  }

  private async getLatestImport(store: api.Store) {
    const prefix = store.storeId + '.'
    let [filename, timestamp] = await Promise.all([
      this.redis.getAsync(prefix + 'latestImport.filename'),
      this.redis.getAsync(prefix + 'latestImport.timestamp')
    ])
    if (!timestamp) return undefined
    timestamp = moment(timestamp)
    return { filename, timestamp }
  }

  private preparePayload(store: api.Store, data: api.ImportPayload): api.ImportPayload {
    let payload = { ...store, ...data } as api.ImportPayload
    payload.items = _.cloneDeep(payload.items)
    return payload
  }
}
