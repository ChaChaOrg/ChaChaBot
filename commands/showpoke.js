const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;

const HELP_MESSAGE = "Displays a Pokemon as it appears in the database. Please do not name your Pokemon 'help'. \n+showpoke [Pokemon Name]"

module.exports.run = (client, connection, P, message, args) => {
    try {
        let name = args[0];

        if (name === "help") {
            message.channel.send(HELP_MESSAGE);
            return;
        }

        let Pokemon = require(`../models/pokemon`);
        let tempPoke = new Pokemon;

        let sql = `SELECT * FROM pokemon WHERE name = '${name}';`;

        console.log(sql);
        connection.query(sql, function (err, response) {
            if (err) throw err;

            if (response.length == 0)
                message.channel.send("Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
            else {
                tempPoke.loadFromSQL(P, response[0])
                    .then(response => {
                        message.channel.send(tempPoke.sendSummaryMessage(client));
                    });
            }
        });

    } catch (error) {
        message.channel.send(error.toString());
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
};