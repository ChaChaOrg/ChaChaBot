//take in move name, print out all dc's , probably need to skim a database for pp count
//maybe take evolution stage into account

const databaseURL = "https://bulbapedia.bulbagarden.net/wiki/List_of_moves";
const PPINDEX = 11;
const logs = require('../logs/logger.js');

exports.run = (client, connection, P, message, args) => {

	let https = require('https');
	let jsdom = require('jsdom');
	
	if(args[0].includes('help')){
		logs.info("[neomovetutor] Sending help message");
		message.channel.send("The command to check the Train Pokemon DC to learn a new move.\n\n+neomovetutor [MoveName (Use _'s for spaces plz)]\n\nTo learn a skill: +neomovetutor Skillpoint [PokeName] [IntMod] [SkillName]\n")
		return;
	}if ( args[0].toLowerCase().includes('skillpoint')) { //check if asking for a skill; if so, return skill dc
		logs.info("[neomovetutor] Skill tutor calculations");
		var skillDC = 20 - args[2];
		message.channel.send(`The DC for ${args[1]} to learn the ${args[3]} skill is ${skillDC}.`).catch(console.error);
		return;
	} else {
		logs.info("[neomovetutor] Move tutor calculations");
		//var request = new XMLHttpRequest();
		logs.info("[neomovetutor] Sending https request");
		https.get(databaseURL, (response) =>{
			if(response.statusCode == 200){
				
				var rawData = '';
				response.on('data', (incdat) => {
					rawData += incdat;
				});
				
				response.on('end', () => {					
					logs.info("[neomovetutor] Response recieved");
					let workingName = "";
					let wordArray = args[0].split("_");

					for (let i = 0; i < wordArray.length; i++) {
						let word = wordArray[i].toLowerCase();
						workingName += word.replace(word.charAt(0), word.charAt(0).toUpperCase());
						workingName += " ";
					}
					//console.log("End of Space manipulation: " + workingName.trim());
					wordArray = workingName.trim().split("-");
					workingName = "";
					for (let i = 0; i < wordArray.length; i++) {
						let word = wordArray[i];
						workingName += word.replace(word.charAt(0), word.charAt(0).toUpperCase());
						workingName += "-";
					}
					//console.log("End of - manipulation: " + workingName);
					let moveName = workingName.substring(0, workingName.length - 1);
					if (moveName.indexOf("-") > 0) {
						//console.log("- move detected, checking special cases.");
						//console.log("Move: " + moveName);
						if (moveName.toLowerCase() === "u-turn") {
							//console.log("U-turn detected.");
							moveName = "U-turn";
						}
						if (moveName.toLowerCase() === "v-create") {
							moveName = "V-create";
						}
						if (moveName.toLowerCase() === "trick-or-treat") {
							moveName = "Trick-or-Treat";
                        }
					}
					if (args.length > 1) {
						for (let i = 1; i < args.length; i++) {
							moveName += " " + args[i];
						}
					}
					//moveName = moveName.replace("_", " ");					
					//var selectorString = ":contains('" + moveName + "')";
					//console.log(response);
					let dom = new jsdom.JSDOM(rawData);
					//let parser = new DOMParser();
					//let document = parser.parseFromString(rawData, "text/html");//some DOM thing to access the page
					let document = dom.window.document;
					//console.log(document);
					//console.log(response.data);
					let cell = document.querySelectorAll("a[title*=\"" + moveName + "\"]");
					//var row = $(selectorString).parentNode;
					if(cell && cell.length > 0){
						let row = cell[0].parentNode.parentNode;
						//console.log(row + "\n");
						//console.log("Number of Children in row: " + row.childNodes.length);
						let ppCell = row.childNodes[PPINDEX];
						let pp = ppCell.innerHTML;//read pp from
						if(pp && !Number.isNaN(pp)){
							logs.info("[neomovetutor] Calculating DC");
							let DCs = [20, 17, 15, 13, 10, 8];
							pp = parseInt(pp);
							let dcAdjust = 8-Math.round(pp/5);
							let output = "";
							if(args.length >= 2 && args[1].includes("origin")){
								logs.info("[neomovetutor] Adjusting to original formula");
								DCs = [20 + dcAdjust, 17 + dcAdjust, 15 + dcAdjust, 15, 13, 10]; 
							}
							
							for(let i = 0; i < DCs.length; i++){
								DCs[i] += dcAdjust;
							}
							logs.info("[neomovetutor] Displaying results");
							output += "**" + moveName + " Training**\n\n";
							output += "**Out of Combat Checks** (Checks 1-3)\n";
							output += "Use your trainer's cha modifier for these checks.\n";
							output += "```First DC: " + DCs[0] + ", " + "Second DC: " + DCs[1] + ", " + "Third DC: " + DCs[2] + "```\n\n";
							output += "**In Combat Checks** (Checks 4-6)\n";
							output += "Replace your trainer's cha modifier with your pokemon's int modifier (or 0 if it's negative) for these checks.\n";
							output += "```First DC: " + DCs[3] + ", " + "Second DC: " + DCs[4] + ", " + "Third DC: " + DCs[5] + "```\n\n";
							output += "You get a +5 to the check if it's the first evolution stage that can learn the move.\n";
							output += "You get a +2 to the check if it's the second evolution stage that can learn the move.\n";
							message.channel.send(output);
						}else{
							logs.error("[neomovetutor] " + moveName + " found, could not locate pp value");
							message.channel.send("Could not find pp of move: " + moveName);
						}		
					}else{
						logs.error("[neomovetutor] Unable to find the move " + moveName);
						message.channel.send("Could not find move: " + moveName + "\n Please double check your spelling, especially if the move has a - in it.");
					}
				});
				
							
			}else{
				//message.channel.send("Couldn't connect to move list(" + databaseURL + ").");
				logs.error("[neomovetutor] Couldn't connect to move database on bulbapedia, response code: " + response);
				message.channel.send("Couldn't connect to move list.");
				//console.log("response code: " + response);
			}
		});
		//request.open('GET', "https://bulbapedia.bulbagarden.net/wiki/List_of_moves", false);
		//request.send(null);
		
		
	}

}
