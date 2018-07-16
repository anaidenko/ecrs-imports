import { CronJob } from 'cron'

import { toImporter } from './api/clientImporter'
import { Jax } from './clients'
import * as config from './config'
import { logger } from './utils/logger'

let jaxImportJob: CronJob | undefined
let jaxCheckJob: CronJob | undefined

const JaxImporter = toImporter(Jax)

if (config.JaxCronImportInterval) {
  logger.log(`Starting jax import timer via cron: ${config.JaxCronImportInterval}`)

  jaxImportJob = new CronJob({
    cronTime: config.JaxCronImportInterval,
    onTick: async () => {
      logger.log(`Starting scheduled jax importer on timer... ${config.JaxCronImportInterval}`)
      await JaxImporter.import().catch(() => 0)
    },
    start: true,
    timeZone: config.Timezone
  })
}

if (config.JaxCronCheckInterval) {
  logger.log(`Starting timer to check for updates from jax via cron: ${config.JaxCronCheckInterval}`)

  jaxCheckJob = new CronJob({
    cronTime: config.JaxCronCheckInterval,
    onTick: async () => {
      logger.log('Checking for updates from jax...')
      await JaxImporter.checkForUpdates().catch(() => 0)
    },
    start: true,
    timeZone: config.Timezone
  })
}

export { jaxImportJob, jaxCheckJob }
