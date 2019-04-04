// Catch calculator

exports.run = (client, connection, message, args) => {
	//get pokeball emoji
	const shakey = client.emojis.find("name", "poke_shake");
	
	try {
		
		//list out required variables
		let pokeName = args[0];
		let maxHP = args[1];
		let curHP = args[2];
		let rate = args[3];
		let bball = args[4];
		let bstatus = args[5];
		let cpfactor = args[6];
		let catchbonus = args[7];
		let level = args[8];
		let troubleshoot = args[9];
		
		message.channel.send(`data received! loading... ${shakey}`).catch(console.error);
		
		//clause for helping!
			if (pokeName.includes('help')) {
				message.reply('Catch Rate Calculator. Variables in order:\n [Pokemon Name] [Max HP] [Current HP] [Catch Rate] [Pokeball Bonus] [Status Bonus] [Capture Power Bonus] [Player Catch Bonus] [Pokemon Level]').catch(console.error);
				return;
			}
		
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
			catchBonusFinal = fortyTimer * 0.5/ 150 + 0.5;
		} else {
			catchBonusFinal = catchBonusGen[5];
		}
		
		// =========== END CRITCATCH CALCULATOR ===========
		
		//values generated from initial vals
		var a_plugValCombo = (3*maxHP-2*curHP)/(3*maxHP)*rate*bball*bstatus*cpfactor;
		
		//var b_shakeVal = (65536 / (255 / Math.pow(a_plugValCombo, 0.1875)));
		var b_shakeVal = (65536 / Math.pow((255/a_plugValCombo), 0.1875));
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
			message.channel.send(`:star2: **CLICK!** :star2:\nIt's a critical capture! ${pokeName} has been caught `).catch(console.error);
			return;
		}
		
		// ================================= TEST STUFF, DELETE LATER!!! =================================
		if (troubleshoot != null) {
			message.channel.send(`PokeName: ${pokeName}\n Max HP: ${maxHP}\nCurrent HP: ${curHP}\nCatch Rate: ${rate}\nBall Rate: ${bball}\nStatus Bonus: ${bstatus}\nCapture Power Factor: ${cpfactor}\nCatch Bonus: ${catchbonus}\nPokemon Level:${level}\ncatchBonusMod: ` + catchBonusMod + `\ncMod: ` + cMod + `\nfortyTimer: ` + fortyTimer + `\ncatchBonusFinal: ` + catchBonusFinal + `\ncatchBonusGen: `+ catchBonusGen + `\ntrueCCatch: ` + trueCCatch + `\na_plugValCombo: ` + a_plugValCombo + `\nb_shakeVal: ` + b_shakeVal + `\nb_randomShake: ` + b_randomShake + `\nc_critCatch: ` + c_critCatch + `\nc_randomCrit: ` + c_randomCrit).catch(console.error);
		}
		
		
		//if not, try for a normal capture
		//TODO: try to have it post on a timer some day?
		if (b_shakeVal > b_randomShake[0]){
			message.channel.send(`The ball shakes once...`).catch(console.error);
			if (b_shakeVal > b_randomShake[1]) {
				message.channel.send(`...it shakes twice...`).catch(console.error);
				if (b_shakeVal > b_randomShake[2]) {
					message.channel.send(`......it shakes three times... (so exciting!! :fingers_crossed:)`).catch(console.error);
					if (b_shakeVal > b_randomShake[3]) {
						message.channel.send(`:star2: **CLICK** :star2:\nDadadada! The wild ${pokeName} was caught!`).catch(console.error);
					} else {
						message.channel.send(`Nooo, the ${pokeName} broke free! It was so close, too...`).catch(console.error);
					}
				} else {
					message.channel.send(`Argh, the ${pokeName} got out!`).catch(console.error);
				}
			} else {
				message.channel.send(`Oh no, the ${pokeName} broke free!`).catch(console.error);
			}
		} else {
			message.channel.send(`Drat! ${pokeName} broke free!`).catch(console.error);
		}
		
		
	} catch (error) {
		message.channel.send(error.toString);
		message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
}