//take in move name, print out all dc's , probably need to skim a database for pp count
//maybe take evolution stage into account


const databaseURL = "https://bulbapedia.bulbagarden.net/wiki/List_of_moves";
const PPINDEX = 11;
const logs = require('../logs/logger.js');

//help messages
const MOVETUTOR_HELP = "" +
	"The command to check the Train Pokemon DC to learn a new move." +
	"\n\nTo learn a move: `+movetutor [Move_Name (Use _'s for spaces)]`" +
	"\n\nTo learn a skill: `+movetutor Skillpoint [PokeName] [IntMod] [SkillName]`" +
	"\n\nMove information originally drawn from " + databaseURL + " and is now stored in a place for bot use.";

exports.run = (client, connection, P, message, args) => {

	let https = require('https');
	let jsdom = require('jsdom');
	let fs = require('fs');
	if (args.length < 1) {
		logs.info("[movetutor] Blank message sent, alerting user");
		message.reply("Not enough arguments given. Please try again- make sure to use _ for spaces in moves!");
		return;
	} else if(args[0].includes('help')) {
		logs.info("[movetutor] Sending help message");
		message.reply(MOVETUTOR_HELP);
		return;
	} else if ( args[0].toLowerCase().includes('skillpoint')) { //check if asking for a skill; if so, return skill dc
		logs.info("[movetutor] Skill tutor calculations");
		var skillDC = 20 - args[2];
		message.reply(`The DC for ${args[1]} to learn the ${args[3]} skill is ${skillDC}.`).catch(console.error);
		return;
	} else {
		logs.info("[movetutor] Move tutor calculations");
		//var request = new XMLHttpRequest();
		logs.info("[movetutor] Sending https request");
		let moves;
		fs.readFile('Moves.txt', (err, data) => {
			//console.log(data);
			//console.log(err);
			if (err) {
				logs.error("[movetutor] Error reading move file.");
				message.reply("Could not read move list. Please contact ChaChaBot devs.");
			} else {
				let workingName = "";
				let wordArray = args[0].split("_");
				console.log(wordArray);
				let dataArray = data.toString().split(/\r?\n/);
				for (let i = 0; i < wordArray.length; i++) {
					let word = wordArray[i].toLowerCase();
					workingName += word.replace(word.charAt(0), word.charAt(0).toUpperCase());
					workingName += " ";
				}
				if (workingName.toLowerCase() === "u-turn") {
					//console.log("U-turn detected.");
					workingName = 'U-turn';
				}
				if (workingName.toLowerCase() === "v-create") {
					workingName = 'V-create';
				}
				if (workingName.toLowerCase() === "trick-or-treat") {
					workingName = 'Trick-or-Treat';
				}
				let move = "";
				let i = 0;
				let found = false;
				//console.log(workingName);
				//console.log(dataArray);
				while (!found && i < dataArray.length) {
					//console.log(dataArray[i].toLowerCase());
					//console.log(dataArray[i].toString());
					//console.log(workingName.toLowerCase());
					//console.log(workingName.toString());
					//console.log(dataArray[i].toLowerCase().indexOf(workingName.toLowerCase()));
					//console.log(dataArray[i].toLowerCase().indexOf(workingName.toLowerCase()) > -1);
					//console.log(dataArray[i].toLowerCase().indexOf(" "));
					move = dataArray[i].split("\t");
					//console.log(move);
					//console.log(move[1]);
					//console.log(move[1].toLowerCase());
					//console.log(typeof move[1]);
					//console.log(workingName);
					//console.log(workingName.toLowerCase());
					//console.log(typeof workingName);
					//console.log('' + workingName.toLowerCase() + '');
					//console.log("" + workingName.toLowerCase() + "");
					if (move[1].toLowerCase() === workingName.trim().toLowerCase()) {
						found = true;
					}
					i++;
				}

				if (found) {
					//data array index list 
					//mv# name type category pp power acc gen
					//0    1    2       3    4    5    6   7
					//console.log(move);
					let pp = move[4];
					console.log(pp);
					let DCs = [20, 17, 15, 13, 10, 8];
					let dcAdjust = 8 - Math.round(pp / 5);
					let output = "";
					if (args.length >= 2 && args[1].includes("origin")) {
						logs.info("[movetutor] Adjusting to original formula");
						DCs = [20 + dcAdjust, 17 + dcAdjust, 15 + dcAdjust, 15, 13, 10];
					}

					for (let i = 0; i < DCs.length; i++) {
						DCs[i] += dcAdjust;
					}
					logs.info("[movetutor] Displaying results");
					output += "**" + workingName + " Training**\n\n";
					logs.info("[movetutor] Displaying results");
					output += "**Out of Combat Checks** (Checks 1-3)\n";
					output += "Use your trainer's CHA modifier for these checks.\n";
					output += "```First DC: " + DCs[0] + " // " + "Second DC: " + DCs[1] + " // " + "Third" +
						" DC:" +
						" " + DCs[2] + "```\n";
					output += "**In Combat Checks** (Checks 4-6)\n";
					output += "Replace your trainer's CHA modifier with your pokemon's INT modifier (*or 0 if" +
						" it's negative*) for these checks.\n";
					output += "```First DC: " + DCs[3] + " // " + "Second DC: " + DCs[4] + " // " + "Third" +
						" DC:" +
						" " + DCs[5] + "```\n";
					output += ":small_blue_diamond: **First Evolutionary Stage** gets **+5** to the check if" +
						" it's the first stage that can learn the move\n";
					output += ":small_orange_diamond: **Second Evolutionary Stage** gets **+2** to the check" +
						" if it's the second evolution" +
						" stage that can learn" +
						" the move.\n";
					message.channel.send(output);
				//let index = data.search(workingName);
				//index += workingName.length;
				} else {
					message.reply("Unable to find move: " + workingName + ". Please check your spelling.");
                }
				
            }
			
		});
		
		//request.open('GET', "https://bulbapedia.bulbagarden.net/wiki/List_of_moves", false);
		//request.send(null);
		
		
	}

}
