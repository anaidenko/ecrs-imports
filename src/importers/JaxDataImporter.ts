import axios from 'axios'

import * as config from '../config'
import * as api from '../api/types'

import JaxDataReader from '../readers/JaxDataReader'
import logger from '../utils/logger'

export default class JaxDataImporter {
  async run (): Promise<number> {
    try {
      let store = { storeId: 284, accountId: 1042 }
      let payload = await new JaxDataReader(store, config.FtpSettings).read()
      if (!payload) return 0 // not found
      return await this.submitItems(payload)
    } catch (err) {
      logger.error('Jax Import', err)
      throw err
    }
  }

  async submitItems (payload: api.ImportPayload): Promise<number> {
    if (config.Debug) {
      payload.items.length = 1 // trim
      logger.debug('item', payload)
    }
    let response = await axios.post(config.ApiImportUrl, payload)
    logger.debug('response', response.data)
    logger.log(`import completed for ${payload.items.length} items`)
    return payload.items.length
  }
}
