import * as path from 'path'
import * as _ from 'lodash'

import * as api from '../api/types'
import logger from '../utils/logger'
import { FtpManager, FtpOptions, FileInfo as FtpFileInfo } from '../utils/FtpManager'
import { parseXml } from '../utils/parsers'

export default class JaxDataReader {
  private ftpManager: FtpManager

  constructor (
    private store: { storeId: number, accountId: number },
    private ftpOptions: FtpOptions) {
    this.ftpManager = new FtpManager(ftpOptions)
  }

  async read (): Promise<api.ImportPayload | undefined> {
    await this.ftpManager.connect()
    try {
      let xmlFile = await this.lookupXmlFile()
      if (!xmlFile) {
        logger.log('no xml files found on FTP')
        return undefined // not found
      }
      let items = await this.readItems(xmlFile.path)
      let payload: api.ImportPayload = {
        ...this.store,
        items: items,
        source: 'ECRS Imports',
        metadata: {
          fileName: xmlFile.name
        }
      } as api.ImportPayload
      return payload
    } finally {
      await this.ftpManager.disconnect()
    }
  }

  private async lookupXmlFile (): Promise<FtpFileInfo> {
    let dirpath = path.join(this.ftpOptions.root || '/', '/items')

    let xmlFiles = await this.ftpManager.list(dirpath, '*.xml')
    if (xmlFiles.length === 0) throw new Error('files not found')

    let lastXmlFile = _.maxBy(xmlFiles, file => Number(file.name.substr(0, file.name.length - file.ext.length)) || file.date.getTime()) as FtpFileInfo
    return lastXmlFile
  }

  private async readItems (xmlFilePath: string): Promise<api.ECRSImportItem[]> {
    let content = await this.ftpManager.getContent(xmlFilePath)
    let data = await parseXml(content)
    logger.debug('mapping jax->sellr items...')
    let items = data.Items.Item.map(data => this.mapItem(data))
    return items
  }

  private mapItem (data: any): api.ECRSImportItem {
    let price: string = data.Pricing[0].Price[0].$.price
    let item: api.ECRSImportItem = {
      'Item ID': data.$.scancode,
      'Receipt Alias': (data.ReceiptAlias || [])[0],
      'Store': this.store.storeId.toString(), // Jax - Cumming, GA
      'On Hand': (data.OnHand || [])[0],
      'Base Price': '$' + price,
      'Avg Cost': '', // missing
      'Last Cost': '' // missing
    }
    return item
  }
}
