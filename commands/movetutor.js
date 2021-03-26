const logger = require('../logs/logger.js');
// JavaScript Document

exports.run = (client, connection, P, message, args) => {
	//message.channel.send('Bang! <:gunspurr:356191158017196032>').catch(console.error);

	//+movetutor [PokemonName] [EvoLeft (2 for 3-stage, 1 for 2-stage, 0 for no more evo)] [Move Name] [Move PP] [Successes (1-5)]

	//if asking for help, gib help
	if (args[0].includes('help')) {
		logger.info("[movetutor] Sending help message.")
		message.channel.send("The command to check the Train Pokemon DC to learn a new move.\n\n+movetutor [PokeName] [MoveName (with no spaces plz)] [MovePP] [Successes(0-5)]\n\nTo learn a skill: +movetutor [PokeName] [IntMod] Skill [SkillName]\n\nTo get evo bonuses: +movetutor evolution").catch(console.error);
		return;
	} else if (args[0].includes('evolution')) {
		logger.info("[movetutor] Sending evolution tip message.")
		message.channel.send("A Pokémon that has never evolved gains a +5 bonus to this check, \
			and a Pokémon that has evolved once gains a +2 bonus, since it is easier to learn moves at earlier stages. \
			However, this only applies if the evolutions can learn the same moves. \
			If a Pokémon is a middle stage and its previous stage does not learn the move, \
			it still gains a +5 bonus. The same applies if it is fully evolved. \
			If it is in a final stage and only the middle stage can learn the moves, \
			it gains a +2 bonus but not the +5. If it is in its final stage and neither previous stage learned the move, \
			the +5 bonus is still retained. This bonus also applies when a Pokémon is trying to use a move in battle, \
			as do all other bonuses except the change in ability modifier and user of the move.").catch(console.error);
		return;
	} else if (args[2].toLowerCase().includes('skill')) { //check if asking for a skill; if so, return skill dc
		var skillDC = 20 - args[1];
		logger.info("[movetutor] " + `The DC for ${args[0]} to learn the ${args[3]} skill is ${skillDC}.`)
		message.channel.send(`The DC for ${args[0]} to learn the ${args[3]} skill is ${skillDC}.`).catch(console.error);
		return;
	} else {

		//otherwise get ready to rumble

		try {
			//pokemon name
			var pokeName = args[0];
			//pokemon evolutionary stage; 2 = 3 forms to max, 1 = 2 forms to max, 0 = does not evolve/ one-stage
			var moveName = args[1];
			//move pp
			var movePP = args[2];
			//number of successes on learning the move
			var successes = parseInt(args[3]);

			//base DCs for checks
			var baseDC = [20, 17, 15, 13, 10, 8];
			//formula for checking DC
			var formulaMod = 8 - Math.round(parseInt(movePP) / 5);

			//final DC
			var finalDC = 0;

			//get final DC
			//if success = 0-2, out-of-battle, so (baseDC) + (2 * formMod)
			if (successes < 3) {
				finalDC = baseDC[successes] + formulaMod;
				logger.info("[movetutor] " + `The DC for ${pokeName} to learn ${moveName} is ${finalDC}.\
					\n\nUse your normal Train Pokemon skill to practice this move outside of battle.`)
				message.channel.send(`The DC for ${pokeName} to learn ${moveName} is ${finalDC}.\
					\n\nUse your normal Train Pokemon skill to practice this move outside of battle.`).catch(console.error);
				if (successes === 2) {
					message.channel.send("Note: if you succeed on this check and your Pokemon already knows four moves, you must forget one to make space for this new one!");
				}
			} else { //if 3+, in-battle, so (baseDC + formMod)
				finalDC = baseDC[successes] + formulaMod;
				logger.info("[movetutor] " + `The DC for ${pokeName} to learn ${moveName} is ${finalDC}.\
					\n\nWhen rolling, use a Train Pokemon check, but utilizing the Pokemon's INT mod instead of your CHA mod.\
					This check must be attempted while in a battle.`)
				message.channel.send(`The DC for ${pokeName} to learn ${moveName} is ${finalDC}.\
				\n\nWhen rolling, use a Train Pokemon check, but utilizing the Pokemon's INT mod instead of your CHA mod.\
				 This check must be attempted while in a battle.`);
			}

		} catch (error) {
			logger.error("[movetutor] " + error.message)
			message.channel.send("ChaCha machine :b:roke :^(").catch(console.error);
			message.channel.send(error.message);
		}
	}
}