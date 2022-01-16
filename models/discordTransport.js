const Transport = require('winston-transport');
const util = require('util');

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//


module.exports = class DiscordResponse extends Transport {
    constructor(opts) {
        super(opts);
        this.client = opts["client"];
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
            client.channels.get("504089094331039764").send(`ERROR:  + ${info}`);
            if(message != null) message.send("");
        });
        callback();
    }
};