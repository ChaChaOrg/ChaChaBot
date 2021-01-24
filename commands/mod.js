const logger = require('../logs/logger.js');

// JavaScript Document
// takes a number, gives the mod

exports.run = (client, connection, P, message, args) => {

	if (args.length > 1) {
		logger.info("[mod] Sending too many args message.")
		message.channel.send("Woahh, slow down pardner. Just give me one number and I'll give you its modifier.");
		return;
	}

	//message.channel.send('Bang! <:gunspurr:356191158017196032>').catch(console.error);
	var score = args[0];
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
	message.channel.send(`${args[0]}(${modString})`).catch(console.error);
};