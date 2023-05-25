const logger = require('../logs/logger.js');
const helpMessage = "Form is a command for managing the various forms of a pokemon, such as regional variants or alternate forms. This command has the list and add subcommands.\n";
const listMessage = "The list subcommand lists all forms avaiable to a given pokemon species. Use: form list <speciesName>\n";
const addMessage = "The add subcommand adds a form to the list of available forms for a pokemon species. Use: form add <speciesName> <formName> <ability1> <ability2> <abilitly3> <hpBaseStat> <attackBaseStat> <defenseBaseStat> <specialAttackBaseStat> <specialDefenseBaseStat> <speedBaseStat> <firstType> <secondType> <genderRatio> <captureRate> <eggGroup1> <eggGroup2> <private>\n";
const { SlashCommandBuilder } = require('@discordjs/builders');
// JavaScript Document
module.exports.data = new SlashCommandBuilder()
    .setName('form')
    .setDescription('Manages the various forms of a pokemon, such as regional variants or alternate forms.')
    .addStringOption(option =>
        option.setName('feat')
        .setDescription('The feat you want info about')
        .setRequired(true))
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('List all forms for a species')
            .addStringOption(option =>
                option.setName('species-name').setDescription('the Species name')))
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('adds a form to the database')
            .addStringOption(option => option.setName('species-name').setDescription('Species Name').setRequired(true))
            .addStringOption(option => option.setName('form-name').setDescription('Form Name').setRequired(true))
            .addStringOption(option => option.setName('ability1').setDescription('First Ability').setRequired(true))
            .addStringOption(option => option.setName('ability2').setDescription('Second Ability'))
            .addStringOption(option => option.setName('ability3').setDescription('Third Ability'))
            .addIntegerOption(option => option.setName('healthpointsBaseStat').setDescription('HP Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('attackBaseStat').setDescription('ATK Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('defenseBaseStat').setDescription('DEF Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('specialAttackBaseStat').setDescription('SPA Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('specialDefenseBaseStat').setDescription('SPD Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('speedBaseStat').setDescription('SPE Base Stat').setRequired(true))

            .addStringOption(option => option.setName('firstType').setDescription('First Type').setRequired(true))
            .addStringOption(option => option.setName('secondType').setDescription('Second Type'))
            .addIntegerOption(option => option.setName('genderRatio').setDescription('Gender ratio'))
            .addIntegerOption(option => option.setName('captureRate').setDescription('Capture rate'))
            .addStringOption(option => option.setName('eggGroup1').setDescription('First Egg group'))
            .addStringOption(option => option.setName('eggGroup2').setDescription('Second Egg group'))
            .addBooleanOption(option => option.setName('private').setDescription('private the form?').setRequired(true)))
     .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('adds a form to the database')
            .addStringOption(option => option.setName('species-name').setDescription('Species Name').setRequired(true))
            .addStringOption(option => option.setName('form-name').setDescription('Form Name').setRequired(true)));

module.exports.run = async (interaction) => 
{
    try {
        if (interaction.options.getSubcommand() === 'list') {
            //throw "Work in Progress";
            let species = interaction.options.getStringOption('species-name').toLowerCase();
            logger.info("[form] Listing forms for " + species);
            let sql = 'SELECT form FROM pokeForms WHERE species = \'' + species + '\'';
            logger.info("[form] List sql query");
            
            //insert api search here
            //javascript node.js promise
            let promise = interaction.pokedex.getPokemonSpeciesByName(species);
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
                    //interaction.reply("The " + species + " species has the following forms in game: " + names);
                    output += "The " + species + " species has the following forms in game: " + names;
                } else { 
                    logger.info("[form] No main forms found");
                    //interaction.reply("No main game forms found.");
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
                        //interaction.reply("No custom forms were found for that species.");
                        out += "No custom forms were found for that species.";
                    } else {
                        logger.info("[form] custom forms found");
                        console.log("custom forms found");
                        console.log(result);
                        console.log(result[1]);
                        let cust = "The " + species + " species has the following custom forms: ";
                        for (let i = 0; i < result.length; i++) {
                            //console.log(result[i]);
                            if (i != 0) {
                                cust += ", "
                            }
                            cust += result[i].form;
                        }
                        console.log("Forms: " + cust);
                        //interaction.reply(output);
                        out += cust;
                    }
                    interaction.reply(out);
                });
            }).catch(function (error) {
                logger.error("[form] " + error.message);
                //console.log(error);
                console.log(error.message);
                //interaction.channel.send(error.message);
            });
            
        } else if (interaction.options.getSubcommand() === 'add'){
            let species = interaction.options.getStringOption("species-name").toLowerCase();
            let check = `SELECT * from pokeForms WHERE species = \'` + species + `\' AND form = \'` + interaction.options.getStringOption("form-name").toLowerCase() + `\'`;

           
           let form = interaction.options.getStringOption("form-name") ?? ''; 
           let ability1 = interaction.options.getStringOption("ability1") ?? '';  
           let ability2 = interaction.options.getStringOption("ability2") ?? '';
           let ability3 = interaction.options.getStringOption("ability3") ?? '';
           let hpBST = interaction.options.getIntegerOption("hpBaseStat") ?? '';
           let atkBST = interaction.options.getIntegerOption("attackBaseStat") ?? '';
           let defBST = interaction.options.getIntegerOption("defenseBaseStat") ?? '';
           let spaBST = interaction.options.getIntegerOption("specialAttackBaseStat") ?? '';
           let spdBST = interaction.options.getIntegerOption("specialDefenseBaseStat") ?? '';
           let speBST = interaction.options.getIntegerOption("speedBaseStat") ?? '';
           let type1 = interaction.options.getStringOption("type1") ?? '';
           let type2 = interaction.options.getStringOption("type2") ?? '';
           let genderRate = interaction.options.getStringOption("genderRate") ?? '';
           let captureRate = interaction.options.getStringOption("captureRate") ?? '';
           let eggGroup1 = interaction.options.getStringOption("eggGroup1") ?? '';
           let eggGroup2 = interaction.options.getStringOption("eggGroup2") ?? '';
           let private = interaction.options.getStringOption("private") ?? false;

            if(private) private = 1; else private = 0;

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
                    "${form}",
                    "${ability1}",
                    "${ability2}",
                    "${ability3}",

                    ${hpBST},
                    ${atkBST},
                    ${defBST},
                    ${spaBST},
                    ${spdBST},
                    ${speBST},
                    "${type1}",
                    "${type2}",
                    ${genderRate},
                    ${captureRate},
                    "${eggGroup1}",
                    "${eggGroup2}",
                    ${interaction.user.id},
                    ${private})`;
                    //console.log(sql);
                    logger.info(`[form] upload SQL query: ${sql}`);
                    connection.query(sql, function (err, result) {
                        if (err) {
                            logger.error(err);
                            throw err;
                        }
                        console.log("1 record inserted");
                        logger.info("[form] upload SQL was successful.");
                        interaction.reply("Your new form for " + species + " was successfully added.");
                    });
                } else {
                    logger.info('[form] New form already exists.');
                    interaction.reply("That already exists.");
                }
            });
            
        } else if(interaction.options.getSubcommand("remove")){
            //in future, may want to add a confirmation step to the deletion process
            let species = interaction.options.getStringOption("species-name").toLowerCase();
            let form = interaction.options.getStringOption("form-name").toLowerCase();
            if (args.length != 3) {
                throw { message: "Please include the species the form belongs to and the name of the form to remove." };
            }
            interaction.reply("Are you sure you want to delete this form? Confrim with ✅ or cancel with ❌.").then(function (response) {
                response.react('✅');
                response.react('❌');

                const filter = (reaction, user) => user.id === interaction.author.id && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');

                response.awaitReactions(filter, { max: 1, time: 100000 }).then(collected => {

                    if (collected.first().emoji.name === '✅') {
                        logger.info("[form] Removing form");
                        let sql = `DELETE FROM pokeForms WHERE species='` + species + `' AND form='` + form + `';`;
                        connection.query(sql, function (err, result) {
                            if (err) {
                                logger.error(err);
                                throw err;
                            }
                            if (result.affectedRows == 0) {
                                logger.info("[form] No form to delete");
                                interaction.reply("There were no forms matching your selection.");
                            } else {
                                logger.info("[form] " + result.affectedRows + " form(s) removed.");
                                interaction.reply(result.affectedRows + " forms were removed from the database.");
                            }
                        });
                    } else {
                        logger.info("[form] Deletion manually cancelled");
                        interaction.reply("Deletion cancelled.");
                    }
                }).catch((err) => {
                    logger.error("[form] Deletion cancelled due to timeout.");
                    interaction.reply("Form deletion cancelled due to timeout.");
                });
            });
            
        }else{
            //help command
            logger.info("[form] Help message");
            interaction.reply(helpMessage + listMessage + addMessage);
        }
    } catch (error){
        logger.error("[form] " + error.message);
        console.log(error);
        console.log(error.message);
        interaction.channel.send(error.message);
	}
    
}

