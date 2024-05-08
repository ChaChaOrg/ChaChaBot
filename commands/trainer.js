const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../logs/logger.js');
const databaseURL = 'https://bulbapedia.bulbagarden.net/wiki/List_of_moves';
// Commands for moves that require randomization or calculation

const HELP_MESSAGE = "Move helper. Variables depend on subcommand"
	+ "Current subcommands: Metronome, Beat Up, Confusion"

const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;



module.exports.data = new SlashCommandBuilder()
		.setName('trainer')
		.setDescription('allows you to group pokemon by trainer. Add, set, or modify a trainer here')
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('sets your current trainer')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name of the trainer you are setting as your current')
						.setRequired(true)
				))
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('adds a new trainer ')
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
				.setName('mod')
				.setDescription('modify a trainer property (just campaign for now)')
				.addStringOption(option =>
					option.setName('party-members')
					.setDescription('Party members to pull valid Assist move from, seperated by a space.')
					.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('confusion')
				.setDescription('Calculates confusion damage for a given Pokemon.')
				.addStringOption(option =>
					option.setName('pokemon')
					.setDescription('Pokemon that is hitting itself.')
					.setRequired(true))
				.addIntegerOption(option =>
					option.setName('stages-of-attack')
					.setDescription('Stages of attack the Pokemon has. Minimum -6, maximum +6')
              		.setMaxValue(6)
              		.setMinValue(-6))
				.addIntegerOption(option =>
					option.setName('stages-of-defense')
					.setDescription('Stages of defens the Pokemon has. Minimum -6, maximum +6')
					.setMaxValue(6)
					.setMinValue(-6))
				);

module.exports.run = async (interaction) => {

return;

}