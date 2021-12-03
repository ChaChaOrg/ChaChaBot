const logger = require('../logs/logger.js');
const helpMessage = "Form is a command for managing the various forms of a pokemon, such as regional variants or alternate forms. This command has the list and add subcommands.\n";
const listMessage = "The list subcommand lists all forms avaiable to a given pokemon species. Use: form list <speciesName>\n";
const addMessage = "The add subcommand adds a form to the list of available forms for a pokemon species. Use: form add <speciesName> <formName> <ability1> <ability2> <abilitly3> <hpBaseStat> <attackBaseStat> <defenseBaseStat> <specialAttackBaseStat> <specialDefenseBaseStat> <speedBaseStat> <firstType> <secondType> <genderRatio> <captureRate> <eggGroup1> <eggGroup2> <private>\n";
exports.run = (client, connection, P, message, args) => {

    try {
        if (args[0].includes("list")) {
            //throw "Work in Progress";
            let species = args[1].toLowerCase();
            logger.info("[form] Listing forms for " + args[1]);
            let sql = 'SELECT form FROM pokeForms WHERE species = \'' + species + '\'';
            logger.info("[form] List sql query");
            
            //insert api search here
            //javascript node.js promise
            let promise = P.getPokemonSpeciesByName(species);
            promise.then(function (response) {
                console.log(response.varieties);
                logger.info("[form] Searching api");
                let output = "";
                if (response.varieties.length >=1) {
                    logger.info("[form] Main form(s) founds");
                    let names ="";
                    for (let i = 0; i < response.varieties.length; i++) {
                        names += response.varieties[i].pokemon.name;
                        if (i != response.varieties.length - 1) {
                            names += ", ";
                        }
                    }
                    //message.reply("The " + args[1] + " species has the following forms in game: " + names);
                    output += "The " + args[1] + " species has the following forms in game: " + names;
                } else { 
                    logger.info("[form] No main forms found");
                    //message.reply("No main game forms found.");
                    output += "No main game forms found";
                }
                output += "\n";
                connection.query(sql, function (err, result) {
                    if (err) {
                        logger.error(err);
                        console.log("list error");
                        throw err;
                    }
                    console.log(output);
                    let out = output;
                    logger.info("[form] sql query successful");
                    //maybe reverse logic, only do stuff if custom forms found?
                    if (result.length <= 0) {
                        logger.info("[form] no custom forms found");
                        console.log("no custom forms");
                        //message.reply("No custom forms were found for that species.");
                        out += "No custom forms were found for that species.";
                    } else {
                        logger.info("[form] custom forms found");
                        console.log("custom forms found");
                        console.log(result);
                        console.log(result[1]);
                        let cust = "The " + args[1] + " species has the following custom forms: ";
                        for (let i = 0; i < result.length; i++) {
                            //console.log(result[i]);
                            if (i != 0) {
                                cust += ", "
                            }
                            cust += result[i].form;
                        }
                        console.log("Forms: " + cust);
                        //message.reply(output);
                        out += cust;
                    }
                    message.reply(out);
                });
            }).catch(function (error) {
                logger.error("[form] " + error.message);
                //console.log(error);
                console.log(error.message);
                //message.channel.send(error.message);
            });
            
        } else if (args[0].includes("add")) {
            if (args.length != 19) {
                throw "Incorrect number of arguments to add the form.";
            }
            let species = args[1].toLowerCase();
            let check = `SELECT * from pokeForms WHERE species = \'` + species + `\' AND form = \'` + args[2] + `\'`;
            logger.info('[from] Checking database for new form.');
            connection.query(check, function (err, result) {
                if (err) {
                    logger.error(err);
                    throw err;
                }
                if (result.length == 0) {
                    //proceed normally
                    logger.info("[form] Adding new form");
                    let sql = `INSERT INTO pokeForms (species, form, ability1, ability2, ability3, hpBST, atkBST, defBST, spaBST, spdBST, speBST, type1, type2, genderRate, captureRate, eggGroup1, eggGroup2, discordID, private) 
                    VALUES (
                    "${species}",
                    "${args[2]}",
                    "${args[3]}",
                    "${args[4]}",
                    "${args[5]}",
                    ${args[6]},
                    ${args[7]},
                    ${args[8]},
                    ${args[9]},
                    ${args[10]},
                    ${args[11]},
                    "${args[12]}",
                    "${args[13]}",
                    ${args[14]},
                    ${args[15]},
                    "${args[16]}",
                    "${args[17]}",
                    ${message.author.id},
                    ${args[18]});`;
                    //console.log(sql);
                    logger.info(`[form] upload SQL query: ${sql}`);
                    connection.query(sql, function (err, result) {
                        if (err) {
                            logger.error(err);
                            throw err;
                        }
                        console.log("1 record inserted");
                        logger.info("[form] upload SQL was successful.");
                        message.reply("Your new form for " + args[1] + " was successfully added.");
                    });
                } else {
                    logger.info('[form] New form already exists.');
                    message.reply("That form already exists.");
                }
            });
            
        } else if(args[0].includes("remove")){
            //in future, may want to add a confirmation step to the deletion process
            if (args.length != 3) {
                throw "Please include the species the form belongs to and the name of the form to remove.";
            }
            message.reply("Are you sure you want to delete this form? Confrim with  or cancel with .").then(function (response) {
                response.react('');
                response.react('');

                const filter = (reaction, user) => user.id === message.author.id && (reaction.emoji.name === '' || reaction.emoji.name === '');

                response.awaitReactions(filter, { max: 1, time: 100000 }).then(collected => {

                    if (collected.first().emoji.name === '') {
                        logger.info("[form] Removing form");
                        let sql = `DELETE FROM pokeForms WHERE species='` + args[1] + `' AND form=` + args[2] + `;`;
                        connection.query(sql, function (err, result) {
                            if (err) {
                                logger.error(err);
                                throw err;
                            }
                            if (result.affectedRows == 0) {
                                logger.info("[form] No form to delete");
                                message.reply("There were no forms matching your selection.");
                            } else {
                                logger.info("[form] " + result.affectedRows + " form(s) removed.");
                                message.reply(result.affectedRows + " forms were removed from the database.");
                            }
                        });
                    } else {
                        logger.info("[form] Deletion manually cancelled");
                        message.reply("Deletion cancelled.");
                    }
                }).catch((err) => {
                    logger.error("[form] Deletion cancelled due to timeout.");
                    message.reply("Form deletion cancelled due to timeout.");
                });
            });
            
        }else{
            //help command
            logger.info("[form] Help message");
            message.reply(helpMessage + listMessage + addMessage);
        }
    } catch (error){
        logger.error("[form] " + error.message);
        console.log(error);
        console.log(error.message);
        message.channel.send(error.message);
	}
    
}

