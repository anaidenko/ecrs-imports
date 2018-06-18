import axios, { AxiosInstance } from 'axios'
import * as moment from 'moment'

import * as config from '../config'
import * as api from '../api/types'

import JaxDataReader from '../readers/JaxDataReader'
import logger from '../utils/logger'
import { RedisClient, createRedisClient } from '../utils/redis'
import RetryPolicy from '../utils/RetryPolicy'

export default class JaxDataImporter {
  private api: AxiosInstance
  private retry: RetryPolicy
  private redis: RedisClient

  constructor () {
    this.api = axios.create({
      baseURL: config.ApiBaseUrl,
      timeout: 2 * 60 * 1000 // 2min
    })
    this.retry = new RetryPolicy(3) // times
    this.redis = createRedisClient()
  }

  async import (): Promise<number> {
    try {
      logger.log('Starting jax importer...')

      let account = { accountId: 1042 }
      let storeCumming = { ...account, storeId: 284 }
      let storeBraselton = { ...account, storeId: 656 }

      let payload = await this.retry.start(() => new JaxDataReader(config.FtpSettings).read(), 'download xml file') as api.ImportPayload
      if (!payload) return 0 // not found

      await this.login()

      // run imports in parallel
      logger.debug('starting imports...')
      // let storeCummingImport = this.retry.start(() => Promise.reject('fake error for cumming store'), 'submit to JAX Cumming store')
      // let storeBraseltonImport = this.retry.start(() => Promise.reject('fake error for braselton store'), 'submit to JAX Braselton store')
      let storeCummingImport = this.retry.start(() => this.submitItems(storeCumming, payload), 'submit to JAX Cumming store')
      let storeBraseltonImport = this.retry.start(() => this.submitItems(storeBraselton, payload), 'submit to JAX Braselton store')
      await Promise.all([storeCummingImport, storeBraseltonImport])

      await this.saveImport(payload)

      logger.log('Finished jax importer successfully')
      return payload.items.length
    } catch (err) {
      logger.error('Jax Import', err)
      logger.log('Finished jax importer with exception')
      throw err
    } finally {
      this.redis.quit()
    }
  }

  async checkForUpdates () {
    try {
      if (config.CronCheckNoUpdatesDuration.valueOf() === 0) return

      let checkFailed = await this.redis.getAsync('latestImport.checkForUpdatesFailed') === 'true'
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

  private async login () {
    let payload = config.ApiCredentials
    logger.log('logging into sellr api...')
    let response = await this.api.post(config.ApiAuthUrl, payload)
    let token = response.data
    logger.debug('auth token received', token)
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    return response.data
  }

  private async submitItems (store: any, payload: api.ImportPayload): Promise<number> {
    const storeInfo = `storeId=${store.storeId}, accountId=${store.accountId}`
    logger.log(`sending jax items over to import api... ${storeInfo}`)
    payload = { ...store, ...payload } as api.ImportPayload // clone object and populate with store details
    if (config.DebugSingleItem) {
      payload.items.length = 1 // trim
      logger.debug('item', payload)
    }
    let response = await this.api.post(config.ApiImportUrl, payload).catch(err => {
      err.message = 'Sellr API: ' + err.message
      throw err
    })
    logger.debug(`import api response for ${storeInfo}`, response.data.summary)
    logger.log(`done, imported ${payload.items.length} items to ${storeInfo}`)
    return payload.items.length
  }

  private async saveImport (payload: api.ImportPayload) {
    logger.debug('marking import as completed in redis db...')
    await this.redis.setAsync('latestImport.timestamp', moment.utc().format())
    await this.redis.setAsync('latestImport.filename', payload.metadata.fileName)
    await this.redis.setAsync('latestImport.checkForUpdatesFailed', false)
  }

  private async getLatestImport () {
    let [filename, timestamp] = await Promise.all([
      this.redis.getAsync('latestImport.filename'),
      this.redis.getAsync('latestImport.timestamp')
    ])
    if (!timestamp) return undefined
    timestamp = moment(timestamp)
    return { filename, timestamp }
  }
}
