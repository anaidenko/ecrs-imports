import { inject, injectable } from 'inversify'

import { TYPES } from '../config'

import { FileInfo, FtpManager, FtpOptions } from './FtpManager'
import { RetryPolicy } from './RetryPolicy'

@injectable()
export class FtpManagerFaultTolerant extends FtpManager {
  constructor(@inject(TYPES.FtpOptions) options: FtpOptions, private retry: RetryPolicy) {
    super(options)
  }

  async connect(): Promise<void> {
    return this.retry.operation(() => super.connect())
  }

  async disconnect(force: boolean = false): Promise<void> {
    return this.retry.operation(() => super.disconnect(force))
  }

  async list(path: string, pattern?: string): Promise<FileInfo[]> {
    return this.retry.operation(() => super.list(path, pattern))
  }

  async getContent(filepath: string): Promise<string> {
    return this.retry.operation(() => super.getContent(filepath))
  }
}
