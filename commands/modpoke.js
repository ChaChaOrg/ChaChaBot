const { EmbedBuilder, SlashCommandAssertions, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js')
const logger = require('../logs/logger.js');

// help message
const HELP_MESSAGE = "\n`/modpoke  [nickname] [fieldToChange] [newValue]`\n\nModifies an existing Pokemon in the" +
    " database. \nUse `/modpoke list` to view all available changeable fields.)";
// list of editable fields
const HELP_FIELDS_LIST = "Here's the list of all available fields on a Pokemon that can be manipulated. Fields marked with a ♢ will update other related stats upon being updated.\n" +
    "\n" +
    "**BASIC FEATURES**\n" +
    "> `name` // Nickname (\"Sparky\", \"Blaze\"), cannot include spaces or special characters\n" +
    "> `species♢` // Species (\"Pikachu\", \"Vulpix\")\n" +
    "> `form♢` // Current Form (\"meowth-galarian\", \"aegislash-shield\")\n" +
    "> `level♢` // ChaCha level, ranging from level 1-20. Each ChaCha level is equivalent to 5 in-videogame levels\n" +
    "> `gender` // Gender (*Male, Female, or Genderless*)\n" +
    "> `ability` // Ability (\"Static\", \"Flash Fire\")\n" +
    "> `nature♢` // Nature (\"Quirky\", \"Sassy\")\n" +
    "> `type1` // First (or only) type. *Cannot be empty*!\n" +
    "> `type2` // Second type, if it has one\n" +
    "\n" +
    "**Base Stats, EVs, & IVs**\n" +
    "> `hp` // `hpIV♢` // `hpEV♢` // Hit Points\n" +
    "> `atk` // `atkIV♢` // `atkEV♢` // Attack\n" +
    "> `def` // `defIV♢` // `defEV♢` // Defense\n" +
    "> `spa` // `spaIV♢` // `spaEV♢` // Special Attack\n" +
    "> `spd` // `spdIV♢` // `spdEV♢` // Special Defense\n" +
    "> `spe` // `speIV` // `speEV` // Speed\n" +
    "\n" +
    "**Moves**\n" +
    "> `move1` // `move2` // `move3` //  `move4` // Main 4 moves known\n" +
    "> `move5` // The currently in-progress move\n" +
    "> `moveProgress` // Progress on move learning. Can be 0-5; upon 6th success, move is learned and replaces other move.\n" +
    "> (For move learning DCs, use `+movetutor help`)\n" +
    "\n" +
    "**Other**\n" +
    "> `originalTrainer` // The Pokemon's trainer\n" +
    "> `campaign` // The Pokemon's campaign\n" +
    "> `shiny` // Shiny status (0 = false, 1 = true)\n" +
    "> `private` // Private marker, generated pokemon set to private (1) by default. (0 = false, 1 = true) (*Private" +
    " Pokemon can only be seen by their creator*)";

//message when there are too few arguments
const FEWARGS_MESSAGE = "Too few arguments submitted. Check your submission for errors.";

//message where the field they want to change does not exist
const NONEXISTENT_FIELD_MESSAGE = "That isn't a valid field to change! Please check your spelling and try again."

// array of variables that can go straight to being updated
const STATIC_FIELDS = ["ability", "name", "gender", "hp", "atk", "def", "spa", "spd", "spe", "move1", "move2", "move3", "move4", "move5", "moveProgress", "originalTrainer", "shiny", "private"];
const OTHER_FIELDS = ["species", "form", "level", "nature", "type1", "type2", "hpIV", "hpEV", "atkIV", "atkEV", "defIV", "defEV", "spaIV", "spaEV", "spdIV", "spdEV", "speIV", "speEV","exp","friendship"]

const ALL_NATURES = ["adamant", "bashful", "bold", "brave", "calm", "careful", "docile", "gentle", "hardy", "hasty", "impish", "jolly", 
                        "lax", "lonely", "mild", "modest", "naive", "naughty", "quiet", "quirky", "rash", "relaxed", "sassy", "serious", "timid"]

const ALL_IVS = ["hpIV", "atkIV", "defIV", "spaIV", "spdIV", "speIV"]
const ALL_EVS = ["hpEV", "atkEV", "defEV", "spaEV", "spdEV", "speEV"]

const EXP_TRESH = [0, 6, 24, 54, 96, 150, 216, 294, 384, 486, 600, 726, 864, 1014, 1176, 1350, 1536, 1734, 1944, 2166]
const FRIEND_TRESH = [35, 70, 120, 170, 220]
const FRIEND_VAL = ["Hostile","Unfriendly"]
// code formatting variables for the embed
const CODE_FORMAT_START = "```diff\n";
const CODE_FORMAT_END = "\n```"

module.exports.data = new SlashCommandBuilder()
                        .setName('modpoke')
                        .setDescription("Modifies an existing Pokemon in the database. Use /modpoke help for available fields.")
                        .addSubcommand(subcommand =>
                            subcommand
                            .setName('help')
                            .setDescription('Tells the user which fields can be modified.')
                        )
                        .addSubcommand(subcommand =>
                            subcommand
                            .setName('pokemon')
                            .setDescription('Modify aspects of a pokemon.')
                            .addStringOption(option =>
                                option.setName('nickname')
                                    .setDescription('Nickname of the Pokemon being modified. Do not use spaces or special characters!')
                                    .setAutocomplete(true)
                                    .setRequired(true))
                            .addStringOption(option =>
                                option.setName('field-to-change')
                                    .setDescription('Field that is going to be modified.')
                                    .setAutocomplete(true)
                                    .setRequired(true))
                            .addStringOption(option =>
                                option.setName('new-value')
                                    .setDescription('New value of the field being modified')
                                    .setAutocomplete(true)
                                    .setRequired(true))
                        );

module.exports.autocomplete = async (interaction) => {
  const focusedValue = interaction.options.getFocused(true);

  if(focusedValue.name === 'nickname'){
    var choices = interaction.client.pokemonCache;
    const filtered = choices.filter(choice => (!choice.private || (choice.discordID == interaction.user)) && choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24) ;
    await interaction.respond(
           filtered.map(choice => ({ name: choice.name, value: choice.name })),
    )
  }else if(focusedValue.name === 'field-to-change'){
    var choices = STATIC_FIELDS.concat(OTHER_FIELDS);
    const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
    await interaction.respond(
           filtered.map(choice => ({ name: choice, value: choice })),
    )
  }else if(focusedValue.name === 'new-value'){
    const field = interaction.options.getString('field-to-change').toLowerCase();
    
    if(field === 'ability'){
        var choices = interaction.client.abilitylist;

        const filtered = choices.filter(choice => choice[0].toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
        await interaction.respond(
            filtered.map(choice => ({ name: choice[0], value: choice[0] })),
        )
    }else if(field === 'nature'){
        var choices = ALL_NATURES;

        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
        await interaction.respond(
           filtered.map(choice => ({ name: choice, value: choice })),
        )
    }
  }else{
    //nothing
  }
  
};


module.exports.run = async (interaction) => {
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
			.addComponents(confirm, cancel);

    let Pokemon = require('../models/pokemon.js');
    try {
        if (interaction.options.getSubcommand() === 'help') {
            interaction.editReply(HELP_FIELDS_LIST);
            return;
        }

        let nickname = interaction.options.getString("nickname");
        let fieldToChange = interaction.options.getString("field-to-change");
        let newValue = interaction.options.getString("new-value");

        // if (nickname == fieldToChange == newValue == 'help') {
        //     interaction.channel.send(HELP_FIELDS_LIST);
        //     return;
        // }

        // grab the pokemon's name
        let pokeName = nickname;

        //grab the value to be changed
        let valName = fieldToChange;
        let lowerCase_OTHERFIELDS = OTHER_FIELDS.map(field => field.toLowerCase()); //copy of OTHER_FIELDS all lowercase
        console.log("other fields mapped");
        // check whether the field they want to change exists
        if (!STATIC_FIELDS.includes(valName) && !OTHER_FIELDS.includes(valName) &&
            !STATIC_FIELDS.includes(valName.toLowerCase()) && !lowerCase_OTHERFIELDS.includes(valName.toLowerCase())) {
            logger.warn("[modpoke] Can't change that field because of spelling or doesn't exist. Sending nonexistent field interaction.");
            interaction.editReply(NONEXISTENT_FIELD_MESSAGE);
            return;
        }

        // make value all lowercase if it's in the STATIC_FIELDS array and not already matching
        if (!STATIC_FIELDS.includes(valName) && STATIC_FIELDS.includes(valName.toLowerCase())) {
            valName = fieldToChange.toLowerCase();
        }

        // make value the correct case by setting it to matching value in OTHER_FIELDS in order to match the DB schema
        if (!OTHER_FIELDS.includes(valName) && lowerCase_OTHERFIELDS.includes(valName.toLowerCase())) {
            let idx = lowerCase_OTHERFIELDS.indexOf(valName.toLowerCase());
            valName = OTHER_FIELDS[idx];
        }

        // make value all lowercase if it's in the STATIC_FIELDS array and not already matching
        if (!STATIC_FIELDS.includes(valName) && STATIC_FIELDS.includes(valName.toLowerCase())) {
            valName = fieldToChange.toLowerCase();
        }

        // make value the correct case by setting it to matching value in OTHER_FIELDS in order to match the DB schema
        if (!OTHER_FIELDS.includes(valName) && lowerCase_OTHERFIELDS.includes(valName.toLowerCase())) {
            let idx = lowerCase_OTHERFIELDS.indexOf(valName.toLowerCase());
            valName = OTHER_FIELDS[idx];
        }

        //grab the new value to be input, set properly in the following if statement
        let valString;
        if (typeof newValue == "string") {
            valString = `${newValue}`;
        } else valString = newValue;

        if (valName == "nature") {
            if (!ALL_NATURES.includes(valString)) {
                logger.error("[modpoke] User tried to put in invalid nature.")
                interaction.editReply("That is not a valid pokemon nature, please check your spelling.")
                return;
            }

            valString = valString.toLowerCase();
            valString = newValue.charAt(0).toUpperCase() + newValue.slice(1);
        }

        const userfilter = i => i.user.id === interaction.user.id;
        if (ALL_IVS.includes(valName) && (parseInt(valString) < 0 || parseInt(valString) > 31)) {
            if (parseInt(valString) < 0) {
                logger.error(`[modpoke] IV value (${valString}) for ${pokeName} is outside the bounds of 0 - 31! Modification canceled.`)
                interaction.editReply(`IV value (${valString}) for ${pokeName} is outside the bounds of 0 - 31! Modification canceled.`)
                return;
            }
            if (parseInt(valString) > 31) {
                const response = await interaction.followUp({
                    content: "IV values are normally capped at 31. Are you sure you want to do this?",
                    components: [row],
                });

                

                try {
                    const confirmation = await response.awaitMessageComponent({ filter: userfilter, time: 60000 });
                    if (confirmation.customId === 'cancel') {
                        interaction.followUp('IV modification canceled.');
                        return;
                    }
                } catch (e) {
                    interaction.followUp("Modification canceled due to time out.");
                    return;
                }
            }
        }
        if (ALL_EVS.includes(valName) && (parseInt(valString) < 0 || parseInt(valString) > 252)) {
            if (parseInt(valString) < 0) {
                logger.error(`[modpoke] EV value (${valString}) for ${pokeName} is outside the bounds of 0 - 252! Modification canceled.`)
                interaction.editReply(`EV value (${valString}) for ${pokeName} is outside the bounds of 0 - 252! Modification canceled.`)
                return;
            }

            if (parseInt(valString) > 252) {
                const response = await interaction.followUp({
                    content: "EV values are normally capped at 252. Are you sure you want to do this?",
                    components: [row],
                });
                try {
                   

                    const confirmation = await response.awaitMessageComponent({ filter: userfilter, time: 60000 });

                    if (confirmation.customId === 'cancel') {
                        interaction.followUp("EV modification canceled.");
                        return;
                    }
                } catch (e) {
                    interaction.followUp("Modification canceled due to time out.");
                    return;
                }
            }
        }
        if (valName.toLowerCase() == 'level' && (parseInt(valString) < 1 || parseInt(valString) > 20)) {
            
            if (parseInt(valString) < 1) {
                logger.error(`[modpoke]Level value (${valString}) for ${pokeName} is outside the bounds of 1 - 20! Modification canceled.`)
                interaction.editReply(`Level value (${valString}) for ${pokeName} is outside the bounds of 1 - 20! Modification canceled.`)
                return;
            }

            if (parseInt(valString) > 20) {
                const response = await interaction.followUp({
                    content: "The normal max level for a pokemon is 20. Are you sure you want to do this?",
                    components: [row],
                });
                try {
                    

                    const confirmation = await response.awaitMessageComponent({ filter: userfilter, time: 60000 });

                    if (confirmation.customId === 'cancel') {
                        interaction.followUp("Level modification canceled.");
                        return;
                    }
                } catch (e) {
                    interaction.followUp("Modification canceled due to time out.");
                    return;
                }
            }
        }


        // Duplicate check and name special character check
        if (valName.toLowerCase() == 'name') {

            if (!valString.match(/^\w+$/)) {
                logger.warn("[modpoke] User put special character in pokemon name, sending warning.");
                interaction.editReply("Please do not use special characters when using renaming Pokemon. Modification canceled.");
                return;
            }

            let dupeSQL = `SELECT * FROM pokemon WHERE name = '${valString}'`;

            let results = new Promise((resolve, reject) => interaction.client.mysqlConnection.query(dupeSQL, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.length);
                }
            }));

            // Call promise with await
            let dupecheck = await results.catch((err) => {
                logger.info("[modpoke] " + err);
                interaction.followUp("SQL error, please try again later or contact a maintainer if the issue persists. Modification canceled.");
                return;
            })

            // If duplicate, stop
            if (dupecheck > 0) {
                logger.warn("[modpoke] Duplicate Pokemon name. Sending warning..");
                interaction.followUp("Duplicate name exists - please choose another name! Modification canceled.");
                return;
            }

        }

        if (valName.toLowerCase() == 'friendship' && isNaN(parseInt(valString))) {
            logger.error('[modpoke]Friendship value is NAN');
            interaction.editReply('Friendship value improperly formatted. Expecting a number.');
            return;
        }

        // ================= SQL statements  =================
        // sql statement to check if the Pokemon exists
        let sqlFindPoke = `SELECT * FROM pokemon WHERE name = '${pokeName}'`;
        logger.info(`[modpoke] SQL find pokemon query: ${sqlFindPoke}`);
        // sql statement to update the Pokemon
        let sqlUpdateString = `UPDATE pokemon SET ${valName} = '${valString}' WHERE name = '${pokeName}'`;
        logger.info(`[modpoke] SQL update string: ${sqlUpdateString}`);
        // not found message
        let notFoundMessage = pokeName + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `/listpoke` to view the Pokemon you can edit.)";

        // try to find the poke in the array first
        interaction.client.mysqlConnection.query(sqlFindPoke, function (err, rows, fields) {
            // if you're here, the name couldn't be found in the table
            if (err) {
                let cantAccessSQLMessage = "SQL error, please try again later or contact a maintainer if the issue persists.";
                logger.error("[modpoke]" + cantAccessSQLMessage + ` ${err}`)
                interaction.editReply(cantAccessSQLMessage);
                return;
            } else if (rows.length === 0) {
                // the pokemon was not found
                logger.info(`[modpoke] ${pokeName} was not found.`)
                interaction.editReply(notFoundMessage);
                return;
            } else {
                // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
                if (rows[0].private > 0 && interaction.user.id !== rows[0].discordID) {
                    logger.info("[modpoke] Detected user attempting to edit private Pokemon that isn't their own.")
                    // If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
                    interaction.editReply(notFoundMessage);
                    return
                } else {
                    logger.info(`[modpoke] ${pokeName} confirmed to be editable by user. Checking for static/dynamic variable.`);
                    // true/false declaring whether or not the variable is static or not
                    let isStaticVal = false;

                    // promise that the static check is taken care of
                    let staticCheck = new Promise((resolve, reject) => {
                        // check if the variable is a "static" one, and go straight to updating if so
                        STATIC_FIELDS.forEach(staticField => {
                            if (staticField === valName) {
                                isStaticVal = true;
                                // go ahead and run the update string right away
                                interaction.client.mysqlConnection.query(sqlUpdateString, function (err, results) {
                                    if (err) {
                                        let errorMessage = "Unable to update static field " + valName + " of " + pokeName;
                                        logger.error(`[modpoke] ${errorMessage}\n\t${err.toString()}`);
                                        logger.error("[modpoke] " + err);
                                        interaction.editReply(errorMessage);
                                        reject();
                                    } else {
                                        let successMessage = "**" + pokeName + "'s** " + valName + " has been changed to " + valString + "!";
                                        logger.info(`[modpoke] ${successMessage}`)
                                        interaction.editReply(successMessage + "\nNOTE: Any updates to base stats will be overwritten if related variables (such as IVs, EVs, and level) are changed.");
                                        interaction.client.pokemonCacheUpdate();
                                        resolve();
                                    }
                                });
                            }
                        });
                        resolve();
                    });

                    // await promise before attempting non-static update
                    staticCheck.then(() => {
                        // if you're here, then the field is not static and needs to get verification before being updated
                        if (!isStaticVal) {// if not a static field, it's one that updates other fields as well...
                            logger.info(pokeName + " found. Attempting to update non-static field " + valName + " to " + valString + "...")
                            /* HP calculation stuff (for later)

                           // === NEW HP CALCULATION(if needed)===
                           // roll 2d10 to get new hp
                           let hpRoll1 = Math.floor(Math.random() * 10) + 1;
                           let hpRoll2 = Math.floor(Math.random() * 10) + 1;
                           // stow away old HP
                           let oldHP = rows[0].hp;

                           // roll through the poke array pre-conversion and adds the new variable
                            */

                            // create a pokemon object with the original data
                            let oldPoke = new Pokemon();

                            // create oldPoke object
                            oldPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, rows[0]).then(function (results) {

                                console.log("oldPoke:");
                                console.log(`"${oldPoke.pokemonData.stats[0].stat.name}": "${oldPoke.pokemonData.stats[0].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[1].stat.name}": "${oldPoke.pokemonData.stats[1].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[2].stat.name}": "${oldPoke.pokemonData.stats[2].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[3].stat.name}": "${oldPoke.pokemonData.stats[3].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[4].stat.name}": "${oldPoke.pokemonData.stats[4].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[5].stat.name}": "${oldPoke.pokemonData.stats[5].base_stat}"`);
                                // grab the row and stow it
                                let thisPoke = rows[0];

                                // if the valName is species, assign directly, otherwise convert it into a number

                                if (valName === "species"|| valName === "form"||valName === "nature") thisPoke[valName] = valString.toLowerCase();
                                else thisPoke[valName] = parseInt(valString);

                                if (valName === "exp") {
                                    let exp = parseInt(valString);
                                    let iter = 1;
                                    while (iter < 20 && exp >= EXP_TRESH[iter]) {
                                        iter++;
                                    }
                                    thisPoke["level"] = iter;
                                    thisPoke["exp"] = exp;
                                }
                                console.log("level: " + thisPoke["level"] + " exp: " + thisPoke["exp"]);

                                if (valName === "friendship") {
                                    let frnd = parseInt(valString);
                                    if (frnd < 0) {
                                        frnd = 0;
                                    }
                                    if (frnd > 255) {
                                        frnd = 255;
                                    }
                                    thisPoke["friendship"] = frnd;
                                }
                                //Make new empty Pokemon object
                                let newPoke = new Pokemon();

                                /* ======== FOR REFERENCE ========
                                // oldPoke - original Pokemon OBJECT, pre-updates
                                // thisPoke - updated Pokemon data ARRAY, post-updates
                                // newPoke - updated Pokemon OBJECT, post-updates & calculated accordingly */

                                //use Pokemon.loadFromSQL to convert SQL object into a complete Pokemon object
                                newPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, thisPoke).then(async function (results) {

                                    console.log("new Pokemon:");
                                    console.log(`"${newPoke.pokemonData.stats[0].stat.name}": "${newPoke.pokemonData.stats[0].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[1].stat.name}": "${newPoke.pokemonData.stats[1].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[2].stat.name}": "${newPoke.pokemonData.stats[2].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[3].stat.name}": "${newPoke.pokemonData.stats[3].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[4].stat.name}": "${newPoke.pokemonData.stats[4].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[5].stat.name}": "${newPoke.pokemonData.stats[5].base_stat}"`);



                                    logger.info("SQL has been converted to a Pokemon Object\nAll values recalculated as necessary\nProviding user with comparison embed & awaiting change confirmation...")

                                    // DEBUG display old and new pokes
                                    //interaction.channel.send("Old Pokemon Below (debug)");
                                    //interaction.channel.send(oldPoke.sendSummaryMessage(client));
                                    //interaction.channel.send("New Pokemon Below (debug)");
                                    //interaction.channel.send(newPoke.sendSummaryMessage(client));

                                    // ======== FORMATTED VARIABLES & STRINGS & EMBED ========

                                    // capitalize function
                                    let capitalize = function (tempWord) {
                                        return tempWord.charAt(0).toUpperCase() + tempWord.substr(1);
                                    };

                                    // format ability function
                                    let formatAbility = function (ability) {
                                        // if two word ability, break apart and format accordingly
                                        if (~ability.indexOf("-")) {
                                            // yoink both halves
                                            let tempA = ability.slice(0, ability.indexOf("-"));
                                            let tempB = ability.slice(ability.indexOf("-") + 1, ability.length);
                                            // capitalize them both
                                            return capitalize(tempA) + " " + capitalize(tempB);
                                        } else {
                                            // return the given ability, but capitalized properly
                                            return capitalize(ability);
                                        }
                                    };

                                    // If species was updated, update types to match
                                    if (valName === "species" || valName === "form") newPoke.assignTypes();

                                    // formatted species names (old + new) for formatting purposes
                                    let oldSpecies = capitalize(oldPoke.species);
                                    let newSpecies = capitalize(newPoke.species);

                                    /**
                                     * This function compares two values, an original and "updated",
                                     * returning a string displaying the one value if left unchanged, or both if changed.
                                     * If designated as a number, will color green if value increased, and red if decreased
                                     * @param oldVal The original value
                                     * @param newVal The "updated" value to compare
                                     * @param isNum Whether or not the value is a number
                                     * @returns {string|*}
                                     */
                                    let fieldChanged = function (oldVal, newVal, isNum) {
                                        // convert entered values into
                                        let oldString = oldVal.toString();
                                        let newString = newVal.toString();
                                        // if different, return string with both
                                        if (oldString.localeCompare(newString) === 0) {
                                            return "\n--- " + oldVal + "\n\n";
                                        } else {
                                            // the full different field string, to be returned at the end
                                            let diffFieldString = "";
                                            //if the isNum value is false, simply return the string with red text for the "updated" text
                                            if (!isNum) {
                                                diffFieldString = "\n- " + newString + "\n--- OLD: " + oldString + "\n";
                                            } else {
                                                // if it is a number, it's time to compare the two
                                                // to see if the new value is higher or lower than the original

                                                // parse int value from oldVal
                                                let oldNum = parseInt(oldVal, 10);
                                                // parse int val from newVal
                                                let newNum = parseInt(newVal, 10);

                                                // if newNum is higher than old, make it green
                                                if (newNum > oldNum) {
                                                    diffFieldString = "\n+ " + newString + "\n--- OLD: " + oldString + "\n";
                                                } else {
                                                    // you're only here if newNum is lower than old, so make it red
                                                    diffFieldString = "\n- " + newString + "\n--- OLD: " + oldString + "\n";
                                                }
                                            }

                                            // if here, the two are different
                                            return diffFieldString;
                                        }
                                    };

                                    // formatted ability score strings. STR(0) DEX(1) CON(2) INT(3) WIS(4) CHA(5)
                                    let abilityScoreString = [
                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.strBase.toFixed(0), newPoke.statBlock.strBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.strMod, newPoke.statBlock.strMod, true)
                                        + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.dexBase.toFixed(0), newPoke.statBlock.dexBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.dexMod, newPoke.statBlock.dexMod, true)
                                        + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.conBase.toFixed(0), newPoke.statBlock.conBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.conMod, newPoke.statBlock.conMod, true)
                                        + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.intBase.toFixed(0), newPoke.statBlock.intBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.intMod, newPoke.statBlock.intMod, true)
                                        + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.wisBase.toFixed(0), newPoke.statBlock.wisBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.wisMod, newPoke.statBlock.wisMod, true)
                                        + CODE_FORMAT_END,


                                        "```\n:3c```"
                                    ];

                                    // TODO update above array with charisma calculator when that's done and ready
                                    console.log("Embedding");
                                    // Create embed with old/new updates
                                    let comparisonEmbed = new EmbedBuilder()
                                        .setColor(0x3498DB)
                                        .setTitle(`Review & Confirm Changes to ${newPoke.name}`)
                                        .setAuthor({
                                            name: interaction.client.user.username,
                                            icon_url: interaction.client.user.avatarURL
                                        })
                                        .setThumbnail(`${newPoke.pokemonData.sprites.front_default}`)
                                        .setDescription(`Please review the Pokemon's updated stats, highlighted in color below. If the updates are correct, confirm the changes to the Pokemon by reacting to the message beneath this embed.`)
                                        .addFields(
                                            {
                                                name: "Static Fields",
                                                value: `These should not change via dynamic field updates.\n`
                                                    + `**Name:** ${newPoke.name}\n`
                                                    + `**Ability:** ${formatAbility(newPoke.ability.name)}\n`
                                                    + `**Gender:** ${capitalize(newPoke.gender)}\n`
                                                    + `**Shiny?** ${newPoke.shiny}`,
                                                inline: true
                                            },
                                            {
                                                name: "Core Fields",
                                                value: `${CODE_FORMAT_START}Level${fieldChanged(oldPoke.level, newPoke.level, true)}Species${fieldChanged(oldSpecies, newSpecies, false)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "=====",
                                                value: "**GROWTH STATS**"
                                            },
                                            {
                                                name: "Experience Points/Friendship",
                                                value: `${CODE_FORMAT_START}Exp: ${fieldChanged(oldPoke.exp, newPoke.exp, true)}Friendship: ${fieldChanged(oldPoke.friendship, newPoke.friendship, true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            //{
                                                //name: "Friendship",
                                                //value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.friendship, newPoke.friendship, true)}${CODE_FORMAT_END}`,
                                                //inline: true
                                            //},
                                            {
                                                name: "=====",
                                                value: "**BASE STATS**"
                                            },
                                            {
                                                name: "Hit Points (HP)",
                                                value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[0], newPoke.statBlock.ivStats[0], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[0], newPoke.statBlock.evStats[0], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[0], newPoke.statBlock.finalStats[0], true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "Attack (ATK)",
                                                value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[1], newPoke.statBlock.ivStats[1], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[1], newPoke.statBlock.evStats[1], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[1], newPoke.statBlock.finalStats[1], true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "Defense (DEF)",
                                                value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[2], newPoke.statBlock.ivStats[2], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[2], newPoke.statBlock.evStats[2], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[2], newPoke.statBlock.finalStats[2], true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "Sp. Attack (SPA)",
                                                value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[3], newPoke.statBlock.ivStats[3], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[3], newPoke.statBlock.evStats[3], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[3], newPoke.statBlock.finalStats[3], true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "Sp. Defense (SPD)",
                                                value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[4], newPoke.statBlock.ivStats[4], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[4], newPoke.statBlock.evStats[4], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[4], newPoke.statBlock.finalStats[4], true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "Speed (SPE)",
                                                value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[5], newPoke.statBlock.ivStats[5], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[5], newPoke.statBlock.evStats[5], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[5], newPoke.statBlock.finalStats[5], true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "=====",
                                                value: "**ABILITY SCORES**"
                                            },
                                            {
                                                name: "Strength (STR)",
                                                value: `${abilityScoreString[0]}`,
                                                inline: true
                                            },
                                            {
                                                name: "Dexterity (DEX)",
                                                value: `${abilityScoreString[1]}`,
                                                inline: true
                                            },
                                            {
                                                name: "Constitution (CON)",
                                                value: `${abilityScoreString[2]}`,
                                                inline: true
                                            },
                                            {
                                                name: "Intelligence (INT)",
                                                value: `${abilityScoreString[3]}`,
                                                inline: true
                                            },
                                            {
                                                name: "Wisdom (WIS)",
                                                value: `${abilityScoreString[4]}`,
                                                inline: true
                                            },
                                            {
                                                name: "Charisma (CHA)",
                                                value: `${abilityScoreString[5]}`,
                                                inline: true
                                            },
                                            {
                                                name: "=====",
                                                value: "**SAVING THROWS**"
                                            },
                                            {
                                                name: "Fortitude (FORT)\nBased on CON",
                                                value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.fortSave, newPoke.statBlock.fortSave, true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "Reflex (REF)\nBased on DEX",
                                                value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.refSave, newPoke.statBlock.refSave, true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "Will (WILL)\nBased on WIS",
                                                value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.willSave, newPoke.statBlock.willSave, true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "=====",
                                                value: "**AC & Move Speed**"
                                            },
                                            {
                                                name: "Armor Class (AC)",
                                                value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.armorClass, newPoke.statBlock.armorClass, true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                            {
                                                name: "Move Speed (measured in feet)",
                                                value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.moveSpeed, newPoke.statBlock.moveSpeed, true)}${CODE_FORMAT_END}`,
                                                inline: true
                                            },
                                        )
                                        .setTimestamp(new Date())
                                        .setFooter({
                                            icon_url: interaction.client.user.avatar,
                                            text: "Chambers and Charizard!"
                                        })

                                    // ======== END FORMATTED VARIABLES & STRINGS & EMBED ========

                                    // post embed with changes displayed
                                    // interaction.channel.send({ embeds: [comparisonEmbed] });
                                    const response = await interaction.editReply({ 
                                        content: 'Confirm with confirm or cancel. Times out in one minute.',
                                        embeds: [comparisonEmbed],
                                        components: [row] 
                                    })

                                    await interaction.channel.send("Changes displayed in embed above. Confirm with confirm or deny.")
                                    
                                    const collectorFilter = i => i.user.id === interaction.user.id;

                                    try {
                                        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

                                        if (confirmation.customId == 'confirm') {
                                            newPoke.updatePokemon(interaction.client.mysqlConnection, null, rows[0].private, interaction).then(function (results) {
                                                let successString = "Success! " + pokeName + "'s " + valName + " has been changed to " + valString + " and all related stats have been updated.\n\nHint: View Pokemon's stat's using `/showpoke [nickname]`";
                                                logger.info(`[modpoke] ${successString}`)
                                                interaction.editReply({ components: []});
                                                interaction.channel.send({ content: successString });
                                            }).catch(function (error) {
                                                interaction.editReply({ components: []});
                                                interaction.channel.send({ content: "Error updating SQL for: " + pokeName })
                                                logger.error(`[modpoke] Error updating SQL for ${pokeName}`)
                                            });
                                        } else if (confirmation.customId === 'cancel') {
                                            logger.info("Edits to Pokemon cancelled by user.")
                                            interaction.editReply({ content: pokeName + "'s edits have been cancelled", components: []});
                                        }
                                    } catch (e) {
                                        console.log(e)
                                        interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
                                    }
                                

                                    //TODO: Find a better way to preserve health
                                    //As of right now just re-rolls hp
                                    //would have to add this within pokemon to do it neatly.
                                    //We can add an arg to .updatePokemon but I'm already doing that with private
                                    //and a one-off fix here would be messy since hp might change in another part of the bot


                                }).catch(function (error) {
                                    let loadNewPokeMessage = "Error loading new Pokemon to object. Please make sure you've entered a valid field and value.";
                                    interaction.editReply(loadNewPokeMessage);
                                    console.log(error);
                                    logger.error(`[modpoke] ${loadNewPokeMessage}\n\t${error.toString()}`)
                                });
                            }).catch(function (error) {
                                let loadOriginalPokeMessage = "Error while attempting to load the original Pokemon to an object.";
                                interaction.editReply(loadOriginalPokeMessage);
                                logger.error(`[modpoke] ${loadOriginalPokeMessage}\n\t${error.toString}`)
                            });
                        }
                    });
                }
            }
        });


    } catch (error) {
        logger.error(`[modpoke] Error while attempting to modify the Pokemon.\n\t${error.toString()}`)
        interaction.channel.send(error.toString());
        interaction.channel.send('Error while attempting to modify the Pokemon.').catch(console.error);
    }
};