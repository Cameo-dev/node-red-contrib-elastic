const util = require('util');

module.exports = function write(RED) {
  function ElasticsearchWrite(config) {
    const evaluateJSONataExpression = util.promisify(RED.util.evaluateJSONataExpression);

    RED.nodes.createNode(this, config);

    if (!config.client) throw new Error('You must provide a client');
    const clientNode = RED.nodes.getNode(config.client);
    if (!clientNode) throw new Error('Invalid client node');
    this.client = clientNode.client;

    this.on('input', async (msg, send, done) => {
      const appendedFields = await config.append.reduce(async (promisedMemo, a) => {
        const memo = await promisedMemo;
        switch (a.type) {
          case 'str': memo[a.field] = a.value;
            break;
          case 'msg': memo[a.field] = RED.util.getMessageProperty(msg, a.value);
            break;
          case 'env': memo[a.field] = process.env[a.value];
            break;
          case 'jsonata':
            memo[a.field] = await evaluateJSONataExpression(
              RED.util.prepareJSONataExpression(a.value, msg),
              msg,
            );
            break;
          default: throw new Error(`Unsupported type ${a.type}`);
        }
        return memo;
      }, Promise.resolve({}));
      const index = msg.payload.index || config.index;
      let data;
      try {
        data = msg.payload.body || JSON.parse(config.body);
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
