const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
// charisma calculator

module.exports.data = new SlashCommandBuilder()
	.setName('charisma')
	.setDescription("Quickly* calculate a pokemon's charisma")
	.addSubcommand(subcommand =>
		subcommand
			.setName('modern')
			.setDescription('Generates Charisma based on current formula')
			.addStringOption(option =>
				option.setName('nature')
				.setDescription('Nature of the Pokemon')
				.setRequired(true)
				.addChoices({
					name: 'Hardy',
					value: 'hardy'
				}, {
					name: 'Lonely',
					value: 'lonely'
				}, {
					name: 'Brave',
					value: 'brave'
				}, {
					name: 'Adamant',
					value: 'adamant'
				}, {
					name: 'Naughty',
					value: 'naughty'
				}, {
					name: 'Bold',
					value: 'bold'
				}, {
					name: 'Docile',
					value: 'docile'
				}, {
					name: 'Relaxed',
					value: 'relaxed'
				}, {
					name: 'Impish',
					value: 'impish'
				}, {
					name: 'Lax',
					value: 'lax'
				}, {
					name: 'Timid',
					value: 'timid'
				}, {
					name: 'Hasty',
					value: 'hasty'
				}, {
					name: 'Serious',
					value: 'serious'
				}, {
					name: 'Jolly',
					value: 'jolly'
				}, {
					name: 'Naive',
					value: 'naive'
				}, {
					name: 'Modest',
					value: 'modest'
				}, {
					name: 'Mild',
					value: 'mild'
				}, {
					name: 'Quiet',
					value: 'quiet'
				}, {
					name: 'Bashful',
					value: 'bashful'
				}, {
					name: 'Rash',
					value: 'rash'
				}, {
					name: 'Calm',
					value: 'calm'
				}, {
					name: 'Gentle',
					value: 'gentle'
				}, {
					name: 'Sassy',
					value: 'sassy'
				}, {
					name: 'Careful',
					value: 'careful'
				}, {
					name: 'Quirky',
					value: 'quirky'
				}))
			.addIntegerOption(option => 
				option.setName('beauty-moves')
				.setDescription('Number of beauty moves a pokemon currently has')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('clever-moves')
				.setDescription('Number of clever moves a pokemon currently has')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('cool-moves')
				.setDescription('Number of cool moves a pokemon currently has')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('cute-moves')
				.setDescription('Number of cute moves a pokemon currently has')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('tough-moves')
				.setDescription('Number of tough moves a pokemon currently has')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('neutral-moves')
				.setDescription('Number of neutral moves a pokemon currently has - typically those without a contest type')
				.setRequired(true)
			))
	.addSubcommand(subcommand =>
		subcommand
			.setName('legacy')
			.setDescription('Old damage formula')
			.addIntegerOption(option => 
				option.setName('beauty-moves')
				.setDescription('Number of beauty moves in the learnset of a Pokemon species')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('clever-moves')
				.setDescription('Number of clever moves in the learnset of a Pokemon species')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('cool-moves')
				.setDescription('Number of cool moves in the learnset of a Pokemon species')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('cute-moves')
				.setDescription('Number of cute moves in the learnset of a Pokemon species')
				.setRequired(true))
			.addIntegerOption(option => 
				option.setName('tough-moves')
				.setDescription('Number of cute moves in the learnset of a Pokemon species')
				.setRequired(true)
			));

module.exports.run = async (interaction) => {
	await interaction.deferReply();
	if(interaction.options.getSubcommand() === 'modern'){
		try{
		let beautymoves = interaction.options.getInteger('beauty-moves');
		let clevermoves = interaction.options.getInteger('clever-moves');
		let coolmoves = interaction.options.getInteger('cool-moves');
		let cutemoves = interaction.options.getInteger('cute-moves');
		let toughmoves = interaction.options.getInteger('tough-moves');
		let neutralmoves = interaction.options.getInteger('neutral-moves');

		let naturestring = interaction.options.getString('nature');

		let same = 0;
		let adjacent = 0;
		let opposite = 0;

		let naturetype;
		if(naturestring === 'modest' || naturestring === 'mild' || naturestring === 'quiet' || naturestring === 'rash'){
			naturetype = 'beauty-nature';
		}else if(naturestring === 'lonely' || naturestring === 'brave' || naturestring === 'adamant' || naturestring === 'naughty'){
			naturetype = 'cool-nature';
		}else if(naturestring === 'bold' || naturestring === 'relaxed' || naturestring === 'impish' || naturestring === 'lax'){
			naturetype = 'tough-nature';
		}else if(naturestring === 'calm' || naturestring === 'gentle' || naturestring === 'sassy' || naturestring === 'careful'){
			naturetype = 'clever-nature';
		}else if(naturestring === 'timid' || naturestring === 'hasty' || naturestring === 'jolly' || naturestring === 'naive'){
			naturetype = 'cute-nature';
		}else{
			naturetype = 'neutral-nature';
		}


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
	}else if (interaction.options.getSubcommand() === 'legacy'){
		try{
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
			interaction.followUp(`Your Pokemon's charisma is ${finalCha}(${finalChaModString})`);
			} catch (error) {
			logger.error("[charisma] " + error.toString())
			//await interaction.followUp(error.toString());
			//await interaction.followUp('ChaCha machine :b:roke, please try again later').catch(console.error);
			}
	}
}