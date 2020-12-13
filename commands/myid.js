const logger = require('../logs/logger.js');

module.exports.run = (client, connection, P, message, args) => {
    let authorID = message.author.id;
    client.fetchUser(authorID)
        .then(response => {
            logger.info("[myid] " + `Your ID is ${authorID}.\nYour Username is ${response}`)
            message.channel.send(`Your ID is ${authorID}.\nYour Username is ${response}`);
        })
};