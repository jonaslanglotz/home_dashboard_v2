import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon, { type SinonStub } from 'sinon'
import { type Tasks } from '../../../../../shared-types'
import { TodoistTasksProvider } from '../../../../src/data/data-providers/todoist'

chai.use(chaiAsPromised)

describe('TodoistTasksProvider', function () {
  const validTodoistData = [
    {
      projectId: 'projectId',
      content: 'Task #1',
      isCompleted: false,
      priority: 1,
      due: {
        date: '2024-08-11'
      }
    },
    {
      projectId: 'projectId',
      content: 'Task #2',
      isCompleted: false,
      priority: 2,
      due: {
        date: '2024-08-11T20:00:00Z'
      }
    },
    {
      projectId: 'otherProjectId',
      content: 'Task #3',
      isCompleted: false,
      priority: 3,
      due: {
        date: '2024-08-11'
      }
    },
    {
      projectId: 'projectId',
      content: 'Task #4',
      isCompleted: true,
      priority: 4,
      due: {
        date: '2024-08-11'
      }
    },
    {
      projectId: 'projectId',
      content: 'Task #5',
      isCompleted: true,
      priority: 4
    }
  ]

  const tasks: Tasks = [
    {
      title: 'Task #1',
      priority: 1,
      due: '2024-08-11'
    },
    {
      title: 'Task #2',
      priority: 2,
      due: '2024-08-11T20:00:00Z'
    }
  ]

  let subject: TodoistTasksProvider
  let todoistStub: SinonStub

  beforeEach('setup', () => {
    subject = new TodoistTasksProvider({
      apiKey: 'apiKey',
      projectId: 'projectId'
    })

    todoistStub = sinon.stub(subject.todoist, 'getTasks')
  })

  afterEach(function () {
    todoistStub.restore()
  })

  describe('#getData', function () {
    it('should return the correct Tasks when Todoist returns valid data', async function () {
      todoistStub.onFirstCall().returns(Promise.resolve(validTodoistData))

      const value = await subject.getData()

      assert.deepStrictEqual(value, tasks)
    })
  })
})
