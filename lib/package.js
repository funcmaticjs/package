const spawn = require('child_process').spawn

async function zip(srcdir, dst, options) {
  options = options || { }
  var command = `zip`
  var args = [ '-r', '-q',
    dst,
    '.'
  ]
  if (options.exclude) {
    args = args.concat([ "--exclude" ]).concat(options.exclude)
  }
  var options = { // this is where other options like role 
    cwd: srcdir,
    env: {
      "PATH": process.env.PATH
    }
  }
  return await spawnAsPromise(command, args, options)
}

async function npm(dir) {
  var command = 'npm'
  var args = [ 'install', '--production', '--silent' ]
  var options = {
    cwd: dir,
    env: {
      'PATH': process.env.PATH
    }
  }
  return await spawnAsPromise(command, args, options)
}

async function spawnAsPromise(command, args, options) {
  return new Promise((resolve, reject) => {
    var invokeLocal = spawn(command, args, options)
    invokeLocal.on('error', (err) => {
      reject(err)
    })
    invokeLocal.stdout.on('data', (data) => {
      var datastr = data.toString('utf-8')
      //console.log(datastr)
    })
    invokeLocal.stderr.on('data', (data) => {
      console.error(data.toString('utf-8'))
    })
    invokeLocal.on('exit', (code) => {
      if (code == 0) {
        resolve({ code: code, msg: 'DONE!', stdout: '', stderr: '' })
      } else {
        reject({ code: code, msg: `Failed: ${code}`, stdout: '', stderr: `Exited with code ${code}` })
      }
      return
    })
  })  
}

module.exports = {
  zip, 
  npm
}