module.exports = function (RED) {
  function HuaweiRouterNode (config) {
    const huaweiLteApi = require('huawei-lte-api')
    RED.nodes.createNode(this, config)
    this.url = 'http://' + config.user + ':' + config.pass + '@' + config.url
    var node = this
    node.on('input', async function (msg, send, done) {
      const connection = new huaweiLteApi.Connection(node.url)
      connection.ready.then(() => {
        const device = new huaweiLteApi.WLan(connection)
        device.hostList().then(function (result) {
          console.log(result)
          msg.payload = result
          send(msg)
          done()
        }).catch(function (error) {
          console.log(error)
          done(error)
        })
      })
    })
  }
  RED.nodes.registerType('huawei-router', HuaweiRouterNode)
}
