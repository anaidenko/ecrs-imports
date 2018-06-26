import { CronJob } from 'cron'
import * as config from './config'
import logger from './core/logger'
import JaxDataImporter from './importers/JaxDataImporter'

let importJob: CronJob | undefined
let checkJob: CronJob | undefined

if (config.CronImportInterval) {
  logger.log(`Starting import timer via cron: ${config.CronImportInterval}`)

  importJob = new CronJob({
    cronTime: config.CronImportInterval,
    onTick: async () => {
      logger.log(`Starting scheduled jax importer on timer... ${config.CronImportInterval}`)
      return new JaxDataImporter().import().catch(() => 0)
    },
    start: true,
    timeZone: config.Timezone
  })
}

if (config.CronCheckInterval) {
  logger.log(`Starting check for updates timer via cron: ${config.CronCheckInterval}`)

  checkJob = new CronJob({
    cronTime: config.CronCheckInterval,
    onTick: async () => {
      logger.log('Checking for updates...')
      await new JaxDataImporter().checkForUpdates().catch(() => 0)
    },
    start: true,
    timeZone: config.Timezone
  })
}

export default { importJob, checkJob }
