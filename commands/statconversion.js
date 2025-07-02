const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../logs/logger.js');

const HELP_MESSAGE = "Converts video game stats to tabletop ability scores. Or vice-versa."

module.exports.data = new SlashCommandBuilder()
	.setName('statconversion')
	.setDescription('Converts a stat value from the video game to the tabletop equivalent Ability Score. Or vice-versa.')
	.addStringOption(option =>
		option.setName('stat')
			.setDescription('Stat to convert from.')
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
			}, {
				name: ' Constitution -> HP',
				value: 'Constitution'
			}, {
				name: 'Strength -> Attack',
				value: 'Strength'
			}, {
				name: 'Natural Armor -> Defense',
				value: 'Natural Armor'
			}, {
				name: 'Intelligence -> Special Attack',
				value: 'Intelligence'
			}, {
				name: 'Wisdom -> Special Defense',
				value: 'Wisdom'
			}, {
				name: 'Dexterity -> Speed',
				value: 'Dexterity'
			}, {
				name: 'Move Speed -> Speed',
				value: 'Move Speed'
			})
	)
	.addIntegerOption(option =>
		option.setName('value')
			.setDescription('Value of stat.')
			.setRequired(true)
			.setMinValue(0)
	)
	.addIntegerOption(option =>
		option.setName('stages')
			.setDescription('Number of stages to calculate with, for compatible stats (not HP).')
			.setMinValue(-6)
			.setMaxValue(6)
	);

module.exports.run = async (interaction) => {

	await interaction.deferReply();

	let option = interaction.options.getString("stat");
	let value = interaction.options.getInteger("value");

	let ability;
	let ability2;

	let stages = interaction.options.getInteger("stages") ?? 0;
	let stageMult = 1;
	if (stages > 0){
		stageMult = (2+stages)/2;
	}else if (stages < 0){
		stageMult = 2/(2+ Math.abs(stages));
	}

	if (option === 'HP') {

		ability = Math.ceil((value * 0.15) + 1.5);
		logger.info("[statconversion] converted HP to CON.");
		interaction.followUp("With " + stages + ", an HP stat of " + value + " becomes a Constitution score of " + ability + " Note: Final HP value used should be equal to the base stat plus HP IVs.");

	} else if (option === 'Attack') {

		ability = Math.ceil((value * 0.15) + 1.5);
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted Attack to STR.");
		interaction.followUp("With " + stages + ", an Attack stat of " + value + " becomes a Strength score of " + ability);

	} else if (option === 'Defense') {

		ability = Math.ceil((value * 0.08) - 0.6);
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted Defense to Natural Armor.");
		interaction.followUp("With " + stages + ", a Defense stat of " + value + " becomes a Natural Armor value of " + ability);

	} else if (option === 'Special Attack') {

		ability = Math.ceil((value * 0.15) + 1.5);
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted Special Attack to INT.");
		interaction.followUp("With " + stages + ", a Special Attack stat of " + value + " becomes an Intelligence score of " + ability);

	} else if (option === 'Special Defense') {

		ability = Math.ceil((value * 0.15) + 1.5);
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted Special Defense to WIS.");
		interaction.followUp("With " + stages + ", a Special Defense stat of " + value + " becomes a Wisdom score of " + ability);

	} else if (option === 'Speed') {

		ability = Math.ceil((value * 0.15) + 1.5);
		ability = Math.floor(ability * stageMult);
		ability2 = Math.ceil((0.38 * value) + 4);
		ability2 = Math.floor(ability2 * stageMult);
		logger.info("[statconversion] converted Speed to Dexterity and Move Speed.");
		interaction.followUp("With " + stages + ", a Speed stat of " + value + " becomes a Dexterity score of " + ability + " and a Move Speed of " + ability2 + " feet per round");

	} else if (option === 'Constitution'){

		ability = Math.floor((value-1.5) * (20/3));
		logger.info("[statconversion] converted CON to HP.");
		interaction.followUp("A Constitution of " + value + " becomes a maximum HP stat of " + ability);

	} else if (option === 'Strength'){

		ability = Math.floor((value-1.5) * (20/3));
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted STR to Attack.");
		interaction.followUp("A Strength of " + value + " becomes a maximum Attack stat of " + ability + ". Stages don't apply to HP/CON!");

	} else if (option === 'Natural Armor'){

		ability = Math.floor((value+0.6) * 12.5);
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted Natural Armor to Defense.");
		interaction.followUp("With " + stages + ", a Natural Armor of " + value + " becomes a maximum Defense stat of " + ability);
		
	} else if (option === 'Intelligence'){

		ability = Math.floor((value-1.5) * (20/3));
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted INT to Special Attack.");
		interaction.followUp("With " + stages + ", an Intelligence of " + value + " becomes a maximum Special Attack stat of " + ability);
		
	} else if (option === 'Wisdom'){

		ability = Math.floor((value-1.5) * (20/3));
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted WIS to Special Defense.");
		interaction.followUp("With " + stages + ", a Wisdom of " + value + " becomes a maximum Special Defense stat of " + ability);
		
	} else if (option === 'Dexterity'){

		ability = Math.floor((value-1.5) * (20/3));
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted DEX to Speed.");
		interaction.followUp("With " + stages + ", a Dexterity of " + value + " becomes a maximum Speed stat of " + ability + ", which may not match with a conversion from Move Speed");
		
	} else if (option === 'Move Speed'){

		ability = Math.floor((value-4) * (50/19));
		ability = Math.floor(ability * stageMult);
		logger.info("[statconversion] converted Move Speed to Speed.");
		interaction.followUp("With " + stages + ", a Move Speed of " + value + " becomes a maximum Speed stat of " + ability + ", which may not match with a conversion from Dexterity");
		
	}
	return;

	}