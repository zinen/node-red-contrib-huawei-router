/* global describe, beforeEach, afterEach, it */
/* eslint-disable-next-line no-unused-vars */
const should = require('should')
const helper = require('node-red-node-test-helper')
const testNode = require('../huawei-router/huawei-mobiledata.js')
require('dotenv').config()

helper.init(require.resolve('node-red'))

describe('huawei-mobiledata Node', function () {
  this.retries(2)
  beforeEach(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload()
    helper.stopServer(done)
  })

  it('should be loaded', function (done) {
    const flow = [{ id: 'n1', type: 'huawei-mobiledata', name: 'huawei-mobiledata' }]
    helper.load(testNode, flow, function () {
      const n1 = helper.getNode('n1')
      n1.should.have.property('name', 'huawei-mobiledata')
      done()
    })
  })
  it('should turn data off-on', function (done) {
    const flow = [
      { id: 'n1', type: 'huawei-mobiledata', wires: [['n2']], user: process.env.ROUTER_USER, pass: process.env.ROUTER_PASSWORD, url: process.env.ROUTER_URL },
      { id: 'n2', type: 'helper' }
    ]
    helper.load(testNode, flow, function () {
      const n1 = helper.getNode('n1')
      const n2 = helper.getNode('n2')
      n2.on('input', function (msg) {
        msg.payload.should.equal('OK')
        msg.should.property('state').which.is.a.Number()
        msg.mode.should.equal('off-on')
        done()
      })
      n1.on('call:error', function (err) {
        console.error(err.firstArg)
        done(new Error(err.firstArg))
      })
      n1.receive({ payload: '', mode: 'off-on' })
    })
  })
})
