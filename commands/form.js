const { EmbedBuilder, SlashCommandAssertions, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js')
const logger = require('../logs/logger.js');
const helpMessage = "Form is a command for managing the various forms of a pokemon, such as regional variants or alternate forms. This command has the list and add subcommands.\n";
const listMessage = "The list subcommand lists all forms avaiable to a given pokemon species. Use: form list <speciesName>\n";
const addMessage = "The add subcommand adds a form to the list of available forms for a pokemon species. Use: form add <speciesName> <formName> <ability1> <ability2> <abilitly3> <hp-base-stat> <attackBaseStat> <defenseBaseStat> <specialattackBaseStat> <specialdefenseBaseStat> <speedBaseStat> <type1> <secondType> <genderratio> <capturerate> <egggroup1> <eggGroup2> <private>\n";

// JavaScript Document
module.exports.data = new SlashCommandBuilder()
    .setName('form')
    .setDescription('Manages the various forms of a pokemon, such as regional variants or alternate forms.')
    .addSubcommand(subcommand =>
        subcommand
        .setName('list')
        .setDescription('List all forms for a species')
        .addStringOption(option =>
            option.setName('species-name').setDescription('the Species name').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('adds a form to the database')
            .addStringOption(option => option.setName('species-name').setDescription('Species Name').setRequired(true))
            .addStringOption(option => option.setName('form-name').setDescription('Form Name').setRequired(true))
            .addStringOption(option => option.setName('ability1').setDescription('First Ability').setRequired(true))
            .addIntegerOption(option => option.setName('hp-base-stat').setDescription('HP Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('attack-base-stat').setDescription('ATK Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('defense-base-stat').setDescription('DEF Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('specialattack-base-stat').setDescription('SPA Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('specialdefense-base-stat').setDescription('SPD Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('speed-base-stat').setDescription('SPE Base Stat').setRequired(true))
            .addStringOption(option => option.setName('type1').setDescription('First Type').setRequired(true))
            .addBooleanOption(option => option.setName('private').setDescription('private the form').setRequired(true))
            .addStringOption(option => option.setName('ability2').setDescription('Second Ability'))
            .addStringOption(option => option.setName('ability3').setDescription('Third Ability'))
            .addStringOption(option => option.setName('type2').setDescription('Second Type'))
            .addIntegerOption(option => option.setName('genderratio').setDescription('Gender ratio'))
            .addIntegerOption(option => option.setName('capturerate').setDescription('Capture rate'))
            .addStringOption(option => option.setName('egggroup1').setDescription('First Egg group'))
            .addStringOption(option => option.setName('egggroup2').setDescription('Second Egg group')))
        .addSubcommand(subcommand =>
            subcommand
            .setName('remove')
            .setDescription('removes a form from the database')
            .addStringOption(option => option.setName('species-name').setDescription('Species Name').setRequired(true))
            .addStringOption(option => option.setName('form-name').setDescription('Form Name').setRequired(true)));

module.exports.run = async (interaction) => 
{
    const confirm = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success);

    const cancel = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(cancel, confirm)


    try {
        if (interaction.options.getSubcommand() === 'list') {
            //throw "Work in Progress";
            let species = interaction.options.getString('species-name').toLowerCase();
            logger.info("[form] Listing forms for " + species);
            let sql = 'SELECT form FROM pokeForms WHERE species = \'' + species + '\'';
            logger.info("[form] List sql query");

            //insert api search here
            //javascript node.js promise
            let promise = interaction.client.pokedex.getPokemonSpeciesByName(species);
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
                interaction.client.mysqlConnection.query(sql, function (err, result) {
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
            let species = interaction.options.getString("species-name").toLowerCase();
            let check = `SELECT * from pokeForms WHERE species = \'` + species + `\' AND form = \'` + interaction.options.getString("form-name").toLowerCase() + `\'`;


            let form = interaction.options.getString("form-name") ?? ''; 
            let ability1 = interaction.options.getString("ability1") ?? '';  
            let ability2 = interaction.options.getString("ability2") ?? '';
            let ability3 = interaction.options.getString("ability3") ?? '';
            let hpBST = interaction.options.getInteger("hp-base-stat") ?? '';
            let atkBST = interaction.options.getInteger("attack-base-stat") ?? '';
            let defBST = interaction.options.getInteger("defense-base-stat") ?? '';
            let spaBST = interaction.options.getInteger("specialattack-base-stat") ?? '';
            let spdBST = interaction.options.getInteger("specialdefense-base-stat") ?? '';
            let speBST = interaction.options.getInteger("speed-base-stat") ?? '';
            let type1 = interaction.options.getString("type1") ?? '';
            let type2 = interaction.options.getString("type2") ?? '';
            let genderrate = interaction.options.getInteger("genderRate") ?? 0;
            let capturerate = interaction.options.getInteger("captureRate") ?? 0;
            let egggroup1 = interaction.options.getString("eggGroup1") ?? '';
            let egggroup2 = interaction.options.getString("eggGroup2") ?? '';
            let private = interaction.options.getBoolean("private") ?? false;

            if(private) private = 1; else private = 0;

            logger.info('[from] Checking database for new form.');
            interaction.client.mysqlConnection.query(check, function (err, result) {
                if (err) {
                    logger.error(err);
                    throw err;
                }
                if (result.length == 0) {
                    //proceed normally
                    logger.info("[form] Adding new form");
                    let sql = `INSERT INTO pokeForms (species, form, ability1, ability2, ability3, hpBST, atkBST, defBST, spaBST, spdBST, speBST, type1, type2, genderrate, captureRate, egggroup1, eggGroup2, discordID, private) 
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
                        ${genderrate},
                        ${capturerate},
                        "${egggroup1}",
                        "${egggroup2}",
                        ${interaction.user.id},
                        ${private})`;
                    //console.log(sql);
                    logger.info(`[form] upload SQL query: ${sql}`);
                    interaction.client.mysqlConnection.query(sql, function (err, result) {
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
            let species = interaction.options.getString("species-name").toLowerCase();
            let form = interaction.options.getString("form-name").toLowerCase();

            const collectorFilter = i => {
                i.deferUpdate();
                return i.user.id === interaction.user.id;
            }
            const message = await interaction.reply({ content: 'Are you sure you want to delete this form?', components: [row], fetchReply: true});
            try {
                const confirmation = await message.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

                if (confirmation.customId == 'confirm') {
                    logger.info("[form] Removing form");
                    let sql = `DELETE FROM pokeForms WHERE species='` + species + `' AND form='` + form + `';`;
                    interaction.client.mysqlConnection.query(sql, function (err, result) {
                        if (err) {
                            logger.error(err);
                            throw err;
                        }
                        if (result.affectedRows == 0) {
                            logger.info("[form] No form to delete");
                            interaction.editReply({content: "There were no forms matching your selection.", components: []});
                        } else {
                            logger.info("[form] " + result.affectedRows + " form(s) removed.");
                            interaction.editReply({content: result.affectedRows + " forms were removed from the database.", components: []});
                        }
                    });
                } else if (confirmation.customId === 'cancel') {
                    logger.error("[form] Deletion cancelled ");
                    interaction.editReply({content: "Form deletion cancelled due to timeout.", components: []});
                }
            } catch (e) {
                console.log(e)
                interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            }







        }
    } catch (error){
        logger.error("[form] " + error.message);
        console.log(error);
        console.log(error.message);
        interaction.channel.send(error.message);
    }

}

