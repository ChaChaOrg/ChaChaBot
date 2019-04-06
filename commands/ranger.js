// Calculates a Pokemon Ranger's DC to loop/catch a Pokemon is, given its dex and catch rate.

exports.run = (client, connection, message, args) => {
    
    //The Pokemon's name
    var name = args[0];
    
    	//check if asking for help
	if (name.includes('help')) {
		message.reply('Pokemon Ranger Catch/Loop command. Variables in order:\n [Pokemon Name] [Pokemon Dex Mod] [Catch Rate]').catch(console.error);
		return;
	}
    
    //the Pokemon's dex mod
    var dexmod = parseFloat(args[1]);
    //the Pokemon's catch rate
    var catchrate = parseFloat(args[2]);
    
    //calculate the catch DC
    var catchDC = Math.round((.15 * (255 - catchrate) + 1.55) + dexmod);
    
    //calculate loop DC
    var loopDC = (10 + dexmod);
    
    //print results
    
    message.channel.send(`The DC to catch ${name} is ${catchDC}. The DC to put a loop around ${name} is ${loopDC}.\n\nDon't forget, a Nat 1 is an auto-fail, and a Nat 20 is an auto-success.`);
    
}