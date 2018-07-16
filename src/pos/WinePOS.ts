import { injectable } from 'inversify'
import * as _ from 'lodash'
import * as path from 'path'

import * as api from '../api/types'
import { FileInfo as FtpFileInfo, FtpManager } from '../core/FtpManager'
import { logger } from '../utils/logger'
import { parseXml } from '../utils/parsers'

import { IDataReader } from '../interfaces/IDataReader'

export const TYPE = Symbol('WinePOS')

@injectable()
export class WinePOS implements IDataReader {
  constructor(private ftpManager: FtpManager) {}

  async readData(): Promise<api.ImportPayload | undefined> {
    await this.ftpManager.connect()
    try {
      let txtFile = await this.lookupTxtFile()
      if (!txtFile) {
        logger.log('no txt files found on FTP')
        return undefined // not found
      }
      let items = await this.readItems(txtFile.path)
      let payload: api.ImportPayload = {
        items: items,
        source: 'Wine POS Imports',
        metadata: {
          fileName: txtFile.name
        }
      }
      return payload
    } finally {
      await this.ftpManager.disconnect()
    }
  }

  private async lookupTxtFile(): Promise<FtpFileInfo> {
    let dirpath = path.join(this.ftpManager.options.root || '/', '/winepos/caesars')

    let txtFiles = await this.ftpManager.list(dirpath, '*.txt')
    if (txtFiles.length === 0) throw new Error('files not found')

    let lastTxtFile = _.maxBy(
      txtFiles,
      file => Number(file.name.substr(0, file.name.length - file.ext.length)) || file.date.getTime()
    ) as FtpFileInfo
    return lastTxtFile
  }

  private async readItems(txtFilePath: string): Promise<api.ImportItem[]> {
    let content = await this.ftpManager.getContent(txtFilePath)
    let data = await parseXml(content)
    logger.debug('mapping jax->sellr items...')
    let items = data.Items.Item.map(data => this.mapItem(data))
    return items
  }

  private mapItem(data: any): api.ImportItem {
    let price: string = data.Pricing[0].Price[0].$.price

    let item: api.ImportItem = {
      upc: data.$.scancode,
      name: (data.Name || [])[0],
      inventory: (data.OnHand || [])[0],
      size: (data.Size || [])[0],
      type: data.Department ? data.Department[0].$.name : '',
      price: price
    }

    return item
  }
}
