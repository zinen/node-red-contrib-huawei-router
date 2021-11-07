module.exports = function (RED) {
  'use strict'
  const huaweiLteApi = require('huawei-lte-api')
  function HuaweiMobileData (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      const allowedModes = ['on', 1, 'off', 0, 'toggle', 'off-on']
      let mode = msg.mode || node.mode || 'off-on'
      mode = mode.toLowerCase()
      if (!allowedModes.includes(mode)) {
        done('Input mode is not understood')
        return
      }
      node.server = RED.nodes.getNode(config.server)
      try {
        const dialUp = new huaweiLteApi.DialUp(await node.server.connect())
        if (mode === 'on' || mode === 1) {
          dialUp.setMobileDataswitch(1).then(function (result) {
            msg.payload = result
            msg.state = result === 'OK' ? 1 : 0
            send(msg)
            done()
          }).catch(function (error) {
            done(error)
          })
        } else if (mode === 'off' || mode === 0) {
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
      } catch (error) {
        done(error)
      }
    })
  }
  RED.nodes.registerType('huawei-mobiledata', HuaweiMobileData)
}
