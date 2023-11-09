const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;

const HELP_MESSAGE = "Displays a Pokemon as it appears in the database. Please do not name your Pokemon 'help'. \n/showpoke [Pokemon Name]"

const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports.data = new SlashCommandBuilder()
		.setName('showpoke')
		.setDescription('Show a pokemon')
		.addStringOption(option =>
			option.setName('nickname')
				.setDescription('Nickname of the pokemon to search for')
				.setRequired(true))
		
module.exports.run = async (interaction) => {
    await interaction.deferReply();

    try {
        // if (args.join(" ").includes("\'")) {
        //     logger.warn("[showpoke] User put single quote in command, sending warning.");
        //     interaction.reply("Please do not use quotes when using commands.");
        //     return;
        // }

        let name = interaction.options.getString('nickname');

        let Pokemon = require(`../models/pokemon`);
        let tempPoke = new Pokemon;

        let sql = `SELECT * FROM pokemon WHERE name = '${name}';`;
        logger.info(`[showpoke] SQL query: ${sql}`);

        let notFoundMessage = name + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `/listpoke` to view the Pokemon you can edit.)";

        //console.log(sql);
        interaction.client.mysqlConnection.query(sql, function (err, response) {
            if (err) throw err;

            if (response.length == 0) {
                logger.info("[showpoke] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
                interaction.editReply("Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
            }
            else {
                // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
                if (response[0].private > 0 && interaction.member.user.id !== response[0].discordID) {
                    logger.info("[modpoke] Detected user attempting to edit private Pokemon that isn't their own.")
                    // If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
                    interaction.editReply(notFoundMessage);
                    return;
                }

                tempPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0])
                    .then(response => {


                        logger.info("[showpoke] Sending summary message to user.");
                        interaction.editReply({
                            embeds: [tempPoke.sendSummaryMessage(interaction).embed]
                        });

                    });
            }
        });

    } catch (error) {
        logger.error("[showpoke] " + error.toString());
        interaction.channel.send(error.toString());
        interaction.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
};