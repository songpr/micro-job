const tap = require('tap')
const test = tap.test
const MJob = require('../index')

test('new job fail without job\'s handler function and ms to run', t => {
  t.throws(() => new MJob(), 'no handler and time')
  t.throws(() => new MJob(data => data + 1), 'no time')
  t.throws(() => new MJob(null, 13), 'no handler')
})

test('basic micro job setup', t => {
  const itemsTest = items => {
    t.ok(Array.isArray(items), 'data passed must be array')
    t.ok(items.length > 0, 'data array length must more that 0')
  }
  const itemsTestJob = new MJob(itemsTest, 93)
  itemsTestJob.addData([1, 2])
})
