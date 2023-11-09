const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../logs/logger.js');

const HELP_MESSAGE = "Converts video game stats to tabletop ability scores."

module.exports.data = new SlashCommandBuilder()
	.setName('statconversion')
	.setDescription('Converts a stat value from the video game to the tabletop equivalent Ability Score.')
	.addStringOption(option =>
		option.setName('stat')
			.setDescription('Stat to convert to/from.')
			.setRequired(true)
			.addChoices({
				name: 'HP -> Constitution',
				value: 'HP'
			}, {
				name: 'Attack -> Strength',
				value: 'Attack'
			}, {
				name: 'Defense -> Natural Armor',
				value: 'Defense'
			}, {
				name: 'Special Attack -> Intelligence',
				value: 'Special Attack'
			}, {
				name: 'Special Defense -> Wisdom',
				value: 'Special Defense'
			}, {
				name: 'Speed -> Dexterity, Move Speed',
				value: 'Speed'
			})
	)
	.addIntegerOption(option =>
		option.setName('value')
			.setDescription('Value of stat.')
			.setRequired(true)
			.setMinValue(0)
	);

module.exports.run = async (interaction) => {

	await interaction.deferReply();

	let option = interaction.options.getString("stat");
	let value = interaction.options.getInteger("value");

	let ability;
	let ability2;

	if (option === 'HP') {

		ability = Math.ceil((value * 0.15) + 1.5);
		logger.info("[statconversion] converted HP to CON.");
		interaction.followUp("An HP stat of " + value + " becomes a Constitution score of " + ability);

	} else if (option === 'Attack') {

		ability = Math.ceil((value * 0.15) + 1.5);
		logger.info("[statconversion] converted Attack to STR.");
		interaction.followUp("An Attack stat of " + value + " becomes a Strength score of " + ability);

	} else if (option === 'Defense') {

		ability = Math.ceil((value * 0.08) - 0.6);
		logger.info("[statconversion] converted Defense to Natural Armor.");
		interaction.followUp("A Defense stat of " + value + " becomes a Natural Armor value of " + ability);

	} else if (option === 'Special Attack') {

		ability = Math.ceil((value * 0.15) + 1.5);
		logger.info("[statconversion] converted Special Attack to INT.");
		interaction.followUp("A Special Attack stat of " + value + " becomes an Intelligence score of " + ability);

	} else if (option === 'Special Defense') {

		ability = Math.ceil((value * 0.15) + 1.5);
		logger.info("[statconversion] converted Special Defense to WIS.");
		interaction.followUp("A Special Defense stat of " + value + " becomes a Wisdom score of " + ability);

	} else if (option === 'Speed') {

		ability = Math.ceil((value * 0.15) + 1.5);
		ability2 = Math.ceil((0.38 * value) + 4);
		logger.info("[statconversion] converted Speed to Dexterity and Move Speed.");
		interaction.followUp("A Speed stat of " + value + " becomes a Dexterity score of " + ability + " and a Move Speed of " + ability2 + " feet per round");

	}
	return;

	}