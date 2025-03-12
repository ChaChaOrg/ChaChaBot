const { EmbedBuilder, SlashCommandAssertions, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js')
const logger = require('../logs/logger.js');
const helpMessage = "Form is a command for managing the various forms of a Pokemon, such as regional variants or" +
    " alternate forms. This command has the \"list\" and \"add\" subcommands.\n";
const listMessage = "The \"list\" subcommand lists all forms available to a given pokemon species. Use: form list" +
    " <speciesName>\n";
const addMessage = "The \"add\" subcommand adds a form to the list of available forms for a Pokemon species. Write" +
    " \"null\" if there is nothing to input for a field. \n\nField Explanations:" +
    "> `speciesName` // Name of the species/overall group, ie Vulpix for Kantonian or Alolan Vulpix\n" +
    "> `formName` // The name of the specific form. Preferred format of `species-form`, ie \"vulpix-alola\"\n" +
    "> `ability1` // `ability2` // `ability3` // The Pokemon's abilities; 1 & 2 are the main abilities while 3 is" +
    " the hidden one. Put \"null\" in 2 or 3 if it does not have a secondary or hidden ability\n" +
    "> `hpBaseStat` // `attackBaseStat` // ... // `speedBaseStat` Base Stats of the Pokemon\n" +
    "> `firstType` // `secondType` // Type(s) of the Pokemon. Set \"null\" for type two if it's a monotype.\n" +
    "> `genderRatio` // -1 = genderless; 1 = all male; 8 = all female. 50% either or = 4\n" +
    "> `captureRate` // 1-255; the capture rate of the Pokemon.\n" +
    "> `eggGroup1` // `eggGroup2`// Egg groups for the Pokemon. If it has only one or no egg groups, put \"null\"" +
    " for the latter group or for both, respectively.\n" +
    "> `private` // Default 0 for public, 1 for private. Used to hide forms, ie if trying to avoid spoiling them" +
    " for players in a campaign.\n" +
    "\n\n Empty template: +form" +
    " add <speciesName> <formName> <ability1> <ability2> <ability3> <hp-base-stat> <attackBaseStat>" +
    " <defenseBaseStat> <specialattackBaseStat> <specialdefenseBaseStat> <speedBaseStat> <type1> <secondType>" +
    " <genderratio> <capturerate> <egggroup1> <eggGroup2> <private>\n\n" +
    "Sample Pokemon (Alolan Ninetales): +form add Vulpix vulpix-alola Snow-Cloak null Snow-Warning 38" +
    " 41 40 50 65 65 Ice null" +
    " 6 190 Field null 0\n";

const REGEX_SANI_STRING = /[^a-zA-Z0-9'_]/;
const REGEX_FORBID = /(^\s*DROP\s*$)|(\s+DROP\s+)|(\s+DROP\s*$)|(^\s*DROP\s+)|(^\s*TABLE\s*$)|(\s+TABLE\s*$)|(\s+TABLE\s+)|(^\s*TABLE\s+)|(^\s*INSERT\s*$)|(\s+INSERT\s+)|(\s+INSERT\s*$)|(^\s*INSERT\s+)|(^\s*DELETE\s*$)|(\s+DELETE\s+)|(\s+DELETE\s*$)|(^\s*DELETE\s+)/i;

// JavaScript Document
module.exports.data = new SlashCommandBuilder()
    .setName('form')
    .setDescription('Manages the various forms of a pokemon, such as regional variants or alternate forms.')
    .addSubcommand(subcommand =>
        subcommand
        .setName('list')
        .setDescription('List all forms for a species')
        .addStringOption(option =>
            option.setName('species-name').setDescription('the Species name').setRequired(true).setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('adds a form to the database')
                .addStringOption(option => option.setName('species-name').setDescription('Species Name').setRequired(true).setAutocomplete(true))
                .addStringOption(option => option.setName('form-name').setDescription('Form Name').setRequired(true))
            .addStringOption(option => option.setName('ability1').setDescription('First Ability').setRequired(true))
            .addIntegerOption(option => option.setName('hp-base-stat').setDescription('HP Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('attack-base-stat').setDescription('ATK Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('defense-base-stat').setDescription('DEF Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('specialattack-base-stat').setDescription('SPA Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('specialdefense-base-stat').setDescription('SPD Base Stat').setRequired(true))
            .addIntegerOption(option => option.setName('speed-base-stat').setDescription('SPE Base Stat').setRequired(true))
            .addStringOption(option => option.setName('type1').setDescription('First Type').setRequired(true)
                    .addChoices(
                        { name: 'Bug', value: 'Bug' },
                        { name: 'Dark', value: 'Dark' },
                        { name: 'Dragon', value: 'Dragon' },
                        { name: 'Electric', value: 'Electric' },
                        { name: 'Fairy', value: 'Fairy' },
                        { name: 'Fighting', value: 'Fighting' },
                        { name: 'Fire', value: 'Fire' },
                        { name: 'Flying', value: 'Flying' },
                        { name: 'Grass', value: 'Grass' },
                        { name: 'Ghost', value: 'Ghost' },
                        { name: 'Ground', value: 'Ground' },
                        { name: 'Ice', value: 'Ice' },
                        { name: 'Normal', value: 'Normal' },
                        { name: 'Poison', value: 'Poison' },
                        { name: 'Psychic', value: 'Psychic' },
                        { name: 'Rock', value: 'Rock' },
                        { name: 'Steel', value: 'Steel' },
                        { name: 'Stellar', value: 'Stellar' },
                        { name: 'Water', value: 'Water' },
                        { name: '???', value: '???' }
                    ))
            .addBooleanOption(option => option.setName('private').setDescription('private the form').setRequired(true))
            .addStringOption(option => option.setName('ability2').setDescription('Second Ability'))
            .addStringOption(option => option.setName('ability3').setDescription('Third Ability'))
            .addStringOption(option => option.setName('type2').setDescription('Second Type')
                    .addChoices(
                        { name: 'Bug', value: 'Bug' },
                        { name: 'Dark', value: 'Dark' },
                        { name: 'Dragon', value: 'Dragon' },
                        { name: 'Electric', value: 'Electric' },
                        { name: 'Fairy', value: 'Fairy' },
                        { name: 'Fighting', value: 'Fighting' },
                        { name: 'Fire', value: 'Fire' },
                        { name: 'Flying', value: 'Flying' },
                        { name: 'Grass', value: 'Grass' },
                        { name: 'Ghost', value: 'Ghost' },
                        { name: 'Ground', value: 'Ground' },
                        { name: 'Ice', value: 'Ice' },
                        { name: 'Normal', value: 'Normal' },
                        { name: 'Poison', value: 'Poison' },
                        { name: 'Psychic', value: 'Psychic' },
                        { name: 'Rock', value: 'Rock' },
                        { name: 'Steel', value: 'Steel' },
                        { name: 'Stellar', value: 'Stellar' },
                        { name: 'Water', value: 'Water' },
                        { name: '???', value: '???' },
                        { name: 'None', value: '-' }
                    ))
            .addIntegerOption(option => option.setName('genderratio').setDescription('Gender ratio').setMinValue(-1).setMaxValue(8))
            .addIntegerOption(option => option.setName('capturerate').setDescription('Capture rate').setMinValue(0).setMaxValue(255))
            .addStringOption(option => option.setName('egggroup1').setDescription('First Egg group')
                    .addChoices(
                        { name: 'Amorphous', value: 'Amorphous' },
                        { name: 'Bug', value: 'Bug' },
                        { name: 'Dragon', value: 'Dragon' },
                        { name: 'Fairy', value: 'Fairy' },
                        { name: 'Field', value: 'Field' },
                        { name: 'Flying', value: 'Flying' },
                        { name: 'Grass', value: 'Grass' },
                        { name: 'Human-Like', value: 'Human-Like' },
                        { name: 'Mineral', value: 'Mineral' },
                        { name: 'Monster', value: 'Monster' },                      
                        { name: 'Water1', value: 'Water1' },
                        { name: 'Water2', value: 'Water2' },
                        { name: 'Water3', value: 'Water3' }
                    ))
            .addStringOption(option => option.setName('egggroup2').setDescription('Second Egg group')
                    .addChoices(
                        { name: 'Amorphous', value: 'Amorphous' },
                        { name: 'Bug', value: 'Bug' },
                        { name: 'Dragon', value: 'Dragon' },
                        { name: 'Fairy', value: 'Fairy' },
                        { name: 'Field', value: 'Field' },
                        { name: 'Flying', value: 'Flying' },
                        { name: 'Grass', value: 'Grass' },
                        { name: 'Human-Like', value: 'Human-Like' },
                        { name: 'Mineral', value: 'Mineral' },
                        { name: 'Monster', value: 'Monster' },
                        { name: 'Water1', value: 'Water1' },
                        { name: 'Water2', value: 'Water2' },
                        { name: 'Water3', value: 'Water3' }
                    )))
        .addSubcommand(subcommand =>
            subcommand
            .setName('remove')
            .setDescription('removes a form from the database')
                .addStringOption(option => option.setName('species-name').setDescription('Species Name').setRequired(true).setAutocomplete(true))
                .addStringOption(option => option.setName('form-name').setDescription('Form Name').setRequired(true).setAutocomplete(true)));

module.exports.autocomplete = async (interaction) => {
    const focused = interaction.options.getFocused(true);
    if (focused.name === 'species-name') {
        let choices = interaction.client.formCache;
        const filtered = choices.filter(choice => (!choice.private || (choice.discordID == interaction.user)) && choice.species.toLowerCase().startsWith(focused.value.toLowerCase())).slice(0,24);
        await interaction.respond(
            filtered.map(choice => ({name:choice.species,value:choice.species})),
        );
    } else if (focused.name === 'form-name') {
        let choices = interaction.client.formCache;
        const filtered = choices.filter(choice => (!choice.private || (choice.discordID == interaction.user)) && choice.form.toLowerCase().startsWith(focused.value.toLowerCase())).slice(0,24);
        await interaction.respond(
            filtered.map(choice => ({name:choice.form, value:choice.form})),
        );
    } else {
        //nope, not auto completed
    }
}

module.exports.run = async (interaction) => 
{
   await interaction.deferReply();


    const confirm = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success);

    const cancel = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(confirm, cancel)


    try {
        if (interaction.options.getSubcommand() === 'list') {
            //throw "Work in Progress";
            let species = interaction.options.getString('species-name').toLowerCase();
            if (species.match(REGEX_SANI_STRING)) {
                logger.error("[form] User attempted to use invalid character in species name.");
                console.log("Invalid character detected.");
                interaction.followUp("Please double check the spelling on the species name.");
                return;
            }
            if (species.match(REGEX_FORBID)) {
                logger.error("[form] Forbidden name detected.");
                console.log("SQL command detected.");
                interaction.followUp("I'm afraid I can't let you do that. Please use a different name.");
                return;
            }
            logger.info("[form] Listing forms for " + species);
            let sql = 'SELECT form, discordID, private FROM pokeForms WHERE species = \'' + species + '\'';
            logger.info("[form] List sql query");

            //insert api search here
            //javascript node.js promise
            interaction.client.pokedex.getPokemonSpeciesByName(species).then(function (response) {
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
                                if (result[i].private == 0 || result[i].discordID == interaction.user.id) {
                                   
                                    cust += result[i].form;
                                    if (i != result.length-1) {
                                        cust += ", "
                                    }
                                }
                            }
                            console.log("Forms: " + cust);
                            //interaction.reply(output);
                            out += cust;
                        }
                    interaction.followUp(out);
                });
            }).catch(function (error) {
                logger.error("[form] " + error.message);
                //console.log(error);
                console.log(error.message);
                interaction.followUp("Given species is not a mainline pokemon species");
            });

        } else if (interaction.options.getSubcommand() === 'add'){
            let species = interaction.options.getString("species-name").toLowerCase();
            let form = interaction.options.getString("form-name").toLowerCase();
            if (form.match(REGEX_SANI_STRING) || species.match(REGEX_SANI_STRING)) {
                
                logger.error("[form add] User attempted to use invalid character.");
                console.log("Invalid character detected.");
                interaction.followUp("Please double check the spelling on your form/species names.");
                return;
                
            }
            if (form.match(REGEX_FORBID) || species.match(REGEX_FORBID)) {
                logger.error("[form] Forbidden form detected.");
                console.log("SQL command detected.");
                interaction.followUp("I'm afraid I can't let you do that. Please use a different name.");
                return;
            }
            let check = `SELECT * from pokeForms WHERE species = \'` + species + `\' AND form = \'` + form + `\'`;


            form = interaction.options.getString("form-name") ?? ''; 
            let ability1 = interaction.options.getString("ability1") ?? '';  
            let ability2 = interaction.options.getString("ability2") ?? '';
            let ability3 = interaction.options.getString("ability3") ?? '';
            if (form.match(REGEX_SANI_STRING) || ability1.match(REGEX_SANI_STRING) || ability2.match(REGEX_SANI_STRING) || ability3.match(REGEX_SANI_STRING)) {

                logger.error("[form add] User attempted to use invalid character. Ability block.");
                console.log("Invalid character detected.");
                interaction.followUp("Please double check the spelling on your ability inputs.");
                return;

            }
            if (ability1.match(REGEX_FORBID) || ability2.match(REGEX_FORBID) || ability3.match(REGEX_FORBID)) {
                logger.error("[form] Forbidden ability name detected.");
                console.log("SQL command detected.");
                interaction.followUp("I'm afraid I can't let you do that. One of those isn't an ability name.");
                return;
            }
            let hpBST = interaction.options.getInteger("hp-base-stat") ?? '';
            let atkBST = interaction.options.getInteger("attack-base-stat") ?? '';
            let defBST = interaction.options.getInteger("defense-base-stat") ?? '';
            let spaBST = interaction.options.getInteger("specialattack-base-stat") ?? '';
            let spdBST = interaction.options.getInteger("specialdefense-base-stat") ?? '';
            let speBST = interaction.options.getInteger("speed-base-stat") ?? '';
            let type1 = interaction.options.getString("type1") ?? '';
            let type2 = interaction.options.getString("type2") ?? '';
            if (type1.match(REGEX_SANI_STRING) || type2.match(REGEX_SANI_STRING)) {

                logger.error("[form add] User attempted to use invalid character. Type block.");
                console.log("Invalid character detected.");
                interaction.followUp("Please double check the spelling on your type inputs.");
                return;

            }
            if (type1.match(REGEX_FORBID) || type2.match(REGEX_FORBID)) {
                logger.error("[form] Forbidden type detected.");
                console.log("SQL command detected.");
                interaction.followUp("I'm afraid I can't let you do that. Please use a different type.");
                return;
            }
            let genderrate = interaction.options.getInteger("genderRate") ?? 0;
            let capturerate = interaction.options.getInteger("captureRate") ?? 0;
            let egggroup1 = interaction.options.getString("eggGroup1") ?? '';
            let egggroup2 = interaction.options.getString("eggGroup2") ?? '';
            if (egggroup1.match(REGEX_SANI_STRING) || egggroup2.match(REGEX_SANI_STRING)) {

                logger.error("[form add] User attempted to use invalid character. Egg block.");
                console.log("Invalid character detected.");
                interaction.followUp("Please double check the spelling on your egg group imputs.");
                return;

            }
            if (egggroup1.match(REGEX_FORBID) || egggroup2.match(REGEX_FORBID)) {
                logger.error("[form] Forbidden egggroup detected.");
                console.log("SQL command detected.");
                interaction.followUp("I'm afraid I can't let you do that. Please use a different egg group.");
                return;
            }
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
                        interaction.followUp("Your new form for " + species + " was successfully added.");
                        return;
                    });
                } else {
                    logger.info('[form] New form already exists.');
                    interaction.followUp("That already exists.");
                    return;
                }
            });

        } else if(interaction.options.getSubcommand("remove")){
            //in future, may want to add a confirmation step to the deletion process
            let species = interaction.options.getString("species-name").toLowerCase();
            let form = interaction.options.getString("form-name").toLowerCase();
            if (form.match(REGEX_SANI_STRING) || species.match(REGEX_SANI_STRING)) {

                logger.error("[form remove] User attempted to use invalid character.");
                console.log("Invalid character detected.");
                interaction.followUp("Please double check the spelling on your inputs.");
                return;

            }
            const collectorFilter = i => {
                i.deferUpdate();
                return i.user.id === interaction.user.id;
            }
            const message = await interaction.followUp({ content: 'Are you sure you want to delete this form?', components: [row], fetchReply: true});
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






            return;
        }
    } catch (error){
        logger.error("[form] " + error.message);
        console.log(error);
        console.log(error.message);
        //interaction.channel.send(error.message);
    }

}

