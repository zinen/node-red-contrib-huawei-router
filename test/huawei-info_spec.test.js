/* global describe, before, after, afterEach, it */
/* eslint-disable-next-line no-unused-vars */
const should = require('should')
const helper = require('node-red-node-test-helper')
const testNode = require('../huawei-router/huawei-router.js')
require('dotenv').config()

helper.init(require.resolve('node-red'))

describe('huawei-info Node', function () {
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
    const flow = [{ id: 'n1', type: 'huawei-info', name: 'huawei-info' }]
    helper.load(testNode, flow, function () {
      const n1 = helper.getNode('n1')
      n1.should.have.property('name', 'huawei-info')
      done()
    })
  })
  it('should return monitor status info', function (done) {
    const flow = [
      {
        id: 'n0',
        type: 'huawei-config',
        url: process.env.ROUTER_URL
      },
      { id: 'n1', type: 'huawei-info', wires: [['n2']], server: 'n0', infoOption: 'Monitor-status' },
      { id: 'n2', type: 'helper' }
    ]
    const testCredentials = {
      n0: {
        user: process.env.ROUTER_USER,
        pass: process.env.ROUTER_PASSWORD,
      }
    }
    helper.load(testNode, flow, testCredentials, function () {
      helper.getNode('n0')
      const n1 = helper.getNode('n1')
      const n2 = helper.getNode('n2')
      n2.on('input', function (msg) {
        msg.payload.should.not.be.empty()
        msg.payload.should.be.Object()
        done()
      })
      n1.on('call:error', function (err) {
        console.error(err.firstArg)
        done(new Error(err.firstArg))
      })
      n1.receive({ payload: '' })
    })
  })

  it('should return lanhosts', function (done) {
    const flow = [
      {
        id: 'n0',
        type: 'huawei-config',
        url: process.env.ROUTER_URL
      },
      { id: 'n1', type: 'huawei-info', wires: [['n2']], server: 'n0', infoOption: 'Lan-hostInfo' },
      { id: 'n2', type: 'helper' }
    ]
    const testCredentials = {
      n0: {
        user: process.env.ROUTER_USER,
        pass: process.env.ROUTER_PASSWORD,
      }
    }
    helper.load(testNode, flow, testCredentials, function () {
      helper.getNode('n0')
      const n1 = helper.getNode('n1')
      const n2 = helper.getNode('n2')
      n2.on('input', function (msg) {
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

  it('should return wlanhosts', function (done) {
    const flow = [
      {
        id: 'n0',
        type: 'huawei-config',
        url: process.env.ROUTER_URL
      },
      { id: 'n1', type: 'huawei-info', wires: [['n2']], server: 'n0', infoOption: 'Lan-hostInfo' },
      { id: 'n2', type: 'helper' }
    ]
    const testCredentials = {
      n0: {
        user: process.env.ROUTER_USER,
        pass: process.env.ROUTER_PASSWORD,
      }
    }
    helper.load(testNode, flow, testCredentials, function () {
      helper.getNode('n0')
      const n1 = helper.getNode('n1')
      const n2 = helper.getNode('n2')
      n2.on('input', function (msg) {
        msg.payload.should.be.Array()
        msg.payload.should.not.be.empty()
        msg.payload[0].should.property('MacAddress').which.is.a.String()
        msg.payload[0].should.property('ID').which.is.a.String()
        msg.payload[0].should.property('IpAddress').which.is.a.String()
        msg.payload[0].should.property('AssociatedSsid').which.is.a.String()
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

  it('should return signal info', function (done) {
    const flow = [
      {
        id: 'n0',
        type: 'huawei-config',
        url: process.env.ROUTER_URL
      },
      { id: 'n1', type: 'huawei-info', wires: [['n2']], server: 'n0', infoOption: 'signal' },
      { id: 'n2', type: 'helper' }
    ]
    const testCredentials = {
      n0: {
        user: process.env.ROUTER_USER,
        pass: process.env.ROUTER_PASSWORD,
      }
    }
    helper.load(testNode, flow, testCredentials, function () {
      helper.getNode('n0')
      const n1 = helper.getNode('n1')
      const n2 = helper.getNode('n2')
      n2.on('input', function (msg) {
        msg.payload.should.be.Object()
        msg.payload.should.not.be.empty()
        msg.payload.should.property('rsrq').which.is.a.String()
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
