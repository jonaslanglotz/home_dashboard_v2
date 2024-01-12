import { Parser } from './parser'
import { type Spec } from './spec'
import { InvalidViolation, MissingViolation } from './violation'

export function readEnv<T> (rawEnv: unknown, format: Spec<T>): T {
  const parser = new Parser<T>()
  const { config, violations } = parser.parse(rawEnv, format)

  if (config === undefined) {
    console.error('\n')
    console.error('Invalid configuration, exiting...')
    console.error('Violations:')
    for (const key in violations) {
      const violation = violations[key]

      if (violation === undefined) { continue }

      let typeString
      switch (violation.constructor) {
        case InvalidViolation:
          typeString = 'INVALID'
          break

        case MissingViolation:
          typeString = 'MISSING'
          break
      }

      const message = violation.message === undefined ? '' : ` - ${violation.message}`

      console.error(`\t${key}: ${typeString}${message}`)
    }
    process.exit(1)
  }

  return config
}
