const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
// Experience calculator - for fights with multiple participants

// XP table
const XPtable = [
	[6, 8, 11, 15, 20, 26, 33, 41, 50, 60, 71, 83, 96, 110, 125, 141, 158, 176, 195, 215],
	[5, 7, 9, 12, 16, 21, 27, 34, 42, 51, 61, 72, 84, 97, 111, 126, 142, 159, 177, 196],
	[3, 6, 8, 10, 13, 17, 22, 28, 35, 43, 52, 62, 73, 85, 98, 112, 127, 143, 160, 178],
	[3, 4, 7, 9, 11, 14, 18, 23, 29, 36, 44, 53, 63, 74, 86, 99, 113, 128, 144, 161],
	[0, 4, 5, 8, 10, 12, 15, 19, 24, 30, 37, 45, 54, 64, 75, 87, 100, 114, 129, 145],
	[0, 1, 5, 6, 9, 11, 13, 16, 20, 25, 31, 38, 46, 55, 65, 76, 88, 101, 115, 130],
	[0, 1, 2, 6, 7, 10, 12, 14, 17, 21, 26, 32, 39, 47, 56, 66, 77, 89, 102, 116],
	[0, 0, 2, 3, 7, 8, 11, 13, 15, 18, 22, 27, 33, 40, 48, 57, 67, 78, 90, 103],
	[0, 0, 0, 3, 4, 8, 9, 12, 14, 16, 19, 23, 28, 34, 41, 49, 58, 68, 79, 91],
	[0, 0, 0, 0, 4, 5, 9, 10, 13, 15, 17, 20, 24, 29, 35, 42, 50, 59, 69, 80],
	[0, 0, 0, 0, 0, 5, 6, 10, 11, 14, 16, 18, 21, 25, 30, 36, 43, 51, 60, 70],
	[0, 0, 0, 0, 0, 0, 6, 7, 11, 12, 15, 17, 19, 22, 26, 31, 37, 44, 52, 61],
	[0, 0, 0, 0, 0, 0, 0, 7, 8, 12, 13, 16, 18, 20, 23, 27, 32, 38, 45, 53],
	[0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 13, 14, 17, 19, 21, 24, 28, 33, 39, 46],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 10, 14, 15, 18, 20, 22, 25, 29, 34, 40],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 15, 16, 19, 21, 23, 26, 30, 35],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 16, 17, 20, 22, 24, 27, 31],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 13, 17, 18, 21, 23, 25, 28],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 14, 18, 19, 22, 24, 26],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 15, 19, 20, 23, 25]
]

module.exports.data = new SlashCommandBuilder()
	.setName('experience')
	.setDescription("Calculate experience gained from a battle. At least one (and up to 6) Pokemon on either side.")
	.addIntegerOption(option =>
		option.setName('winner-level1')
			.setDescription('Level of first Pokemon winning the battle.')
			.setRequired(true)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('defeated-level1')
			.setDescription('Level of first defeated Pokemon.')
			.setRequired(true)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('winner-level2')
			.setDescription('Level of additional Pokemon winning the battle, if applicable.')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('winner-level3')
			.setDescription('Level of additional Pokemon winning the battle, if applicable.')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('winner-level4')
			.setDescription('Level of additional Pokemon winning the battle, if applicable.')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('winner-level5')
			.setDescription('Level of additional Pokemon winning the battle, if applicable.')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('winner-level6')
			.setDescription('Level of additional Pokemon winning the battle, if applicable.')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('defeated-level2')
			.setDescription('Level of additional defeated Pokemon, if applicable')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('defeated-level3')
			.setDescription('Level of additional defeated Pokemon, if applicable')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('defeated-level4')
			.setDescription('Level of additional defeated Pokemon, if applicable')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('defeated-level5')
			.setDescription('Level of additional defeated Pokemon, if applicable')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			))
	.addIntegerOption(option =>
		option.setName('defeated-level6')
			.setDescription('Level of additional defeated Pokemon, if applicable')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
				{ name: '16', value: 16 },
				{ name: '17', value: 17 },
				{ name: '18', value: 18 },
				{ name: '19', value: 19 },
				{ name: '20', value: 20 },
			));

module.exports.run = async (interaction) => {
	await interaction.deferReply();

	let winnercount = 1;

	let winnerarray = [interaction.options.getInteger("winner-level1")];
	if (interaction.options.getInteger("winner-level2")) {
		winnerarray.push(interaction.options.getInteger("winner-level2"))
		winnercount++;
	} else {
		winnerarray.push(0);
	}
	if (interaction.options.getInteger("winner-level3")) {
		winnerarray.push(interaction.options.getInteger("winner-level3"))
		winnercount++;
	} else {
		winnerarray.push(0);
	}
	if (interaction.options.getInteger("winner-level4")) {
		winnerarray.push(interaction.options.getInteger("winner-level4"))
		winnercount++;
	} else {
		winnerarray.push(0);
	}
	if (interaction.options.getInteger("winner-level5")) {
		winnerarray.push(interaction.options.getInteger("winner-level5"))
		winnercount++;
	} else {
		winnerarray.push(0);
	}
	if (interaction.options.getInteger("winner-level6")) {
		winnerarray.push(interaction.options.getInteger("winner-level6"))
		winnercount++;
	} else {
		winnerarray.push(0);
	}

	let defeatedarray = [interaction.options.getInteger("defeated-level1")]
	if (interaction.options.getInteger("defeated-level2")) {
		defeatedarray.push(interaction.options.getInteger("defeated-level2"))
	} else {
		defeatedarray.push(0);
	}
	if (interaction.options.getInteger("defeated-level3")) {
		defeatedarray.push(interaction.options.getInteger("defeated-level3"))
	} else {
		defeatedarray.push(0);
	}
	if (interaction.options.getInteger("defeated-level4")) {
		defeatedarray.push(interaction.options.getInteger("defeated-level4"))
	} else {
		defeatedarray.push(0);
	}
	if (interaction.options.getInteger("defeated-level5")) {
		defeatedarray.push(interaction.options.getInteger("defeated-level5"))
	} else {
		defeatedarray.push(0);
	}
	if (interaction.options.getInteger("defeated-level6")) {
		defeatedarray.push(interaction.options.getInteger("defeated-level6"))
	} else {
		defeatedarray.push(0);
	}

	let reply = "";

	winnerarray.forEach((winner, index) => {
		if (winner > 0) {
			let XP = 0;
			defeatedarray.forEach((loser) => {
				if (loser > 0) {
					XP += XPtable[winner - 1][loser - 1]
				}
			});
			let finalXP = Math.floor(XP / winnercount);
			if (XP > 0 && finalXP == 0) {
				finalXP = 1;
			}
			reply += "Pokemon " + (index+1) + " receives " + finalXP + " experience."
			if (winnercount > 1){
				reply += " This was " + XP + " divided by " + winnercount + " Pokemon earning experience.";
			}
			reply += "\n"
		}
	});

	interaction.followUp(reply);


}