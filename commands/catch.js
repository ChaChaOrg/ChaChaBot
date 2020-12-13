const logger = require('../logs/logger.js');
// Catch calculator

const HELP_MESSAGE = "Catch Rate Calculator. Variables in order:\n "
	+ "[Pokemon Name] [Max HP] [Current HP] [Catch Rate] [Pokeball Bonus] [Status Bonus] "
	+ "[Capture Power Bonus] [Player Catch Bonus] [Pokemon Level]\n"
	+ "Default bonus values are: \n\tPokeball = 1\n\tStatus = 1\n\tCapture Power = 1\n\tPlayer Catch = 1"

exports.run = (client, connection, P, message, args) => {
	//get pokeball emoji
	const shakey = client.emojis.find(emoji => emoji.name === "poke_shake");

	if (args.length > 0 && args[0].includes('help')) {
		//clause for helping!
		logger.info("[catch] Sending help message.")
		message.reply(HELP_MESSAGE).catch(console.error);
		return;
	}
	else {
		if (args.length < 4) {
			logger.info("[catch] Sending too few arguments message.")
			message.reply("You haven't provided enough arguments. If you'd like help with the command, here you go:\n"
				+ HELP_MESSAGE)
			return;
		} else {
			/* Checks for pokeball bonus option
			Accepts:
				 -p [val]
				 -pokeball [val]
				 -ball [val]
			 */
			let pokeball_regex = /(-p \d+)|(-pokeball \d+)|(-ball \d+)/

			/* Checks for pokeball bonus option
			Accepts:
				 -s [val]
				 -status [val]
			 */
			let status_regex = /(-s \d+)|(-status \d+)/

			/* Checks for pokeball bonus option
			Accepts:
				-cp [val]
				-capturepower [val]
				-capture_power [val]
				-capture-power [val]
				-capture power [val] 
			 */
			let capture_power_regex = /(-cp \d+)|(-capture(\s|-|_)?power \d+)/

			/* Checks for player catch bonus
			Accepts:
				-pc [val]
				-playercatch [val]
				-player_catch [val]
				-player-catch [val]
				-player catch [val]
			*/
			let player_catch_regex = /(-pc \d+)|(-player(\s|-|_)?catch \d+)/
			let args_string = args.splice(0).join(" ")

			var bball;
			pokeball_match = pokeball_regex.exec(args_string);
			if (pokeball_match) {
				bball = parseInt(pokeball_match[0].split(" ")[1])
			} else {
				bball = 1
			}

			var bstatus;
			status_match = status_regex.exec(args_string);
			if (status_match) {
				bstatus = parseInt(status_match[0].split(" ")[1])
			} else {
				bstatus = 1
			}

			var cpfactor;
			capture_power_match = capture_power_regex.exec(args_string);
			if (capture_power_match) {
				var cp_match_array = capture_power_match[0].split(" ");
				if (cp_match_array.length == 2) {
					cpfactor = parseInt(cp_match_array[1])
				}
				else if (cp_match_array.length == 3) {
					cpfactor = parseInt(cp_match_array[2])
				}
			} else {
				cpfactor = 1
			}

			var catchbonus;
			player_catch_match = player_catch_regex.exec(args_string);
			if (player_catch_match) {
				var pc_match_array = capture_power_match[0].split(" ")
				if (cp_match_array.length == 2)
					catchbonus = parseInt(pc_match_array[1])
				else if (cp_match_array.length == 3)
					catchbonus = parseInt(cpc_match_array[2])
			} else {
				catchbonus = 1
			}
		}


	}


	try {
		console.log(catchbonus)
		console.log(cpfactor)
		//list out required variables
		let pokeName = args[0];
		let maxHP = args[1];
		let curHP = args[2];
		let rate = args[3];
		// let bball = args[4];
		// let bstatus = args[5];
		// let cpfactor = args[6];
		// let catchbonus = args[7];
		let level = args[8];
		let troubleshoot = args[9];

		logger.info("[catch] data received! loading...")
		message.channel.send(`data received! loading... ${shakey}`).catch(console.error);

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
		if (fortyTimer > (catchBonusMod[6] + 150)) {
			catchBonusFinal = fortyTimer * 0.5 / 150 + 0.5;
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
			message.channel.send(`:star2: **CLICK!** :star2:\nIt's a critical capture! ${pokeName} has been caught `).catch(console.error);
			return;
		}

		// ================================= TEST STUFF, DELETE LATER!!! =================================
		if (troubleshoot != null) {
			message.channel.send(`PokeName: ${pokeName}\n Max HP: ${maxHP}\nCurrent HP: ${curHP}\nCatch Rate: ${rate}\nBall Rate: ${bball}\nStatus Bonus: ${bstatus}\nCapture Power Factor: ${cpfactor}\nCatch Bonus: ${catchbonus}\nPokemon Level:${level}\ncatchBonusMod: ` + catchBonusMod + `\ncMod: ` + cMod + `\nfortyTimer: ` + fortyTimer + `\ncatchBonusFinal: ` + catchBonusFinal + `\ncatchBonusGen: ` + catchBonusGen + `\ntrueCCatch: ` + trueCCatch + `\na_plugValCombo: ` + a_plugValCombo + `\nb_shakeVal: ` + b_shakeVal + `\nb_randomShake: ` + b_randomShake + `\nc_critCatch: ` + c_critCatch + `\nc_randomCrit: ` + c_randomCrit).catch(console.error);
		}


		//if not, try for a normal capture
		//TODO: try to have it post on a timer some day?
		if (b_shakeVal > b_randomShake[0]) {
			console.log(b_shakeVal)
			logger.info("[catch] Ball shakes once.")
			message.channel.send(`The ball shakes once...`).catch(console.error);
			if (b_shakeVal > b_randomShake[1]) {
				logger.info("[catch] Ball shakes twice.")
				message.channel.send(`...it shakes twice...`).catch(console.error);
				if (b_shakeVal > b_randomShake[2]) {
					logger.info("[catch] Ball shakes three times.")
					message.channel.send(`......it shakes three times... (so exciting!! :fingers_crossed:)`).catch(console.error);
					if (b_shakeVal > b_randomShake[3]) {
						logger.info("[catch] " + pokeName + " was caught!")
						message.channel.send(`:star2: **CLICK** :star2:\nDadadada! The wild ${pokeName} was caught!`).catch(console.error);
					} else {
						logger.info("[catch] " + pokeName + " broke free!")
						message.channel.send(`Nooo, the ${pokeName} broke free! It was so close, too...`).catch(console.error);
					}
				} else {
					logger.info("[catch] " + pokeName + " broke free!")
					message.channel.send(`Argh, the ${pokeName} got out!`).catch(console.error);
				}
			} else {
				logger.info("[catch] " + pokeName + " broke free!")
				message.channel.send(`Oh no, the ${pokeName} broke free!`).catch(console.error);
			}
		} else {
			logger.info("[catch] " + pokeName + " broke free!")
			message.channel.send(`Drat! ${pokeName} broke free!`).catch(console.error);
		}


	} catch (error) {
		logger.error("[catch] " + error.toString())
		message.channel.send(error.toString());
		message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
};