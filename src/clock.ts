import { CronJob } from 'cron'
import * as config from './config'
import JaxDataImporter from './importers/JaxDataImporter'

export default new CronJob({
  cronTime: config.CronTimerInterval,
  onTick: new JaxDataImporter().run,
  start: true,
  timeZone: config.Timezone
})
