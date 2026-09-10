const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../logs/logger.js');
const SQL_SANITATION_REGEX = /[^a-zA-Z0-9-'_]/;
// Catch calculator

const HELP_MESSAGE = "Catch Rate Calculator. Variables in order:\n "
	+ "[Pokemon Name] [Max HP] [Current HP] [Catch Rate] [Pokeball Bonus] [Status Bonus] "
	+ "[Capture Power Bonus] [Player Catch Bonus] [Pokemon Level]\n"
	+ "Default bonus values are: \n\tPokeball = 1\n\tStatus = 1\n\tCapture Power = 1\n\tPlayer Catch = 1"



module.exports.data = new SlashCommandBuilder()
	.setName('catch')
	.setDescription('Pokemon Catch Rate Calculator')
	.addSubcommand(subcommand =>
		subcommand
			.setName('automatic')
			.setDescription('Gets CatchRate and Level automatically from a Pokemon in the bot.')
			.addStringOption(option =>
				option.setName('pokemon-auto')
					.setDescription('Name of the Pokemon being caught')
					.setRequired(true))
			.addIntegerOption(option =>
				option.setName('max-hp')
					.setDescription('Max HP of the Pokemon being caught')
					.setRequired(true))
			.addIntegerOption(option =>
				option.setName('current-hp')
					.setDescription('Current HP of the Pokemon being caught')
					.setRequired(true))
			.addNumberOption(option =>
				option.setName('ball-bonus')
					.setDescription('Bonus from Pokeball'))
			.addNumberOption(option =>
				option.setName('player-bonus')
					.setDescription('Bonus from Player'))
			.addNumberOption(option =>
				option.setName('cp-bonus')
					.setDescription('Bonus from Capture Power'))
			.addNumberOption(option =>
				option.setName('status-bonus')
					.setDescription('Bonus from Status')))
	.addSubcommand(subcommand =>
		subcommand
			.setName('manual')
			.setDescription('Uses input CatchRate.')
			.addStringOption(option =>
				option.setName('pokemon-name')
					.setDescription('Name of the Pokemon being caught')
					.setRequired(true))
			.addIntegerOption(option =>
				option.setName('max-hp')
					.setDescription('Max HP of the Pokemon being caught')
					.setRequired(true))
			.addIntegerOption(option =>
				option.setName('current-hp')
					.setDescription('Current HP of the Pokemon being caught')
					.setRequired(true))
			.addNumberOption(option =>
				option.setName('capture-rate')
					.setDescription('Capture Rate of the Pokemon being caught')
					.setRequired(true))
			.addIntegerOption(option =>
				option.setName('level')
					.setDescription('Level of the Pokemon being caught')
					.setRequired(true))
			.addNumberOption(option =>
				option.setName('ball-bonus')
					.setDescription('Bonus from Pokeball'))
			.addNumberOption(option =>
				option.setName('player-bonus')
					.setDescription('Bonus from Player'))
			.addNumberOption(option =>
				option.setName('cp-bonus')
					.setDescription('Bonus from Capture Power'))
			.addNumberOption(option =>
				option.setName('status-bonus')
					.setDescription('Bonus from Status')));

module.exports.autocomplete = async (interaction) => {
	const focusedValue = interaction.options.getFocused(true);
	if (focusedValue.name === 'pokemon-auto') {
		var choices = interaction.client.pokemonCache;
		const filtered = choices.filter(choice => (!choice.private || (choice.discordID == interaction.user)) && choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
		await interaction.respond(
			filtered.map(choice => ({ name: choice.name, value: choice.name })),
		)
	} else {
		//nothing
	}
}

module.exports.run = async (interaction) => {
	//get pokeball emoji
	await interaction.deferReply();

	//const shakey = interaction.client.emojis.find(emoji => emoji.name === "poke_shake");
	const shakey = '[PokeBall Emoji]'
	logger.info('found emoji');


	try {		
		var bball;
		let pokeball_match = interaction.options.getNumber('ball-bonus');
		if (pokeball_match) {
			bball = pokeball_match;
		} else {
			bball = 1;
		}

		var bstatus;
		let status_match = interaction.options.getNumber('status-bonus');
		if (status_match) {
			bstatus = status_match;
		} else {
			bstatus = 1;
		}

		var cpfactor;
		let capture_power_match = interaction.options.getNumber('cp-bonus');
		if (capture_power_match) {
			cpfactor = capture_power_match;
		} else {
			cpfactor = 1;
		}

		var catchbonus;
		let player_catch_match = interaction.options.getNumber('player-bonus');
		if (player_catch_match) {
			catchbonus = player_catch_match;
		} else {
			catchbonus = 1;
		}

		var pokeName;
		var rate;
		var level;
		//list out required variables
		if (interaction.options.getSubcommand() === 'automatic') {
			pokeName = interaction.options.getString('pokemon-auto');
			let notFoundMessage = pokeName + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `/listpoke` to view the Pokemon you can edit.)";
			if (pokeName.match(SQL_SANITATION_REGEX)) {
				logger.error("[catch] User tried to put in invalid string input.");
				console.log("[catch] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid name, please keep input alphanumeric, ', - or _");
				return;
			}
			let Pokemon = require(`../models/pokemon`);
			let tempPoke = new Pokemon;
			let sql = `SELECT * FROM pokemon WHERE name = '${pokeName}';`;
			let autoSQL = new Promise(async function (resolve, reject) {
				interaction.client.mysqlConnection.query(sql, function (err, response) {
					if (err) throw err;

					if (response.length == 0) {
						logger.info("[catch] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
						console.log("[catch] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
						interaction.editReply("Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
					}
					else {
						// check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
						if (response[0].private > 0 && interaction.member.user.id !== response[0].discordID) {
							logger.info("[catch] Detected user attempting to edit private Pokemon that isn't their own.")
							console.log("[catch] Detected user attempting to edit private Pokemon that isn't their own.")
							// If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
							interaction.editReply(notFoundMessage);
							return;
						}

						tempPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0])
							.then(response => {
								level = tempPoke.statBlock.level;
								tempPoke.getPokemonAndSpeciesData(interaction.client.mysqlConnection, interaction.client.pokedex).then(
									function (response) {
										rate = tempPoke.speciesData.capture_rate;
										resolve();
									});
							});
					}
				})
			}).catch(function (error) {
				logger.error("[move] Error during SQL or response: " + error);
				interaction.editReply("Error fetching Pokemons. This may be temporary error - please retry");
				return;
			})
			await (autoSQL);
		} else {
			pokeName = interaction.options.getString('pokemon-name');
			rate = interaction.options.getNumber('capture-rate');
			level = interaction.options.getInteger('level');
		}
		
		let maxHP = interaction.options.getInteger('max-hp');
		let curHP = interaction.options.getInteger('current-hp');
		// let bball = args[4];
		// let bstatus = args[5];
		// let cpfactor = args[6];
		// let catchbonus = args[7];
		let troubleshoot = null;

		const LINE_ONE_STRING = `data received! loading... ${shakey}\n`;
		const CRIT_CAPTURE_STRING = `:star2: **CLICK!** :star2:\nIt's a critical capture! ${pokeName} has been caught `
		const SHAKES_ONCE_STRING = `The ball shakes once...\n`;
		const SHAKES_TWICE_STRING = `...it shakes twice...\n`;
		const SHAKES_THREE_STRING = `......it shakes three times... (so exciting!! :fingers_crossed:)\n`;
		const CAUGHT_STRING = `:star2: **CLICK** :star2:\nDadadada! The wild ${pokeName} was caught!`;
		const SO_CLOSE_STRING = `Nooo, the ${pokeName} broke free! It was so close, too...`;
		const GOT_OUT_STRING = `Argh, the ${pokeName} got out!`;
		const OH_NO_STRING = `Oh no, the ${pokeName} broke free!`;
		const DRAT_STRING = `Drat! ${pokeName} broke free!`;
		
		logger.info("[catch] data received! loading...")

		let CumulativeString = LINE_ONE_STRING;

		await interaction.followUp(CumulativeString).catch(console.error);

		//  =========== CRITCATCH CALCULATOR ===========
		var catchBonusMod = [0, 31, 151, 301, 451, 600];
		var cMod = [0, 0.5, 1, 1.5, 2, 2.5];
		var fortyTimer = catchbonus * 40;
		var catchBonusFinal;
		var catchBonusGen = [0, 0, 0, 0, 0, 0];
		var trueCCatch = [false, false, false, false, false, false];

		//initialize true/falses
		for (i = 0; i < 6; i++) {
			if (fortyTimer > catchBonusMod[i]) {
				trueCCatch[i] = true;
			}
		}

		//generate catchBonusGen
		for (i = 0; i < 6; i++) {
			if (i === 0) {
				if (trueCCatch === true) {
					catchBonusGen[i] = cMod[i];
				} else {
					catchBonusGen[i] = 0;
				}
			} else {
				if (trueCCatch === true) {
					catchBonusGen[i] = cMod[i];
				} else {
					catchBonusGen[i] = catchBonusGen[i - 1];
				}
			}
		}

		//initializes final 
		if (fortyTimer > (catchBonusMod[5] + 150)) {
			catchBonusFinal = fortyTimer * 0.5/ 150 + 0.5;
		} else {
			catchBonusFinal = catchBonusGen[5];
		}

		// =========== END CRITCATCH CALCULATOR ===========

		//values generated from initial vals
		var a_plugValCombo = (3 * maxHP - 2 * curHP) / (3 * maxHP) * rate * bball * bstatus * cpfactor;

		//var b_shakeVal = (65536 / (255 / Math.pow(a_plugValCombo, 0.1875)));
		var b_shakeVal = (65536 / Math.pow((255 / a_plugValCombo), 0.1875));
		var b_randomShake = [
			Math.floor((Math.random() * 65535) + 1),
			Math.floor((Math.random() * 65535) + 1),
			Math.floor((Math.random() * 65535) + 1),
			Math.floor((Math.random() * 65535) + 1)
		];

		var c_critCatch = a_plugValCombo / 6 * catchBonusFinal;
		var c_randomCrit = Math.floor((Math.random() * 255)) + 1;

		//calculate if it's a critical capture!

		if ((c_critCatch > c_randomCrit) && (level <= catchbonus)) {
			logger.info("[catch] Critical capture! " + pokeName + " has been caught.")
			await interaction.followUp(CRIT_CAPTURE_STRING).catch(console.error);
			return;
		}

		// ================================= TEST STUFF, DELETE LATER!!! =================================
		if (troubleshoot != null) {
			await interaction.followUp(`PokeName: ${pokeName}\n Max HP: ${maxHP}\nCurrent HP: ${curHP}\nCatch Rate: ${rate}\nBall Rate: ${bball}\nStatus Bonus: ${bstatus}\nCapture Power Factor: ${cpfactor}\nCatch Bonus: ${catchbonus}\nPokemon Level:${level}\ncatchBonusMod: ` + catchBonusMod + `\ncMod: ` + cMod + `\nfortyTimer: ` + fortyTimer + `\ncatchBonusFinal: ` + catchBonusFinal + `\ncatchBonusGen: ` + catchBonusGen + `\ntrueCCatch: ` + trueCCatch + `\na_plugValCombo: ` + a_plugValCombo + `\nb_shakeVal: ` + b_shakeVal + `\nb_randomShake: ` + b_randomShake + `\nc_critCatch: ` + c_critCatch + `\nc_randomCrit: ` + c_randomCrit).catch(console.error);
		}


		//if not, try for a normal capture
		//TODO: try to have it post on a timer some day?
		if (b_shakeVal > b_randomShake[0]) {
			logger.info("[catch] Ball shakes once.")
			CumulativeString += SHAKES_ONCE_STRING;
			await interaction.editReply(CumulativeString).catch(console.error);
			await sleep(2000);
			if (b_shakeVal > b_randomShake[1]) {
				logger.info("[catch] Ball shakes twice.")
				CumulativeString += SHAKES_TWICE_STRING;
				await interaction.editReply(CumulativeString).catch(console.error);
				await sleep(2000);

				if (b_shakeVal > b_randomShake[2]) {
					logger.info("[catch] Ball shakes three times.")
					CumulativeString += SHAKES_THREE_STRING;
					await interaction.editReply(CumulativeString).catch(console.error);
					await sleep(2000);

					if (b_shakeVal > b_randomShake[3]) {
						logger.info("[catch] " + pokeName + " was caught!")
						CumulativeString += CAUGHT_STRING;
						await interaction.editReply(CumulativeString).catch(console.error);
					} else {
						logger.info("[catch] " + pokeName + " broke free!")
						CumulativeString += SO_CLOSE_STRING;
						await interaction.followUp(CumulativeString).catch(console.error);
					}
				
				} else {
					logger.info("[catch] " + pokeName + " broke free!")
					CumulativeString += GOT_OUT_STRING;
					await interaction.followUp(CumulativeString).catch(console.error);
				}
			
			} else {
				logger.info("[catch] " + pokeName + " broke free!")
				CumulativeString += OH_NO_STRING;
				await interaction.followUp(CumulativeString).catch(console.error);
			}
		} else {
			logger.info("[catch] " + pokeName + " broke free!")
			CumulativeString += DRAT_STRING;
			await interaction.followUp(CumulativeString).catch(console.error);
		}


	} catch (error) {
		logger.error("[catch] " + error.toString())
		console.log("[catch] " + error.toString())
		interaction.channel.send(error.toString());
		interaction.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
};

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  }