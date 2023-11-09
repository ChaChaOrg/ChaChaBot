const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

// Generates a new ChaCha Pokemon, given level & base stats

//message template
const CMD_TEMPLATE = '/genpoke [SPECIES] [LEVEL (1-20)] [NICKNAME - no spaces or special characters] [Form Name] [HIDDEN' +
	' ABILITY % (as a number, 0-100)]';
//help message

const HELP_MESSAGE = `Generates a Pokemon and adds it to the database. Minimum requirements are the pokemon's species, level (1-20),and nickname.

	If desired, you can specify a form and hidden ability, but unless the form is stored in our database, it will default to the base species listed at the beginning.

	Example standard Pokemon:
	/genpoke Meganium 10 Meggie
OR /genpoke Meganium 10 Meggie Meganium 50 (generates a meganium with a 50% chance of having it's hidden ability)

Example Kantonian Vulpix:
	/genpoke Vulpix 10 VulKanto

Example Alolan Vulpix:
	/genpoke Vulpix 10 VulAlola vulpix-alola

After creating your Pokemon, we suggest using /showpoke (nickname) to preview them properly.`;

/*
const HELP_MESSAGE = '\n' + CMD_TEMPLATE + '\n\n' + 'examples - `/genpoke Pikachu 1 Pika` or `/genpoke Pikachu 1' +
	' Pika' +
	' 30`' +
	' (30% chance to have hidden ability)' +
	'\n\nCreates a new Pokemon when given the values above, printing it upon completion. \n**Created as private by' +
	' default** - use `/modpoke (name) private 0` to make publicly visible/editable\n\n' +
	'(Hint: You can view an existing Pokemon with `/showpoke [nickname]`, or remove it using `/rempoke [nickname]`';
*/
// /genpoke [SPECIES] [LEVEL (1-20)] [NICKNAME - no spaces or special characters] [Form Name] [HIDDEN' +
// 	' ABILITY % (as a number, 0-100)]';
module.exports.data = new SlashCommandBuilder()
		.setName('genpoke')
		.setDescription('Generate a new pokemon')
		.addStringOption(option =>
			option.setName('species')
				.setDescription('Species of the Pokemon being generated')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('level')
				.setDescription('Level of the Pokemon being generated. Minimum 1, maximum 20')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(20))
		.addStringOption(option =>
			option.setName('nickname')
				.setDescription('Nickname of the Pokemon being generated. Do not use spaces or special characters!')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('form')
				.setDescription('Form name of the Pokemon if it is different from the species.')
				.setRequired(false))
		// .addIntegerOption(option =>
		// 	option.setName('hidden-ability')
		// 		.setDescription('Hidden ability percentage from 0 - 100.')
		// 		.setRequired(false)
		// 		.setMinValue(0)
		// 		.setMaxValue(100))

module.exports.run = async (interaction) => {
	await interaction.deferReply();

	let Pokemon = require('../models/pokemon.js');

	if (interaction.options.getString('nickname').match(/[-\/\\^$*+?.()|[\]{}'"\s]/)) {
		logger.warn("[showpoke] User put special character in pokemon name, sending warning.");
		interaction.followUp("Please do not use special characters when using generating Pokemon.");
		return;
	}

	try {
		let genPokemon = new Pokemon(interaction.options.getString('species'), interaction.options.getInteger('level'),
			interaction.options.getString('nickname'), interaction.options.getString('form'));
		// assign hidden ability chance, if listed
		//if (args[3] !== null) genPokemon.haChance = args[3];
		// initialize the Pokemon
		/* istanbul ignore next */
		genPokemon.init(interaction.client.mysqlConnection, interaction.client.pokedex)
			.then(function (response) {
				// upload pokemon to database
				logger.info("[genpoke] Uploading pokemon to database.");
				genPokemon.uploadPokemon(interaction.client.mysqlConnection, interaction);

				// post embed
				logger.info("[genpoke] Sending summary interaction.");
				interaction.channel.send({ embeds: [genPokemon.sendSummaryMessage(interaction).embed] });

				// alert user that their poke has been added to the database
				logger.info("[genpoke] Sending upload confirmation and how to remove pokemon.");
				interaction.followUp(genPokemon.name + " has been added to the database.\nTo remove it, use this command: `/rempoke " + genPokemon.name + "`");
			})
			.catch(function (error) {
				logger.error(error);
				interaction.followUp(error);
			});
	}
	/* istanbul ignore next */
	catch (error) {
		logger.error(error);
		interaction.channel.send('ChaCha machine :b:roke while attempting to generate a Pokemon, please try again later').catch(console.error);
	}

};
