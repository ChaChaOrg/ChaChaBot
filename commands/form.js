const logger = require('../logs/logger.js');
const helpMessage = "Form is a command for managing the various forms of a pokemon, such as regional variants or alternate forms. This command has the list and add subcommands.\n";
const listMessage = "The list subcommand lists all forms avaiable to a given pokemon species. Use: form list <speciesName>\n";
const addMessage = "The add subcommand adds a form to the list of available forms for a pokemon species. Use: form add <speciesName> <formName> <ability1> <ability2> <abilitly3> <hpBaseStat> <attackBaseStat> <specialAttackBaseStat> <defenseBaseStat> <specialDefenseBaseStat> <speedBaseStat> <firstType> <secondType> <genderRatio> <captureRate> <eggGroup1> <eggGroup2> <private>\n";
exports.run = (client, connection, P, message, args) => {

    try {
        if (args[0].includes("list")) {
            throw "Work in Progress";
            logger.info("[form] Listing forms for " + args[1]);
            let sql = 'SELECT form FROM pokeForms WHERE species = ' + args[1];
            logger.info("[form] List sql query");
            connection.query(sql, function (err, result) {
                if (err) {
                    logger.error(err);
                    throw err;
                }
                logger.info("[form] sql query successful");
                if (result.length <= 0) {
                    logger.info("[form] no forms found");
                    message.reply("No forms were found for that species.");
                } else {
                    logger.info("[form] forms found");
                    let output = "The " + args[1] + "species has the following forms: ";
                    for (let i = 0; i < result.length; i++) {
                        output += result[i];
                    }
                    message.reply(output);
                }
            });
        } else if (args[0].includes("add")) {
            if (args.length != 20) {
                throw "Incorrect number of arguments to add the form.";
            }
            logger.info("[form] Adding new form");
            let sql = `INSERT INTO pokeForms (species, form, ability1, ability2, ability3, hpBST, atkBST, spaBST, defBST, spdBST, speBST, type1, type2, genderRate, captureRate, eggGroup1, eggGroup2, discordID, private) 
            VALUES (
            "${args[1]}",
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
            ${args[19]}
            ');`;
            //console.log(sql);
            logger.info(`[form] upload SQL query: ${sql}`);
            connection.query(sql, function (err, result) {
                if (err) {
                    logger.error(err);
                    throw err;
                }
                console.log("1 record inserted");
                logger.info("[form] upload SQL was successful.")
            });
        } else {
            //help command
            logger.info("[form] Help message");
            message.reply(helpMessage + listMessage + addMessage);
        }
    } catch (error){
        logger.error("[form] " + error.message);
        message.channel.send(error.message);
	}
    
}

