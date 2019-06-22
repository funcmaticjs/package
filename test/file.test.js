const path = require('path')
const TEST_FUNC_DIR = path.join(__dirname, 'func')
const { packageJSON, createBuildFolder, removeBuildFolder, createDistFolder, removeDistFolder, copyUserCode } = require('../lib/file')
const fs = require('fs-extra')
const os = require('os')

describe('Package JSON', () => {
  it ('should find and parse package.json in current directory', async () => {
    let res = packageJSON({ cwd: TEST_FUNC_DIR })
    expect(res).toMatchObject({
      cwd: TEST_FUNC_DIR,
      path: path.join(TEST_FUNC_DIR, 'package.json'),
      dir: TEST_FUNC_DIR,
      json: {
        name: "my-test-function"
      }
    })
  })
  it ('should find and parse package.json from a child directory', async () => {
    let cwd = path.join(TEST_FUNC_DIR, 'lib')
    let res = packageJSON({ cwd })
    expect(res).toMatchObject({
      cwd: cwd,
      path: path.join(TEST_FUNC_DIR, 'package.json'),
      dir: TEST_FUNC_DIR,
      json: {
        name: "my-test-function"
      }
    })
    console.log(JSON.stringify(res, null, 2))
  })
})

describe('Build and Dist Folders', () => {
  it ('should create and remove the build folder', async () => {
    let tmpdir = os.tmpdir()
    await createBuildFolder(tmpdir)
    expect(fs.existsSync(path.join(tmpdir, '.build'))).toBe(true)
    await removeBuildFolder(tmpdir)
    expect(fs.existsSync(path.join(tmpdir, '.build'))).toBe(false)
  })
  it ('should create and remove the dist folder', async () => {
    await createDistFolder(TEST_FUNC_DIR)
    expect(fs.existsSync(path.join(TEST_FUNC_DIR, 'dist'))).toBe(true)
    await removeDistFolder(TEST_FUNC_DIR)
    expect(fs.existsSync(path.join(TEST_FUNC_DIR, 'dist'))).toBe(false)
  })
})

describe('Copy User Code', () => {
  let tmpdir = os.tmpdir()
  let dirname = `.build-${Date.now()}`
  beforeEach(async () => {
    await createBuildFolder(tmpdir, { dirname })
  })
  afterEach(async () => {
    await removeBuildFolder(tmpdir, { dirname })
  })
  it ('should copy user code to the build folder', async () => {
    let builddir = path.join(tmpdir, dirname)
    await copyUserCode(TEST_FUNC_DIR, builddir, { exclude: [  "excludes", ".build" ] })
    expect(fs.existsSync(path.join(builddir, 'index.js'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'README.md'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'lib', 'lib.js'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'excludes'))).toBe(false)
    expect(fs.existsSync(path.join(builddir, 'excludes', 'shouldnotbecopied.txt'))).toBe(false)
  })
})