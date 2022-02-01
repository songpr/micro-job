'use strict'

class MicroJob {
  constructor (jobHandler, msToRun) {
    if (typeof (jobHandler) !== 'function') throw Error('job handler is not a function.')
    if (!Number.isInteger(msToRun) || msToRun < 1) throw Error('invalid milliseconds to run job ')
    const _jobHandler = jobHandler
    Object.defineProperty(this, 'handler', { value: _jobHandler, writable: false })
    Object.defineProperty(this, 'msToRun', { value: msToRun, writable: false })
    const jobId = null
    Object.defineProperty(this, 'isABatchScheduled', { get: () => jobId != null, writable: false })
    let data = []
    const runAbatch = () => {
      if (data.length > 0) {
        const currentData = data
        data = []
        _jobHandler(currentData)
      }
    }
    Object.defineProperty(this, 'runAbatch', { value: runAbatch, writable: false })
  }

  addData (data) {
  }
}

module.exports = MicroJob
