var through = require('through')
  , xtend = require('xtend')
  , jstransform = require('jstransform')
  , createVisitors = require('./visitors')

var processEnvPattern = /\bprocess\.env\b/

module.exports.transform = function transform(source) {
  if (processEnvPattern.test(source)) {
    return jstransform.transform(createVisitors(env), source).code
  }
}

module.exports = function(rootEnv) {
  rootEnv = rootEnv || process.env || {}

  return function envify(file, argv) {
    if (/\.json$/.test(file)) return through()

    var buffer = []
    var env = argv
      ? xtend(rootEnv, argv)
      : rootEnv

    return through(write, flush)

    function write(data) {
      buffer.push(data)
    }

    function flush() {
      var source = buffer.join('')

      try {
          source = transform(source);
      } catch(err) {
        return this.emit('error', err)
      }

      this.queue(source)
      this.queue(null)
    }
  }
}
