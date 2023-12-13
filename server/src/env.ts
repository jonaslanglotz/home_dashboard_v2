import 'dotenv/config'
import dist = require('envalid')

export const env = dist.cleanEnv(process.env, {
})
