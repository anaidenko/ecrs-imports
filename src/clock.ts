import { CronJob } from 'cron'
import * as config from './config'
import logger from './utils/logger'
import JaxDataImporter from './importers/JaxDataImporter'

let job: any = undefined

if (config.CronTimerInterval) {
  logger.log(`Starting timer via cron: ${config.CronTimerInterval}`)
  job = new CronJob({
    cronTime: config.CronTimerInterval,
    onTick: () => {
      logger.log(`Starting scheduled jax importer on timer... ${config.CronTimerInterval}`)
      return new JaxDataImporter().run()
    },
    start: true,
    timeZone: config.Timezone
  })
}

export default job
