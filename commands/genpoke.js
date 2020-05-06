// Generates a new ChaCha Pokemon, given level & base stats

module.exports.run = (client, connection, P, message, args) => {

	let Pokemon = require('../models/pokemon.js');

	if (args[0] === "help") {
		message.reply('New Pokemon Generator. Variables in order:\n [Pokemon Species] [Level] [Pokemon Name] [Hidden Ability % (optional - CURRENTLY BROKEN)]').catch(console.error);
		return;
	}

	if (args.length < 3) {
		message.channel.send("You haven't provided enough arguments. Should be [Pokemon Species] [Level] [Pokemon Name] [Hidden Ability % (optional - CURRENTLY BROKEN)]")
		return;
	}

	try {
		let genPokemon = new Pokemon(args[0].toLowerCase(), args[1], args[2]);
		genPokemon.init(P, message)
			.then(function (response) {
				message.channel.send(genPokemon.sendSummaryMessage(client));
				genPokemon.uploadPokemon(connection, message);
			});

	}
	catch (error) {
		console.log(error);
		message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}

};