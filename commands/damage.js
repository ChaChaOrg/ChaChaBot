// Damage Calculator

// help message
const HELP_MESSAGE = "The \"manual\" damage calculator. Variables in order:\n" +
	"[Attacker (A) Name] [Defender (D) Name] [A's Level (1-20)] [A's Attack Stat] " +
	"[D's Defense Stat] [Dice Roll] [STAB] [Effectiveness] [Critical Hit] [Misc Modifiers] [Stages of Attack] [Stages of Defense]\n\n" +
	">**Value Explanations:\n" +
	"**Dice Roll:** Xd8, where X is the power of the move used divided by 5.\n" +
	"**STAB:** Same-Type Attack Bonus; 1.5 if the move used is the same type as the attacker, 1 otherwise\n" +
	"**Effectiveness:** The effectiveness of the move on the foe, as a percentage. Ie, a super-effective move would have an effectiveness of 2, while a not very effective move would have an effectiveness of .5.\n" +
	"**Critical Hit:** 1.5 if a critical hit, 1 otherwise\n" +
	"**Misc Modifiers:** Any other modifiers to the stat, as a percentage. Default = 1\n" +
	"**Stages of Attack/Defense:** 0 by default, can be -6 to 6";

exports.run = (client, connection, P, message, args) => {
	try {
			//variables required
			let attackName = args[0];
			let defendName = args[1];
			let level = parseInt(args[2]);
			let attack = parseInt(args[3]);
			let defense = parseInt(args[4]);
			let dice = parseInt(args[5]);
			let stab = parseFloat(args[6]);
			let effective = parseFloat(args[7]);
			let critical = parseFloat(args[8]);
			let other = parseFloat(args[9]);
			let bonusAtk = parseInt(args[10]);
			let bonusDef = parseInt(args[11]);
			
			//clause for helping!
			if (args[0].toUpperCase() === 'HELP') {
				message.reply(HELP_MESSAGE).catch(console.error);
				return;
			}

			//values used for calculation
			var stageModAtk = 0;
			var stageModDef = 0;
			var damageTotal = 0;

			//check if attack or defense are modded by terrain
			// attack stages
			if (bonusAtk > -1) {
				stageModAtk = ((2+bonusAtk)/2);
			} else {
				stageModAtk = (2/(Math.abs(bonusAtk) + 2));
			}
			//defense stages
			if (bonusDef > -1) {
				stageModDef = (2 + bonusDef) / 2;
			} else {
				stageModDef = (2/(Math.abs(bonusDef) + 2));
			}

			damageTotal = ((10*level+10)/250*((attack*stageModAtk)/(defense*stageModDef))*dice)*stab*effective*critical*other;
			damageTotal = damageTotal.toFixed(2);

			message.channel.send(`${attackName} deals ${damageTotal} damage to the defending ${defendName}`).catch(console.error);
		
		}
		catch (error) {
			message.channel.send(error.toString);
			message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
			
		}
}