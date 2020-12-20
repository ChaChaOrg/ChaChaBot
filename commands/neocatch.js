//reworked catch calculator
exports.run = (client, connection, P, message, args) => {
	//get pokeball emoji
	const shakey = client.emojis.find("name", "poke_shake");
	
	try{
	
		//default values for ball rate, status rate and capture power bonus
		//base case assumes basic pokeball with no status or special circumstances
		let name = args[0];
		let hp = args[1];
		let max = args[2];
		let roll = args[3];
		let ball = 1;
		let status = 1;
		let bonus = 1;
		if(args.length >= 5){
			ball = args[4];
		}
		if(args.length >= 6){
			status = args[5];
		}
		if(args.length >= 7){
			bonus = args[6];
		}
	
		let sql = "SELECT * From pokemon WHERE name = '${name}';";
		
		let loadSQLPromise = [];
		connection.query(sql, function(err, response){
			if(err){
		
			};
	
			if(response.length == 0){
				let errMsg = `Cannot find '${name}'. Please check your spelling + case-sensitivity.`
        		console.log(errMsg);
        		message.reply(errMsg);
        		return;
			}else{
				
				//First in line I choose you!
				loadSQLPromise.push(response[0].loadFromSQL(P, response[0]));
				Promise.all(loadSQLPromise).then((response)=>{
					let mon = response[0];
					//run calculation
	
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
					if (fortyTimer > (catchBonusMod[6] + 150)) {
						catchBonusFinal = fortyTimer * 0.5/ 150 + 0.5;
					} else {
						catchBonusFinal = catchBonusGen[5];
					}
		
					// =========== END CRITCATCH CALCULATOR ===========
	
					//call up the catch rate
					let rate = 1;
				
					//still need catch rate
					let calcA = (3*max-2*hp)/(3*max)*rate*ball*status*bonus;
					let calcB = (65536 / Math.pow(255/calcA), 0.1875);
					let b_randomShake = [
						Math.floor((Math.random() * 65535) + 1),
						Math.floor((Math.random() * 65535) + 1),
						Math.floor((Math.random() * 65535) + 1),
						Math.floor((Math.random() * 65535) + 1)
					];
					let calcC = calcA/6*catchBonusFinal;
					let critRando = Math.floor(Math.random() * 255) + 1;
	
					if((calcC > critRando) && (mon.level <= roll)){
						message.channel.send(`:star2: **CLICK!** :star2:\nIt's a critical capture! ${pokeName} has been caught `).catch(console.error);
						return;
					}
	
					//moment of truth
					if (calcB > b_randomShake[0]){
						message.channel.send(`The ball shakes once...`).catch(console.error);
						if (calcB > b_randomShake[1]) {
							message.channel.send(`...it shakes twice...`).catch(console.error);
							if (calcB > b_randomShake[2]) {
								message.channel.send(`......it shakes three times... (so exciting!! :fingers_crossed:)`).catch(console.error);
								if (calcB > b_randomShake[3]) {
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
				}
				});
				
				
		});
	
		
	}catch(error){
		message.channel.send(error.toString);
		message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
	}
};