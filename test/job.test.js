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
  const itemsTestJob = new MJob(itemsTest, 51)
  let i = 0
  for (; i < 20; i++) itemsTestJob.addData(i)
  await setTimeoutAsync(100, '1st batch')
  for (; i < 60; i++) itemsTestJob.addData(i)
  await setTimeoutAsync(100, '2nd batch')
})

test('basic micro job, data is null can be put as data - but not undefined ', async t => {
  const itemsTest = items => {
    t.ok(Array.isArray(items), 'data passed must be array')
    t.ok(items.length > 0, 'data array length must more that 0')
  }
  const itemsTestJob = new MJob(itemsTest, 51)
  itemsTestJob.addData(null)
  await setTimeoutAsync(100, '1st batch')
  t.throws(() => itemsTestJob.addData(undefined), 'cannot add undefined data')
  await setTimeoutAsync(100, '2nd batch')
})
