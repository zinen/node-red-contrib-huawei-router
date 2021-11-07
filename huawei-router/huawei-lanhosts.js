module.exports = function (RED) {
  'use strict'
  const huaweiLteApi = require('huawei-lte-api')
  function HuaweiLanHosts (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      try {
        const lan = new huaweiLteApi.Lan(await node.server.connect())
        lan.hostInfo().then(function (result) {
          msg.payload = result.Hosts.Host
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
  RED.nodes.registerType('huawei-lanhosts', HuaweiLanHosts)
}
