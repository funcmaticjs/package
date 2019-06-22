const path = require('path')
const fs = require('fs-extra')
const { zip, npm } = require('../lib/package')
const TEST_BUILD_DIR = path.join(__dirname, 'build')
const TEST_FUNC_DIR = path.join(__dirname, "func")

describe('Zip', () => {
  beforeEach(async () => {
    fs.remove(path.join(TEST_BUILD_DIR, 'index.zip'))
  })
  it ('should zip folder', async () => {
    let zippath = path.join(TEST_BUILD_DIR, 'index.zip')
    await zip(TEST_FUNC_DIR, zippath, { exclude: [ "excludes/*" ] })
    expect(fs.existsSync(zippath)).toBe(true)
    expect(fs.statSync(zippath)).toMatchObject({
      size: 874
    })
  })
})

describe('NPM', () => {
  beforeEach(async () => {
    fs.remove(path.join(TEST_BUILD_DIR, 'node_modules'))
  })
  it ('should run npm in production mode', async () => {
    await npm(TEST_BUILD_DIR)
    expect(fs.existsSync(path.join(TEST_BUILD_DIR, 'node_modules', 'uuid'))).toBe(true)
    expect(fs.existsSync(path.join(TEST_BUILD_DIR, 'node_modules', 'jest'))).toBe(false)
  })
})