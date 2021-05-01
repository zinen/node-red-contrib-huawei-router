module.exports = function (RED) {
  function HuaweiLanHosts (config) {
    const huaweiLteApi = require('huawei-lte-api')
    RED.nodes.createNode(this, config)
    this.url = 'http://' + config.user + ':' + config.pass + '@' + config.url
    var node = this
    node.on('input', async function (msg, send, done) {
      const connection = new huaweiLteApi.Connection(node.url)
      connection.ready.then(() => {
        const lan = new huaweiLteApi.Lan(connection)
        lan.hostInfo().then(function (result) {
          msg.payload = result.Hosts.Host
          send(msg)
          done()
        }).catch(function (error) {
          done(error)
        })
      }).catch(function (error) {
        done(error)
      })
    })
  }
  RED.nodes.registerType('huawei-lanhosts', HuaweiLanHosts)
}
