import { createClient, RedisClient as RedisClientType } from 'redis'
import { promisify } from 'util'
import * as config from '../config'

export interface RedisClient extends RedisClientType {
  getAsync: Function
  setAsync: Function
  deleteAsync: Function
}

export function createRedisClient (): RedisClient {
  const RedisClient: RedisClient = createClient(config.RedisSettings) as RedisClient

  RedisClient.getAsync = promisify(RedisClient.get).bind(RedisClient)
  RedisClient.setAsync = promisify(RedisClient.set).bind(RedisClient)
  RedisClient.deleteAsync = promisify(RedisClient.del).bind(RedisClient)

  return RedisClient
}
