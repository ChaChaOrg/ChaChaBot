const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../logs/logger.js');
const databaseURL = 'https://bulbapedia.bulbagarden.net/wiki/List_of_moves';
// Commands for moves that require randomization or calculation

const HELP_MESSAGE = "allows you to group pokemon by trainer. Add, set, or modify a trainer here"
	+ "Current subcommands: set, add, mod"

const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;



module.exports.data = new SlashCommandBuilder()
		.setName('trainer')
		.setDescription('allows you to group pokemon by trainer. Add, set, or modify a trainer here')
		.addSubcommand(subcommand =>
			subcommand
				.setName('switch')
				.setDescription('switches your current trainer')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name of the trainer you are setting as your active')
						.setRequired(true)
				))
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('adds a new trainer')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('name of your new trainer')
						.setRequired(true))
                .addStringOption(option =>
					option.setName('campaign')
						.setDescription('campaign to place the new trainer in')
						.setRequired(true))
				)
		.addSubcommand(subcommand =>
			subcommand
				.setName('clear')
				.setDescription('Clears your current trainer field')
				)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription(`deletes a trainer and clears their pokemons' owner`)
				.addStringOption(option =>
					option.setName('name')
						.setDescription('name of the trainer to delete')
						.setRequired(true))
		.addSubcommand(subcommand =>
			subcommand
				.setName('mod')
				.setDescription('modify a trainer property (just campaign for now)')
				.addStringOption(option =>
					option.setName('property')
					.setDescription('property to modify')
					.setRequired(true)))
				)
		

module.exports.run = async (interaction) => {

return;

}