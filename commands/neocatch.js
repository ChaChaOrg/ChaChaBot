//reworked catch calculator
exports.run = (client, connection, P, message, args) => {
	//get pokeball emoji
	const shakey = client.emojis.find("name", "poke_shake");
	const helpMessage = "Catch Rate Calculator. (★ = required field)\n\n `+neocatch [Pokemon Name★] [Current HP★] [Max HP★] [Catch Roll★] [Pokeball Bonus] [Status Bonus] [Capture Power Bonus]`\n\n" + 
	"**Common Pokeball Bonuses:**\n Pokeball: 1\n Greatball: 1.5\n Ultraball: 2\n\n" + 
	"**Common Status Bonuses:**\n Sleep: 2.5\n Freeze: 2\n Paralysis/Poison/Burn: 1.5\n Everything Else: 1";
	try{
	
		//default values for ball rate, status rate and capture power bonus
		//base case assumes basic pokeball with no status or special circumstances
		let name = args[0];
		//clause for helping!
		if (args.length < 4 || name.includes('help')) {			
			message.reply(helpMessage).catch(console.error);
			return;
		}
		let hp = args[1];
		let max = args[2];
		let roll = args[3];
		let ball = 1;
		let status = 1;
		let bonus = 1;
		let Pokemon = require("../models/pokemon.js");
		let opponent = new Pokemon();
		if(args.length >= 5){
			ball = args[4];
		}
		if(args.length >= 6){
			status = args[5];
		}
		if(args.length >= 7){
			bonus = args[6];
		}
		message.channel.send(`data received! loading... <a:pokeball:790311645095919637>`).catch(console.error);
		let sql = `SELECT * From pokemon WHERE name = '${name}';`;
		console.log(sql);
		let loadSQLPromise = [];
		console.log("promises");
		connection.query(sql, function(err, response){
			if(err){
				let errMsg = `Error with SQL query: ${err}`;
		        console.log(errMsg);
		        message.reply(errMsg);
		        return;
			};
	
			if(response.length == 0){
				let errMsg = `Cannot find '${name}'. Please check your spelling + case-sensitivity.`
        		console.log(errMsg);
        		message.reply(errMsg);
        		return;
			}else{
				
				//First in line I choose you!
				loadSQLPromise.push(opponent.loadFromSQL(P, response[0]));
				Promise.all(loadSQLPromise).then((response)=>{
					let species = opponent.speciesData;
					//run calculation
					console.log("calcs start");
					//  =========== CRITCATCH CALCULATOR ===========
					var catchBonusMod = [0, 31, 151, 301, 451, 600];
					var cMod = [0, 0.5, 1, 1.5, 2, 2.5];
					var fortyTimer = roll * 40;
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
					console.log("Timer: " + fortyTimer + "\ncatchMod: " + catchBonusMod[6]);
					if (fortyTimer > (catchBonusMod[5] + 150)) {
						catchBonusFinal = fortyTimer * 0.5/ 150 + 0.5;
					} else {
						catchBonusFinal = catchBonusGen[5];
					}
		
					// =========== END CRITCATCH CALCULATOR ===========
	
					//call up the catch rate
					let rate = species.capture_rate;
					console.log("crit calcs");
					//still need catch rate
					let calcA = (3 * max - 2 * hp) / (3 * max) * rate * ball * status * bonus;
					console.log("Calc part A: " + calcA);
					let calcB = (65536 / Math.pow((255/calcA), 0.1875));
					let b_randomShake = [
						Math.floor((Math.random() * 65535) + 1),
						Math.floor((Math.random() * 65535) + 1),
						Math.floor((Math.random() * 65535) + 1),
						Math.floor((Math.random() * 65535) + 1)
					];
					console.log("Final bonus: " + catchBonusFinal);
					let calcC = calcA / 6 * catchBonusFinal;
					let critRando = Math.floor(Math.random() * 255) + 1;

					console.log("Calculation: " + calcC + "\nRandom: " + critRando);
					console.log("Level: " + opponent.level + "\nRoll: " + roll);
					if ((calcC > critRando) && (opponent.level <= roll)) {
						message.channel.send(`:star2: **CLICK!** :star2:\nIt's a critical capture! ${name} has been caught `).catch(console.error);
						return;
					}
	
					//moment of truth
					console.log("moment of truth");
					console.log("Catch rate: " + rate);
					console.log("number: " + calcB + " target: " + b_randomShake[0]);
					if (calcB > b_randomShake[0]){
						message.channel.send(`The ball shakes once...`).catch(console.error);
						console.log("number: " + calcB + " target: " + b_randomShake[1]);
						if (calcB > b_randomShake[1]) {
							message.channel.send(`...it shakes twice...`).catch(console.error);
							console.log("number: " + calcB + " target: " + b_randomShake[2]);
							if (calcB > b_randomShake[2]) {
								message.channel.send(`......it shakes three times... (so exciting!! :fingers_crossed:)`).catch(console.error);
								console.log("number: " + calcB + " target: " + b_randomShake[3]);
								if (calcB > b_randomShake[3]) {
									message.channel.send(`:star2: **CLICK** :star2:\nDadadada! The wild ${name} was caught!`).catch(console.error);
								} else {
									message.channel.send(`Nooo, ${name} broke free! It was so close, too...`).catch(console.error);
								}
							} else {
								message.channel.send(`Argh, ${name} got out!`).catch(console.error);
							}	
						} else {
							message.channel.send(`Oh no, ${name} broke free!`).catch(console.error);
						}
					} else {
						message.channel.send(`Drat! ${name} broke free!`).catch(console.error);
					}
				
				});
			}
				
		});
	
		
	}catch(error){
		message.channel.send(error.toString);
		message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
};