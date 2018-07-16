import 'reflect-metadata'

import { Container } from 'inversify'

import * as api from '../api'
import { FtpManager, FtpOptions } from '../core/FtpManager'
import { FtpManagerFaultTolerant } from '../core/FtpManagerFaultTolerant'
import { createFaultTolerantRedisClient, RedisClient } from '../core/RedisClient'
import { RetryPolicy } from '../core/RetryPolicy'

import * as constants from './constants'
import { TYPES } from './types'

const container = new Container({ autoBindInjectable: true })
container.bind(RetryPolicy).toConstantValue(new RetryPolicy(3))
container.bind<FtpOptions>(TYPES.FtpOptions).toConstantValue(constants.FtpSettings)
container.bind(FtpManager).to(FtpManagerFaultTolerant)
container.bind(api.Client).to(api.ClientFaultTolerant)
container
  .bind<RedisClient>(TYPES.RedisClient)
  .toDynamicValue(context => createFaultTolerantRedisClient(context.container.get(RetryPolicy)))
  .inSingletonScope()

export { container }

export async function disposeContainer() {
  const redis = container.get<RedisClient>(TYPES.RedisClient)
  await redis.quit()
}
