module.exports = function (RED) {
  'use strict'
  const huaweiLteApi = require('huawei-lte-api')
  function HuaweiWlanHosts (config) {
    RED.nodes.createNode(this, config)
    // this.url = 'http://' + config.user + ':' + config.pass + '@' + config.url
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      try {
        const device = new huaweiLteApi.WLan(await node.server.connect())
        device.hostList().then(function (result) {
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
  RED.nodes.registerType('huawei-wlanhosts', HuaweiWlanHosts)
}
