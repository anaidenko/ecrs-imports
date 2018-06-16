import logger from './logger'

let taskCounter = 0 // for logging purposes

export default class RetryPolicy {
  private delayGenerator: (attempt: number) => number

  constructor (private tries: number) {
    // this.delayGenerator = this.linearDelayTime // for debugging only
    this.delayGenerator = this.expoDelayTime
  }

  start (fn: () => Promise<any>, description?: string): Promise<any> {
    return this.startPromise(fn, 1, ++taskCounter, description)
  }

  private async startPromise (fn: () => Promise<any>, attempt: number, taskId: number, description?: string): Promise<any> {
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
        logger.log(taskIdPrefix, `retrying... attempt #${nextAttempt} to ${description}`)
        await this.startPromise(fn, nextAttempt, taskId, description)
      } else {
        throw err // reject
      }
    }
  }

  private async delay (duration) {
    return new Promise((resolve: () => void) => {
      setTimeout(resolve, duration)
    })
  }

  // tslint:disable-next-line:no-unused-variable
  private expoDelayTime (attempt: number): number {
    return 1000 * Math.pow(attempt, 2) // exponential delay... 1sec, 4sec, 9sec, 16sec...
  }

  // tslint:disable-next-line:no-unused-variable
  private linearDelayTime (attempt: number): number {
    return 1000 * attempt // linear delay... 1sec, 2sec, 3sec...
  }
}
