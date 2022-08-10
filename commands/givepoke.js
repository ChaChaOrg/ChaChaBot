const HELP_MESSAGE = "Allows a player to transfer ownership of a pokemon with another trainer. \
                     \n+givepoke [pokeName] @[username]"

const logger = require('../logs/logger.js');

module.exports.run = (client, connection, P, message, args) => {
    try {
        
        let pokeName = args[0];
        if (pokeName === "help" ) {
            logger.info("[givepoke] Sending trade help message.");
            message.channel.send(HELP_MESSAGE);
            return;
        }

        if (args.length < 2) {
            logger.warn("[givepoke] User did not enter a user to trade with.");
            message.reply("You forgot to pick someone to give your pokemon to with. You can't give it to me! ;)");
            return;
        }

        let other_user = args[1].substring(2, args[1].length - 1);

        let sql = `UPDATE pokemon SET discordID = '${other_user}' WHERE name = '${pokeName}';`;
        logger.info(`[givepoke] SQL query: ${sql}`);

        let send_msg = message.channel.send(`Please confirm that you want to transfer ${pokeName} to <@${other_user}>.`
        ).then(function (response) {
            // add reactions so user can just click on em
            // CHECKMARK = CONFIRM, X = CANCEL
            response.react('✅').then(response.react('❌'));

            // then listen for reactions
            response.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'),
                { max: 1, time: 30000 }).then(collected => {
                    if (collected.first().emoji.name == '✅') {
                        message.reply("Transferring " + pokeName + " to <@" + other_user + ">...");
                        connection.query(sql, function (err, response) {
                            if (err) throw err;
                
                            if (response.length == 0) {
                                logger.info("[givepoke] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
                            }
                            else {
                                message.channel.send(`Transfer complete!`) 
                            }
                        });
                    }
                    else {
                        logger.info("[givepoke] Action cancelled by user.");
                        message.reply(pokeName + "'s transfer has been cancelled.");
                    }
                }).catch(() => {
                    logger.info("[givepoke] Action cancelled via timeout.");
                    message.reply("Timed out after 30 seconds, so " + pokeName + "'s transfer has been cancelled.");
                })
        });
        
        

    } catch (error) {
        logger.error("[givepoke] " + error.toString());
        message.channel.send(error.toString());
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
};