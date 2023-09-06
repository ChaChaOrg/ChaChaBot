const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
// charisma calculator

module.exports.data = new SlashCommandBuilder()
	.setName('charisma')
	.setDescription("Quickly* calculate a pokemon's charisma")
	.addStringOption(option =>
		option.setName('nature')
		.setDescription('Nature of the Pokemon')
		.setRequired(true)
		.addChoices({
			name: 'Hardy',
			value: 'neutral-nature'
		}, {
			name: 'Lonely',
			value: 'cool-nature'
		}, {
			name: 'Brave',
			value: 'cool-nature'
		}, {
			name: 'Adamant',
			value: 'cool-nature'
		}, {
			name: 'Naughty',
			value: 'cool-nature'
		}, {
			name: 'Bold',
			value: 'tough-nature'
		}, {
			name: 'Docile',
			value: 'neutral-nature'
		}, {
			name: 'Relaxed',
			value: 'tough-nature'
		}, {
			name: 'Impish',
			value: 'tough-nature'
		}, {
			name: 'Lax',
			value: 'tough-nature'
		}, {
			name: 'Timid',
			value: 'cute-nature'
		}, {
			name: 'Hasty',
			value: 'cute-nature'
		}, {
			name: 'Serious',
			value: 'neutral-nature'
		}, {
			name: 'Jolly',
			value: 'cute-nature'
		}, {
			name: 'Naive',
			value: 'cute-nature'
		}, {
			name: 'Modest',
			value: 'beauty-nature'
		}, {
			name: 'Mild',
			value: 'beauty-nature'
		}, {
			name: 'Quiet',
			value: 'beauty-nature'
		}, {
			name: 'Bashful',
			value: 'neutral-nature'
		}, {
			name: 'Rash',
			value: 'beauty-nature'
		}, {
			name: 'Calm',
			value: 'clever-nature'
		}, {
			name: 'Gentle',
			value: 'clever-nature'
		}, {
			name: 'Sassy',
			value: 'clever-nature'
		}, {
			name: 'Careful',
			value: 'clever-nature'
		}, {
			name: 'Quirky',
			value: 'neutral-nature'
		}))
	.addIntegerOption(option => 
		option.setName('beauty-moves')
		.setDescription('Number of beauty moves a pokemon has')
		.setRequired(true))
	.addIntegerOption(option => 
		option.setName('clever-moves')
		.setDescription('Number of clever moves a pokemon has')
		.setRequired(true))
	.addIntegerOption(option => 
		option.setName('cool-moves')
		.setDescription('Number of cool moves a pokemon has')
		.setRequired(true))
	.addIntegerOption(option => 
		option.setName('cute-moves')
		.setDescription('Number of cute moves a pokemon has')
		.setRequired(true))
	.addIntegerOption(option => 
		option.setName('tough-moves')
		.setDescription('Number of tough moves a pokemon has')
		.setRequired(true))
	.addIntegerOption(option => 
		option.setName('neutral-moves')
		.setDescription('Number of neutral moves a pokemon has - typically those without a contest type')
		.setRequired(true)
	);

module.exports.run = async (interaction) => {
	await interaction.deferReply();
	try{
	let beautymoves = interaction.options.getInteger('beauty-moves');
	let clevermoves = interaction.options.getInteger('clever-moves');
	let coolmoves = interaction.options.getInteger('cool-moves');
	let cutemoves = interaction.options.getInteger('cute-moves');
	let toughmoves = interaction.options.getInteger('tough-moves');
	let neutralmoves = interaction.options.getInteger('neutral-moves');

	let naturetype = interaction.options.getString('nature');

	let same = 0;
	let adjacent = 0;
	let opposite = 0;

	//Calculate same, adjacent, and opposite values based on nature;
	if (naturetype == "beauty-nature"){
		same = beautymoves;
		adjacent = coolmoves + cutemoves;
		opposite = clevermoves + toughmoves;
	}else if (naturetype == "clever-nature"){
		same = clevermoves;
		adjacent = cutemoves + toughmoves;
		opposite = beautymoves + coolmoves;
	}else if (naturetype == "cool-nature"){
		same = coolmoves;
		adjacent = beautymoves + toughmoves;
		opposite = clevermoves + cutemoves;
	}else if (naturetype == "cute-nature"){
		same = cutemoves;
		adjacent = beautymoves + clevermoves;
		opposite = coolmoves + toughmoves;
	}else if (naturetype == "tough-nature"){
		same = toughmoves;
		adjacent = clevermoves + coolmoves;
		opposite = beautymoves + cutemoves;
	}else{
		same = neutralmoves;
	}
	let charisma = 12;
	charisma += 3*same;
	charisma += adjacent;
	charisma -= 2*opposite;

	//Calculate MF (Most Frequent) contest type, and calculate the value it adds to the total
	let frequencyfactor = Math.max(beautymoves, clevermoves, coolmoves, cutemoves, toughmoves, neutralmoves);
	frequencyfactor = frequencyfactor*(frequencyfactor-1);

	charisma += frequencyfactor;

	//calculate charisma mod
	let finalChaMod = Math.floor((charisma - 10) / 2);
	var finalChaModString;
	if (finalChaMod > 0) {
		finalChaModString = '+' + finalChaMod;
	} else {
		finalChaModString = finalChaMod;
	}

	//print results!

	logger.info("[charisma] " + `Your Pokemon's Charisma is ${charisma}(${finalChaModString})`);
	interaction.followUp(`Your Pokemon's charisma is ${charisma}(${finalChaModString})`);
	} catch (error) {
	logger.error("[charisma] " + error.toString())
	//await interaction.followUp(error.toString());
	//await interaction.followUp('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
}