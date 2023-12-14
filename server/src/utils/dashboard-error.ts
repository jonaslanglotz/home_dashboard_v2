export class DashboardError extends Error {
  debugData: any

  constructor (message: string, debugData = {}) {
    super(message)
    this.debugData = debugData
  }
}
