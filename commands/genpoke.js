// Generates a new ChaCha Pokemon, given level & base stats

module.exports.run = (client, connection, P, message, args) => {

	let Pokemon = require('../pokemon.js');

	if (args[0] === "help"){
		message.reply('New Pokemon Generator. Variables in order:\n [Pokemon Species] [Level] [Pokemon Name] [Hidden Ability % (optional - CURRENTLY BROKEN)]').catch(console.error);
		return;
	}
	try{
		let genPokemon = new Pokemon(args[0].toLowerCase(), args[1], args[2]);
		genPokemon.init(P, message)
			.then( function(response){
				// upload pokemon to database
				genPokemon.uploadPokemon(connection, message);
				// post embed
				message.channel.send(genPokemon.sendSummaryMessage(client));
				// alert user that their poke has been added to the database
				message.reply(genPokemon.name + " has been added to the database.\nTo remove it, use this command: `+rempoke " + genPokemon.name + "`");
			});

	}
	catch(error) {
		console.log(error);
		message.channel.send('ChaCha machine :b:roke while attempting to generate a Pokemon, please try again later').catch(console.error);
	}
	
};