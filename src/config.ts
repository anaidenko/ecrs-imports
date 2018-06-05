import * as dotenv from 'dotenv'
import { FtpOptions } from './utils/FtpManager'

dotenv.config()

export const Env: string = process.env['NODE_ENV'] || 'development'
export const Debug: boolean = process.env['DEBUG'] === 'true'
export const FtpRoot: string = process.env['FTP_ROOT'] || '/'
export const ApiImportUrl: string = process.env['API_IMPORT_URL'] || 'http://api.sllr.io/api/import'

export const FtpSettings: FtpOptions = {
  host: process.env['FTP_HOST'],
  user: process.env['FTP_USER'],
  password: process.env['FTP_PASS'],
  root: FtpRoot
}
