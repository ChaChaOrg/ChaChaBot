// Damage Calculator

exports.run = (client, message, args) => {
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
			if (attackName.includes('help')) {
				message.reply('Damage Calculator. Variables in order:\n [Attacker (A) Name] [Defender (D) Name] [A\'s Level] [A\'s Attack Stat] [D\'s Defense Stat] [Dice Roll] [STAB] [Effectiveness] [Critical Hit] [Misc Modifiers] [Stages of Attack] [Stages of Defense]').catch(console.error);
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