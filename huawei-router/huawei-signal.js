module.exports = function (RED) {
  'use strict'
  const huaweiLteApi = require('huawei-lte-api')
  function HuaweiSignal (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      try {
        const device = new huaweiLteApi.Device(await node.server.connect())
        device.signal().then(function (result) {
          msg.payload = result
          send(msg)
          done()
        }).catch(function (error) {
          done(error)
        })
      } catch (error) {
        done(error)
      }
    })
  }
  RED.nodes.registerType('huawei-signal', HuaweiSignal)
}
