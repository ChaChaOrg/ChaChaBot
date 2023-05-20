const logger = require('../logs/logger.js');

// JavaScript Document
// takes a number, gives the mod
module.exports.data = new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Quick Mod Calculator')
		.addIntegerOption(option =>
			option.setName('stat')
				.setDescription('stat you wanted to calculate')
				.setRequired(true));


module.exports.run = async (interaction) => 

	//interaction.channel.send('Bang! <:gunspurr:356191158017196032>').catch(console.error);
	var score = interaction.options.getInteger('stat');
	if (score % 2 !== 0) { score = score - 1; } //lower odd numbers by 1
	var rawMod = ((score - 10) / 2);
	rawMod = rawMod.toFixed(0);
	var modString;
	if (rawMod > 0) {
		modString = "+" + rawMod.toString();
	} else {
		modString = rawMod.toString();
	}

	logger.info("[mod] " + `${args[0]}(${modString})`)
	interaction.channel.send(`${args[0]}(${modString})`).catch(console.error);
};
