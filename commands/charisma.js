const logger = require('../logs/logger.js');
// charisma calculator

exports.run = (interaction) => {
	//interaction.channel.send('Bang! <:gunspurr:356191158017196032>').catch(console.error);

	//variables

	//pokemon name
	let name = args[0];

	//final charisma score
	var finalCha = 0;
	//charisma mod
	var finalChaMod = 0;

	//check if asking for help
	if (name.includes('help')) {
		logger.info("[charisma] Sending help interaction.")
		interaction.reply('Charisma Generator. Variables in order:\n [Pokemon Name] [Beauty Moves] [Clever Moves] [Cool Moves] [Cute Moves] [Tough Moves]').catch(console.error);
		return;
	}

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

	logger.info("[charisma] " + `${name}'s Charisma is ${finalCha}(${finalChaModString})`)
	interaction.channel.send(`${name}'s Charisma is ${finalCha}(${finalChaModString})`);

}