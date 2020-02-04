// Generates a new ChaCha Pokemon, given level & base stats

module.exports.run = (client, connection, P, message, args) => {

	let Pokemon = require('../pokemon.js');

	if (args[0] === "help"){
		message.reply('New Pokemon Generator. Variables in order:\n [Pokemon Species] [Level] [Pokemon Name] [Hidden Ability % (optional - CURRENTLY BROKEN)]').catch(console.error);
	}
	try{
		let genPokemon = new Pokemon.Pokemon(args[0], args[1], args[2], P);
		let genPromise = genPokemon.init(P);
		genPromise
			.then( function(response){
				message.channel.send(genPokemon.sendSummaryMessage(client));
			});

	}
	catch(error) {
		console.log(error);
		message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
	
};