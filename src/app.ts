import axios from 'axios'

import * as config from './config'
import * as api from './api/types'

import JaxDataReader from './readers/JaxDataReader'
import logger from './utils/logger'

async function run () {
  let store = { storeId: 284, accountId: 1042 }
  let payload = await new JaxDataReader(store, config.FtpSettings).read()
  if (payload) await submitItems(payload)
}

async function submitItems (payload: api.ImportPayload) {
  if (config.Debug) {
    payload.items.length = 1 // trim
    logger.debug('item', payload)
  }
  let response = await axios.post(config.ApiImportUrl, payload)
  logger.debug('response', response.data)
  logger.log(`import completed for ${payload.items.length} items`)
}

run().catch(logger.error)
