module.exports = function (RED) {
  function HuaweiSignal (config) {
    const huaweiLteApi = require('huawei-lte-api')
    RED.nodes.createNode(this, config)
    this.url = 'http://' + config.user + ':' + config.pass + '@' + config.url
    var node = this
    node.on('input', async function (msg, send, done) {
      const connection = new huaweiLteApi.Connection(node.url)
      const device = new huaweiLteApi.Device(connection)
      connection.ready.then(() => {
        device.signal().then((result) => {
          msg.payload = result
          send(msg)
          done()
        }).catch((error) => {
          done(error)
        })
      }).catch(function (error) {
        done(error)
      })
    })
  }
  RED.nodes.registerType('huawei-signal', HuaweiSignal)
}
