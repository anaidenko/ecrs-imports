export default class AggregateError extends Error {
  readonly errors: Error[]

  constructor(errors: Error[], message?: string) {
    super(message)

    this.errors = errors || []

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor)
  }
}
