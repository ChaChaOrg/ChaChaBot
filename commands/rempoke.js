/**
 * Remove Pokemon (rempoke).
 *
 * This command removes a Pokemon from the SQL database
 */

const logger = require('../logs/logger.js');
const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
// The help message provided when requested by the user.
const helpMessage = "\n`+rempoke [nickname]`\n\nDeletes the listed Pokemon from the SQL database, if it exists.\n\n((If found, confirm deletion by reaction to the posted interaction.))";

module.exports.data = new SlashCommandBuilder()
    .setName('rempoke')
    .setDescription('Removes a pokemon from the database.')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The nickname of the pokemon you are releasing.')
            .setRequired(true)
    );

module.exports.run = async (interaction) => {
    await interaction.deferReply();
    try {
        // grab the argument given, either the name of a Pokemon or a request for help
        let pokeName = interaction.options.getString('name');

        // If user is asking for help, provide help string and get outta here
        if (pokeName.includes('help')) {
            logger.info("[rempoke] Sending help interaction.");
            interaction.followUp(helpMessage);
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
        connection.query(findPoke, async function (err, rows, fields) {
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
                    const confirm = new ButtonBuilder()
                        .setCustomId('release')
                        .setLabel('Release')
                        .setStyle(ButtonStyle.Danger);

                    const reject = new ButtonBuilder()
                        .setCustomId('keep')
                        .setLabel('Keep')
                        .setStyle(ButtonStyle.Success);


                    const row = new ActionRowBuilder()
                        .addComponents(confirm, reject);

                    const userFilter = i => i.user.id === interaction.user.id;
                    const response = await interaction.followUp({
                        content: 'Pokemon found. Are you sure you want to release `' +
                            rows[0].name + ", LV " + rows[0].level + " " + rows[0].species.toUpperCase() +
                            "`?\n\n**:warning: This action cannot be undone. :warning:**",
                        components: [row],
                    });
                    try {
                        const confirmation = await response.awaitMessageComponent({ filter: userFilter, time: 30000 });
                        if (confirmation.customId === 'release') {
                            interaction.followUp("Releasing " + pokeName + " to the wild. Goodbye, " + pokeName + "!");
                            //removePokemon(deletePokeStatement, pokeName, message);
                            connection.query(deletePokeStatement, function (err, results) {
                                if (err) {
                                    logger.error("[rempoke] Unable to properly delete " + pokeName);
                                    interaction.followUp("...But " + pokeName + " came back!\n((The Pokemon could not be deleted))");
                                    throw err;
                                } else {
                                    logger.info("[rempoke] " + pokeName + " has been deleted successfully.");
                                }
                            });
                        } else {
                            logger.info("[rempoke] Action cancelled by user.");
                            interaction.followUp(pokeName + "'s release has been cancelled.");
                        }
                    } catch (err) {
                        logger.info("[rempoke] Action cancelled via timeout.");
                        interaction.followUp("Timed out after 30 seconds, so " + pokeName + "'s release has been cancelled.");
                    }

                   
                } else {
                    // if you're in here, it didn't find anything
                    logger.info("[rempoke] Pokemon with name " + pokeName + " not found.");
                    interaction.followUp(
                        "No Pokemon found with name `" + pokeName +
                        "`, please check spelling and try again.\n" +
                        "*Hint:* Use `+listpoke` to view all Pokemon you have access to."
                    );
                }
            }
        });

    } catch (error) {
        logger.error(`[rempoke] ${error}`);
        interaction.channel.send(error.toString());
        interaction.channel.send('ChaCha Machine :b:roke whilst trying to remove a Pokemon :(').catch(console.error);
    }
};