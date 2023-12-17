import { TodoistTasksProvider } from '../../../../src/data/data-providers/todoist'

import 'dotenv/config'
import { cleanEnv, str } from 'envalid'
import { log } from '../../../../src/utils/log'

const env = cleanEnv(process.env, {
  TODOIST_API_KEY: str(),
  TODOIST_PROJECT_ID: str()
})

describe('TodoistTasksProvider', function () {
  let subject: TodoistTasksProvider

  beforeEach('setup', () => {
    subject = new TodoistTasksProvider({
      apiKey: env.TODOIST_API_KEY,
      projectId: env.TODOIST_PROJECT_ID
    })
  })

  describe('#_getRawTasks()', function () {
    it('should not throw an Error', async function () {
      this.timeout(5000)
      const rawTasks = await subject._getRawTasks()
      log.info({ rawTasks })
    })
  })
})
