const logger = require('../logs/logger.js');

// Generates a new ChaCha Pokemon, given level & base stats

//message template
const CMD_TEMPLATE = '+genpoke [SPECIES] [LEVEL (1-20)] [NICKNAME - no spaces or special characters] [HIDDEN' +
	' ABILITY % (as a number, 0-100)]';
//help message
const HELP_MESSAGE = '\n`+genpoke [species] [level (1-20)] [nickname] [Form Name] [hidden ability % (as a number, 0-100)]\n' +
	'**FIELDS TO ADD LATER:**\n [trainerName] [private (optional: leave blank if public, put 1 if private]`' +
	'\n\nCreates a new Pokemon when given the values above, printing it upon completion.\n\n';

/*
const HELP_MESSAGE = '\n' + CMD_TEMPLATE + '\n\n' + 'examples - `+genpoke Pikachu 1 Pika` or `+genpoke Pikachu 1' +
	' Pika' +
	' 30`' +
	' (30% chance to have hidden ability)' +
	'\n\nCreates a new Pokemon when given the values above, printing it upon completion. \n**Created as private by' +
	' default** - use `+modpoke (name) private 0` to make publicly visible/editable\n\n' +
	'(Hint: You can view an existing Pokemon with `+showpoke [nickname]`, or remove it using `+rempoke [nickname]`';
*/
module.exports.run = (client, connection, P, message, args) => {

	let Pokemon = require('../models/pokemon.js');

	if (args[0] === "help") {
		message.reply('New Pokemon Generator. Variables in order:\n [Pokemon Species] [Level] [Pokemon Name] [Form Name] [Hidden Ability % (optional - CURRENTLY BROKEN)]').catch(console.error);
		logger.info("[genpoke] Sending help message.");
		message.reply(HELP_MESSAGE).catch(console.error);
		return;
	}

	if (args.length < 4) {
		logger.info("[genpoke] Sending not enough arguments warning.");
		message.channel.send("You haven't provided enough arguments. Should be " + CMD_TEMPLATE)
		return;
	}

	if (args[2].match(/[-\/\\^$*+?.()|[\]{}'"\s]/)) {
		logger.warn("[showpoke] User put special character in pokemon name, sending warning.");
		message.reply("Please do not use special characters when using generating Pokemon.");
		return;
	}

	try {
		let genPokemon = new Pokemon(args[0].toLowerCase(), args[1], args[2], args[3]);
		// assign hidden ability chance, if listed
		//if (args[3] !== null) genPokemon.haChance = args[3];
		// initialize the Pokemon
		/* istanbul ignore next */
		genPokemon.init(connection, P)
			.then(function (response) {
				// upload pokemon to database
				logger.info("[genpoke] Uploading pokemon to database.");
				genPokemon.uploadPokemon(connection, message);

				// post embed
				logger.info("[genpoke] Sending summary message.");
				message.channel.send(genPokemon.sendSummaryMessage(client));

				// alert user that their poke has been added to the database
				logger.info("[genpoke] Sending upload confirmation and how to remove pokemon.");
				message.reply(genPokemon.name + " has been added to the database.\nTo remove it, use this command: `+rempoke " + genPokemon.name + "`");
			})
			.catch(function (error) {
				logger.error(error);
				message.reply(error);
			});
	}
	/* istanbul ignore next */
	catch (error) {
		logger.error(error);
		message.channel.send('ChaCha machine :b:roke while attempting to generate a Pokemon, please try again later').catch(console.error);
	}

};