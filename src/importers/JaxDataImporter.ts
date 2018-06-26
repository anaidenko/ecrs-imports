import * as moment from 'moment'
import * as _ from 'lodash'

import * as config from '../config'
import * as api from '../api'

import JaxDataReader from '../readers/JaxDataReader'
import logger from '../core/logger'
import { RedisClient, createRedisClient } from '../core/redis'
import RetryPolicy from '../core/RetryPolicy'
import AggregateError from '../core/AggregateError'
import { everyPromiseOneByOne } from '../core/promise-extra'

export default class JaxDataImporter {
  private api: api.Client
  private retry: RetryPolicy
  private redis: RedisClient

  constructor() {
    this.api = new api.Client()
    this.retry = new RetryPolicy(3) // times
    this.redis = createRedisClient()
  }

  async import(): Promise<number> {
    try {
      logger.log('Starting jax importer...')

      let account = { accountId: 1042 }
      let storeCumming: api.Store = { ...account, storeId: 284 }
      let storeBraselton: api.Store = { ...account, storeId: 656 }

      let data = await this.retry.operation(() => new JaxDataReader(config.FtpSettings).read(), 'download xml file')
      if (!data || !data.items || data.items.length === 0) return 0 // not found

      await this.api.login()

      // run imports in parallel
      logger.debug(`starting imports to ${config.ApiBaseUrl}...`)
      let storeCummingPayload = this.preparePayload(storeCumming, data)
      let storeBraseltonPayload = this.preparePayload(storeBraselton, data)

      // await everyPromiseInParallel([
      //   this.retry.operation(() => Promise.reject('fake error for cumming store'), 'submit to JAX Cumming store'),
      //   this.retry.operation(() => Promise.reject('fake error for braselton store'), 'submit to JAX Braselton store')
      // ])

      // await everyPromiseInParallel([
      //   this.submitUpdates(storeCumming, storeCummingPayload),
      //   this.submitUpdates(storeBraselton, storeBraseltonPayload)
      // ])

      await everyPromiseOneByOne([
        () => this.submitUpdates(storeCumming, storeCummingPayload),
        () => this.submitUpdates(storeBraselton, storeBraseltonPayload)
      ])

      await this.saveImport(data)

      logger.log('Finished jax importer successfully')
      return data.items.length
    } catch (err) {
      if (err instanceof AggregateError && err.errors.length > 0) {
        _.each(err.errors, innerErr => {
          logger.error('Jax Import', innerErr)
        })
      } else {
        logger.error('Jax Import', err)
      }

      logger.log('Finished jax importer with exception')
      throw err
    } finally {
      this.redis.quit()
    }
  }

  async submitUpdates(store: api.Store, payload: api.ImportPayload): Promise<number> {
    let existingProducts = await this.retry.operation(() => this.api.fetchStoreProducts(store), 'fetch store products')
    this.mergeProductDetails(payload.items, existingProducts)
    let updated = await this.retry.operation(() => this.api.submitItems(payload), 'submit ECRS items to sellr api')
    return updated
  }

  async checkForUpdates() {
    try {
      if (config.CronCheckNoUpdatesDuration.valueOf() === 0) return

      let checkFailed = (await this.redis.getAsync('latestImport.checkForUpdatesFailed')) === 'true'
      if (checkFailed) return // already reported

      let latestImport = await this.getLatestImport()
      if (!latestImport) return // ok

      let timePassed = moment.duration(moment().diff(latestImport.timestamp))
      if (timePassed > config.CronCheckNoUpdatesDuration) {
        await this.redis.setAsync('latestImport.checkForUpdatesFailed', true)
        throw new Error(`No updates from ECRS for the last ${config.CronCheckNoUpdatesDuration.asHours()} hours`)
      }
    } catch (err) {
      logger.error('Jax Check for Updates', err)
      throw err
    } finally {
      this.redis.quit()
    }
  }

  private mergeProductDetails(importProducts: api.ImportItem[], existingProducts: api.StoreProduct[]) {
    _.each(existingProducts, existing => {
      let importProduct = _.find(importProducts, { upc: existing.upc }) as api.ECRSImportItem
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

  private async saveImport(payload: api.ImportPayload) {
    logger.debug('marking import as completed in redis db...')
    await this.redis.setAsync('latestImport.timestamp', moment.utc().format())
    await this.redis.setAsync('latestImport.filename', payload.metadata.fileName)
    await this.redis.setAsync('latestImport.checkForUpdatesFailed', false)
  }

  private async getLatestImport() {
    let [filename, timestamp] = await Promise.all([
      this.redis.getAsync('latestImport.filename'),
      this.redis.getAsync('latestImport.timestamp')
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
