import { TodoistApi } from '@doist/todoist-api-typescript'
import { DataProvider } from '../data-provider'
import type { Task, Tasks } from '../../../../shared-types'

type RawTask = Awaited<ReturnType<TodoistApi['getTasks']>>[0]

interface Options {
  apiKey: string
  projectId: string
}

export class TodoistTasksProvider extends DataProvider<Tasks> {
  todoist: TodoistApi
  projectId: string

  /**
   * Creates an instance of TodoistTasksProvider.
   * @param {Options} options
   * @param {String} options.apiKey The key for the Todoist API.
   * @param {String} options.projectId The ID of the Todoist project from which tasks should be taken.
   * @memberof TodoistTasksProvider
   */
  constructor (options: Options) {
    super()

    this.todoist = new TodoistApi(options.apiKey)
    this.projectId = options.projectId
  }

  async getData (): Promise<Tasks> {
    const rawTasks = await this._getRawTasks()
    const relevantRawTasks = rawTasks.filter(rawTask => this._isRawTaskRelevant(rawTask))

    const convertedTasks = relevantRawTasks.flatMap(rawTask => this._convertRawTask(rawTask))
    return convertedTasks
  }

  async _getRawTasks (): Promise<RawTask[]> {
    return await this.todoist.getTasks()
  }

  _isRawTaskRelevant (rawTask: RawTask): boolean {
    return rawTask.projectId === this.projectId &&
      !rawTask.isCompleted &&
      rawTask.due != null
  }

  _convertRawTask (rawTask: RawTask): Task[] {
    if (rawTask.due == null) { return [] }

    return [{
      title: rawTask.content,
      due: rawTask.due?.datetime ?? rawTask.due?.date,
      priority: rawTask.priority
    }]
  }
}
