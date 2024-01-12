export class Violation {
  message: string | undefined
  constructor (message?: string) {
    this.message = message
  }
}

export class MissingViolation extends Violation {}
export class InvalidViolation extends Violation {}
