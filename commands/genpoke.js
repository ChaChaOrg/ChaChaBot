// Generates a new ChaCha Pokemon, given level & base stats

//help message
const HELP_MESSAGE = '\n`+genpoke [species] [level (1-20)] [nickname] [hidden ability % (as a number, 0-100)]\n' +
	'**FIELDS TO ADD LATER:**\n [trainerName] [private (optional: leave blank if public, put 1 if private]`' +
	'\n\nCreates a new Pokemon when given the values above, printing it upon completion.\n\n' +
	'(Hint: You can view an existing Pokemon with `+showpoke [nickname]`, or remove it using `+rempoke [nickname]`';

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
		// assign hidden ability chance, if listed
		if (args[3] !== null) genPokemon.haChance = args[3];
		// initialize the Pokemon
		genPokemon.init(P, message)
			.then(function (response) {
				// upload pokemon to database
				genPokemon.uploadPokemon(connection, message);
				// post embed
				message.channel.send(genPokemon.sendSummaryMessage(client));
				// alert user that their poke has been added to the database
				message.reply(genPokemon.name + " has been added to the database.\nTo remove it, use this command: `+rempoke " + genPokemon.name + "`");
			})
			.catch(function (error) {
				message.reply(error);
			});
	}
	catch (error) {
		message.channel.send('ChaCha machine :b:roke while attempting to generate a Pokemon, please try again later').catch(console.error);
	}

};