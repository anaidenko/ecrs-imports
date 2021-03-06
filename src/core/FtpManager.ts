import * as FtpClient from 'ftp'
import ReadableStream = NodeJS.ReadableStream
import { inject, injectable } from 'inversify'
import * as minimatch from 'minimatch'
import * as path from 'path'
import streamToString = require('stream-to-string')

import { TYPES } from '../config/types'

import { logger } from '../utils/logger'

export interface FtpOptions extends FtpClient.Options {
  root?: string
  compress?: boolean
}

export interface FileInfo extends FtpClient.ListingElement {
  host: string
  name: string
  ext: string
  path: string
}

@injectable()
export class FtpManager {
  private static lastId: number = 0

  private client: FtpClient
  private _id: number

  constructor(@inject(TYPES.FtpOptions) public options: FtpOptions) {
    this._id = ++FtpManager.lastId
    this.client = new FtpClient()
    this.client.on('error', err => logger.error(this.id, 'Error', err))
  }

  async connect(): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (err: Error) => void) => {
      this.client.on('error', err => reject(err))
      this.client.on('ready', () => {
        logger.debug(this.id, 'Connected')
        resolve()
      })
      logger.log(this.id, `Connecting to ${this.options.user}@${this.options.host}...`)
      this.client.connect(this.options as FtpClient.Options)
    })
  }

  async disconnect(force: boolean = false): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (err: Error) => void) => {
      this.client.on('error', err => reject(err))
      this.client.on('close', () => {
        logger.log(this.id, `Disconnected`)
        resolve()
      })
      if (force) this.client.destroy()
      else this.client.end()
    })
  }

  async list(path: string, pattern?: string): Promise<FileInfo[]> {
    return new Promise((resolve: (result: FileInfo[]) => void, reject: (err: Error) => void) => {
      logger.log(this.id, `requesting listing at ${path}...`)
      this.client.on('error', reject)
      this.client.list(path, this.options.compress || false, (error: Error, listing: FtpClient.ListingElement[]) => {
        if (error) return reject(error)
        let files = listing.map(file => this.mapFileInfo(file, path))
        if (pattern) files = files.filter(file => minimatch(file.name, pattern))
        logger.debug(this.id, `total xml files found: ${files.length}`)
        resolve(files)
      })
    })
  }

  async getContent(filepath: string): Promise<string> {
    return new Promise((resolve: (result: string) => void, reject: (err: Error) => void) => {
      logger.log(this.id, `downloading file ${filepath}...`)
      this.client.on('error', reject)
      this.client.get(filepath, (error: Error, stream: ReadableStream) => {
        if (error) return reject(error)
        streamToString(stream).then(resolve, reject)
      })
    })
  }

  private get id(): string {
    // if (FtpManager.lastId === 1) return 'FTP'
    return `FTP [${this._id}]`
  }

  private mapFileInfo(listing: FtpClient.ListingElement, dirpath: string): FileInfo {
    let ftpSettings: FtpOptions = this.options
    let file = {
      ...listing,
      host: ftpSettings.host,
      path: path.join(dirpath, listing.name),
      ext: path.extname(listing.name)
    } as FileInfo
    return file
  }
}
