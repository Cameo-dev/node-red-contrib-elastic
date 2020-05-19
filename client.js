const { Client } = require('@elastic/elasticsearch');

module.exports = function client(RED) {
  function serverClientNode(config) {
    RED.nodes.createNode(this, config);

    if (!config.cloudId) throw new Error('You must provide a cloud ID');
    if (!config.username) throw new Error('You must provide a username');
    if (!this.credentials.password) throw new Error('You must provide a password');

    const { cloudId: id, username } = config;
    const { password } = this.credentials;

    this.client = new Client({
      cloud: {
        id,
      },
      auth: {
        username,
        password,
      },
    });
  }

  RED.nodes.registerType('elasticsearch-client', serverClientNode, {
    credentials: {
      password: { type: 'password' },
    },
  });
};
