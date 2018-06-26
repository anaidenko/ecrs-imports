import axios, { AxiosInstance } from 'axios'

import * as api from './index'
import * as config from '../config'
import logger from '../core/logger'

export class Client {
  private api: AxiosInstance

  constructor () {
    this.api = axios.create({
      baseURL: config.ApiBaseUrl,
      timeout: 2 * 60 * 1000 // 2min
    })
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
    const storeInfo = `storeId=${payload.storeId}, accountId=${payload.accountId}`
    logger.log(`sending jax items over to import api... ${storeInfo}`)
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

  async fetchStoreProducts (store: api.Store): Promise<api.StoreProduct[]> {
    const storeInfo = `storeId=${store.storeId}, accountId=${store.accountId}`
    logger.log(`fetching jax items from store api... ${storeInfo}`)
    let url = config.ApiFetchUrl + '?id=' + store.storeId
    let response = await this.api.get<api.StoreProduct[]>(url)
    let products = response.data || []
    logger.debug(`Received ${products.length} products`)
    return products
  }

}
