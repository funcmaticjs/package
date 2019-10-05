const os = require('os')
const path = require('path')
const fs = require('fs-extra')

const USERCONFIG_KEY = "@funcmaticjs/package"
const DEFAULT_EXCLUDES = [ "node_modules" ]

function getConfig(options) {
  options = options || { }
  let config = { }

  // cwd: we start with either a manually set cwd or the dir where the process is executed from
  config.cwd = options.cwd || process.cwd() 

  let { name, dir, src, json } = packageJSON({ cwd: config.cwd })
  let userConfig = json[USERCONFIG_KEY] || { }

  // src: where the code we will package lives 
  config.src = userConfig.src || dir
  config.src_rel = path.relative(config.cwd, config.src)

  // dist: where we will drop the packaged zip file
  config.dist = userConfig.dist || path.join(config.src, "dist")
  config.dist_rel = path.relative(config.cwd, config.dist)
  config.name = userConfig.name || `${name}.zip`

  // build: where we will copy code and run 'npm install'
  config.build = userConfig.build || path.join(os.tmpdir(), `build-${Date.now()}`)
  config.build_rel = path.relative(config.cwd, config.build)

  // exclude the following when we copy files from src -> build
  config.exclude = DEFAULT_EXCLUDES.concat([ config.dist ]).concat(userConfig.exclude || [ ]) 

  return config
}

function ensureSetup(config) {
  if (config.build) fs.mkdirpSync(config.build)
  if (config.dist) {
    fs.mkdirpSync(config.dist)
    fs.removeSync(path.join(config.dist, config.name))
  }
}

function packageJSON({ cwd }) {
  // we find the package.json from this (recursing back until we find one)
  var packageJsonPath = findParentPkgDesc(cwd)
 
  // if we could not find a package.json in the heirarchy we error
  if (!packageJsonPath) throw new Error("No package.json could be found")

  let packageDotJson = JSON.parse(fs.readFileSync(packageJsonPath))

  return {
    cwd,
    path: packageJsonPath,
    dir: path.join(packageJsonPath, '..'),
    json: packageDotJson,
    name: functionName(packageDotJson)
  }
}

function functionName(packageDotJson) {
  let name = packageDotJson.name || "function"
  return name.replace('@', '').replace('/', '-')
}

/**
 * https://gist.github.com/fhellwig/3355047
 * Finds the pathname of the parent module's package descriptor file. If the
 * directory is undefined (the default case), then it is set to the directory
 * name of the parent module's filename. If no package.json file is found, then
 * the parent directories are recursively searched until the file is found or
 * the root directory is reached. Returns the pathname if found or null if not.
 */
function findParentPkgDesc(directory) {
  if (!directory) {
      directory = path.dirname(module.parent.filename);
  }
  var file = path.resolve(directory, 'package.json');
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      return file;
  }
  var parent = path.resolve(directory, '..');
  if (parent === directory) {
      return null;
  }
  return findParentPkgDesc(parent);
}

function createBuildFolder(dirpath, options) {
  options = options || { }
  let dirname = options.dirname || ".build"
  let fullpath = path.join(dirpath, dirname)
  fs.mkdirpSync(fullpath)
  return fullpath
}

function removeBuildFolder(dirpath, options) {
  options = options || { }
  let dirname = options.dirname || ".build"
  let fullpath = path.join(dirpath, dirname)
  fs.removeSync(fullpath)
  return fullpath
}

function createDistFolder(dirpath, options) {
  options = options || { }
  let dirname = options.dist || "dist"
  let fullpath = path.join(dirpath, dirname)
  fs.mkdirpSync(fullpath)
  return fullpath
}

function removeDistFolder(dirpath, options) {
  options = options || { }
  let dirname = options.dirname || "dist"
  let fullpath = path.join(dirpath, dirname)
  fs.removeSync(fullpath)
  return fullpath
}

// copy everything except 
async function copyUserCode(srcdir, dstdir, options) {
  //console.log(`copying ${srcdir} to ${dstdir}`)
  options = options || { }
  let excludes = options.exclude || DEFAULT_EXCLUDES
  let filter = (src, dst) => {
    if (src == srcdir) return true
    for (let s of excludes) {
      let excludepath = s
      if (!path.isAbsolute(s)) { // e.g. "tmp"
        excludepath = path.join(srcdir, s)
      }
      if (src.startsWith(excludepath)) {
        return false
      }
    }
    return true
  }
  fs.copySync(srcdir, dstdir, { filter })
  return
}

// zip

function copyPackageFromBuildDir(options) {
  var src = `${__dirname}/../test/index_98a63ec9-4b9b-493e-85be-bf00e080a4ab.zip`
  var dest = `${getBaseDir()}/index.zip`
  fs.copyFileSync(src, dest)
  return dest
}

module.exports = {
  getConfig,
  ensureSetup,
  packageJSON,
  functionName,
  createDistFolder,
  removeDistFolder,
  removeBuildFolder,
  createBuildFolder,
  copyUserCode
}