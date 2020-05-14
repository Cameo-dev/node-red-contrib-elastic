const { Client } = require('@elastic/elasticsearch');

module.exports = function (RED) {

    function serverClientNode(config) {
        try{throw 'e'} catch(e){}
        RED.nodes.createNode(this, config);

        if(!config.cloudId) throw new Error('You must provide a cloud ID');
        if(!config.username) throw new Error('You must provide a username');
        if(!config.password) throw new Error('You must provide a password');

        const {cloudId: id, username, password} = config;

        this.client = new Client({
            cloud: {
                id
            },
            auth: {
                username,
                password
            }
        });
    }

    RED.nodes.registerType("elasticsearch-client", serverClientNode, {});
}