import * as path from 'path'
import * as _ from 'lodash'

import { ECRSImportItem } from '../api'
import { DataReader } from './DataReader'
import { FtpManager, FtpOptions } from '../utils/FtpManager'
import { parseXml } from '../utils/parsers'

export default class JaxDataReader implements DataReader<ECRSImportItem> {
  private ftpManager = new FtpManager()

  constructor (
    private store: { storeId: number },
    private ftpOptions: FtpOptions) {
  }

  async read (): Promise<ECRSImportItem[]> {
    await this.ftpManager.connect(this.ftpOptions)
    try {
      let items = await this.readItems()
      return items
    } finally {
      await this.ftpManager.disconnect()
    }
  }

  mapItem (data: any): ECRSImportItem {
    let price: string = data.Pricing[0].Price[0].$.price
    let item: ECRSImportItem = {
      'Item ID': data.$.scancode,
      'Receipt Alias': (data.ReceiptAlias || [])[0],
      'Store': this.store.storeId.toString(), // Jax - Cumming, GA
      'On Hand': (data.OnHand || [])[0],
      'Base Price': '$' + price
    }
    return item
  }

  private async readItems (): Promise<ECRSImportItem[]> {
    let dirpath = path.join(this.ftpOptions.root || '/', '/items')

    let xmlFiles = await this.ftpManager.list(dirpath, '*.xml')
    if (xmlFiles.length === 0) throw new Error('files not found')

    let lastXmlFile = _.maxBy(xmlFiles, file => Number(file.name.split('.')[0]) || file.name)
    let lastXmlFilename: string = lastXmlFile ? lastXmlFile.name : ''

    let content = await this.ftpManager.getContent(path.join(dirpath, lastXmlFilename))
    let data = await parseXml(content)

    let items = data.Items.Item.map(data => this.mapItem(data))
    return items
  }
}
