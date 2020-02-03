// Generates a new ChaCha Pokemon, given level & base stats



exports.run = (client, connection, P, message, args) => {

		// message.reply('New Pokemon Generator. Variables in order:\n [Pokemon Name] [Level] [Base HP] [Base Atk] [Base Def] [Base SpA] [Base SpD] [Base Speed] [\% Male] [Number of Abilities Available (including hidden abilities)] [Size Bonus] [Hidden Ability % (optional)]').catch(console.error);
	let Pokemon = require('./pokemon.js');
	try{
		let genPokemon = new Pokemon(args[0], args[1], args[2])
	}
	catch(error) {
		message.channel.send(error.toString);
		message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
	
}