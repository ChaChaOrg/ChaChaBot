// JavaScript Document
// takes a number, gives the mod

exports.run = (client, connection, message, args) => {
	
	if (args.length > 1) {
		message.channel.send("Woahh, slow down pardner. Just give me one number and I'll give you it's modifier.");
		return;
	}
	
	//message.channel.send('Bang! <:gunspurr:356191158017196032>').catch(console.error);
	var score = args[0];
	if (score % 2 !== 0) {score = score - 1;} //lower odd numbers by 1
	var rawMod = ((score - 10)/2);
	rawMod = rawMod.toFixed(0);
	var modString;
	if (rawMod > 0) {
		modString = "+" + rawMod.toString();
	} else {
		modString = rawMod.toString();
	}
	
	message.channel.send(`${args[0]}(${modString})`).catch(console.error);
	
	
}