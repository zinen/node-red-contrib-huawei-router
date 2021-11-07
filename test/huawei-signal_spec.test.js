/* global describe, beforeEach, afterEach, it */
/* eslint-disable-next-line no-unused-vars */
const should = require('should')
const helper = require('node-red-node-test-helper')
const testNode = require('../huawei-router/huawei-signal.js')
require('dotenv').config()

helper.init(require.resolve('node-red'))

describe('huawei-signal Node', function () {
  this.retries(2)
  beforeEach(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload()
    helper.stopServer(done)
  })

  it('should be loaded', function (done) {
    const flow = [{ id: 'n1', type: 'huawei-signal', name: 'huawei-signal' }]
    helper.load(testNode, flow, function () {
      const n1 = helper.getNode('n1')
      n1.should.have.property('name', 'huawei-signal')
      done()
    })
  })
  it('should return values', function (done) {
    const flow = [
      {
        id: 'n0',
        type: 'huawei-config',
        user: process.env.ROUTER_USER,
        pass: process.env.ROUTER_PASSWORD,
        url: process.env.ROUTER_URL
      },
      { id: 'n1', type: 'huawei-signal', wires: [['n2']], server: 'n0' },
      { id: 'n2', type: 'helper' }
    ]

    helper.load(testNode, flow, function () {
      const c1 = helper.getNode('c1')
      const n1 = helper.getNode('n1')
      const n2 = helper.getNode('n2')
      n2.on('input', function (msg) {
        msg.payload.should.be.Object()
        msg.payload.should.not.be.empty()
        done()
      })
      n1.on('call:error', function (err) {
        console.error(err.firstArg)
        done(new Error(err.firstArg))
      })
      c1.on('input', function (msg) {
        console.log(msg)
      })
      n1.receive({ payload: '' })
    })
  })
})
