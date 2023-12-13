import 'dotenv/config'
import dist = require('envalid')

const env = dist.cleanEnv(process.env, {
})

export = {
  env
}
