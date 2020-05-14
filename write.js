/* eslint-disable linebreak-style */
module.exports = function (RED) {
  function ElasticsearchWrite(config) {
    RED.nodes.createNode(this, config);

    if (!config.client) throw new Error('You must provide a client');
    this.client = RED.nodes.getNode(config.client).client;

    this.on('input', async (msg, send, done) => {
      const appendedFields = config.append.reduce((memo, a) => {
        switch (a.type) {
          case 'str': memo[a.field] = a.value;
            break;
          case 'msg': memo[a.field] = RED.util.getMessageProperty(msg, a.value);
            break;
          case 'env': memo[a.field] = process.env[a.value];
            break;
          default: throw new Error(`Unsupported type ${a.type}`);
        }
        return memo;
      }, {});
      const index = msg.payload.index || config.index;
      const body = Object.assign({}, appendedFields, JSON.parse(msg.payload.body || config.body));

      try {
        await this.client.index({
          index,
          body,
        });
      } catch (e) {
        if (!done) this.error(e);
        else done(e);
      }
    });
  }

  RED.nodes.registerType('elasticsearch-write', ElasticsearchWrite, {});
};
