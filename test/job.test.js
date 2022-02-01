const tap = require('tap')
const test = tap.test
const MJob = require('../index')
const { setTimeout: setTimeoutAsync } = require('timers/promises')

test('new job fail without job\'s handler function and ms to run', t => {
  t.plan(3)
  t.throws(() => new MJob(), 'no handler and time')
  t.throws(() => new MJob(data => data + 1), 'no time')
  t.throws(() => new MJob(null, 13), 'no handler')
})

test('basic micro job', async t => {
  const itemsTest = items => {
    t.ok(Array.isArray(items), 'data passed must be array')
    t.ok(items.length > 0, 'data array length must more that 0')
  }
  const itemsTestJob = new MJob(itemsTest, 10)
  let i = 0
  for (; i < 20; i++) itemsTestJob.addData(i)
  await setTimeoutAsync(20, '1st batch')
  for (; i < 60; i++) itemsTestJob.addData(i)
  await setTimeoutAsync(20, '2nd batch')
})

test('basic micro job, data is null can be put as data - but not undefined ', async t => {
  const itemsTest = items => {
    console.log({ items })
    t.ok(Array.isArray(items), 'data passed must be array')
    t.ok(items.length > 0, 'data array length must more that 0')
    items.map(item => {
      if (item === null) {
        throw Error('do not support null item data in test')
      }
    })
  }
  const itemsTestJob = new MJob(itemsTest, 10)
  itemsTestJob.addData(null)
  t.ok(itemsTestJob.isABatchScheduled)
  await setTimeoutAsync(50, '1st batch done')
  console.log({ lastError: itemsTestJob.lastError })
  t.ok(itemsTestJob.lastError, 'when the batch is fail to run the error will be captured in lastError')
  t.throws(() => itemsTestJob.addData(undefined), 'cannot add undefined data')
})

test('basic micro job, run async function handler', async t => {
  const itemsTest = async (items) => {
    const result = await setTimeoutAsync(10, items.reduce((total, num) => total + num, 0))
    console.log({ result })
    t.ok(Number.isInteger(result))
    t.ok(Array.isArray(items), 'data passed must be array')
    t.ok(items.length > 0, 'data array length must more that 0')
  }
  const itemsTestJob = new MJob(itemsTest, 10)
  itemsTestJob.addData(null)
  await setTimeoutAsync(10, 'wait for 1st batch')
  t.throws(() => itemsTestJob.addData(undefined), 'cannot add undefined data')
  let i = 0
  for (; i < 20; i++) itemsTestJob.addData(i)
  await setTimeoutAsync(50, 'wait for 2nd batch')
})
