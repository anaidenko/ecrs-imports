import * as redis from 'redis'
import { promisify } from 'util'

import * as config from '../config'

import { RetryPolicy } from './RetryPolicy'

export interface RedisClient extends redis.RedisClient {
  getAsync: Function
  setAsync: Function
  deleteAsync: Function
}

export function createRedisClient(): RedisClient {
  const RedisClient: RedisClient = redis.createClient(config.RedisSettings) as RedisClient
  ;(redis => (redis.debug_mode = config.DebugRedis))(redis)

  RedisClient.getAsync = promisify(RedisClient.get).bind(RedisClient)
  RedisClient.setAsync = promisify(RedisClient.set).bind(RedisClient)
  RedisClient.deleteAsync = promisify(RedisClient.del).bind(RedisClient)

  return RedisClient
}

export function createFaultTolerantRedisClient(retry: RetryPolicy): RedisClient {
  const retryHandler = {
    apply: (target, self, args) => retry.operation(() => target.apply(self, ...args))
  }

  const client = createRedisClient()

  client.getAsync = new Proxy(client.getAsync, retryHandler)
  client.setAsync = new Proxy(client.setAsync, retryHandler)
  client.deleteAsync = new Proxy(client.deleteAsync, retryHandler)

  return client
}
