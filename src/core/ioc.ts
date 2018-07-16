import { Container, ContainerModule } from 'inversify'

import * as api from '../api'
import * as constants from '../config/constants'
import { TYPES } from '../config/types'

import { FtpManager, FtpOptions } from './FtpManager'
import { FtpManagerFaultTolerant } from './FtpManagerFaultTolerant'
import { createFaultTolerantRedisClient, RedisClient } from './RedisClient'
import { RetryPolicy } from './RetryPolicy'

export const module = new ContainerModule(bind => {
  bind(RetryPolicy).toConstantValue(new RetryPolicy(3))
  bind<FtpOptions>(TYPES.FtpOptions).toConstantValue(constants.FtpSettings)
  bind(FtpManager).to(FtpManagerFaultTolerant)
  bind(api.Client).to(api.ClientFaultTolerant)
  bind<RedisClient>(TYPES.RedisClient)
    .toDynamicValue(context => createFaultTolerantRedisClient(context.container.get(RetryPolicy)))
    .inSingletonScope()
})

export async function dispose(container: Container) {
  const redis = container.get<RedisClient>(TYPES.RedisClient)
  await redis.quit()
}
