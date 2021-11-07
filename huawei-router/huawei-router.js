module.exports = function (RED) {
  'use strict'
  const huaweiLteApi = require('huawei-lte-api')
  function HuaweiConfig (n) {
    RED.nodes.createNode(this, n)
    const node = this
    node.connect = function () {
      const self = this
      self.now = (new Date()).getTime()
      if (self.now >= self.sessionTimeout) {
        self.connection = null
      }
      // Add 5 minutes to current time
      self.sessionTimeout = self.now + 300000

      return new Promise((resolve, reject) => {
        if (!self.connection) {
          self.connection = new huaweiLteApi.Connection('http://' + n.user + ':' + n.pass + '@' + n.url)
          self.connection.ready
            .then(() => {
              resolve(self.connection)
            })
            .catch((err) => {
              // catched here here: no connection router, wrong login, wrong ip/hostname, already logged in
              self.connection = null
              reject(err.message)
            })
        } else {
          resolve(self.connection)
        }
      })
    }
    node.on('close', function (removed, done) {
      if (removed) {
        // This node has been disabled/deleted
        // delete node.connection
      } else {
        // This node is being restarted
        // node.connection = null
      }
      done()
    })
  }
  RED.nodes.registerType('huawei-config', HuaweiConfig)
  function HuaweiLanHosts (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      if (node.server.connect == null) {
        done('No config specified')
        return
      }
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
  function HuaweiMobileData (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      const allowedModes = ['on', 1, true, 'off', 0, false, 'toggle', 'off-on']
      let mode = msg.mode || node.mode || 'off-on'
      mode = mode.toLowerCase()
      if (!allowedModes.includes(mode)) {
        done('Input mode is not understood')
        return
      }
      node.server = RED.nodes.getNode(config.server)
      if (node.server.connect == null) {
        done('No config specified')
        return
      }
      try {
        const dialUp = new huaweiLteApi.DialUp(await node.server.connect())
        if (mode === 'on' || mode === 1 || mode === true) {
          dialUp.setMobileDataswitch(1).then(function (result) {
            msg.payload = result
            msg.state = result === 'OK' ? 1 : 0
            send(msg)
            done()
          }).catch(function (error) {
            done(error)
          })
        } else if (mode === 'off' || mode === 0 || mode === false) {
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
  function HuaweiSignal (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      if (node.server.connect == null) {
        done('No config specified')
        return
      }
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

  function HuaweiWlanHosts (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      if (node.server.connect == null) {
        done('No config specified')
        return
      }
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
  function HuaweiReboot (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      if (node.server.connect == null) {
        done('No config specified')
        return
      }
      try {
        const device = new huaweiLteApi.Device(await node.server.connect())
        device.reboot().then(function (result) {
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
  RED.nodes.registerType('huawei-reboot', HuaweiReboot)
}
