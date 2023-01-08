const logger = require('../logs/logger');
const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async run(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {			
            logger.error(`No command matching ${interaction.commandName} was found`)
			return;
		}

		try {
			await command.run(interaction);
		} catch (error) {
            await interaction.followUp({content:'There was an error while executing this command!', ephemeral: true});
			logger.error(`Error executing ${interaction.commandName}`);
		}
	},
};