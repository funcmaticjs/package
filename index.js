const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const program = require('commander')
const ora = require('ora')

const { packageJSON, functionName, createBuildFolder, removeBuildFolder, createDistFolder, copyUserCode } = require('./lib/file')
const { zip, npm } = require('./lib/package')

let packageDotJson = packageJSON()
let tmpdir = os.tmpdir()

let src = packageDotJson.dir
let srcrel = path.relative(process.cwd(), src) || '.'
let build = createBuildFolder(tmpdir, { dirname: `build-${Date.now()}` })
let dist = createDistFolder(src)
let distrel = path.relative(process.cwd(), dist)
let name = `${packageDotJson.name}.zip`

main()
.then(() => { })

async function main() {
  try {
    await runCopy()
    await runNpm()
    await runZip()
  } catch (err) {
    console.error(err)
  }
}

async function runCopy() {
  const spinner = ora(`Copying code to ${build} ...`).start()
  copyUserCode(src, build)
  spinner.succeed(`Copied code to ${build}`)
  return
}

async function runNpm() {
  const spinner = ora(`Running npm install --production --silent`).start()
  await npm(build)
  spinner.succeed(`Finished npm install --production --silent`)
}

async function runZip() {
  const spinner = ora(`Saving zip to ${distrel}/${name}`).start()
  await zip(build, path.join(dist, name))
  spinner.succeed(`Saved zip to ${distrel}/${name}`)
}