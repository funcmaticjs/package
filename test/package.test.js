const path = require('path')
const fs = require('fs-extra')
const { copyUserCode } = require('../lib/file')
const { zip, npm } = require('../lib/package')
const TEST_SRC_DIR = path.join(__dirname, 'func')
const TEST_DIST_DIR = path.join(__dirname, 'func', 'dist') 
const TEST_BUILD_DIR = path.join(__dirname, 'build')

describe('Build npm install', () => {
  beforeEach(async () => {
    fs.removeSync(path.join(TEST_BUILD_DIR, 'node_modules'))
    fs.removeSync(path.join(TEST_BUILD_DIR, 'package-lock.json'))
    await copyUserCode(TEST_SRC_DIR, TEST_BUILD_DIR, { exclude: [ "tmp", "node_modules", "dist" ] })
  })
  it ('should run npm in production mode', async () => {
    await npm(TEST_BUILD_DIR)
    expect(fs.existsSync(path.join(TEST_BUILD_DIR, 'node_modules', 'uuid'))).toBe(true)
    expect(fs.existsSync(path.join(TEST_BUILD_DIR, 'node_modules', 'jest'))).toBe(false)
  }, 60 * 1000)
})

describe('Zip', () => {
  beforeEach(async () => {
    fs.mkdirpSync(TEST_DIST_DIR)
    fs.removeSync(path.join(TEST_DIST_DIR, 'index.zip'))
  })
  it ('should zip everything in build and put in index.zip', async () => {
    let zippath = path.join(TEST_DIST_DIR, 'index.zip')
    await zip(TEST_BUILD_DIR, zippath)
    expect(fs.existsSync(zippath)).toBe(true)
    expect(fs.statSync(zippath)).toMatchObject({
      size: 61744
    })
  }, 60 * 1000)
})