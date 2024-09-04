const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../logs/logger.js');
const databaseURL = 'https://bulbapedia.bulbagarden.net/wiki/List_of_moves';
// Commands for moves that require randomization or calculation

const HELP_MESSAGE = "Move helper. Variables depend on subcommand"
	+ "Current subcommands: Metronome, Beat Up, Confusion"

const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;

const SQL_SANITATION_REGEX = /[^a-zA-Z0-9-'_]/;

module.exports.data = new SlashCommandBuilder()
		.setName('move')
		.setDescription('Move Helper')
		.addSubcommand(subcommand =>
			subcommand
				.setName('metronome')
				.setDescription('Generate a move to be called by Metronome')
				.addStringOption(option =>
					option.setName('typelimit')
						.setDescription('Optionally limit Metronome to only calling damaging or status moves.')
						.setRequired(false)
						.addChoices({
							name: 'Damage',
							value: 'damage'
						}, {
							name: 'Status',
							value: 'status'
						})
				))
		.addSubcommand(subcommand =>
			subcommand
				.setName('beatup')
				.setDescription('Calculate damage for beat up base power for given Pokemon. Must be in bot.')
				.addStringOption(option =>
					option.setName('userbeatup')
						.setDescription('User of Beat Up to calculate base damage of Beat Up for.')
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member1beatup')
						.setDescription('Party member to calculate base damage of Beat Up for.')
						.setRequired(false)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member2beatup')
						.setDescription('Party member to calculate base damage of Beat Up for.')
						.setRequired(false)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member3beatup')
						.setDescription('Party member to calculate base damage of Beat Up for.')
						.setRequired(false)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member4beatup')
						.setDescription('Party member to calculate base damage of Beat Up for.')
						.setRequired(false)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member5beatup')
						.setDescription('Party member to calculate base damage of Beat Up for.')
						.setRequired(false)
						.setAutocomplete(true))
					)
		.addSubcommand(subcommand =>
			subcommand
				.setName('assist')
				.setDescription('Provides a random assist-compatible move from those known by the input Pokemon. Must be in bot.')
				.addStringOption(option =>
					option.setName('party-member1assist')
						.setDescription('Party member to pull valid Assist move from.')
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member2assist')
						.setDescription('Party member to pull valid Assist move from.')
						.setRequired(false)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member3assist')
						.setDescription('Party member to pull valid Assist move from.')
						.setRequired(false)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member4assist')
						.setDescription('Party member to pull valid Assist move from.')
						.setRequired(false)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('party-member5assist')
						.setDescription('Party member to pull valid Assist move from.')
						.setRequired(false)
						.setAutocomplete(true))
					)
		.addSubcommand(subcommand =>
			subcommand
				.setName('confusion')
				.setDescription('Calculates confusion damage for a given Pokemon.')
				.addStringOption(option =>
					option.setName('pokemon')
					.setDescription('Pokemon that is hitting itself.')
					.setRequired(true)
					.setAutocomplete(true))
				.addIntegerOption(option =>
					option.setName('stages-of-attack')
					.setDescription('Stages of attack the Pokemon has. Minimum -6, maximum +6')
              		.setMaxValue(6)
              		.setMinValue(-6))
				.addIntegerOption(option =>
					option.setName('stages-of-defense')
					.setDescription('Stages of defens the Pokemon has. Minimum -6, maximum +6')
					.setMaxValue(6)
					.setMinValue(-6))
				);

module.exports.autocomplete = async (interaction) => {
	const focusedValue = interaction.options.getFocused(true);
	if (focusedValue.name === 'pokemon' || focusedValue.name === 'userbeatup' || focusedValue.name === 'party-member1beatup' || focusedValue.name === 'party-member2beatup' || focusedValue.name === 'party-member3beatup' ||
		focusedValue.name === 'party-member4beatup' || focusedValue.name === 'party-member5beatup' ||
		focusedValue.name === 'party-member1assist' || focusedValue.name === 'party-member2assist' ||
		focusedValue.name === 'party-member3assist' || focusedValue.name === 'party-member4assist' ||
		focusedValue.name === 'party-member5assist') {
		var choices = interaction.client.pokemonCache;
		const filtered = choices.filter(choice => (!choice.private || (choice.discordID == interaction.user)) && choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
		await interaction.respond(
			filtered.map(choice => ({ name: choice.name, value: choice.name })),
		)
	}
};

module.exports.run = async (interaction) => {

	var metronomeunselectable = 
		["After You", "Apple Acid", "Armor Cannon", "Astral Barrage",
		"Baneful Bunker", "Behemoth Bash", "Behemoth Blade", "Belch",
		"Blazing Torque", "Body Press", "Branch Poke", "Breaking Swipe",
		"Celebrate", "Chilling Water", "Chilly Reception", "Collision Course",
		"Combat Torque", "Comeuppance", "Copycat", "Counter",
		"Covet", "Destiny Bond", "Detect", "Diamond Storm",
		"Doodle", "Double Shock", "Dragon Ascent", "Dragon Energy",
		"Drum Beating", "Dynamax Cannon", "Electro Drift", "Endure",
		"False Surrender", "Feint", "Fiery Wrath", "Fillet Away",
		"Fleur Cannon", "Freezing Glare", "Grav Apple", "Helping Hand",
		"Hold Hands", "Hyper Drill", "Instruct", "Jet Punch",
		"Jungle Healing", "Life Dew", "Make It Rain", "Magical Torque",
		"Mimic", "Mirror Coat", "Noxious Torque", "Order Up",
		"Origin Pulse", "Overdrive", "Population Bomb", "Pounce",
		"Power Shift", "Precipice Blades", "Protect", "Pyro Ball",
		"Quash", "Quick Guard", "Rage Fist", "Rage Powder",
		"Raging Bull", "Raging Fury", "Relic Song", "Revival Blessing",
		"Ruination", "Salt Cure", "Shed Tail", "Silk Trap",
		"Sleep Talk", "Snarl", "Snore", "Snowscape",
		"Spicy Extract", "Spiky Shield", "Spirit Break", "Steam Eruption",
		"Steel Beam", "Struggle", "Surging Strikes", "Switcheroo",
		"Thief", "Thunder Cage", "Thunderous Kick", "Tidy Up",
		"Trailblaze", "Transform", "Trick", "Twin Beam",
		"Wicket Blow", "Wicked Torque", "Wide Guard",
		"Assist", "Aura Wheel", "Beak Blast", "Bestow",
		"Chatter", "Clangorous Soul", "Crafty Shield", "Decorate",
		"Double Iron Bash", "Eternabeam", "Focus Punch", "Follow Me",
		"Freeze Shock", "Glacial Lance", "Hyperspace Fury", "Hyperspace Hole",
		"King's Shield", "Light of Ruin", "Mat Block", "Me First",
		"Meteor Assault", "Mind Blown", "Mirro Move", "Moongeist Beam",
		"Nature Power", "Nature's Madness", "Obstruct", "Photon Geyser",
		"Plasma Fists", "Secret Sword", "Shell Trap", "Sketch",
		"Snap Trap", "Snatch", "Spectral Thief", "Spotlight",
		"Strange Steam", "Sunsteel Strike", "Techno Blast", "Thousand Arrows",
		"Thousand Waves", "V-create", "Metronome"];

	var assistunselectable = 
		["Baneful Bunker", "Beak Blast", "Belch", "Bestow",
		"Bounce", "Celebrate", "Chatter", "Circle Throw",
		"Copycat", "Counter", "Covet", "Destiny Bond",
		"Detect", "Dig", "Dive", "Dragon Tail",
		"Endure", "Feint", "Fly", "Focus Punch",
		"Follow Me", "Helping Hand", "Hold Hands", "King's Shield",
		"Mat Block", "Me First", "Metronome", "Mimic",
		"Mirror Coat", "Mirror Move", "Nature Power", "Phantom Force",
		"Protect", "Rage Powder", "Roar", "Shadow Force",
		"Shell Trap", "Sketch", "Sky Drop", "Sleep Talk",
		"Snatch", "Spiky Shield", "Spotlight", "Struggle",
		"Switcheroo", "Thief", "Transform", "Trick",
		"Whirlwind", "Assist", "-", "undefined"];

	await interaction.deferReply();
	if (interaction.options.getSubcommand() === 'metronome') {
		let fs = require('fs');
			logger.info('[move] Move tutor calculations');
			logger.info('[move] Reading text file');
			//Load Moves file
			fs.readFile('./data/Moves.txt', (err, data) => {
				if (err) {
					logger.error('[move] Error reading move file.\n' + err.toString());
					interaction.followUp('Could not read move list. Please contact ChaChaBot devs.');
				} else {
					//Split moves file into one String per line
					let dataArray = data.toString().split(/\r?\n/);

					//Variables to aid in search
					let move = '';
					let found = false;
					let limitoption = interaction.options.getString('typelimit') ?? 'Null';

					while (!found) {
						//Get a random index to pull a random move
						let moveindex = Math.floor(Math.random() * (dataArray.length - 1));
						move = dataArray[moveindex].split('\t');

						let valid = true;

						//Test to see if random move meets criteria
						if (metronomeunselectable.includes(move[1])) {
							valid = false;
							logger.info('[move] Selected move not allowed, retrying');
						} else if (limitoption === 'damage' && (move[3] === "Status")) {
							valid = false;
							logger.info('[move] Selected move is Status, Damage requested - retrying');
						} else if (limitoption === 'status' && (move[3] === "Physical" || move[3] === "Special")) {
							valid = false;
							logger.info('[move] Selected move is Damage, Status requested - retrying');
						}
						if (valid){
							found = true;
							logger.info('[move] Found a move meeting all criteria');
						}
					}
					interaction.followUp("Your metronome calls " + move[1] + ". Remember your metronome cannot call another move the Pokemon using it knows!");
				}
			});
	} else if (interaction.options.getSubcommand() === 'beatup') {
		let Pokemon = require(`../models/pokemon`);


		let followup = "";
		let names = []
		if (interaction.options.getString('userbeatup').match(SQL_SANITATION_REGEX)){
            logger.error("[move] User tried to put in invalid string input.");
            interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
            return;
        }
		names.push(interaction.options.getString('userbeatup'));

		if (interaction.options.getString('party-member1beatup').match(SQL_SANITATION_REGEX)){
            logger.error("[move] User tried to put in invalid string input.");
            interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
            return;
        }
		names.push(interaction.options.getString('party-member1beatup'));
		
		if(interaction.options.getString('party-member2beatup')){
			if (interaction.options.getString('party-member2beatup').match(SQL_SANITATION_REGEX)){
				logger.error("[move] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
				return;
			}
			names.push(interaction.options.getString('party-member2beatup'));
		}
		if(interaction.options.getString('party-member3beatup')){
			if (interaction.options.getString('party-member3beatup').match(SQL_SANITATION_REGEX)){
				logger.error("[move] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
				return;
			}
			names.push(interaction.options.getString('party-member3beatup'));
		}
		if(interaction.options.getString('party-member4beatup')){
			if (interaction.options.getString('party-member4beatup').match(SQL_SANITATION_REGEX)){
				logger.error("[move] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
				return;
			}
			names.push(interaction.options.getString('party-member4beatup'));
		}
		if(interaction.options.getString('party-member5beatup')){
			if (interaction.options.getString('party-member5beatup').match(SQL_SANITATION_REGEX)){
				logger.error("[move] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
				return;
			}

			names.push(interaction.options.getString('party-member5beatup'));
		}

		let promisearray = [];

		names.forEach((element) => {

			let tempPoke = new Pokemon;
			let notFoundMessage = element + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `/listpoke` to view the Pokemon you can edit.)";
			let sql = `SELECT * FROM pokemon WHERE name = '${element}';`;
			logger.info('[move-assist] SQL query: ${sql}');
			promisearray.push(new Promise(async function(resolve, reject){ interaction.client.mysqlConnection.query(sql, async function (err, response) {
				if (err) throw err;
	
				if (response.length == 0) {
					logger.info("[move-assist] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
					followup += notFoundMessage + "\n";
				}
				else {
					// Check if user is allowed to edit the Pokemon.
					if (response[0].private > 0 && interaction.user.id !== response[0].discordID) {
						logger.info("[modpoke] Detected user attempting to access private Pokemon.")
						// If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
						interaction.reply(notFoundMessage);
						return;
					}

					await tempPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0])
						.then(response => {
	
							logger.info("[move-beatup] Got Pokemon info.");
							let math = tempPoke.statBlock.baseStats[1] / 10;
							math += 5
							followup += "Beat Up base power for " + element + " is " + math + ".\n";
	
						});
				}
				resolve();
			})}))
		});
		Promise.all(promisearray).then(() => {
			interaction.followUp(followup + "This is the base power each strike should use with the Damage command - each strike can crit and STAB individually.");
	 	 })
	}else if (interaction.options.getSubcommand() === 'assist') {
		let Pokemon = require(`../models/pokemon`);
        

		let followup = "";

		let names = []

		if (interaction.options.getString('party-member1assist').match(SQL_SANITATION_REGEX)){
            logger.error("[move] User tried to put in invalid string input.");
            interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
            return;
        }
		names.push(interaction.options.getString('party-member1assist'));
		if(interaction.options.getString('party-member2assist')){
			if (interaction.options.getString('party-member2assist').match(SQL_SANITATION_REGEX)){
				logger.error("[move] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
				return;
			}
			names.push(interaction.options.getString('party-member2assist'));
		}
		if(interaction.options.getString('party-member3assist')){
			if (interaction.options.getString('party-member3assist').match(SQL_SANITATION_REGEX)){
				logger.error("[move] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
				return;
			}
			names.push(interaction.options.getString('party-member3assist'));
		}
		if(interaction.options.getString('party-member4assist')){
			if (interaction.options.getString('party-member4assist').match(SQL_SANITATION_REGEX)){
				logger.error("[move] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
				return;
			}
			names.push(interaction.options.getString('party-member4assist'));
		}
		if(interaction.options.getString('party-member5assist')){
			if (interaction.options.getString('party-member5assist').match(SQL_SANITATION_REGEX)){
				logger.error("[move] User tried to put in invalid string input.");
				interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
				return;
			}

			names.push(interaction.options.getString('party-member5assist'));
		}
		let movelist = [];
		let promisearray = [];

		names.forEach((element) => {

			let tempPoke = new Pokemon;
			let notFoundMessage = element + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `/listpoke` to view the Pokemon you can edit.)";
			let sql = `SELECT * FROM pokemon WHERE name = '${element}';`;
			logger.info('[move-assist] SQL query: ${sql}');
			promisearray.push(new Promise(async function(resolve, reject){ interaction.client.mysqlConnection.query(sql, async function (err, response) {
				if (err) throw err;
	
				if (response.length == 0) {
					logger.info("[move-assist] Pokemon not found in database. Please check your spelling, or the Pokemon may not be there.")
					followup += notFoundMessage + "\n";
				}
				else {
					// Check if user is allowed to edit the Pokemon.
					if (response[0].private > 0 && interaction.user.id !== response[0].discordID) {
						logger.info("[modpoke] Detected user attempting to access private Pokemon.")
						// If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
						interaction.reply(notFoundMessage);
						return;
					}

					await tempPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0])
						.then(response => {
	
							logger.info("[move-assist] Got Pokemon info.");
							if(tempPoke.moveSet.move1){
								movelist.push(tempPoke.moveSet.move1);
							}
							if(tempPoke.moveSet.move2){
								movelist.push(tempPoke.moveSet.move2);
							}
							if(tempPoke.moveSet.move3){
								movelist.push(tempPoke.moveSet.move3);
							}
							if(tempPoke.moveSet.move4){
								movelist.push(tempPoke.moveSet.move4);
							}
	
						});
				}
				resolve();
			})}))
		});
		Promise.all(promisearray).then(() => {
			//Variables to aid in search
			let move = '';
			let validmoves = [];
			movelist.forEach((element) => {
				if (typeof element === "string") {
					let badmove = assistunselectable.includes(element);
					if (!badmove) {
						validmoves.push(element);
					}
				}
			});
			if(validmoves.length == 0){
				move = "Nothing - no moves found recorded in given party members";
			}else{
				let moveindex = Math.floor(Math.random() * (validmoves.length - 1));
				move = validmoves[moveindex];
			}
			interaction.followUp(followup + "Assist calls " + move + ".");
	 	 })
	}else if (interaction.options.getSubcommand() === 'confusion') {   
        let Pokemon = require(`../models/pokemon`);
        let tempPoke = new Pokemon;
		let pokeName = interaction.options.getString('pokemon');
		if (pokeName.match(SQL_SANITATION_REGEX)){
            logger.error("[move] User tried to put in invalid string input.");
            interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
            return;
        }
		let atkStages = 0;
		let defStages = 0;
		let numDice = 8;
		let dice = 0;
		for (numDice; numDice > 0; numDice--) {
			dice += Math.floor(Math.random() * 8 + 1);
		  }
		if(interaction.options.getInteger('stages-of-attack')){
			atkStages = interaction.options.getInteger('stages-of-attack'); //Stages Attack
		}
      	
   		if(interaction.options.getInteger('stages-of-defense')){
			defStages = interaction.options.getInteger('stages-of-defense'); //Stages Defense 
		}

		let stageModAtk = 0;
		let stageModDef = 0;
		if (atkStages > -1) {
			stageModAtk = (2 + atkStages) / 2;
		} else {
			stageModAtk = 2 / (Math.abs(atkStages) + 2);
		}
		//
		// parse defense stages into the effect it has on damage.
		//
		if (defStages > -1) {
			stageModDef = (2 + defStages) / 2;
		} else {
			stageModDef = 2 / (Math.abs(defStages) + 2);
		}

		let sql = `SELECT * FROM pokemon WHERE name = '${pokeName}';`;
		logger.info(`[moves-confusion SQL query: ${sql}`);
		interaction.client.mysqlConnection.query(sql, function (err, response) {
			if (err) throw err;

			if (response.length === 0) {
				let pokeNotFoundMessage = "Pokemon not found in database. Please check your spelling, or the Pokemon may" +
					" not be there.";
				logger.info("[showpoke] " + pokeNotFoundMessage);
				interaction.followUp(pokeNotFoundMessage);
			}
			else {
                    // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
                    if (response[0].private > 0 && interaction.user.id !== response[0].discordID) {
                        logger.info("[modpoke] Detected user attempting to access private Pokemon.")
                        // If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
                        interaction.followUp(notFoundMessage);
                        return;
                    }

					tempPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0])
                        .then(response => {
							let atkStat = tempPoke.statBlock.finalStats[ATK_ARRAY_INDEX];
							let defStat = tempPoke.statBlock.finalStats[DEF_ARRAY_INDEX];

							let damageTotal = ((10 * tempPoke.level + 10)/250) * ((atkStat * stageModAtk) / (defStat * stageModDef)) * dice;
							damageTotal = damageTotal.toFixed(2);
							let combatString = `${pokeName} deals ${damageTotal} damage to themselves (Damage roll ${dice}).`
							interaction.followUp(combatString);
						});
			}
		});
	};
}

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  }