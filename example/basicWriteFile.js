const fs = require('fs')
const precision = 3 // 3 decimal places
const numLines = 1000000
try {
  fs.truncateSync(`${__filename}.out.txt`)
} catch (err) {
  console.log(err.message)
}
const fd = fs.openSync(`${__filename}.out.txt`, 'w+', 0o666)

const start = process.hrtime()

for (let i = 0; i < numLines; i++) {
  fs.writeFileSync(fd, `${i}\n`)
}
const elapsed = process.hrtime(start)
console.log(`write ${numLines} lines to file within ${elapsed[0]} s, ${(elapsed[1] / 1000000).toFixed(precision)} ms`)
try {
  fs.truncateSync(`${__filename}.batchout.txt`)
} catch (err) {
  console.log(err.message)
}
const bfd = fs.openSync(`${__filename}.batchout.txt`, 'w+', 0o666)
const MJob = require('../index')

const bstart = process.hrtime()
let belapsed = null
let writeLines = 0
const jobMS = 93
let timeout = null
const writeJob = new MJob((items) => {
  fs.writeFileSync(bfd, items.join(''))
  writeLines += items.length
  if (writeLines === numLines) {
    belapsed = process.hrtime(bstart)
  }
}, jobMS)

for (let bi = 0; bi < numLines; bi++) {
  writeJob.addData(`${bi}\n`)
}

timeout = setTimeout(() => {
  console.log(`write ${numLines} lines to file within ${belapsed[0]} s, ${(belapsed[1] / 1000000).toFixed(precision)} ms`)

  const performance = belapsed[0] < elapsed[0] || belapsed[0] < elapsed[0]
    ? `every ${jobMS} ms, run a batch job is ${(elapsed[0] * 1000 + elapsed[1] / 1000000) / (belapsed[0] * 1000 + belapsed[1] / 1000000)} faster`
    : `every ${jobMS} ms, run a batch job is ${(belapsed[0] * 1000 + belapsed[1] / 1000000) / (elapsed[0] * 1000 + elapsed[1] / 1000000)} slower`
  console.log(performance)

  const { exec } = require('child_process')

  exec(`diff -s ${__filename}.out.txt ${__filename}.batchout.txt`, (error, stdout, stderr) => {
    if (error) console.error({ error: error.message, stack: error.stack })
    if (stdout) console.log(stdout)
  })
}, Math.min(elapsed[0] * 1000, 10000))
