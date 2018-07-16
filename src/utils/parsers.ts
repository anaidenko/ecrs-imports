import xml2js = require('xml2js')

import { logger } from './logger'

export async function parseXml(content: string): Promise<any> {
  return new Promise((resolve: (result: string) => void, reject: (err: Error) => void) => {
    logger.debug('parsing xml...')
    xml2js.parseString(content, (err: Error, result: any) => {
      if (err) return reject(err)
      else resolve(result)
    })
  })
}
