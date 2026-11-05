const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const SQL_SANITATION_REGEX = /[^a-zA-Z0-9-'_]/;

module.exports.data = new SlashCommandBuilder()
    .setName('exports')
    .setDescription('Exports raw stats for a Pokemon. Typically used by DMs for group battle reference.')
        .addSubcommand(subcommand =>
            subcommand
            .setName('help')
            .setDescription('Posts format help')) 
        .addSubcommand(subcommand =>
            subcommand
            .setName('export')
            .setDescription('Exports Pokemon data')
            .addStringOption(option => option.setName('nickname').setDescription('Name of the Pokemon to export.').setRequired(true).setAutocomplete(true)));

module.exports.autocomplete = async (interaction) => {
    const focusedValue = interaction.options.getFocused(true);
    if (focusedValue.name === 'nickname') {
        var choices = interaction.client.pokemonCache;
        const filtered = choices.filter(choice => (!choice.private || (choice.discordID == interaction.user)) && choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
        await interaction.respond(
            filtered.map(choice => ({ name: choice.name, value: choice.name })),
        )
    }
    // Nothing
};

module.exports.run = async (interaction) => {
    await interaction.deferReply();

    try {

        let name = interaction.options.getString('nickname');

        if (name.match(SQL_SANITATION_REGEX)){
            logger.error("[export] User tried to put in invalid string input.");
            console.log("[export] User tried to put in invalid string input.");
            interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
            return;
        }

        let Pokemon = require(`../models/pokemon`);
        let tempPoke = new Pokemon;

        let sql = `SELECT * FROM pokemon WHERE name = '${name}';`;

        let notFoundMessage = name + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `/listpoke` to view the Pokemon you can edit.)";

        //console.log(sql);
        interaction.client.mysqlConnection.query(sql, function (err, response) {
            if (err) throw err;

            if (response.length == 0) {
                logger.info("[export] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
                console.log("[export] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
                interaction.editReply("Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
            }
            else {
                // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
                if (response[0].private > 0 && interaction.user.id !== response[0].discordID) {
                    console.log("[export] Detected user attempting to edit private Pokemon that isn't their own.")
                    logger.info("[export] Detected user attempting to edit private Pokemon that isn't their own.")
                    // If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
                    interaction.editReply(notFoundMessage);
                    return;
                }

                tempPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0])
                    .then(response => {


                        interaction.editReply({
                            embeds: [tempPoke.sendRawStats(interaction).embed]
                        });

                    });
            }
        })

    } catch (error) {
        logger.error("[export] " + error.toString());
        interaction.followUp(error.toString());
        interaction.followUp('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
};
