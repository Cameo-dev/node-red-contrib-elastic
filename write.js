module.exports = function write(RED) {
  function ElasticsearchWrite(config) {
    RED.nodes.createNode(this, config);

    if (!config.client) throw new Error('You must provide a client');
    const clientNode = RED.nodes.getNode(config.client);
    if (!clientNode) throw new Error('Invalid client node');
    this.client = clientNode.client;

    this.on('input', async (msg, _, done) => {
      const appendedFields = await config.append.reduce(async (promisedMemo, a) => {
        const memo = await promisedMemo;
        memo[a.field] = RED.util.evaluateNodeProperty(a.value, a.type, this, msg);
        return memo;
      }, Promise.resolve({}));
      const { index } = clientNode;
      let data;
      try {
        data = RED.util.evaluateNodeProperty(config.body, config.bodyType, this, msg) || msg.payload;
      } catch (e) {
        done(new Error('Invalid body in settings'));
      }
      if (!data) done(new Error('You must provide a body'));
      const body = Object.assign({}, appendedFields, { timestamp: Date.now() }, data);

      try {
        await this.client.index({
          index,
          body,
        });
        done();
      } catch (e) {
        if (!done) this.error(e);
        else done(e);
      }
    });
  }

  RED.nodes.registerType('elasticsearch-write', ElasticsearchWrite, {});
};
