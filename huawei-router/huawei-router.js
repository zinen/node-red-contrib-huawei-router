module.exports = function (RED) {
  'use strict'
  const huaweiLteApi = require('huawei-lte-api')
  function HuaweiConfig(n) {
    RED.nodes.createNode(this, n)
    const node = this
    node.promiseTimeout = function (delayMs) {
      return new Promise(resolve => setTimeout(resolve, delayMs))
    }
    node.requestQueue = 0
    node.requestQueueing = async function (event) {
      if (event == 'end') {
        this.requestQueue--
        return
      } else if (event == 'wait') {
        this.requestQueue++
      } else {
        throw new Error(`Error in requestQueueing handling. event=${event} should be wait or end`)
      }
      while (new Date().getSeconds() < this.requestQueueTimeout && this.requestQueue > 2) {
        await this.promiseTimeout(250)
      }
      if (!new Date().getSeconds() < this.requestQueueTimeout && this.requestQueue>0) this.requestQueue--
      this.requestQueueTimeout = new Date().getSeconds() + 10
    }
    node.connect = async function () {
      try {
        const now = (new Date()).getTime()
        // On timeout a new session should be made
        if (now >= this.sessionTimeout) {
          this.connection = null
        }
        // Add 298 seconds to current time as timeout
        this.sessionTimeout = n.sessionTimeout ? now + n.sessionTimeout * 1000 : now + 298000
        if (!this.connection) {
          // Make new session
          this.connection = new huaweiLteApi.Connection(`http://${node.credentials.user}:${node.credentials.pass}@${n.url}`)
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
          // await user.logout()
          Promise.race([user.logout(), node.promiseTimeout(7000)])
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
  RED.nodes.registerType('huawei-config', HuaweiConfig, {
    credentials: {
      user: { type: "text" },
      pass: { type: "password" }
    }
  })

  function HuaweiCommand(config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      const cmdOptions = ['MobileData', 'Reboot', 'SMSSend']
      if (!cmdOptions.includes(config.cmdOption)) {
        done(`Unknown command option ${config.cmdOption}`)
        return
      }
      try {
        node.server = RED.nodes.getNode(config.server)
        if (!node.server || !node.server.connect) {
          node.status({ fill: 'red', text: 'Unknown config error' })
          done('Unknown config error')
          return
        }
        node.status({ text: 'Connecting' })
        await node.server.requestQueueing('wait')
        switch (config.cmdOption) {
          case cmdOptions[0]:
            const allowedModes = ['on', 1, true, 'off', 0, false, 'toggle', 'off-on']
            if (typeof (msg.mode) === 'undefined') {
              msg.mode = node.mode
            } else if (typeof (msg.mode) === 'string') { msg.mode = msg.mode.toLowerCase() }
            if (!allowedModes.includes(msg.mode)) {
              done('Input mode is not understood')
              node.server.requestQueueing('end')
              return
            }
            const dialUp = new huaweiLteApi.DialUp(await node.server.connect())
            if (msg.mode === 'on' || msg.mode === 1 || msg.mode === true) {
              msg.payload = await dialUp.setMobileDataswitch(1)
              msg.state = msg.payload === 'OK' ? 1 : 0
              send(msg)
            } else if (msg.mode === 'off' || msg.mode === 0 || msg.mode === false) {
              msg.payload = await dialUp.setMobileDataswitch(0)
              msg.state = msg.payload === 'OK' ? 0 : 1
              send(msg)
            } else if (msg.mode === 'toggle') {
              const { dataswitch } = await dialUp.mobileDataswitch()
              msg.payload = await dialUp.setMobileDataswitch(1 - Number(dataswitch))
              msg.state = msg.payload === 'OK' ? 1 - Number(dataswitch) : Number(dataswitch)
              send(msg)
            } else if (msg.mode === 'off-on') {
              await dialUp.setMobileDataswitch(0)
              msg.payload = await dialUp.setMobileDataswitch(1)
              msg.state = msg.payload === 'OK' ? 1 : 0
              send(msg)
            }
            break
          case cmdOptions[1]:
            const device = new huaweiLteApi.Device(await node.server.connect())
            msg.payload = await device.reboot()
            send(msg)
            break
          case cmdOptions[2]:
            function parseNumber(inputNumber) {
              if (typeof inputNumber === 'string') {
                return [inputNumber]
              } else if (typeof inputNumber === 'number') {
                return [inputNumber.toString()]
              } else if (Array.isArray(inputNumber)) {
                return inputNumber.map(element => {
                  return parseNumber(element)[0]
                })
              }
              return ['']
            }
            msg.payload = String(msg.payload)
            msg.number = parseNumber(msg.number || node.phoneNumber)
            if (msg.number === ['']) {
              done('Error understanding input number. Accepts text, number and array of text/numbers but not ' + String(msg.number || node.phoneNumber))
              return
            }
            const SMS = new huaweiLteApi.Sms(await node.server.connect())
            msg.payload = await SMS.sendSms(msg.number, msg.payload)
            if (msg.payload !== 'OK') {
              node.status({ fill: 'red', text: msg.payload })
              done(msg.payload)
              node.server.requestQueueing('end')
              return
            }
            send(msg)
            break
          default:
            done(`Unhandled command ${config.cmdOption}`)
            node.server.requestQueueing('end')
            return
        }
        node.server.requestQueueing('end')
        node.status({ text: '' })
        done()
      } catch (error) {
        if (error.code === 125002 || error.code === 125003) {
          // Make sure the session timeout happens on session error (125002/125003)
          node.server.sessionTimeout = 0
        }
        node.status({ fill: 'red', text: error.message })
        done(error.message)
        node.server.requestQueueing('end')
      }
    })
  }
  RED.nodes.registerType('huawei-send-cmd', HuaweiCommand)

  function HuaweiInfo(config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg, send, done) {
      const infoOptions = ['Monitor-status', 'convergedStatus', 'checkNotifications', 'trafficStatistics', 'startDate', 'monthStatistics', 'Lan-hostInfo', 'WLan-hostInfo', 'signal']
      if (!infoOptions.includes(config.infoOption)) {
        done(`Unknown info option ${config.infoOption}`)
        return
      }
      node.server = RED.nodes.getNode(config.server)
      if (!node.server || !node.server.connect) {
        node.status({ fill: 'red', text: 'Unknown config error' })
        done('Unknown config error')
        return
      }
      node.status({ text: 'Connecting' })
      await node.server.requestQueueing('wait')
      try {
        switch (config.infoOption) {
          case infoOptions[0]:
            msg.payload = await new huaweiLteApi.Monitoring(await node.server.connect()).status()
            break
          case infoOptions[1]:
            msg.payload = await new huaweiLteApi.Monitoring(await node.server.connect()).convergedStatus()
            break
          case infoOptions[2]:
            msg.payload = await new huaweiLteApi.Monitoring(await node.server.connect()).checkNotifications()
            break
          case infoOptions[3]:
            msg.payload = await new huaweiLteApi.Monitoring(await node.server.connect()).trafficStatistics()
            break
          case infoOptions[4]:
            msg.payload = await new huaweiLteApi.Monitoring(await node.server.connect()).startDate()
            break
          case infoOptions[5]:
            msg.payload = await new huaweiLteApi.Monitoring(await node.server.connect()).monthStatistics()
            break
          case infoOptions[6]:
            msg.payload = await new huaweiLteApi.Lan(await node.server.connect()).hostInfo()
            msg.payload = msg.payload.Hosts.Host
            break
          case infoOptions[7]:
            msg.payload = await new huaweiLteApi.WLan(await node.server.connect()).hostList()
            break
          case infoOptions[8]:
            msg.payload = await new huaweiLteApi.Device(await node.server.connect()).signal()
            break
          default:
            done(`Unhandled info option ${config.cmdOption}`)
            node.server.requestQueueing('end')
            return
        }
        node.server.requestQueueing('end')
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
        node.server.requestQueueing('end')
      }
    })
  }
  RED.nodes.registerType('huawei-info', HuaweiInfo)
}
