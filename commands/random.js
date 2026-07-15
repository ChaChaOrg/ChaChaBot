const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
// Random Pokemon / Move / Ability Generator

module.exports.data = new SlashCommandBuilder()
	.setName('random')
	.setDescription("Generate a random Pokemon, Move, or Ability.")
	.addStringOption(option =>
		option.setName('category')
			.setDescription('Choose which random value to generate')
			.setRequired(true)
			.addChoices(
				{ name: 'Pokemon Species', value: 'pokemon' },
				{ name: 'Move', value: 'move' },
				{ name: 'Ability', value: 'ability' },
			));

module.exports.run = async (interaction) => {

	console.log("USER: " + interaction.user + " RUNNING RANDOM: " + interaction.toString());
	logger.info("USER: " + interaction.user + " RUNNING RANDOM: " + interaction.toString());
	
	await interaction.deferReply();
	let choice = interaction.options.getString('category');

	if (choice === 'pokemon'){
		interaction.client.pokedex.getPokemonsList().then((pokemonPool) => {
			let randomIndex = Math.random() * Math.floor(pokemonPool.results.length - 1);
			let arrayPos = Math.floor(randomIndex);
			let random = pokemonPool.results[arrayPos].name;
			let randomClean = random.charAt(0).toUpperCase() + random.slice(1);
			randomClean = randomClean.replace("-", " ");
			logger.info("[random] Random Species: " + randomClean);
			console.log("[random] Random Species: " + randomClean);
			interaction.followUp("Random Pokemon Species: " + randomClean);
		})
	}else if (choice === 'move'){
		interaction.client.pokedex.getMovesList().then((movePool) => {
			let randomIndex = Math.random() * Math.floor(movePool.results.length - 1);
			let arrayPos = Math.floor(randomIndex);
			let random = movePool.results[arrayPos].name;
			let randomClean = random.charAt(0).toUpperCase() + random.slice(1);
			randomClean = randomClean.replace("-", " ");
			logger.info("[random] Random Move: " + randomClean);
			console.log("[random] Random Move: " + randomClean);
			interaction.followUp("Random Move: " + randomClean);
		})
	}else if (choice === 'ability'){
		interaction.client.pokedex.getAbilitiesList().then((abilityPool) => {
			let randomIndex = Math.random() * Math.floor(abilityPool.results.length - 1);
			let arrayPos = Math.floor(randomIndex);
			let random = abilityPool.results[arrayPos].name;
			let randomClean = random.charAt(0).toUpperCase() + random.slice(1);
			randomClean = randomClean.replace("-", " ");
			logger.info("[random] Random Ability: " + randomClean);
			console.log("[random] Random Ability: " + randomClean);
			interaction.followUp("Random Ability: " + randomClean);
		})
	}else{
		//Error
		logger.info("[random] Somehow chose nothing to generate.")
		console.log("[random] Somehow chose nothing to generate.")
        interaction.followUp("Error generating a random value.");
        return;
	}

}