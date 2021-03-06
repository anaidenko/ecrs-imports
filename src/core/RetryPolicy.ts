import { injectable } from 'inversify'

import { logger } from '../utils/logger'

let taskCounter = 0 // for logging purposes

@injectable()
export class RetryPolicy {
  private delayGenerator: (attempt: number) => number

  constructor(private tries: number) {
    // this.delayGenerator = this.linearDelayTime // for debugging only
    this.delayGenerator = this.expoDelayTime
  }

  operation<T = any>(fn: () => Promise<T>, description?: string): Promise<T> {
    return this.start(fn, 1, ++taskCounter, description)
  }

  private async start<T = any>(
    fn: () => Promise<T>,
    attempt: number,
    taskId: number,
    description?: string
  ): Promise<T> {
    let taskIdPrefix = `[${taskId}]`
    try {
      return await fn()
    } catch (err) {
      let message = (err.message || err).toString().replace(/Error:\s*/gi, '')
      if (description) logger.warn(taskIdPrefix, description, 'failed due to', message)
      else logger.warn(taskIdPrefix, message)

      if (attempt < this.tries) {
        let retryDelay = this.delayGenerator(attempt)
        let nextAttempt = attempt + 1
        logger.log(taskIdPrefix, `retry scheduled in ${retryDelay}ms...`)
        await this.delay(retryDelay)
        logger.log(taskIdPrefix, `retrying... attempt #${nextAttempt}`, description ? `to ${description}` : '')
        return this.start<T>(fn, nextAttempt, taskId, description)
      } else {
        throw err // reject
      }
    }
  }

  private async delay(duration) {
    return new Promise((resolve: () => void) => {
      setTimeout(resolve, duration)
    })
  }

  // tslint:disable-next-line:no-unused-variable
  private expoDelayTime(attempt: number): number {
    return 1000 * Math.pow(attempt, 2) // exponential delay... 1sec, 4sec, 9sec, 16sec...
  }

  // tslint:disable-next-line:no-unused-variable
  private linearDelayTime(attempt: number): number {
    return 1000 * attempt // linear delay... 1sec, 2sec, 3sec...
  }
}
