const path = require('path')
const TEST_FUNC_DIR = path.join(__dirname, 'func')
const { getConfig, packageJSON, copyUserCode } = require('../lib/file')
const fs = require('fs-extra')
const os = require('os')

describe('Config', () => {
  it ('should get config values', async () => {
    let config = getConfig({ cwd: TEST_FUNC_DIR })
    expect(config).toMatchObject({
      "cwd": TEST_FUNC_DIR,
      "src": TEST_FUNC_DIR,
      "src_rel": "",
      "dist": path.join(TEST_FUNC_DIR, "dist"),
      "dist_rel": "dist",
      "name": "my-test-function.zip",
      "build": expect.stringMatching(/var\/folders\//),
      "build_rel": expect.anything(),
      "exclude": [
        "node_modules",
        expect.stringMatching(/dist$/),
        "tmp"
      ]
    })
  })
})

describe('Package JSON', () => {
  it ('should find and parse package.json in current directory', async () => {
    let res = packageJSON({ cwd: TEST_FUNC_DIR })
    expect(res).toMatchObject({
      cwd: TEST_FUNC_DIR,
      path: path.join(TEST_FUNC_DIR, 'package.json'),
      dir: TEST_FUNC_DIR,
      json: {
        name: "my-test-function",
        "@funcmaticjs/package": {
          exclude: [ "tmp" ]
        }
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
  })
})

describe('fs.copySync', () => {
  let tmpdir = os.tmpdir()
  let dirname = `build-${Date.now()}`
  let builddir = path.join(tmpdir, dirname)
  beforeEach(async () => {
    fs.mkdirpSync(builddir)
  })
  it ('should fs.copySync with a filter function', async () => {
    let srcs = [ ]
    let filter = (src, dst) => {
      if (src == TEST_FUNC_DIR) return true
      if (src.startsWith(path.join(TEST_FUNC_DIR, 'tmp'))) {
        srcs.push(src)
        return true
      }
      return false
    }
    fs.copySync(TEST_FUNC_DIR, builddir, { filter })
    expect(srcs).toEqual([
      path.join(TEST_FUNC_DIR, 'tmp'),
      path.join(TEST_FUNC_DIR, 'tmp', 'shouldnotbecopied.txt')
    ])
  })
})

describe('Copy User Code', () => {
  let tmpdir = os.tmpdir()
  let dirname = `build-${Date.now()}`
  beforeEach(async () => {
    fs.mkdirpSync(path.join(tmpdir, dirname))
  })
  afterEach(async () => {
    fs.removeSync(path.join(tmpdir, dirname))
  })
  it ('should copy user code to the build folder using relative paths', async () => {
    let builddir = path.join(tmpdir, dirname)
    await copyUserCode(TEST_FUNC_DIR, builddir, { exclude: [ "tmp", "dist", "node_modules" ] })
    expect(fs.existsSync(path.join(builddir, 'index.js'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'README.md'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'lib', 'lib.js'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'tmp'))).toBe(false)
    expect(fs.existsSync(path.join(builddir, 'tmp', 'shouldnotbecopied.txt'))).toBe(false)
    expect(fs.existsSync(path.join(builddir, 'dist'))).toBe(false)
    expect(fs.existsSync(path.join(builddir, 'node_modules'))).toBe(false)
  })
  it ('should copy user code to the build folder using absolute paths', async () => {
    let builddir = path.join(tmpdir, dirname)
    await copyUserCode(TEST_FUNC_DIR, builddir, { exclude: [ 
      path.join(TEST_FUNC_DIR, "tmp"), 
      path.join(TEST_FUNC_DIR, "dist"),
      path.join(TEST_FUNC_DIR, "node_modules")
    ] })
    expect(fs.existsSync(path.join(builddir, 'index.js'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'README.md'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'lib', 'lib.js'))).toBe(true)
    expect(fs.existsSync(path.join(builddir, 'tmp'))).toBe(false)
    expect(fs.existsSync(path.join(builddir, 'tmp', 'shouldnotbecopied.txt'))).toBe(false)
    expect(fs.existsSync(path.join(builddir, 'dist'))).toBe(false)
    expect(fs.existsSync(path.join(builddir, 'node_modules'))).toBe(false)
  })
})