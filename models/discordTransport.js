const Transport = require('winston-transport');
const util = require('util');

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//


module.exports = class YourCustomTransport extends Transport {
    constructor(opts) {
        super(opts);
        this.level = opts["level"];
        this.message = opts["message"];
        this.client = opts["client"];
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        client.channels.get("504089094331039764").send("");
        callback();
    }
};