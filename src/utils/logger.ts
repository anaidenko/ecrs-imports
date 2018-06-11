import * as winston from 'winston'
import * as config from '../config'

const logger = new winston.Logger({
  level: config.Env === 'development' || config.Debug ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({ colorize: 'level', prettyPrint: jsonObjects, handleExceptions: true }),
    new winston.transports.File({ filename: './logs/errors.log', level: 'error', name: 'file.errors', json: false }),
    new winston.transports.File({ filename: './logs/all.log', level: 'verbose', name: 'file.all', json: false })
  ],
  exitOnError: false
})

function jsonObjects (obj: any): string {
  let json = JSON.stringify(obj)
  if (json.length > 200) json = JSON.stringify(obj, null, 2) // prettify
  return json
}

class Logger {
  log (message: any, ...params: any[]) {
    logger.log('info', message, ...params)
  }

  error (message: any, ...params: any[]) {
    logger.log('error', message, ...params)
  }

  debug (message: any, ...params: any[]) {
    logger.log('debug', message, ...params)
  }
}

export default new Logger()
