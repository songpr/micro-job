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
  let result = null
  const itemsTest = items => {
    console.log({ items })
    t.ok(Array.isArray(items), 'data passed must be array')
    t.ok(items.length > 0, 'data array length must more that 0')
    result = items.reduce((total, num) => num ? total + num : total, 0)
  }
  const itemsTestJob = new MJob(itemsTest, 10)
  let i = 2
  for (; i < 20; i++) itemsTestJob.addData(i)
  t.ok(itemsTestJob.isABatchScheduled)
  await setTimeoutAsync(30, '1st batch done')
  t.equal(result, 189, 'job have been run correctly with data')
  t.equal(itemsTestJob.lastBatchFailInfo, null, 'when the batch is pass lastError is null')
  t.throws(() => itemsTestJob.addData(undefined), 'cannot add undefined data')
  i = 5
  for (; i < 10; i++) itemsTestJob.addData(i)
  itemsTestJob.addData(null)
  await setTimeoutAsync(30, '2nd batch done')
})

test('basic micro job, error in batch job ', async t => {
  let result = null
  const itemsTest = items => {
    if (items.length < 10) throw Error('throw when number of data is less than 10')
    result = items.reduce((total, num) => num ? total + num : total, 0)
  }
  const itemsTestJob = new MJob(itemsTest, 10)
  let i = 0
  for (; i < 9; i++) itemsTestJob.addData(i)
  t.ok(itemsTestJob.isABatchScheduled)
  await setTimeoutAsync(30, '1st batch done')
  console.log({ lastBatchFailInfo: itemsTestJob.lastError })
  t.ok(itemsTestJob.lastBatchFailInfo, 'job throw error')
  t.equal(itemsTestJob.lastBatchFailInfo.error.message, 'throw when number of data is less than 10', 'when the batch is fail to run the error will be captured in lastError')

  i = 0
  for (; i < 10; i++) itemsTestJob.addData(i)
  await setTimeoutAsync(30, '2nd batch done')
  t.equal(itemsTestJob.lastBatchFailInfo, null, 'when the batch is pass lastError is null, even there is error in prevoius batch')
  t.equal(result, 45, 'job have been run correctly with data')
})

test('basic micro job, run async function handler', async t => {
  let result = null
  const itemsTestAsync = async (items) => {
    result = await setTimeoutAsync(2, items.reduce((total, num) => num ? total + num : total, 0))
    console.log({ items })
    t.ok(Number.isInteger(result))
    t.ok(Array.isArray(items), 'data passed must be array')
    t.ok(items.length > 0, 'data array length must more that 0')
  }
  const itemsTestJob = new MJob(itemsTestAsync, 10)
  itemsTestJob.addData(null)
  await setTimeoutAsync(10, 'wait for 1st batch')
  t.throws(() => itemsTestJob.addData(undefined), 'cannot add undefined data')
  let i = 0
  for (; i < 20; i++) itemsTestJob.addData(i)
  await setTimeoutAsync(30, 'wait for 2nd batch')
  t.equal(result, 190, 'job have been run correctly with data')
})

test('basic micro job, error in async batch job ', async t => {
  let result = null
  const itemsTest = async (items) => {
    if (items.length < 10) throw Error('throw when number of data is less than 10')
    result = await setTimeoutAsync(2, items.reduce((total, num) => num ? total + num : total, 0))
  }
  const itemsTestJob = new MJob(itemsTest, 10)
  let i = 0
  for (; i < 9; i++) itemsTestJob.addData(i)
  t.ok(itemsTestJob.isABatchScheduled)
  await setTimeoutAsync(30, '1st batch done')
  console.log({ lastBatchFailInfo: itemsTestJob.lastError })
  t.ok(itemsTestJob.lastBatchFailInfo, 'job throw error')
  t.equal(itemsTestJob.lastBatchFailInfo.error.message, 'throw when number of data is less than 10', 'when the batch is fail to run the error will be captured in lastError')

  i = 0
  for (; i < 10; i++) itemsTestJob.addData(i)
  await setTimeoutAsync(30, '2nd batch done')
  t.equal(itemsTestJob.lastBatchFailInfo, null, 'when the batch is pass lastError is null, even there is error in prevoius batch')
  t.equal(result, 45, 'job have been run correctly with data')
})

test('run long time job', async t => {
  let result = null
  const itemsSum = async (items) => {
    result = await setTimeoutAsync(2, items.reduce((total, num) => num ? total + num : total, 0))
  }
  const itemsSumJob = new MJob(itemsSum, 10)
  for (round = 0; round < 100; round++) {
    let roundSum = 0
    for (i = round; i < (round + 10); i++) {
      itemsSumJob.addData(i)
      roundSum += i
    }
    await setTimeoutAsync(30, `${round} batch done`)
    t.equal(result, roundSum)
  }
})
