// Damage Calculator
const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

// help message
const HELP_MESSAGE = "The \"manual\" damage calculator. Variables in order:\n" +
	"[Attacker (A) Name] [Defender (D) Name] [A's Level (1-20)] [A's Attack Stat] " +
	"[D's Defense Stat] [Dice Roll] [STAB] [Effectiveness] [Critical Hit] [Misc Modifiers] [Stages of Attack] [Stages of Defense]\n\n" +
	">**Value Explanations:**\n" +
	"**Dice Roll:** Xd8, where X is the power of the move used divided by 5.\n" +
	"**STAB:** Same-Type Attack Bonus; 1.5 if the move used is the same type as the attacker, 1 otherwise\n" +
	"**Effectiveness:** The effectiveness of the move on the foe, as a percentage. Ie, a super-effective move would have an effectiveness of 2, while a not very effective move would have an effectiveness of .5.\n" +
	"**Critical Hit:** 1.5 if a critical hit, 1 otherwise\n" +
	"**Misc Modifiers:** Any other modifiers to the stat, as a percentage. Default = 1\n" +
	"**Stages of Attack/Defense:** 0 by default, can be -6 to 6";

module.exports.data = new SlashCommandBuilder()
	.setName("damagelegacy")
	.setDescription("The manual damage calculator.")
	.addStringOption(option =>
		option.setName("atkname")
			.setDescription("The attacker's name.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("defname")
			.setDescription("The defender's name.")
			.setRequired(true)
	)
	.addIntegerOption(option =>
		option.setName("level")
			.setDescription("The attacker's level.")
			.setRequired(true)
	)
	.addIntegerOption(option =>
		option.setName("attackstat")
			.setDescription("The attacker's attack or special attack score.")
			.setRequired(true)
	)
	.addIntegerOption(option =>
		option.setName("defensestat")
			.setDescription("The defender's defense or special defense score.")
			.setRequired(true)
	)
	.addIntegerOption(option =>
		option.setName("dice")
			.setDescription("The number rolled on the damage dice.")
			.setRequired(true)
	)
	.addNumberOption(option =>
		option.setName("stab")
			.setDescription("Either 1.5 for type match, 1 for no match or something else for special cases.")
			.setRequired(true)
	)
	.addNumberOption(option =>
		option.setName("effectiveness")
			.setDescription("How effective the move is against the defender.")
			.setRequired(true)
			.addChoices(
				{name: "Double Resist", value: 0.25},
				{name: "Resist", value: 0.5},
				{name: "Normal", value: 1.0},
				{name: "Weakness", value: 2.0},
				{name: "Double Weakness", value: 4.0},
				{name: "Immunity", value: 0.0},
			)
	)
	.addNumberOption(option =>
		option.setName("criticalmultiplier")
			.setDescription("Critical hit multiplyer. Typically either 1.5 for a crit or 1 for a normal hit.")
			.setRequired(true)
	)
	.addNumberOption(option =>
		option.setName("other")
			.setDescription("Other situational multipliers. Typically left at 1 under normal conditions.")
			.setRequired(true)
	)
	.addIntegerOption(option =>
		option.setName("attackstages")
			.setDescription("Boosts/penalties to the attacker's attack or special attack stages.")
			.setRequired(true)
	)
	.addIntegerOption(option =>
		option.setName("defensestages")
			.setDescription("Boosts/penalties to the defender's defense or special defense stages.")
			.setRequired(true)
)
	.addBooleanOption(option =>
		option.setName("help")
			.setDescription("Displays the help message when true.")
			.setRequired(false)
	);

module.exports.run = async (interaction) => {
	await interaction.deferReply();
	try {
		//variables required
		let attackName = interaction.options.getString("atkname");
		let defendName = interaction.options.getString("defname");
		let level = interaction.options.getInteger("level");
		let attack = interaction.options.getInteger("attackstat");
		let defense = interaction.options.getInteger("defensestat");
		let dice = interaction.options.getInteger("dice");
		let stab = interaction.options.getNumber("stab");
		let effective = interaction.options.getNumber("effectiveness");
		let critical = interaction.options.getNumber("criticalmultiplier");
		let other = interaction.options.getNumber("other");
		let bonusAtk = interaction.options.getInteger("attackstages");
		let bonusDef = interaction.options.getInteger("defensestages");

		//clause for helping!
		if (interaction.options.getBoolean("help")) {
			logger.info("[damagelegacy] Sending help interaction.")
			interaction.editReply(HELP_MESSAGE).catch(console.error);
			return;
		}

		//values used for calculation
		var stageModAtk = 0;
		var stageModDef = 0;
		var damageTotal = 0;

		//check if attack or defense are modded by terrain
		// attack stages
		if (bonusAtk > -1) {
			stageModAtk = ((2 + bonusAtk) / 2);
		} else {
			stageModAtk = (2 / (Math.abs(bonusAtk) + 2));
		}
		//defense stages
		if (bonusDef > -1) {
			stageModDef = (2 + bonusDef) / 2;
		} else {
			stageModDef = (2 / (Math.abs(bonusDef) + 2));
		}

		damageTotal = ((10 * level + 10) / 250 * ((attack * stageModAtk) / (defense * stageModDef)) * dice) * stab * effective * critical * other;
		damageTotal = damageTotal.toFixed(2);

		logger.info("[damagelegacy] " + `${attackName} deals ${damageTotal} damage to the defending ${defendName}`);
		interaction.editReply(`${attackName} deals ${damageTotal} damage to the defending ${defendName}`).catch(console.error);

	}
	catch (error) {
		logger.error("[damagelegacy] " + error)
		interaction.editReply(error.toString);
		interaction.editReply('ChaCha machine :b:roke, please try again later').catch(console.error);

	}
}