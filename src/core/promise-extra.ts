import AggregateError from './AggregateError'

/**
 * Avoiding Promise.all() fail-fast behavior, make sure all the promises are eventually executed.
 * @param promises
 */
export async function everyPromiseInParallel(promises: Promise<any>[]): Promise<any> {
  if (!promises || promises.length === 0) return promises

  let errors: Error[] = []

  // Promise.all is rejected if one of the elements is rejected and Promise.all fails fast:
  // If you have four promises which resolve after a timeout, and one rejects immediately, then Promise.all rejects immediately.
  let results = await Promise.all(promises.map(p => p.catch(err => errors.push(err))))

  if (errors.length > 0) {
    throw new AggregateError(errors)
  }

  return results
}

export async function everyPromiseOneByOne(factories: (() => Promise<any>)[]): Promise<any> {
  if (!factories || factories.length === 0) return factories

  let errors: Error[] = []
  let results: any[] = []

  for (let factory of factories) {
    let promise = factory()
    let result = await promise.catch(err => errors.push(err))
    results.push(result)
  }

  if (errors.length > 0) {
    throw new AggregateError(errors)
  }

  return results
}
