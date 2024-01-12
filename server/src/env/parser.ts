import { type Spec } from './spec'
import { Violation } from './violation'

export class Parser<T> {
  parse (rawEnv: unknown, format: Spec<T>): { config: T, violations: undefined } | { config: undefined, violations: Partial<Record<keyof T, Violation>> } {
    const violations: Partial<Record<keyof T, Violation>> = {}
    const config: Partial<T> = {}

    for (const key in format) {
      const spec = format[key]

      const result = spec.evaluate(key, rawEnv)

      if (result instanceof Violation) { violations[key] = result } else { config[key as keyof T] = result }
    }

    if (Object.entries(violations).length > 0) {
      return { config: undefined, violations }
    }

    return { config: config as T, violations: undefined }
  }
}
