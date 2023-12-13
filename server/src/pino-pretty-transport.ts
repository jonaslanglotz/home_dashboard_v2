import pretty from 'pino-pretty'

module.exports = (opts: Record<string, any>) => pretty({
  ...opts,
  messageFormat: (log: Record<any, any>, messageKey: string) => {
    const message = log[messageKey]
    if (log.module != null) return `[${log.module}] ${message}`
    return message
  },
  ignore: 'module'
})
