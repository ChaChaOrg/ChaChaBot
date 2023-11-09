const logger = require('../logs/logger');
const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async run(interaction) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (interaction.isAutocomplete()){
			if (!command) {
			  console.error(`No command matching ${interaction.commandName} was found.`);
			  return;
			}
			try {
			  await command.autocomplete(interaction);
			  return;
			} catch (error) {
			  console.error(error);
			}
		}

		if (!interaction.isChatInputCommand()) return;

		if (!command) {			
            logger.error(`No command matching ${interaction.commandName} was found`)
			return;
		}

		try {
			await command.run(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}	
	},
};