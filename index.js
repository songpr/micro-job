'use strict'

class MicroJob {
  /**
   *
   * @param {function} jobHandler - function to handle a batch of data for this job
   * @param {Number} msToRun - millisecond to run a batch of data using the handler
   */
  constructor(jobHandler, msToRun) {
    if (typeof (jobHandler) !== 'function') throw Error('job handler is not a function.')
    if (!Number.isInteger(msToRun) || msToRun < 1) throw Error('invalid milliseconds to run job ')
    const _jobHandler = jobHandler
    const _msToRun = msToRun
    let timeout = null
    let dataItems = []
    const runAbatch = () => {
      const currentDataItems = dataItems
      dataItems = []
      // const currenttimeout = timeout
      timeout = null
      if (currentDataItems.length > 1) _jobHandler(currentDataItems)
    }

    const addData = (data) => {
      if (data === undefined) throw Error('can not add undefined as data')
      dataItems.push(data)
      // the first data added/or first data after a batch is processed - which is created new dataItems
      if (timeout === null) {
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
