module.exports = function (RED) {
  function HuaweiMobileData (config) {
    const huaweiLteApi = require('huawei-lte-api')
    RED.nodes.createNode(this, config)
    this.url = 'http://' + config.user + ':' + config.pass + '@' + config.url
    var node = this

    node.on('input', async function (msg, send, done) {
      const allowedModes = ['on', 'off', 'toggle', 'off-on']
      let mode = msg.mode || node.mode || 'off-on'
      mode = mode.toLowerCase()
      if (!allowedModes.includes(mode)) {
        done('Input mode is not understood')
        return
      }
      const connection = new huaweiLteApi.Connection(node.url)
      connection.ready.then(() => {
        const dialUp = new huaweiLteApi.DialUp(connection)
        if (mode === 'on') {
          dialUp.setMobileDataswitch(1).then(function (result) {
            msg.payload = result
            msg.state = result === 'OK' ? 1 : 0
            send(msg)
            done()
          }).catch(function (error) {
            done(error)
          })
        } else if (mode === 'off') {
          dialUp.setMobileDataswitch(0).then(function (result) {
            msg.payload = result
            msg.state = result === 'OK' ? 0 : 1
            send(msg)
            done()
          }).catch(function (error) {
            done(error)
          })
        } else if (mode === 'toggle') {
          dialUp.mobileDataswitch().then(function ({ dataswitch }) {
            dialUp.setMobileDataswitch(1 - Number(dataswitch)).then(function (result) {
              msg.payload = result
              msg.state = result === 'OK' ? 1 - Number(dataswitch) : Number(dataswitch)
              send(msg)
              done()
            }).catch(function (error) {
              done(error)
            })
          }).catch(function (error) {
            done(error)
          })
        } else if (mode === 'off-on') {
          dialUp.setMobileDataswitch(0).then(function () {
            dialUp.setMobileDataswitch(1).then(function (result) {
              msg.payload = result
              msg.state = result === 'OK' ? 1 : 0
              send(msg)
              done()
            }).catch(function (error) {
              done(error)
            })
          }).catch(function (error) {
            done(error)
          })
        }
      }).catch(function (error) {
        done(error)
      })
    })
  }
  RED.nodes.registerType('huawei-mobiledata', HuaweiMobileData)
}
