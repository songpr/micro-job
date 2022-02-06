'use strict'
const { isAsyncFunction } = require('util/types')
class MicroJob {
  /**
   *
   * @param {function} jobHandler - function to handle a batch of data for this job
   * @param {Number} msToRun - millisecond to run a batch of data using the handler
   */
  constructor (jobHandler, msToRun) {
    if (typeof (jobHandler) !== 'function') throw Error('job handler is not a function.')
    if (!Number.isInteger(msToRun) || msToRun < 1) throw Error('invalid milliseconds to run job ')
    const _jobHandler = jobHandler
    const _msToRun = msToRun
    let timeout = null
    let dataItems = []
    let error = null
    Object.defineProperty(this, 'lastBatchFailInfo', {
      get: () => error
    })
    Object.defineProperty(this, 'isABatchScheduled', {
      get: () => timeout != null
    })
    const runAbatch = isAsyncFunction(_jobHandler)
      ? () => {
          const currentDataItems = dataItems
          dataItems = []
          const currenttimeout = timeout
          timeout = null
          _jobHandler(currentDataItems).then(() => {
            error = null
          }).catch(err => {
            error = Object.freeze({ error: err, data: currentDataItems, timeout: currenttimeout })
          })
        }
      : () => {
          const currentDataItems = dataItems
          dataItems = []
          const currenttimeout = timeout
          timeout = null
          try {
            _jobHandler(currentDataItems)
            error = null
          } catch (err) {
            error = Object.freeze({ error: err, data: currentDataItems, timeout: currenttimeout })
          }
        }

    const addData = (data) => {
      if (data === undefined) throw Error('can not add undefined as data')
      dataItems.push(data)
      // there is data but no schedule batchjob
      if (timeout === null && dataItems.length > 0) {
        // no batch is scheduled yet, schedule it
        timeout = setTimeout(runAbatch, _msToRun)
      }
    }

    Object.defineProperty(this, 'addData', {
      writable: false,
      value: addData
    })
  }
}

module.exports = MicroJob
