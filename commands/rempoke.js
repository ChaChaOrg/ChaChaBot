/**
 * Remove Pokemon (rempoke).
 *
 * This command removes a Pokemon from the SQL database
 */

const logger = require('../logs/logger.js');

// The help message provided when requested by the user.
const helpMessage = "\n`+rempoke [nickname]`\n\nDeletes the listed Pokemon from the SQL database, if it exists.\n\n((If found, confirm deletion by reaction to the posted message.))";

module.exports.run = (client, connection, P, message, args) => {
    try {
        // grab the argument given, either the name of a Pokemon or a request for help
        let pokeName = args[0];

        // If user is asking for help, provide help string and get outta here
        if (pokeName.includes('help')) {
            logger.info("[rempoke] Sending help message.");
            message.reply(helpMessage);
            return;
        }

        //debug print to console
        logger.info("[rempoke] Attempting to remove " + pokeName + " from the database...");

        // create find/delete statements
        let findPoke = `SELECT * FROM pokemon WHERE name = '${pokeName}'`;
        logger.info(`[rempoke] Find pokemon SQL statement: ${findPoke}`);

        let deletePokeStatement = `DELETE FROM pokemon WHERE name = '${pokeName}'`
        logger.info(`[rempoke] Delete pokemon SQL statement: ${deletePokeStatement}`);

        // Attempt to find the Pokemon in the database, ending everything if nothing found
        connection.query(findPoke, function (err, rows, fields) {
            // if there's something wrong, throw error
            if (err) {
                logger.error("Error while attempting to access the database.");
                message.reply("Error while attempting to access the database!");
                throw err;
            } else {
                // check to see if it picked anything up
                if (rows.length > 0) {
                    // let console know
                    logger.info("[rempoke] " + pokeName + " has been found. Awaiting user confirmation.");
                    // if picked up, stow the response
                    message.channel.send(
                        'Pokemon found. Are you sure you want to release `' +
                        rows[0].name + ", LV " + rows[0].level + " " + rows[0].species.toUpperCase() +
                        "`?\n\n**:warning: This action cannot be undone. :warning:**"
                    ).then(function (response) {
                        // add reactions so user can just click on em
                        // CHECKMARK = CONFIRM deletion, X = CANCEL deletion
                        response.react('✅').then(response.react('❌'));

                        // then listen for reactions
                        response.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'),
                            { max: 1, time: 30000 }).then(collected => {
                                if (collected.first().emoji.name == '✅') {
                                    // Alert user to deletion of pokemon & set deletePoke to true
                                    message.reply("Releasing " + pokeName + " to the wild. Goodbye, " + pokeName + "!");
                                    //removePokemon(deletePokeStatement, pokeName, message);
                                    connection.query(deletePokeStatement, function (err, results) {
                                        if (err) {
                                            logger.error("[rempoke] Unable to properly delete " + pokeName);
                                            message.reply("...But " + pokeName + " came back!\n((The Pokemon could not be deleted))");
                                            throw err;
                                        } else {
                                            logger.info("[rempoke] " + pokeName + " has been deleted successfully.");
                                        }
                                    });
                                }
                                else {
                                    logger.info("[rempoke] Action cancelled by user.");
                                    message.reply(pokeName + "'s release has been cancelled.");
                                }
                            }).catch(() => {
                                logger.info("[rempoke] Action cancelled via timeout.");
                                message.reply("Timed out after 30 seconds, so " + pokeName + "'s release has been cancelled.");
                            })
                    });
                } else {
                    // if you're in here, it didn't find anything
                    logger.info("[rempoke] Pokemon with name " + pokeName + " not found.");
                    message.reply(
                        "No Pokemon found with name `" + pokeName +
                        "`, please check spelling and try again.\n" +
                        "*Hint:* Use `+listpoke` to view all Pokemon you have access to."
                    );
                }
            }
        });

    } catch (error) {
        logger.error(`[rempoke] ${error}`);
        message.channel.send(error.toString());
        message.channel.send('ChaCha Machine :b:roke whilst trying to remove a Pokemon :(').catch(console.error);
    }
};