//take in move name, print out all dc's , probably need to skim a database for pp count
//maybe take evolution stage into account

const PPINDEX = 5;

exports.run = (client, connection, P, message, args) => {

	if(args[0].includes('help')){
		message.channel.send("The command to check the Train Pokemon DC to learn a new move.\n\n+movetutor [PokeName] [MoveName (with no spaces plz)]\n\nTo learn a skill: +movetutor [PokeName] [IntMod] Skill [SkillName]\n")
		return;
	}if (args[2].toLowerCase().includes('skill')) { //check if asking for a skill; if so, return skill dc
		var skillDC = 20 - args[1];
		message.channel.send(`The DC for ${args[0]} to learn the ${args[3]} skill is ${skillDC}.`).catch(console.error);
		return;
	} else {
		var request = new XMLHttpRequest();
		request.open('GET', "https://bulbapedia.bulbagarden.net/wiki/List_of_moves", false);
		request.send(null);
		if(request.status == 200){
			var selectorString = ":contains('" + args[0] + "')";
			//var document = ;//some DOM thing to access the page
			var row = $(selectorString).parentNode;
			if(row){
				var pp = row.childNodes[PPINDEX].value;//read pp from
				if(pp){
					var DCs = [20,17,15,13,10,8];
					var dcAdjust = 8-Math.round(pp/5);
					var output = "";
					DCs.foreach((value, index) => { 
						DCs[index] = value + dcAdjust;
					});
					output += "Out of Combat Checks (Checks 1-3)\n";
					output += "First DC: " + DCs[0] + ", " + "Second DC: " + DCs[1] + ", " + "Third DC: " + DCs[2] + "\n";
					output += "In Combat Checks (Checks 4-6)\n";
					output += "First DC: " + DCs[3] + ", " + "Second DC: " + DCs[4] + ", " + "Third DC: " + DCs[5] + "\n";
					output += "You get a +5 to the check if it's the first evolution stage that can learn the move.\n";
					output += "You get a +2 to the check if it's the second evolution stage that can learn the move.\n";
					message.channel.send(output);
				}else{
					message.channel.send("Could not find pp of move: " + args[0]);
				}		
			}else{
				message.channel.send("Could not find move: " + args[0]);
			}
			
		}else{
			message.channel.send("Coundn't connect to move list(Bulbapedia).");
		}
		
	}

}