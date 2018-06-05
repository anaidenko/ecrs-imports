import axios from 'axios'

import * as config from './config'
import JaxDataReader from './readers/JaxDataReader'
import logger from './utils/logger'

async function run () {
  let store = { storeId: 284 }
  let items = await new JaxDataReader(store, config.FtpSettings).read()
  await submitItems(items)
}

async function submitItems (items) {
  if (config.Debug) {
    items.length = 1 // trim
    logger.debug('item', items)
  }
  let response = await axios.post(config.ApiImportUrl, items)
  logger.debug('response', response.data)
  logger.log(`import completed for ${items.length} items`)
}

run().catch(logger.error)
