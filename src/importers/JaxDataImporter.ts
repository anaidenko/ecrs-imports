import axios, { AxiosInstance } from 'axios'
import * as moment from 'moment'

import * as config from '../config'
import * as api from '../api/types'

import JaxDataReader from '../readers/JaxDataReader'
import logger from '../utils/logger'
import { RedisClient, createRedisClient } from '../utils/redis'

export default class JaxDataImporter {
  private api: AxiosInstance
  private redis: RedisClient

  constructor () {
    this.api = axios.create({
      baseURL: config.ApiBaseUrl
    })
    this.redis = createRedisClient()
  }

  async run (): Promise<number> {
    try {
      logger.log('Starting jax importer...')
      let store = config.JaxStore
      let payload = await new JaxDataReader(store, config.FtpSettings).read()
      if (!payload) return 0 // not found
      await this.login()
      let result = await this.submitItems(payload)
      await this.saveImport(store, payload)
      logger.log('Finished jax importer')
      return result
    } catch (err) {
      logger.error('Jax Import', err)
      logger.log('Finished jax importer with exception')
      throw err
    } finally {
      this.redis.quit()
    }
  }

  async login () {
    let payload = config.ApiCredentials
    logger.log('logging into sellr api...')
    let response = await this.api.post(config.ApiAuthUrl, payload)
    let token = response.data
    logger.debug('auth token received', token)
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    return response.data
  }

  async submitItems (payload: api.ImportPayload): Promise<number> {
    logger.log('sending jax items over to import api...')
    if (config.DebugSingleItem) {
      payload.items.length = 1 // trim
      logger.debug('item', payload)
    }
    let response = await this.api.post(config.ApiImportUrl, payload)
    logger.debug('import api response', response.data.summary)
    logger.log(`done, imported ${payload.items.length} items`)
    return payload.items.length
  }

  async saveImport (store, payload: api.ImportPayload) {
    logger.debug('saving import in redis db...')
    await this.redis.setAsync('latestImport.timestamp', moment.utc().format())
    await this.redis.setAsync('latestImport.filename', payload.metadata.fileName)
    await this.redis.setAsync('latestImport.checkForUpdatesFailed', false)
  }

  async checkForUpdates () {
    try {
      let checkFailed = await this.redis.getAsync('latestImport.checkForUpdatesFailed') === 'true'
      if (checkFailed) return // already reported

      let latestImport = await this.getLatestImport()
      if (!latestImport) return // ok

      let timePassed = moment.duration(moment().diff(latestImport.timestamp))
      if (timePassed > config.CronCheckNoUpdatesDuration) {
        await this.redis.setAsync('latestImport.checkForUpdatesFailed', true)
        throw new Error('No updates from ECRS for the last ' + config.CronCheckNoUpdatesDuration)
      }
    } finally {
      this.redis.quit()
    }
  }

  async getLatestImport () {
    let [filename, timestamp] = await Promise.all([
      this.redis.getAsync('latestImport.filename'),
      this.redis.getAsync('latestImport.timestamp')
    ])
    if (!timestamp) return undefined
    timestamp = moment(timestamp)
    return { filename, timestamp }
  }
}
