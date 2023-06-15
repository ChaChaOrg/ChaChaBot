const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../logs/logger.js');
const databaseURL = 'https://bulbapedia.bulbagarden.net/wiki/List_of_moves';
// Commands for moves that require randomization or calculation

const HELP_MESSAGE = "Move helper. Variables depend on subcommand"
	+ "Current subcommands: Metronome, Beat Up"



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
				.setDescription('Calculate damage for beat up based on user and applicable Pokemon in party. All must be in bot.')
				/*
				.addStringOption(option =>
					option.setName('attacker-name')
					  .setDescription('The name of the attacker, as listed in the database')
					  .setRequired(true))
				.addStringOption(option => 
					option.setName('move-name')
					  .setDescription('The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, "rock-smash"')
					  .setRequired(true))
				.addStringOption(option => 
					option.setName('defender-name')
					  .setDescription('The name of the pokemon being hit by the attack, as listed in the database')
					  .setRequired(true))
				.addBooleanOption(option =>
					option.setName('critical-hit')
					.setDescription('If the attacker struck a critical hit Defaults to no.'))
				.addIntegerOption(option =>
					  option.setName('stages-of-attack')
					  .setDescription('Stages of attack/special attack the attacker has. Minimum -6, maximum +6')
					  .setMaxValue(6)
					  .setMinValue(-6))
				.addIntegerOption(option =>
					  option.setName('stages-of-defense')
					  .setDescription('Stages of defense/special defense the defender has. Minimum -6, maximum +6')
					  .setMaxValue(6)
					  .setMinValue(-6))
				.addIntegerOption(option =>
					  option.setName('additive-bonus')
					  .setDescription('Extra damage *added* to the base power. Usually done through ChaCha feats. Defaults to 0'))
				.addIntegerOption(option =>
					  option.setName('multiplicitive-bonus')
					  .setDescription('Extra damage *multiplying* the base power.')
					  .setMinValue(0))
				.addStringOption(option =>
					option.setName('party-members')
					.setDescription('Party members aiding in Beat Up, seperated by a space')
					.setRequired(true))*/)

		.addSubcommand(subcommand =>
			subcommand
				.setName('assist')
				.setDescription('Provides a random assist-compatible move from those known by the input Pokemon')
				.addStringOption(option =>
					option.setName('party-members')
					.setDescription('Party members to pull valid Assist move from, seperated by a space.')
					.setRequired(true)));

module.exports.run = async (interaction) => {

	var metronomeunselectable = [
		["After You", "Apple Acid", "Armor Cannon", "Astral Barrage"],
		["Baneful Bunker", "Behemoth Bash", "Behemoth Blade", "Belch"],
		["Blazing Torque", "Body Press", "Branch Poke", "Breaking Swipe"],
		["Celebrate", "Chilling Water", "Chilly Reception", "Collision Course"]
		["Combat Torque", "Comeuppance", "Copycat", "Counter"],
		["Covet", "Destiny Bond", "Detect", "Diamond Storm"],
		["Doodle", "Double Shock", "Dragon Ascent", "Dragon Energy"],
		["Drum Beating", "Dynamax Cannon", "Electro Drift", "Endure"],
		["False Surrender", "Feint", "Fiery Wrath", "Fillet Away"],
		["Fleur Cannon", "Freezing Glare", "Grav Apple", "Helping Hand"],
		["Hold Hands", "Hyper Drill", "Instruct", "Jet Punch"],
		["Jungle Healing", "Life Dew", "Make It Rain", "Magical Torque"],
		["Mimic", "Mirror Coat", "Noxious Torque", "Order Up"],
		["Origin Pulse", "Overdrive", "Population Bomb", "Pounce"],
		["Power Shift", "Precipice Blades", "Protect", "Pyro Ball"],
		["Quash", "Quick Guard", "Rage Fist", "Rage Powder"],
		["Raging Bull", "Raging Fury", "Relic Song", "Revival Blessing"],
		["Ruination", "Salt Cure", "Shed Tail", "Silk Trap"],
		["Sleep Talk", "Snarl", "Snore", "Snowscape"],
		["Spicy Extract", "Spiky Shield", "Spirit Break", "Steam Eruption"],
		["Steel Beam", "Struggle", "Surging Strikes", "Switcheroo"],
		["Thief", "Thunder Cage", "Thunderous Kick", "Tidy Up"],
		["Trailblaze", "Transform", "Trick", "Twin Beam"],
		["Wicket Blow", "Wicked Torque", "Wide Guard"],
		["Assist", "Aura Wheel", "Beak Blast", "Bestow"],
		["Chatter", "Clangorous Soul", "Crafty Shield", "Decorate"],
		["Double Iron Bash", "Eternabeam", "Focus Punch", "Follow Me"],
		["Freeze Shock", "Glacial Lance", "Hyperspace Fury", "Hyperspace Hole"],
		["King's Shield", "Light of Ruin", "Mat Block", "Me First"],
		["Meteor Assault", "Mind Blown", "Mirro Move", "Moongeist Beam"],
		["Nature Power", "Nature's Madness", "Obstruct", "Photon Geyser"],
		["Plasma Fists", "Secret Sword", "Shell Trap", "Sketch"],
		["Snap Trap", "Snatch", "Spectral Thief", "Spotlight"],
		["Strange Steam", "Sunsteel Strike", "Techno Blast", "Thousand Arrows"],
		["Thousand Waves", "V-create"]
	];

	if (interaction.options.getSubcommand() === 'metronome') {
		let fs = require('fs');
		await interaction.deferReply();
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
						let i = 0;
						//Test to see if random move meets criteria
						while (valid && i < metronomeunselectable.length){
							if(move[1] === metronomeunselectable[i]){
								valid = false;
								logger.info('[move] Selected move not allowed, retrying');
							}else if(limitoption === 'damage' && (move[3]==="Status")){
								valid = false;
								logger.info('[move] Selected move is Status, Damage requested - retrying');
							}else if(limitoption === 'status' && (move[3]==="Physical" || move[3]==="Special")){
								valid = false;
								logger.info('[move] Selected move is Damage, Status requested - retrying');
							}
							i++;
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

	} else if (interaction.options.getSubcommand() === 'assist') {

	}
};

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  }