import * as redis from 'redis'
import { promisify } from 'util'
import * as config from '../config'

export interface RedisClient extends redis.RedisClient {
  getAsync: Function
  setAsync: Function
  deleteAsync: Function
}

export function createRedisClient (): RedisClient {
  const RedisClient: RedisClient = redis.createClient(config.RedisSettings) as RedisClient

  (redis => redis.debug_mode = config.DebugRedis)(redis)
  RedisClient.getAsync = promisify(RedisClient.get).bind(RedisClient)
  RedisClient.setAsync = promisify(RedisClient.set).bind(RedisClient)
  RedisClient.deleteAsync = promisify(RedisClient.del).bind(RedisClient)

  return RedisClient
}
