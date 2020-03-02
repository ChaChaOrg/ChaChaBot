// Generates a new ChaCha Pokemon, given level & base stats

module.exports.run = (client, connection, P, message, args) => {

	// get pokemon.js to create the actual poke itself lol
	let Pokemon = require('../pokemon.js');

	//help command explains how to use this to make a poke
	if (args[0] === "help"){
		message.reply('New Pokemon Generator. Variables in order:\n [Pokemon Species] [Level] [Pokemon Name] [Hidden Ability % (optional - CURRENTLY BROKEN)]').catch(console.error);
	}
	// attempt to create the pokemon itself
	try{

		//import the pokemon args to generate it
		let genPokemon = new Pokemon.Pokemon(args[0].toLowerCase(), args[1], args[2]);
		let genPromise = genPokemon.init(P, message);
		genPromise
			.then(function(response){
				// remind user to react to save the pokemon to the sql
				let loadingEmbed = genPokemon.sendLoadingMessage(client);
				message.channel.send(loadingEmbed).catch(console.error);

				//grab embed message
				let pokeEmbed = genPokemon.sendSummaryMessage(client);

				//send message to channel
				let pokeEmbedMessage = message.channel.send(pokeEmbed);
				pokeEmbedMessage.id.react("💾").catch(console.error);


				//savecheck lets bot check reaction and user id
				const savecheck = (reaction, user) => {
					return ['💾'].includes(reaction.emoji.name) && user.id === message.author.id;
				};
				//look at reactions- if the creator of the message reacts appropriately, save to sql
				pokeEmbedMessage.awaitReactions(savecheck, {max: 1, time: 60000, errors: ['time']})
					.then(collected => {
						//grab the reaction from the collected thingy
						const reaction = collected.first();

						/*if the person who reacted was the one who sent the initial message, then the
						pokemon is saved and a confirmation message is printed */
						if (reaction.emoji.name === '💾'){
							message.channel.send(genPokemon.uploadPokemon(connection, message)).catch(console.error);
						} else { /* nothing happens otherwise */ }
					});
			});

	}
	catch(error) {
		console.log(error);
		message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
	
};