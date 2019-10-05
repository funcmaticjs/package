#!/usr/bin/env node

const path = require('path')
const ora = require('ora')

const { getConfig, ensureSetup, copyUserCode } = require('./lib/file')
const { zip, npm } = require('./lib/package')

main()
.then(() => { })

async function main() {
  try {
    let config = getConfig()
    ensureSetup(config)
    await runCopy(config)
    await runNpm(config)
    await runZip(config)
  } catch (err) {
    console.error(err)
  }
}

async function runCopy({ src, build, exclude }) {
  const spinner = ora(`Copying code to ${build} ...`).start()
  copyUserCode(src, build, { exclude })
  spinner.succeed(`Copied code to ${build}`)
  return
}

async function runNpm({ build }) {
  const spinner = ora(`Running npm install --production --silent`).start()
  await npm(build)
  spinner.succeed(`Finished npm install --production --silent`)
}

async function runZip({ name, build, dist, dist_rel }) {
  const spinner = ora(`Saving zip to ${dist_rel}/${name}`).start()
  await zip(build, path.join(dist, name))
  spinner.succeed(`Saved zip to ${dist_rel}/${name}`)
}