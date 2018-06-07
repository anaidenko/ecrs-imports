import * as dotenv from 'dotenv'
import { FtpOptions } from './utils/FtpManager'

dotenv.config()

export const Env: string = process.env['NODE_ENV'] || 'development'
export const Timezone: string = process.env['TZ'] || 'America/New_York'
export const Debug: boolean = process.env['DEBUG'] === 'true'
export const DebugSingleItem: boolean = process.env['DEBUG_SINGLE_ITEM'] === 'true'
export const CronTimerInterval: string = process.env['CRON_TIMER_INTERVAL'] || ''

export const ApiBaseUrl: string = process.env['API_SELLR_BASE'] || 'http://apidev.sllr.io'
export const ApiAuthUrl: string = process.env['API_AUTH_URL'] || '/session'
export const ApiImportUrl: string = process.env['API_IMPORT_URL'] || '/api/import'

export const ApiCredentials = {
  email: process.env['API_EMAIL'],
  password: process.env['API_PASSWORD']
}

export const FtpSettings: FtpOptions = {
  host: process.env['FTP_HOST'],
  user: process.env['FTP_USER'],
  password: process.env['FTP_PASS'],
  root: process.env['FTP_ROOT'] || '/',
  compress: process.env['FTP_COMPRESS'] === 'true'
}
