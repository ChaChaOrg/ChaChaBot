const { EmbedBuilder, SlashCommandAssertions, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js')
const HELP_MESSAGE = "Allows a player to transfer ownership of a pokemon with another trainer. \
                     \n+givepoke [pokeName] @[username]"

const logger = require('../logs/logger.js');

module.exports.data = new SlashCommandBuilder()
    .setName('givepoke')
    .setDescription('Give a pokemon to another trainer.')
    .addSubcommand(subcommand =>
        subcommand
        .setName('help')
        .setDescription('Tells user what fields are required')
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName('pokemon')
        .setDescription('Give a pokemon to another trainer.')
        .addUserOption(option =>
            option.setName('user')
            .setDescription("Filter by discordID")
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('pokename')
            .setDescription('Name of the pokemon being transferred')
            .setRequired(true)
        )
    )
    

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
        if (interaction.options.getSubcommand() === 'help') {
            logger.info("[givepoke] Sending trade help message.");
            interaction.editReply(HELP_MESSAGE);
            return;
        }

        let pokeName = interaction.options.getString('pokeName');
        let other_user = interaction.options.getString('user');

        let sql = `UPDATE pokemon SET discordID = '${other_user}' WHERE name = '${pokeName}';`;
        logger.info(`[givepoke] SQL query: ${sql}`);

        const response = await interaction.editReply({
            content: `Please confirm that you want to transfer ${pokeName} to <@${other_user}>.\nUse showpoke if you'd like to see more details on the Pokemon.`,
            components: [row]
        })

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            if (confirmation.customId == 'confirm') {
                connection.query(sql, function (err, response) {
                    if (err) throw err;
        
                    if (response.length == 0) {
                        logger.info("[givepoke] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
                    }
                    else {
                        message.channel.send(`Transfer complete!`) 
                    }
                });
            } else if (confirmation.customId == 'cancel') {
                logger.info("[givepoke] Transfer cancelled.")
                interaction.editReply(`${pokeName} will not be transferred to ${other_user}.`)
            }
        } catch (e) {
            logger.error(`Error transferring: ${e}`)
            interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling.', components: [] })
        }

    } catch (error) {
        logger.error("[givepoke] " + error.toString());
        message.channel.send(error.toString());
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
};