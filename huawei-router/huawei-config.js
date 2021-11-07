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
}
