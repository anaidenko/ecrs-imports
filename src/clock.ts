import { CronJob } from 'cron'
import * as config from './config'
import JaxDataImporter from './importers/JaxDataImporter'

let job: any = undefined

if (config.CronTimerInterval) {
  job = new CronJob({
    cronTime: config.CronTimerInterval,
    onTick: new JaxDataImporter().run,
    start: true,
    timeZone: config.Timezone
  })
}

export default job
