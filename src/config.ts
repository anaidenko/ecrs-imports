import * as dotenv from 'dotenv'
import * as moment from 'moment'
import { ClientOpts as RedisOptions } from 'redis'

import { FtpOptions } from './core/FtpManager'

dotenv.config()

export const Env: string = process.env['NODE_ENV'] || 'development'
export const Port: number = Number(process.env['PORT']) || 3000
export const Timezone: string = process.env['TZ'] || 'America/New_York'
export const Debug: boolean = process.env['DEBUG'] === 'true'
export const DebugSingleItem: boolean = process.env['DEBUG_SINGLE_ITEM'] === 'true'
export const DebugRedis: boolean = process.env['DEBUG_REDIS'] === 'true'

export const CronImportInterval: string = process.env['CRON_IMPORT_INTERVAL'] || ''
export const CronCheckInterval: string = process.env['CRON_CHECK_INTERVAL'] || ''
export const CronCheckNoUpdatesDuration: moment.Duration = moment.duration(process.env['CRON_CHECK_NO_UPDATES_FOR'] || '24:00')

export const ApiBaseUrl: string = process.env['API_SELLR_BASE'] || 'http://apidev.sllr.io'
export const ApiAuthUrl: string = process.env['API_AUTH_URL'] || '/session'
export const ApiImportUrl: string = process.env['API_IMPORT_URL'] || '/api/import'
export const ApiFetchUrl: string = process.env['API_FETCH_URL'] || '/storedb/stores/products'

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

export const RedisSettings: RedisOptions = {
  url: process.env['REDIS_URL'] || 'redis://127.0.0.1'
}
