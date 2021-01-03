//take in move name, print out all dc's , probably need to skim a database for pp count
//maybe take evolution stage into account

const databaseURL = "https://bulbapedia.bulbagarden.net/wiki/List_of_moves";
const PPINDEX = 11;

exports.run = (client, connection, P, message, args) => {

	let https = require('https');
	let jsdom = require('jsdom');
	
	if(args[0].includes('help')){
		message.channel.send("The command to check the Train Pokemon DC to learn a new move.\n\n+neomovetutor [MoveName (Use _'s for spaces plz)]\n\nTo learn a skill: +neomovetutor Skillpoint [PokeName] [IntMod] [SkillName]\n")
		return;
	}if ( args[0].toLowerCase().includes('skillpoint')) { //check if asking for a skill; if so, return skill dc
		var skillDC = 20 - args[2];
		message.channel.send(`The DC for ${args[1]} to learn the ${args[3]} skill is ${skillDC}.`).catch(console.error);
		return;
	} else {
		//var request = new XMLHttpRequest();
		https.get(databaseURL, (response) =>{
			if(response.statusCode == 200){
				
				var rawData = '';
				response.on('data', (incdat) => {
					rawData += incdat;
				});
				
				response.on('end', () => {					
					let moveName = args[0];
					moveName = moveName.replace("_", " ");
					//var selectorString = ":contains('" + moveName + "')";
					//console.log(response);
					let dom = new jsdom.JSDOM(rawData);
					//let parser = new DOMParser();
					//let document = parser.parseFromString(rawData, "text/html");//some DOM thing to access the page
					let document = dom.window.document;
					//console.log(document);
					//console.log(response.data);
					let cell = document.querySelectorAll("a[title*=\"" + moveName+"\"]");
					//var row = $(selectorString).parentNode;
					if(cell && cell.length > 0){
						let row = cell[0].parentNode.parentNode;
						//console.log(row + "\n");
						//console.log("Number of Children in row: " + row.childNodes.length);
						let ppCell = row.childNodes[PPINDEX];
						let pp = ppCell.innerHTML;//read pp from
						if(pp && !Number.isNaN(pp)){
							let DCs = [20,17,15,13,10,8];
							pp = parseInt(pp);
							let dcAdjust = 8-Math.round(pp/5);
							let output = "";
							if(args.length >= 2 && args[1].includes("origin")){
								DCs = [20 + dcAdjust,17 + dcAdjust,15 + dcAdjust,15,13,10]; 
							}
							
							for(let i = 0; i < DCs.length; i++){
								DCs[i] += dcAdjust;
							}
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
							message.channel.send("Could not find pp of move: " + moveName);
						}		
					}else{
						message.channel.send("Could not find move: " + moveName);
					}
				});
				
							
			}else{
				//message.channel.send("Couldn't connect to move list(" + databaseURL + ").");
				message.channel.send("Couldn't connect to move list.");
				console.log("response code: " + response);
			}
		});
		//request.open('GET', "https://bulbapedia.bulbagarden.net/wiki/List_of_moves", false);
		//request.send(null);
		
		
	}

}