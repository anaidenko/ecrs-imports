import fs = require('fs-extra')
import * as winston from 'winston'

import * as config from '../config'

fs.ensureDirSync('./logs')

const mb = 1024 * 1024
const wlogger = new winston.Logger({
  level: config.Env === 'development' || config.Debug ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({ colorize: 'level', prettyPrint: jsonObjects, handleExceptions: true }),
    new winston.transports.File({
      filename: './logs/errors.log',
      level: 'error',
      name: 'file.errors',
      json: false,
      maxsize: 50 * mb
    }),
    new winston.transports.File({
      filename: './logs/all.log',
      level: 'verbose',
      name: 'file.all',
      json: false,
      maxsize: 50 * mb
    })
  ],
  exitOnError: false
})

function jsonObjects(obj: any): string {
  let json = JSON.stringify(obj)
  if (json.length > 200) json = JSON.stringify(obj, null, 2) // prettify
  return json
}

class Logger {
  log(message: any, ...params: any[]) {
    wlogger.log('info', message, ...params)
  }

  warn(message: any, ...params: any[]) {
    wlogger.log('warn', message, ...params)
  }

  error(message: any, ...params: any[]) {
    wlogger.log('error', message, ...params)
  }

  debug(message: any, ...params: any[]) {
    wlogger.log('debug', message, ...params)
  }
}

export const logger = new Logger()
