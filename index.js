var stringKey = require('@dwebs/codec').toStr
// var path = require('path')
var xtend = require('xtend')
var toiletdb = require('toiletdb')

module.exports = function (vault, opts) {
  if (!opts) opts = {}

  var db = toiletdb({name: '/dweb.json', fs: vault})
  var fileDb = opts.file ? toiletdb(opts.file) : null

  var that = {
    read: function (cb) {
      vault.stat('/dweb.json', function (err, stat) {
        if (err) return cb(err)
        db.read(cb)
      })
    },
    write: function (key, val, cb) {
      if (typeof val === 'function') cb = val
      if (!vault.writable) {
        return process.nextTick(cb, new Error('Vault not writable'))
      }
      if (typeof key === 'object') return writeAll(key, cb)
      // TODO: validate things
      if (!fileDb) return db.write(key, val, cb)

      fileDb.write(key, val, function (err) {
        if (err) return cb(err)
        db.write(key, val, cb)
      })
    },
    delete: db.delete,
    create: function (data, cb) {
      if (typeof data === 'function') return that.create(null, data)
      if (!vault.writable) {
        return process.nextTick(cb, new Error('Vault not writable'))
      }
      data = xtend(getdefaults(), data)
      that.write(data, cb)
    }
  }

  return that

  function getdefaults () {
    return {
      title: '',
      description: '',
      url: 'dweb://' + stringKey(vault.key)
    }
  }

  function writeAll (data, cb) {
    var keys = Object.keys(data)
    var pending = keys.length
    keys.map(function (key) {
      that.write(key, data[key], function (err) {
        if (err) return cb(err)
        if (!--pending) return cb()
      })
    })
  }
}
