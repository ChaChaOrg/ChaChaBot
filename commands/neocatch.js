//reworked catch calculator
exports.run = (client, connection, P, message, args) => {
	//get pokeball emoji
	const shakey = client.emojis.find("name", "poke_shake");
	//default values for ball rate, status rate and capture power bonus
	//base case assumes basic pokeball with no status or special circumstances
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
	//run calculation
	//still need catch rate
	let calcA = (3*args[2]-2*args[1])/(3*args[2])*ball*status*bonus;
	let calcB = (65536 / Math.pow(255/calcA), 0.1875);
	let calcC = ;
};