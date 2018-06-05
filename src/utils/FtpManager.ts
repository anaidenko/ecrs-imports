import * as FtpClient from 'ftp'
import * as minimatch from 'minimatch'
import streamToString = require('stream-to-string')

import logger from './logger'
import ReadableStream = NodeJS.ReadableStream

export interface FtpOptions extends FtpClient.Options {
  root?: string
}

export class FtpManager {
  private static lastId: number = 0

  private client: FtpClient
  private _id: number

  constructor () {
    this._id = ++FtpManager.lastId
    this.client = new FtpClient()
    this.client.on('error', (err) => logger.error(this.id, 'Error', err))
  }

  async connect (options: FtpOptions): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (err: Error) => void) => {
      this.client.on('error', err => reject(err))
      this.client.on('ready', () => resolve())
      logger.log(this.id, `Connecting to ${options.host}...`)
      this.client.connect(options as FtpClient.Options)
    })
  }

  async disconnect (force: boolean = false): Promise<void> {
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

  async list (path: string, pattern?: string): Promise<FtpClient.ListingElement[]> {
    return new Promise((resolve: (result: FtpClient.ListingElement[]) => void, reject: (err: Error) => void) => {
      this.client.on('error', reject)
      this.client.list(path, false, (error: Error, listing: FtpClient.ListingElement[]) => {
        if (error) return reject(error)
        if (pattern) listing = listing.filter(file => minimatch(file.name, pattern))
        resolve(listing)
      })
    })
  }

  async getContent (filepath: string): Promise<string> {
    return new Promise((resolve: (result: string) => void, reject: (err: Error) => void) => {
      this.client.on('error', reject)
      this.client.get(filepath, (error: Error, stream: ReadableStream) => {
        if (error) return reject(error)
        streamToString(stream).then(resolve, reject)
      })
    })
  }

  private get id (): string {
    // if (FtpManager.lastId === 1) return 'FTP'
    return `FTP [${this._id}]`
  }
}
