import { CronJob } from 'cron'

import { toImporter } from './api/clientImporter'
import { Caesars, Jax } from './clients'
import * as config from './config'
import { logger } from './utils/logger'

let jaxImportJob: CronJob | undefined
let jaxCheckJob: CronJob | undefined
let caesarsImportJob: CronJob | undefined
let caesarsCheckJob: CronJob | undefined

const JaxImporter = toImporter(Jax)
const CaesarsImporter = toImporter(Caesars)

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

if (config.CaesarsCronImportInterval) {
  logger.log(`Starting caesars import timer via cron: ${config.CaesarsCronImportInterval}`)

  caesarsImportJob = new CronJob({
    cronTime: config.CaesarsCronImportInterval,
    onTick: async () => {
      logger.log(`Starting scheduled caesars importer on timer... ${config.CaesarsCronImportInterval}`)
      await CaesarsImporter.import().catch(() => 0)
    },
    start: true,
    timeZone: config.Timezone
  })
}

if (config.CaesarsCronCheckInterval) {
  logger.log(`Starting timer to check for updates from caesars via cron: ${config.CaesarsCronCheckInterval}`)

  caesarsCheckJob = new CronJob({
    cronTime: config.CaesarsCronCheckInterval,
    onTick: async () => {
      logger.log('Checking for updates from caesars...')
      await CaesarsImporter.checkForUpdates().catch(() => 0)
    },
    start: true,
    timeZone: config.Timezone
  })
}

export { jaxImportJob, jaxCheckJob, caesarsImportJob, caesarsCheckJob }
