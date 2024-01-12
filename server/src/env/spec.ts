import { Parser } from './parser'
import { InvalidViolation, MissingViolation, type Violation } from './violation'

export abstract class FieldSpec<T> {
  abstract evaluate (key: string, env: unknown): T | Violation
}

export type Spec<T> = {
  [K in keyof T]: FieldSpec<T[K]>
}

class StringFieldSpec extends FieldSpec<string> {
  evaluate (key: string, env: unknown): string | Violation {
    const value = (env as any)[key]

    if (value === undefined) { return new MissingViolation() }
    if (value === '') { return new InvalidViolation('Value was empty.') }
    if (typeof value !== 'string') { return new InvalidViolation('Value was not a string') }

    return value
  }
}

abstract class NumberFieldSpec extends FieldSpec<number> {
  evaluate (key: string, env: unknown): number | Violation {
    const value = (env as any)[key]

    if (value === undefined) { return new MissingViolation() }
    if (value === '') { return new InvalidViolation('Value was empty.') }
    if (typeof value !== 'string') { return new InvalidViolation('Value was not a string') }

    const parsedValue = this._parseNumber(value)

    if (isNaN(parsedValue)) { return new InvalidViolation('Value could not be parsed.') }

    return parsedValue
  }

  abstract _parseNumber (value: string): number
}

class IntFieldSpec extends NumberFieldSpec {
  _parseNumber (value: string): number {
    return parseInt(value)
  }
}

class FloatFieldSpec extends NumberFieldSpec {
  _parseNumber (value: string): number {
    return parseFloat(value)
  }
}

class OptionalGroupFieldSpec<T> extends FieldSpec<T | undefined> {
  _format: Spec<T>

  constructor (format: Spec<T>) {
    super()
    this._format = format
  }

  evaluate (key: string, env: unknown): Violation | T | undefined {
    const parser = new Parser<T>()
    const { config, violations } = parser.parse(env, this._format)
    const violationCount = violations !== undefined ? Object.keys(violations).length : 0
    const fieldCount = Object.keys(this._format).length

    if (violationCount > 0 && violationCount < fieldCount) {
      const ignoredKeys = Object.keys(this._format).filter(key => !Object.keys(violations ?? {}).includes(key))
      console.log('Ignoring partially configured group containing env keys')
      for (const ignoredKey of ignoredKeys) {
        console.log(`\t${ignoredKey}`)
      }
    }

    return config
  }
}

export function str (): StringFieldSpec { return new StringFieldSpec() }
export function int (): IntFieldSpec { return new IntFieldSpec() }
export function float (): FloatFieldSpec { return new FloatFieldSpec() }
export function optionalGroup<T> (format: Spec<T>): OptionalGroupFieldSpec<T> { return new OptionalGroupFieldSpec(format) }
