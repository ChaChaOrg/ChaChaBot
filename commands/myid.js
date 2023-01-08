const logger = require('../logs/logger.js');

module.exports.run = (interaction) => {
    let authorID = interaction.author.id;
    client.fetchUser(authorID)
        .then(response => {
            logger.info("[myid] " + `Your ID is ${authorID}.\nYour Username is ${response}`)
            interaction.channel.send(`Your ID is ${authorID}.\nYour Username is ${response}`);
        })
};