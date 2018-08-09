var fs = require('fs')
var path = require('path')
var test = require('tape')
var ddrive = require('@ddrive/core')
var dwrem = require('@dwcore/rem')
var dWebJson = require('..')

test('Default dweb.json', function (t) {
  var vault = ddrive(dwrem)
  vault.ready(function () {
    var dwebjson = dWebJson(vault)
    dwebjson.read(function (err) {
      t.ok(err, 'error read before write')
      dwebjson.create({name: 'test'}, function (err) {
        t.error(err, 'no error')

        dwebjson.read(function (err, data) {
          t.error(err, 'no error')
          t.ok(data, 'has metadata')
          t.same(data.url, `dweb://${vault.key.toString('hex')}`)
          t.same(data.name, 'test', 'has name value')
          t.end()
        })
      })
    })
  })
})

test('Write dweb.json to vault', function (t) {
  var vault = ddrive(dwrem)
  vault.ready(function () {
    var dwebjson = dWebJson(vault)
    dwebjson.create(function (err) {
      t.error(err, 'no error')
      dwebjson.write({specialVal: 'cat'}, check)

      function check (err) {
        t.error(err, 'no error')
        dwebjson.read(function (err, data) {
          t.error(err, 'no error')
          t.ok(data, 'has metadata')
          t.same(data.url, `dweb://${vault.key.toString('hex')}`, 'url ok')
          t.same(data.specialVal, 'cat', 'has special value')
          t.end()
        })
      }
    })
  })
})

test('.create with no writable vault errors', function (t) {
  var vault = { writable: false }
  var dwebjson = dWebJson(vault)
  var async = false
  dwebjson.create(function (err) {
    t.is(err.message, 'Vault not writable', 'should error')
    t.is(async, true, 'callback is asyncronous')
    t.end()
  })
  async = true
})

test('.write with key/value and no writable vault errors', function (t) {
  var vault = { writable: false }
  var dwebjson = dWebJson(vault)
  var async = false
  dwebjson.write('key', 'value', function (err) {
    t.is(err.message, 'Vault not writable', 'should error')
    t.is(async, true, 'callback is asyncronous')
    t.end()
  })
  async = true
})

test('.write with data object and no writable vault errors', function (t) {
  var vault = { writable: false }
  var dwebjson = dWebJson(vault)
  var async = false
  dwebjson.write({specialVal: 'cat'}, function (err) {
    t.is(err.message, 'Vault not writable', 'should error')
    t.is(async, true, 'callback is asyncronous')
    t.end()
  })
  async = true
})

test('Write dweb.json to file and vault', function (t) {
  var vault = ddrive(dwrem)
  var file = path.join(__dirname, 'dweb.json')
  vault.ready(function () {
    var dwebjson = dWebJson(vault, {file: file})
    dwebjson.create(function (err) {
      t.error(err, 'no error')
      dwebjson.write({specialVal: 'cat'}, checkFile)

      function checkFile (err) {
        t.error(err, 'no error')
        fs.readFile(file, 'utf-8', function (err, data) {
          data = JSON.parse(data)
          t.error(err, 'fs no error')
          t.ok(data, 'fs has metadata')
          t.same(data.url, `dweb://${vault.key.toString('hex')}`, 'fs url ok')
          t.same(data.specialVal, 'cat', 'fs has special value')
          fs.unlinkSync(file)
          checkRead()
        })
      }

      function checkRead (err) {
        t.error(err, 'no error')
        dwebjson.read(function (err, data) {
          t.error(err, 'no error')
          t.ok(data, 'has metadata')
          t.same(data.url, `dweb://${vault.key.toString('hex')}`, 'url ok')
          t.same(data.specialVal, 'cat', 'has special value')
          t.end()
        })
      }
    })
  })
})
