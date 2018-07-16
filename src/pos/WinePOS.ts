import { injectable } from 'inversify'
import * as _ from 'lodash'
import * as path from 'path'

import * as api from '../api/types'
import { FileInfo as FtpFileInfo, FtpManager } from '../core/FtpManager'
import { logger } from '../utils/logger'
import { parseCsv } from '../utils/parsers'

import { IDataReader } from '../interfaces/IDataReader'

export const TYPE = Symbol('WinePOS')

@injectable()
export class WinePOS implements IDataReader {
  constructor(private ftpManager: FtpManager) {}

  async readData(): Promise<api.ImportPayload | undefined> {
    await this.ftpManager.connect()
    try {
      const file = await this.lookupCsvFile()
      if (!file) {
        logger.log('no txt files found on FTP')
        return undefined // not found
      }
      const items = await this.readItems(file.path)
      const payload: api.ImportPayload = {
        items: items,
        source: 'Wine POS Imports',
        metadata: {
          fileName: file.name
        }
      }
      return payload
    } finally {
      await this.ftpManager.disconnect()
    }
  }

  private async lookupCsvFile(): Promise<FtpFileInfo> {
    const dirpath = path.join(this.ftpManager.options.root || '/', '/winepos/caesars')

    const files = await this.ftpManager.list(dirpath, '*.txt')
    if (files.length === 0) throw new Error('files not found')

    const lastFile = _.maxBy(
      files,
      file => Number(file.name.substr(0, file.name.length - file.ext.length)) || file.date.getTime()
    ) as FtpFileInfo

    return lastFile
  }

  private async readItems(filePath: string): Promise<api.ImportItem[]> {
    const content = await this.ftpManager.getContent(filePath)
    const opts = {
      // columns: ['id', 'name', 'size', false, 'price', false, false, false, 'inventory', 'upc', 'type'],
      columns: [
        'id',
        'name',
        false,
        false,
        'size',
        false,
        'upc',
        'inventory',
        'price',
        false,
        false,
        false,
        false,
        false,
        'type'
      ],
      quote: false
    }
    const data = await parseCsv(content, opts)
    logger.debug('mapping winepos->sellr items...')
    const items = data.map(this.mapItem)
    return items
  }

  private mapItem(data: any): api.ImportItem {
    delete data.id
    delete data.undefined
    delete data.null
    return data as api.ImportItem
  }
}
