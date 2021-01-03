const logger = require('../logs/logger.js');
const Pokemon = require(`../models/pokemon`);

// List forms of a given Pokemon and allows you to switch forms.

const HELP_MESSAGE = "Lists forms of a Pokemon in the database. Allows you to switch forms of the Pokemon.\nUsage: ```+forms [nickname]";

module.exports.run = (client, connection, P, message, args) => {

    if (args[0] === "help") {
        logger.info("[forms] Sending help message.");
        message.reply(HELP_MESSAGE).catch(console.error);
        return;
    }

    // if (args.length < 1) {
    //     logger.info("[forms] Sending not enough arguments warning.");
    //     message.channel.send("You haven't provided enough arguments. Should include the pokemon's nickname.")
    //     return;
    // }

    try {
        let pokemon_name = args[0];

        let sql = `SELECT * FROM pokemon WHERE name = '${pokemon_name}';`;
        logger.info(`[showpoke] SQL query: ${sql}`);

        connection.query(sql, function (err, response) {
            if (err) throw err;

            if (response.length == 0) {
                logger.info("[forms] Pokemon not found in pokemon table. Please check your spelling, or the Pokemon may not be there. Trying custom table.")
                message.channel.send("Pokemon not found in pokemon table. Please check your spelling, or the Pokemon may not be there. Trying custom table.")

                let sql2 = `SELECT * from pokeForms WHERE name = '${pokemon_name}';`
                logger.info(`[showpoke] SQL query: ${sql2}`);

                connection.query(sql2, function (err, response) {
                    if (err) throw err;

                    if (response.length == 0) {
                        logger.info("[forms] Pokemon not found in custom table. Please check your spelling, or the Pokemon may not be there.")
                        message.channel.send("Pokemon not found in custom table. Please check your spelling, or the Pokemon may not be there.")
                    }
                    else {
                        logger.info("this is where the info will go")
                    }
                });

            }
            else {
                logger.info("peepee");

                P.getPokemonSpeciesByName(response[0].species)
                    .then(function (response) {
                        console.log(response.varieties)
                    })
                    .catch(function (error) {
                        console.log('There was an ERROR: ', error);
                    });


            }
        });



    }
    /* istanbul ignore next */
    catch (error) {
        logger.error(error);
        message.channel.send('ChaCha machine :b:roke while attempting to generate a Pokemon, please try again later').catch(console.error);
    }

};