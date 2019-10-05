async function runCopy() {
  const spinner = ora(`Copying code to ${build} ...`).start()
  copyUserCode(src, build, options)
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


module.exports = {
  runCopy,
  runNpm,
  runZip
}