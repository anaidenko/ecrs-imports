import axios from 'axios'

import * as config from '../config'
import * as api from '../api/types'

import JaxDataReader from '../readers/JaxDataReader'
import logger from '../utils/logger'

export default class JaxDataImporter {
  async run (): Promise<void> {
    try {
      let store = { storeId: 284, accountId: 1042 }
      let payload = await new JaxDataReader(store, config.FtpSettings).read()
      if (!payload) return // not found
      await this.submitItems(payload)
    } catch (err) {
      logger.error('Jax Import', err)
    }
  }

  async submitItems (payload: api.ImportPayload): Promise<void> {
    if (config.Debug) {
      payload.items.length = 1 // trim
      logger.debug('item', payload)
    }
    let response = await axios.post(config.ApiImportUrl, payload)
    logger.debug('response', response.data)
    logger.log(`import completed for ${payload.items.length} items`)
  }
}
