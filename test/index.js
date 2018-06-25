var fs = require('fs')
var path = require('path')
var test = require('tape')
var ddrive = require('@ddrive/core')
var dwrem = require('@dwcore/rem')
var dPackJSON = require('..')

test('Default dpack.json', function (t) {
  var vault = ddrive(ram)
  vault.ready(function () {
    var dpackjson = dPackJSON(vault)
    dpackjson.read(function (err) {
      t.ok(err, 'error read before write')
      dpackjson.create({name: 'test'}, function (err) {
        t.error(err, 'no error')

        dpackjson.read(function (err, data) {
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

test('Write dpack.json to vault', function (t) {
  var vault = ddrive(ram)
  vault.ready(function () {
    var dpackjson = dPackJSON(vault)
    dpackjson.create(function (err) {
      t.error(err, 'no error')
      dpackjson.write({specialVal: 'cat'}, check)

      function check (err) {
        t.error(err, 'no error')
        dpackjson.read(function (err, data) {
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
  var dpackjson = dPackJSON(vault)
  var async = false
  dpackjson.create(function (err) {
    t.is(err.message, 'Vault not writable', 'should error')
    t.is(async, true, 'callback is asyncronous')
    t.end()
  })
  async = true
})

test('.write with key/value and no writable vault errors', function (t) {
  var vault = { writable: false }
  var dpackjson = dPackJSON(vault)
  var async = false
  dpackjson.write('key', 'value', function (err) {
    t.is(err.message, 'Vault not writable', 'should error')
    t.is(async, true, 'callback is asyncronous')
    t.end()
  })
  async = true
})

test('.write with data object and no writable vault errors', function (t) {
  var vault = { writable: false }
  var dpackjson = dPackJSON(vault)
  var async = false
  dpackjson.write({specialVal: 'cat'}, function (err) {
    t.is(err.message, 'Vault not writable', 'should error')
    t.is(async, true, 'callback is asyncronous')
    t.end()
  })
  async = true
})

test('Write dpack.json to file and vault', function (t) {
  var vault = ddrive(ram)
  var file = path.join(__dirname, 'dpack.json')
  vault.ready(function () {
    var dpackjson = dPackJSON(vault, {file: file})
    dpackjson.create(function (err) {
      t.error(err, 'no error')
      dpackjson.write({specialVal: 'cat'}, checkFile)

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
        dpackjson.read(function (err, data) {
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
