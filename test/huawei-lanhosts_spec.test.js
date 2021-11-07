/* global describe, before, after, afterEach, it */
/* eslint-disable-next-line no-unused-vars */
const should = require('should')
const helper = require('node-red-node-test-helper')
const testNode = require('../huawei-router/huawei-router.js')
require('dotenv').config()

helper.init(require.resolve('node-red'))

describe('huawei-lanhosts Node', function () {
  this.retries(2)
  before(function (done) {
    helper.startServer(done)
  })

  after(function (done) {
    helper.stopServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  it('should be loaded', function (done) {
    const flow = [{ id: 'n1', type: 'huawei-lanhosts', name: 'huawei-lanhosts' }]
    helper.load(testNode, flow, function () {
      const n1 = helper.getNode('n1')
      n1.should.have.property('name', 'huawei-lanhosts')
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
      { id: 'n1', type: 'huawei-lanhosts', wires: [['n2']], server: 'n0' },
      { id: 'n2', type: 'helper' }
    ]
    helper.load(testNode, flow, function () {
      helper.getNode('n0')
      const n1 = helper.getNode('n1')
      const n2 = helper.getNode('n2')
      n2.on('input', function (msg) {
        // console.log(msg)
        msg.payload.should.be.Array()
        msg.payload.should.not.be.empty()
        msg.payload[0].should.property('MacAddress').which.is.a.String()
        msg.payload[0].should.property('ID').which.is.a.String()
        msg.payload[0].should.property('IpAddress').which.is.a.String()
        msg.payload[0].should.property('AssociatedTime').which.is.a.String()
        msg.payload[0].should.property('HostName').which.is.a.String()
        done()
      })
      n1.on('call:error', function (err) {
        console.error(err.firstArg)
        done(new Error(err.firstArg))
      })
      n1.receive({ payload: '' })
    })
  })
})
