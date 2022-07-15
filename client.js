const { Client } = require('@elastic/elasticsearch');

module.exports = function client(RED) {
  function serverClientNode(config) {
    RED.nodes.createNode(this, config);

    if (!config.cloudId && !config.node) throw new Error('You must provide a cloud ID or a node URL');
    if (!config.username) throw new Error('You must provide a username');
    if (!this.credentials.password) throw new Error('You must provide a password');

    const { cloudId: id, username, node } = config;
    const { password } = this.credentials;

    this.client = new Client({
      cloud: id ? {
        id,
      } : undefined,
      node,
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
