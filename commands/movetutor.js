//take in move name, print out all dc's , probably need to skim a database for pp count
//maybe take evolution stage into account

const databaseURL = 'https://bulbapedia.bulbagarden.net/wiki/List_of_moves';
const PPINDEX = 11;
const logs = require('../logs/logger.js');
const {
	SlashCommandBuilder, SlashCommandSubcommandBuilder
} = require('@discordjs/builders');

//help messages
//const MOVETUTOR_HELP = '' +
//	'The command to check the Train Pokemon DC to learn a new move.' +
//	'\n\nTo learn a move: `+movetutor [Move_Name (Use _'s for spaces)]`' +
//	'\n\nTo learn a skill: `+movetutor Skillpoint [PokeName] [IntMod] [SkillName]`'

module.exports.data = new SlashCommandBuilder()
	.setName('movetutor')
	.setDescription('The command to check the Train Pokemon DC to learn a new move or skill.')
	.addSubcommand(subcommand =>
		subcommand.setName('move')
			.setDescription('Calculates the DC for learning a move.')
			.addStringOption(option =>
				option.setName('move-name')
					.setDescription("The name of what you're trying to learn.")
					.setRequired(true))
			.addStringOption(option =>
				option.setName('formula')
					.setDescription('Which move DC forula to use.')
					.setRequired(false)
					.addChoices({
						name: 'Normal',
						value: 'normal'
					}, {
						name: 'Original',
						value: 'original'
					})
			)
	)
	.addSubcommand(subcommand =>
		subcommand.setName('skill')
			.setDescription('Calculates the DC for learning a skill.')
			.addStringOption(option =>
				option.setName('skill-name')
					.setDescription("The name of what you're trying to learn.")
					.setRequired(true)
			)
			.addIntegerOption(option =>
				option.setName('int-mod')
					.setDescription('Your pokemon\'s intelligence modifier.')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand.setName('help')
			.setDescription('Displays the help message.')
)
	.addSubcommand(subcommand =>
		subcommand.setName('legacy')
			.setDescription('Manual Power Point value selection.')
			.addIntegerOption(option =>
				option.setName('pp-value')
					.setDescription('The Power Point value of the move.')
					.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('formula')
				.setDescription('Which move DC forula to use.')
				.setRequired(false)
				.addChoices({
					name: 'Normal',
					value: 'normal'
				}, {
					name: 'Original',
					value: 'original'
				})
		));

module.exports.run = async (interaction) => {
	try {
		//let https = require('https');
		//let jsdom = require('jsdom');
		let fs = require('fs');
		await interaction.deferReply();
		if (interaction.options.getSubcommand() === 'help') {
			logs.info('[movetutor] Sending help message');
			interaction.followUp(MOVETUTOR_HELP);
			return;
		} else if (interaction.options.getSubcommand() === 'skill') {
			logs.info('[movetutor] Skill tutor calculations');
			var skillDC = 20 - interaction.options.getInteger('int-mod');
			interaction.followUp(`The DC to learn the ${interaction.options.getString('skill-name')} skill is ${skillDC}.`).catch(console.error);
			return;
		} else if (interaction.options.getSubcommand() === 'move') {
			logs.info('[movetutor] Move tutor calculations');
			//var request = new XMLHttpRequest();
			logs.info('[movetutor] Reading text file');
			//let moves;
			fs.readFile('./data/Moves.txt', (err, data) => {
				//console.log(data);
				//console.log(err);
				if (err) {
					logs.error('[movetutor] Error reading move file.\n' + err.toString());
					interaction.followUp('Could not read move list. Please contact ChaChaBot devs.');
				} else {
					let workingName = '';
					let wordArray = interaction.options.getString('move-name').split('_');
					//console.log(wordArray);
					let dataArray = data.toString().split(/\r?\n/);
					for (let i = 0; i < wordArray.length; i++) {
						let word = wordArray[i].toLowerCase();
						workingName += word.replace(word.charAt(0), word.charAt(0).toUpperCase());
						workingName += ' ';
					}
					let moveName = workingName.substring(0, workingName.length - 1);
					if (moveName.indexOf('-') > 0) {
						if (moveName.toLowerCase() === 'u-turn') {
							//console.log('U-turn detected.');
							moveName = 'U-turn';
						}
						if (moveName.toLowerCase() === 'v-create') {
							moveName = 'V-create';
						}
						if (moveName.toLowerCase() === 'trick-or-treat') {
							moveName = 'Trick-or-Treat';
						}
					}

					//if (args.length > 1) {
					//for (let i = 1; i < args.length; i++) {
					//let word = args[i];
					//moveName += ' ' + word.replace(word.charAt(0), word.charAt(0).toUpperCase());
					//}
					//}
					let move = '';
					let i = 0;
					let found = false;
					//console.log(workingName);
					//console.log(dataArray);
					while (!found && i < dataArray.length) {
						//console.log(dataArray[i].toLowerCase());
						//console.log(dataArray[i].toString());
						//console.log(workingName.toLowerCase());
						//console.log(workingName.toString());
						//console.log(dataArray[i].toLowerCase().indexOf(workingName.toLowerCase()));
						//console.log(dataArray[i].toLowerCase().indexOf(workingName.toLowerCase()) > -1);
						//console.log(dataArray[i].toLowerCase().indexOf(' '));
						move = dataArray[i].split('\t');
						//console.log(move);
						//console.log(move[1]);
						//console.log(move[1].toLowerCase());
						//console.log(typeof move[1]);
						//console.log(workingName);
						//console.log(workingName.toLowerCase());
						//console.log(typeof workingName);
						//console.log('' + workingName.toLowerCase() + '');
						//console.log('' + workingName.toLowerCase() + '');
						//console.log(move[1].toLowerCase());
						//console.log(moveName.trim().toLowerCase());
						if (move[1].toLowerCase() === moveName.trim().toLowerCase()) {
							found = true;
						}
						i++;
					}

					if (found) {
						//data array index list 
						//mv# name type category pp power acc gen
						//0    1    2       3    4    5    6   7
						//console.log(move);
						let pp = move[4];
						//console.log(pp);
						let DCs = [20, 17, 15, 13, 10, 8];
						let dcAdjust = 8 - Math.round(pp / 5);
						let output = '';
						if (interaction.options.getString('formula') === ('original')) {
							logs.info('[movetutor] Adjusting to original formula');
							DCs = [20 + dcAdjust, 17 + dcAdjust, 15 + dcAdjust, 15, 13, 10];
						}

						for (let i = 0; i < DCs.length; i++) {
							DCs[i] += dcAdjust;
						}
						logs.info('[movetutor] Displaying results');
						output += '**' + moveName + ' Training**\n\n';
						logs.info('[movetutor] Displaying results');
						output += '**Out of Combat Checks** (Checks 1-3)\n';
						output += "Use your trainer's CHA modifier for these checks.\n";
						output += '```First DC: ' + DCs[0] + ' // ' + 'Second DC: ' + DCs[1] + ' // ' + 'Third' +
							' DC:' +
							' ' + DCs[2] + '```\n';
						output += '**In Combat Checks** (Checks 4-6)\n';
						output += "Replace your trainer's CHA modifier with your pokemon's INT modifier (*or 0 if" +
							" it's negative*) for these checks.\n";
						output += '```First DC: ' + DCs[3] + ' // ' + 'Second DC: ' + DCs[4] + ' // ' + 'Third' +
							' DC:' +
							' ' + DCs[5] + '```\n';
						output += ':small_blue_diamond: **First Evolutionary Stage** gets **+5** to the check if' +
							" it's the first stage that can learn the move\n";
						output += ':small_orange_diamond: **Second Evolutionary Stage** gets **+2** to the check' +
							" if it's the second evolution" +
							' stage that can learn' +
							' the move.\n';
						interaction.followUp(output);
						//let index = data.search(workingName);
						//index += workingName.length;
					} else {
						interaction.followUp('Unable to find move: ' + moveName + '. Please check your spelling.');
					}
				}
			});
		} else if (interaction.options.getSubcommand() === 'legacy') {
			//data array index list 
			//mv# name type category pp power acc gen
			//0    1    2       3    4    5    6   7
			//console.log(move);
			let pp = interaction.options.getInteger('pp-value');
			//console.log(pp);
			let DCs = [20, 17, 15, 13, 10, 8];
			let dcAdjust = 8 - Math.round(pp / 5);
			let output = '';
			if (interaction.options.getString('formula') === ('original')) {
				logs.info('[movetutor] Adjusting to original formula');
				DCs = [20 + dcAdjust, 17 + dcAdjust, 15 + dcAdjust, 15, 13, 10];
			}

			for (let i = 0; i < DCs.length; i++) {
				DCs[i] += dcAdjust;
			}
			logs.info('[movetutor] Displaying results');
			output += '** Move Training**\n\n';
			logs.info('[movetutor] Displaying results');
			output += '**Out of Combat Checks** (Checks 1-3)\n';
			output += "Use your trainer's CHA modifier for these checks.\n";
			output += '```First DC: ' + DCs[0] + ' // ' + 'Second DC: ' + DCs[1] + ' // ' + 'Third' +
				' DC:' +
				' ' + DCs[2] + '```\n';
			output += '**In Combat Checks** (Checks 4-6)\n';
			output += "Replace your trainer's CHA modifier with your pokemon's INT modifier (*or 0 if" +
				" it's negative*) for these checks.\n";
			output += '```First DC: ' + DCs[3] + ' // ' + 'Second DC: ' + DCs[4] + ' // ' + 'Third' +
				' DC:' +
				' ' + DCs[5] + '```\n';
			output += ':small_blue_diamond: **First Evolutionary Stage** gets **+5** to the check if' +
				" it's the first stage that can learn the move\n";
			output += ':small_orange_diamond: **Second Evolutionary Stage** gets **+2** to the check' +
				" if it's the second evolution" +
				' stage that can learn' +
				' the move.\n';
			interaction.followUp(output);
		}else {
			//ya dun goofed
			logs.info('[movetutor] Invalid tutor type, how did we get here?');
			interaction.followUp('Invalid tutor type used. The valid types are help, skill and move.');
			return;
		}
	} catch (error) {
		logs.error("[charisma] " + error.toString())
	}
}