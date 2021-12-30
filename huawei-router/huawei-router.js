module.exports = function (RED) {
  'use strict'
  const huaweiLteApi = require('huawei-lte-api')
  function HuaweiConfig (n) {
    RED.nodes.createNode(this, n)
    const node = this
    node.connect = async function () {
      try {
        this.now = (new Date()).getTime()
        // On timeout a new session should be made
        if (this.now >= this.sessionTimeout) {
          this.connection = null
        }
        // Add 298 seconds to current time as timeout
        this.sessionTimeout = node.now + 298000
        if (!this.connection) {
          // Make new session
          this.connection = new huaweiLteApi.Connection(`http://${n.user}:${n.pass}@${n.url}`)
          await this.connection.ready
        }
        return this.connection
      } catch (error) {
        this.connection = null
        throw error
      }
    }
    node.on('close', async function (removed, done) {
      try {
        if ((new Date()).getTime() < node.sessionTimeout) {
          const user = new huaweiLteApi.User(await this.connect())
          await user.logout()
        }
      } finally {
        if (removed) {
          // This node has been disabled/deleted
          delete this.connection
        } else {
          // This node is being restarted/stopped
          this.connection = null
        }
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
      node.status({ fill: '', shape: 'dot', text: 'Connecting' })
      try {
        const lan = new huaweiLteApi.Lan(await node.server.connect())
        const result = await lan.hostInfo()
        msg.payload = result.Hosts.Host
        node.status({ text: '' })
        send(msg)
        done()
      } catch (error) {
        if (error.code === 125002 || error.code === 125003) {
          // Make sure the session timeout happens on session error (125002/125003)
          node.server.sessionTimeout = 0
        }
        node.status({ fill: 'red', text: error.message })
        done(error.message)
      }
    })
  }
  RED.nodes.registerType('huawei-lanhosts', HuaweiLanHosts)

  function HuaweiMobileData (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.mode = config.mode
    node.on('input', async function (msg, send, done) {
      const allowedModes = ['on', 1, true, 'off', 0, false, 'toggle', 'off-on']
      if (typeof (msg.mode) === 'undefined') {
        msg.mode = node.mode
      } else if (typeof (msg.mode) === 'string') { msg.mode = msg.mode.toLowerCase() }
      if (!allowedModes.includes(msg.mode)) {
        done('Input mode is not understood')
        return
      }
      node.server = RED.nodes.getNode(config.server)
      node.status({ fill: '', shape: 'dot', text: 'Connecting' })
      try {
        const dialUp = new huaweiLteApi.DialUp(await node.server.connect())
        if (msg.mode === 'on' || msg.mode === 1 || msg.mode === true) {
          const result = await dialUp.setMobileDataswitch(1)
          msg.payload = result
          msg.state = result === 'OK' ? 1 : 0
          send(msg)
        } else if (msg.mode === 'off' || msg.mode === 0 || msg.mode === false) {
          const result = await dialUp.setMobileDataswitch(0)
          msg.payload = result
          msg.state = result === 'OK' ? 0 : 1
          send(msg)
        } else if (msg.mode === 'toggle') {
          const { dataswitch } = await dialUp.mobileDataswitch()
          const result = await dialUp.setMobileDataswitch(1 - Number(dataswitch))
          msg.payload = result
          msg.state = result === 'OK' ? 1 - Number(dataswitch) : Number(dataswitch)
          send(msg)
        } else if (msg.mode === 'off-on') {
          await dialUp.setMobileDataswitch(0)
          const result = await dialUp.setMobileDataswitch(1)
          msg.payload = result
          msg.state = result === 'OK' ? 1 : 0
          send(msg)
        }
      } catch (error) {
        if (error.code === 125002 || error.code === 125003) {
          // Make sure the session timeout happens on session error (125002/125003)
          node.server.sessionTimeout = 0
        }
        node.status({ fill: 'red', text: error.message })
        done(error.message)
        return
      }
      node.status({ text: '' })
      done()
    })
  }
  RED.nodes.registerType('huawei-mobiledata', HuaweiMobileData)

  function HuaweiSignal (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      node.status({ fill: '', shape: 'dot', text: 'Connecting' })
      try {
        const device = new huaweiLteApi.Device(await node.server.connect())
        const result = await device.signal()
        msg.payload = result
        node.status({ text: '' })
        send(msg)
        done()
      } catch (error) {
        if (error.code === 125002 || error.code === 125003) {
          // Make sure the session timeout happens on session error (125002/125003)
          node.server.sessionTimeout = 0
        }
        node.status({ fill: 'red', text: error.message })
        done(error.message)
      }
    })
  }
  RED.nodes.registerType('huawei-signal', HuaweiSignal)

  function HuaweiWlanHosts (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      node.status({ fill: '', shape: 'dot', text: 'Connecting' })
      try {
        const device = new huaweiLteApi.WLan(await node.server.connect())
        const result = await device.hostList()
        msg.payload = result
        node.status({ text: '' })
        send(msg)
        done()
      } catch (error) {
        if (error.code === 125002 || error.code === 125003) {
          // Make sure the session timeout happens on session error (125002/125003)
          node.server.sessionTimeout = 0
        }
        node.status({ fill: 'red', text: error.message })
        done(error.message)
      }
    })
  }
  RED.nodes.registerType('huawei-wlanhosts', HuaweiWlanHosts)

  function HuaweiReboot (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      node.server = RED.nodes.getNode(config.server)
      node.status({ fill: '', shape: 'dot', text: 'Connecting' })
      try {
        const device = new huaweiLteApi.Device(await node.server.connect())
        const result = await device.reboot()
        msg.payload = result
        node.status({ text: '' })
        send(msg)
        done()
      } catch (error) {
        if (error.code === 125002 || error.code === 125003) {
          // Make sure the session timeout happens on session error (125002/125003)
          node.server.sessionTimeout = 0
        }
        node.status({ fill: 'red', text: error.message })
        done(error.message)
      }
    })
  }
  RED.nodes.registerType('huawei-reboot', HuaweiReboot)
  function HuaweiSMSSend (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      function parseNumber (inputNumber) {
        if (typeof inputNumber === 'string') {
          return [inputNumber]
        } else if (typeof inputNumber === 'number') {
          return [inputNumber.toString()]
        } else if (Array.isArray(inputNumber)) {
          return inputNumber.map(element => {
            return parseNumber(element)[0]
          })
        }
        node.warn('Error understanding input number. Accepts text,number and array of text/numbers')
        return ['']
      }
      const textMessage = msg.payload || node.message || ''
      const phoneNumber = msg.number || node.phoneNumber || ['']
      node.server = RED.nodes.getNode(config.server)
      node.status({ fill: 'blue', shape: 'dot', text: 'Connecting' })
      try {
        const SMS = new huaweiLteApi.Sms(await node.server.connect())
        msg.payload = await SMS.sendSms(parseNumber(phoneNumber), textMessage.toString())
        send(msg)
      } catch (error) {
        if (error.code === 125002) {
          // Make sure the session timeout happens on session error (125002)
          node.server.sessionTimeout = 0
        } else {
          console.trace(error)
        }
        node.status({ fill: 'red', text: error.message })
        done(error.message)
        return
      }
      node.status({ text: '' })
      done()
    })
  }
  RED.nodes.registerType('huawei-sms-send', HuaweiSMSSend)
}
