const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
// charisma calculator

module.exports.data = new SlashCommandBuilder()
	.setName('charisma')
	.setDescription("Quickly* calculate a pokemon's charisma")
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
		.setDescription('Number of cute moves a pokemon has')
		.setRequired(true)
	);

module.exports.run = async (interaction) => {
	//interaction.channel.send('Bang! <:gunspurr:356191158017196032>').catch(console.error);
	try{

	
	//await interaction.deferReply();

	//variables

	//final charisma score
	var finalCha = 0;
	//charisma mod
	var finalChaMod = 0;

		var args = [];

	args[1] = interaction.options.getInteger('beauty-moves');
	args[2] = interaction.options.getInteger('clever-moves');
	args[3] = interaction.options.getInteger('cool-moves');
	args[4] = interaction.options.getInteger('cute-moves');
	args[5] = interaction.options.getInteger('tough-moves');

/*
	//check if asking for help
	if (name.includes('help')) {
		logger.info("[charisma] Sending help interaction.")
		interaction.reply('Charisma Generator. Variables in order:\n [Pokemon Name] [Beauty Moves] [Clever Moves] [Cool Moves] [Cute Moves] [Tough Moves]').catch(console.error);
		return;
	}
*/
	//find total number of moves + best cha move
	var totalMoves = 0;
	//move with highest value
	var bestCha = 0;
	for (var i = 1; i < 6; i++) { //NOTE: if any cats are 0, add +1 to total
		var newVal = parseFloat(args[i]);
		totalMoves += newVal;
		if (newVal > bestCha) {
			bestCha = newVal;
		} else {
			if (newVal === 0) {
				finalCha++;
			}
		}
	}

	//calculate final charisma
	finalCha += Math.round(38.699 * (Math.pow((bestCha / totalMoves), 1.3125)));

	//calculate charisma mod
	finalChaMod = Math.floor((finalCha - 10) / 2);
	var finalChaModString;
	if (finalChaMod > 0) {
		finalChaModString = '+' + finalChaMod;
	} else {
		finalChaModString = finalChaMod;
	}

	//print results!

	logger.info("[charisma] " + `Your Pokemon's Charisma is ${finalCha}(${finalChaModString})`);
	await interaction.reply(`Your Pokemon's charisma is ${finalCha}(${finalChaModString})`);
	} catch (error) {
	logger.error("[charisma] " + error.toString())
	//await interaction.followUp(error.toString());
	//await interaction.followUp('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
}