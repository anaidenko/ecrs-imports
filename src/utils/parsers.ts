import * as csvParse from 'csv-parse'
import * as xml2js from 'xml2js'

import { logger } from './logger'

export async function parseXml(content: string): Promise<any> {
  return new Promise((resolve: (result: any) => void, reject: (err: Error) => void) => {
    logger.debug('parsing xml...')
    xml2js.parseString(content, (err: Error, result: any) => {
      if (err) return reject(err)
      else resolve(result)
    })
  })
}

export async function parseCsv(content: string, opts?: any): Promise<any> {
  return new Promise((resolve: (result: any) => void, reject: (err: Error) => void) => {
    // see http://csv.adaltas.com/parse/
    const defaults = { columns: true, delimiter: '\t', relax_column_count: true, skip_empty_lines: true }
    const options = Object.assign({}, defaults, opts)
    csvParse(content, options, (err: Error, result: any) => {
      if (err) return reject(err)
      else resolve(result)
    })
  })
}
