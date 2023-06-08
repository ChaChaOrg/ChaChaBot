/**
 * Remove Pokemon (rempoke).
 *
 * This command removes a Pokemon from the SQL database
 */

const logger = require('../logs/logger.js');
const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js')

// The help message provided when requested by the user.
const helpMessage = "\n`+rempoke [nickname]`\n\nDeletes the listed Pokemon from the SQL database, if it exists.\n\n((If found, confirm deletion by reaction to the posted interaction.))";

module.exports.data = new SlashCommandBuilder()
                        .setName('rempoke')
                        .setDescription("Removes a pokemon the database. Must be one you own.")
                        .addStringOption(option =>
                            option.setName('nickname')
                                .setDescription('Nickname of the Pokemon being removed.')
                                .setRequired(true))

module.exports.run = async (interaction) => {
    await interaction.deferReply();
    const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Success);
    
    const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);
    
    const row = new ActionRowBuilder()
			.addComponents(cancel, confirm);

    try {
        // grab the argument given, either the name of a Pokemon or a request for help
        let pokeName = interaction.options.getString("nickname");

        //debug print to console
        logger.info("[rempoke] Attempting to remove " + pokeName + " from the database...");

        // create find/delete statements
        let findPoke = `SELECT * FROM pokemon WHERE name = '${pokeName}'`;
        logger.info(`[rempoke] Find pokemon SQL statement: ${findPoke}`);

        let deletePokeStatement = `DELETE FROM pokemon WHERE name = '${pokeName}'`
        logger.info(`[rempoke] Delete pokemon SQL statement: ${deletePokeStatement}`);

        // Attempt to find the Pokemon in the database, ending everything if nothing found
        interaction.client.mysqlConnection.query(findPoke, async function (err, rows, fields) {
            // if there's something wrong, throw error
            if (err) {
                logger.error("Error while attempting to access the database.");
                interaction.followUp("Error while attempting to access the database!");
                throw err;
            } else {
                // check to see if it picked anything up
                if (rows.length > 0) {
                    // let console know
                    logger.info("[rempoke] " + pokeName + " has been found. Awaiting user confirmation.");
                    // if picked up, stow the response
                    const response = await interaction.editReply({ 
                        content: 'Pokemon found. Are you sure you want to release `' +
                        rows[0].name + ", LV " + rows[0].level + " " + rows[0].species.toUpperCase() +
                        "`?\n\n**:warning: This action cannot be undone. :warning:**",
                        components: [row] 
                    })

                    const collectorFilter = i => i.user.id === interaction.user.id;

                    try {
                        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

                        if (confirmation.customId == 'confirm') {
                            interaction.editReply({
                                content: "Releasing " + pokeName + " to the wild. Goodbye, " + pokeName + "!",
                                components: []
                            });
                            //removePokemon(deletePokeStatement, pokeName, message);
                            interaction.client.mysqlConnection.query(deletePokeStatement, function (err, results) {
                                if (err) {
                                    logger.error("[rempoke] Unable to properly delete " + pokeName);
                                    interaction.editReply({
                                        content: "...But " + pokeName + " came back!\n((The Pokemon could not be deleted))",
                                        components: []
                                    });
                                    throw err;
                                } else {
                                    logger.info("[rempoke] " + pokeName + " has been deleted successfully.");
                                }
                            });
                        } else if (confirmation.customId === 'cancel') {
                            logger.info("Edits to Pokemon cancelled by user.")
                            interaction.editReply({ 
                                content: pokeName + "'s release has been cancelled.", 
                                components: []});
                        }
                    } catch (e) {
                        console.log(e)
                        interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
                    }
                    
                } else {
                    // if you're in here, it didn't find anything
                    logger.info("[rempoke] Pokemon with name " + pokeName + " not found.");
                    interaction.editReply({
                        content: "No Pokemon found with name `" + pokeName +
                        "`, please check spelling and try again.\n" +
                        "*Hint:* Use `+listpoke` to view all Pokemon you have access to.",
                        components: []
                    });
                }
            }
        });

    } catch (error) {
        logger.error(`[rempoke] ${error}`);
        interaction.channel.send(error.toString());
        interaction.channel.send('ChaCha Machine :b:roke whilst trying to remove a Pokemon :(').catch(console.error);
    }
};