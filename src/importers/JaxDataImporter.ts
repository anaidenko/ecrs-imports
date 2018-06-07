import axios, { AxiosInstance } from 'axios'

import * as config from '../config'
import * as api from '../api/types'

import JaxDataReader from '../readers/JaxDataReader'
import logger from '../utils/logger'

export default class JaxDataImporter {
  private api: AxiosInstance

  constructor () {
    this.api = axios.create({
      baseURL: config.ApiBaseUrl
    })
  }

  async run (): Promise<number> {
    try {
      logger.log('Starting jax importer...')
      let store = { storeId: 284, accountId: 1042 }
      let payload = await new JaxDataReader(store, config.FtpSettings).read()
      if (!payload) return 0 // not found
      await this.login()
      let result = await this.submitItems(payload)
      logger.log('Finished jax importer')
      return result
    } catch (err) {
      logger.error('Jax Import', err)
      logger.log('Finished jax importer with exception')
      throw err
    }
  }

  async login () {
    let payload = { payload: config.ApiCredentials }
    logger.log('logging into sellr api...')
    let response = await this.api.post(config.ApiAuthUrl, payload)
    logger.debug('auth api response', response.data)
    let token = response.data.token
    logger.debug('auth token received', token.token)
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token.token}`
    return response.data
  }

  async submitItems (payload: api.ImportPayload): Promise<number> {
    logger.log('sending jax items over to import api...')
    if (config.Debug) {
      payload.items.length = 1 // trim
      logger.debug('item', payload)
    }
    let response = await this.api.post(config.ApiImportUrl, payload)
    logger.debug('import api response', response.data)
    logger.log(`done, imported ${payload.items.length} items`)
    return payload.items.length
  }
}
