const logger = require('../logs/logger.js');
const helpMessage = "Form is a command for managing the various forms of a pokemon, such as regional variants or alternate forms. This command has the list and add subcommands.\n";
const listMessage = "The list subcommand lists all forms avaiable to a given pokemon species. Use: form list <speciesName>\n";
const addMessage = "The add subcommand adds a form to the list of available forms for a pokemon species. Use: form add <speciesName> <formName> <ability1> <ability2> <abilitly3> <hpBaseStat> <attackBaseStat> <defenseBaseStat> <specialAttackBaseStat> <specialDefenseBaseStat> <speedBaseStat> <firstType> <secondType> <genderRatio> <captureRate> <eggGroup1> <eggGroup2> <private>\n";
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports.data = new SlashCommandBuilder()
    .setName("form")
    .setDescription("A command for managing alternate forms and regional variants.")
    .addSubcommand(subcommand =>
        subcommand.setName("help")
            .setDescription("Displays the help message for the command.")
    )
    .addSubcommand(subcommand =>
        subcommand.setName("list")
            .setDescription("Lists all avaiable forms for a pokemon species.")
            .addStringOption(option =>
                option.setName("species")
                    .setDescription("The species you're listing forms for.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName("add")
            .setDescription("Adds a new form to a given pokemon species.")
            .addStringOption(option =>
                option.setName("species")
                    .setDescription("The name of the base pokemon species for the form.")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("form")
                    .setDescription("The name of the form being added.")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("ability1")
                    .setDescription("The form's first ability.")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("hidden-ability")
                    .setDescription("The form's hiddent ability.")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName("base-hp")
                    .setDescription("The base hp stat of the form.")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName("base-attack")
                    .setDescription("The base attack stat of the form.")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName("base-defense")
                    .setDescription("The base defense stat of the form.")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName("base-special-attack")
                    .setDescription("The base special attack stat of the form.")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName("base-special-defense")
                    .setDescription("The base special defense stat of the form.")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName("base-speed")
                    .setDescription("The base speed stat of the form.")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("type")
                    .setDescription("The type of the form.")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName("gender-ratio")
                    .setDescription("The rate of male to female.")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName("capture-rate")
                    .setDescription("How hard it is to catch the pokemon. Lower numbers are harder to catch.")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("ability2")
                    .setDescription("The form's second ability.")
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName("second-type")
                    .setDescription("The form's second type.")
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName("egg-group1")
                    .setDescription("The form's egg group.")
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName("egg-group2")
                    .setDescription("The form's second egg group.")
                    .setRequired(false)
            )
            .addBooleanOption(option =>
                option.setName("private")
                    .setDescription("Is this form visible to everyone? Defaults to private visibility.")
                    .setRequired(false)
            )

    )
    .addSubcommand(subcommand =>
        subcommand.setName("remove")
            .setDescription("Removes a custom form from a given pokemon species.")
            .addStringOption(option =>
                option.setName("species")
                    .setDescription("The species you're removing a form from.")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("form")
                    .setDescription("The form you're removing.")
                    .setRequired(true)
            )
    );
    
    


module.exports.run = async (interaction) => {
    await interaction.deferReply();
    try {
        if (interaction.options.getSubcommand() === "list") {
            //throw "Work in Progress";
            let species = interaction.options.getString("species").toLowerCase();
            logger.info("[form] Listing forms for " + interaction.options.getString("species"));
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
                    //interaction.reply("The " + args[1] + " species has the following forms in game: " + names);
                    output += "The " + interaction.options.getString("species") + " species has the following forms in game: " + names;
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
                        let cust = "The " + interaction.options.getString("species") + " species has the following custom forms: ";
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
                    interaction.editReply(out);
                });
            }).catch(function (error) {
                logger.error("[form] " + error.message);
                //console.log(error);
                console.log(error.message);
                //interaction.channel.send(error.message);
            });

        } else if (interaction.options.getSubcommand() === "add") {
            if (args.length != 19) {
                throw "Incorrect number of arguments to add the form.";
            }
            let species = interaction.options.getString("species").toLowerCase();
            let form = interaction.options.getString("form");
            let ability1 = interaction.options.getString("ability1");
            let ability2 = interaction.options.getString("form") ?? "-";
            let ability3 = interaction.options.getString("hidden") ?? "-";
            let hp = interaction.options.getInteger("base-hp");
            let atk = interaction.options.getInteger("base-attack");
            let def = interaction.options.getInteger("base-defense");
            let spat = interaction.options.getInteger("base-special-attack");
            let spdf = interaction.options.getInteger("base-special-defense");
            let speed = interaction.options.getInteger("base-speed");
            let type1 = interaction.options.getString("type");
            let type2 = interaction.options.getString("second-type") ?? "-";
            let genrat = interaction.options.getInteger("gender-ratio");
            let caprat = interaction.options.getInteger("capture-rate");
            let egg1 = interaction.options.getString("egg-group1") ?? "-";
            let egg2 = interaction.options.getString("egg-group2") ?? "-";
            let private = 1;
            if (!interaction.options.getBoolean("private")) {
                private = 0;
            }
            let check = `SELECT * from pokeForms WHERE species = \'` + species + `\' AND form = \'` + form + `\'`;
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

                    ${hp},
                    ${atk},
                    ${def},
                    ${spat},
                    ${spdf},
                    ${speed},
                    "${type1}",
                    "${type2}",
                    ${genrat},
                    ${caprat},
                    "${egg1}",
                    "${egg2}",
                    ${interaction.author.id},
                    ${private});`;
                    //console.log(sql);
                    logger.info(`[form] upload SQL query: ${sql}`);
                    connection.query(sql, function (err, result) {
                        if (err) {
                            logger.error(err);
                            throw err;
                        }
                        console.log("1 record inserted");
                        logger.info("[form] upload SQL was successful.");
                        interaction.editReply("Your new form for " + species + " was successfully added.");
                    });
                } else {
                    logger.info('[form] New form already exists.');
                    interaction.editReply("That form already exists.");
                }
            });

        } else if (interaction.options.getSubcommand() === "remove") {
            //in future, may want to add a confirmation step to the deletion process
            if (args.length != 3) {
                throw { message: "Please include the species the form belongs to and the name of the form to remove." };
            }
            interaction.editReply("Are you sure you want to delete this form? Confrim with ✅ or cancel with ❌.").then(function (response) {
                response.react('✅');
                response.react('❌');

                const filter = (reaction, user) => user.id === interaction.author.id && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');

                response.awaitReactions(filter, { max: 1, time: 100000 }).then(collected => {

                    if (collected.first().emoji.name === '✅') {
                        logger.info("[form] Removing form");
                        let species = interaction.options.getString("species");
                        let form = interaction.options.getString("form");
                        let sql = `DELETE FROM pokeForms WHERE species='` + species + `' AND form='` + form + `';`;
                        connection.query(sql, function (err, result) {
                            if (err) {
                                logger.error(err);
                                throw err;
                            }
                            if (result.affectedRows == 0) {
                                logger.info("[form] No form to delete");
                                interaction.editReply("There were no forms matching your selection.");
                            } else {
                                logger.info("[form] " + result.affectedRows + " form(s) removed.");
                                interaction.editReply(result.affectedRows + " forms were removed from the database.");
                            }
                        });
                    } else {
                        logger.info("[form] Deletion manually cancelled");
                        interaction.editReply("Deletion cancelled.");
                    }
                }).catch((err) => {
                    logger.error("[form] Deletion cancelled due to timeout.");
                    interaction.editReply("Form deletion cancelled due to timeout.");
                });
            });
            
        }else{
            //help command
            logger.info("[form] Help message");
            interaction.editReply(helpMessage + listMessage + addMessage);
        }
    } catch (error){
        logger.error("[form] " + error.message);
        console.log(error);
        console.log(error.message);
        interaction.channel.send(error.message);
	}
    
}

