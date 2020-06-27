// help message
const HELP_MESSAGE = "\n`+modpoke [nickname] [fieldToChange] [newValue]`\n\nModifies an existing Pokemon in the database. \nUse `+modpoke list` to view all available changeable fields.)";
// list of editable fields
const HELP_FIELDS_LIST = "Here's the list of all available fields on a Pokemon that can be manipulated. Fields marked with a ♢ will update other related stats upon being updated.\n" +
    "NOTE - Fields are **case-sensitive**" +
    "\n" +
    "**BASIC FEATURES**\n" +
    "> `name` // Nickname (\"Sparky\", \"Blaze\")\n" +
    "> `species♢` // Species (\"Pikachu\", \"Vulpix\")\n" +
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
    "> `shiny` // Shiny status (0 = false, 1 = true)\n" +
    "> `private` // Private marker. (0 = false, 1 = true) (*Private Pokemon can only be seen by their creator*)";

//message when there are too few arguments
const FEWARGS_MESSAGE = "Too few arguments submitted. Check your submission for errors.";

// array of variables that can go straight to being updated
const STATIC_FIELDS = ["name", "gender", "hp", "atk", "def", "spa", "spd", "spe", "move1", "move2", "move3", "move4", "move5", "moveProgress", "originalTrainer", "shiny", "private"];

// code formatting variables for the embed
const CODE_FORMAT_START = "```diff\n";
const CODE_FORMAT_END = "\n```"

module.exports.run = (client, connection, P, message, args) => {
    let Pokemon = require('../models/pokemon.js');
    try {


        // if asking for help, print the help message
        if (args[0].includes('help')) {
            message.reply(HELP_MESSAGE);
            return;
        }

        // if looking for the list of arguments, print em
        if (args[0].includes('list')) {
            message.reply(HELP_FIELDS_LIST);
            return;
        }

        //Check if enough args
        if(args.length < 3) {
            message.reply(FEWARGS_MESSAGE);
            console.log(FEWARGS_MESSAGE);
            return;
        }
        // otherwise, lets find our poke and add those updates!

        // grab the pokemon's name
        let pokeName = args[0];
        //grab the value to be changed
        let valName = args[1];
        //grab the new value to be input, set properly in the following if statement
        let valString;
        if (typeof args[2] == "string") {
            valString = `${args[2]}`;
        } else valString = args[2];

        // ================= SQL statements  =================
        // sql statement to check if the Pokemon exists
        let sqlFindPoke = `SELECT * FROM pokemon WHERE name = '${pokeName}'`;
        // sql statement to update the Pokemon
        let sqlUpdateString = `UPDATE pokemon SET ${valName} = '${valString}' WHERE name = '${pokeName}'`;
        // not found message
        let notFoundMessage = pokeName + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `+listpoke` to view the Pokemon you can edit.";

        // try to find the poke in the array first
        connection.query(sqlFindPoke, function(err, rows, fields) {
            // if you're here, the name couldn't be found in the table
           if (err) {
               let cantAccessSQLMessage = "SQL error, please try again later or contact a maintainer if the issue persists.";
               console.log(cantAccessSQLMessage);
               message.reply(cantAccessSQLMessage);
           } else if (rows.length === 0) {
                // the pokemon was not found
               console.log(pokeName + " was not found.");
               message.reply(notFoundMessage);
           } else {

               // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
               if (rows[0].private > 0 && message.author.id !== rows[0].userID) {
                   console.log("Detected user attempting to edit private Pokemon that isn't their own.");
                   // If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
                   message.reply(notFoundMessage);
               } else {
                   console.log(pokeName + " confirmed to be editable by user. Checking for static/dynamic variable.");
                   // true/false declaring whether or not the variable is static or not
                   let isStaticVal = false;

                   // promise that the static check is taken care of
                   let staticCheck = new Promise((resolve, reject) => {
                       // check if the variable is a "static" one, and go straight to updating if so
                       STATIC_FIELDS.forEach(staticField => {
                           if (staticField === valName) {
                               // go ahead and run the update string right away
                               connection.query(sqlUpdateString, function(err, results) {
                                   if (err) {
                                       let errorMessage = "Unable to update static field " + valName + " of " + pokeName;
                                       console.log(errorMessage);
                                       console.log(err.toString());
                                       message.reply(errorMessage);
                                   } else {
                                       let successMessage = "**" + pokeName + "'s** " + valName + " has been changed to " + valString + "!";
                                       console.log(successMessage);
                                       message.reply(successMessage + "\nNOTE: Any updates to base stats will be overwritten if related variables (such as IVs, EVs, and level) are changed.");
                                       isStaticVal = true;
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
                           console.log(pokeName + " found. Attempting to update non-static field " + valName + " to " + valString + "...");
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
                           oldPoke.loadFromSQL(P, rows[0]).then(function (results) {

                               // grab the row and stow it
                               let thisPoke = rows[0];

                               // if the valName is species, assign directly, otherwise convert it into a number
                               if (valName === "species") thisPoke[valName] = valString;
                               else thisPoke[valName] = parseInt(valString);

                               //Make new empty Pokemon object
                               let tempPoke = new Pokemon();

                               /* ======== FOR REFERENCE ========
                               // oldPoke - original Pokemon OBJECT, pre-updates
                               // thisPoke - updated Pokemon data ARRAY, post-updates
                               // tempPoke - updated Pokemon OBJECT, post-updates & calculated accordingly */


                               //use Pokemon.loadFromSQL to convert SQL object into a complete Pokemon object
                               tempPoke.loadFromSQL(P, thisPoke).then(function (results) {

                                   console.log("SQL has been converted to a Pokemon Object\nAll values recalculated as necessary\nProviding user with comparison embed & awaiting change confirmation...");

                                   // DEBUG display old and new pokes
                                   //message.channel.send("Old Pokemon Below (debug)");
                                   //message.channel.send(oldPoke.sendSummaryMessage(client));
                                   //message.channel.send("New Pokemon Below (debug)");
                                   //message.channel.send(tempPoke.sendSummaryMessage(client));

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

                                   // formatted species names (old + new) for formatting purposes
                                   let oldSpecies = capitalize(oldPoke.species);
                                   let newSpecies = capitalize(tempPoke.species);

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
                                       + "SCORE:" + fieldChanged(oldPoke.statBlock.strBase.toFixed(0), tempPoke.statBlock.strBase.toFixed(0),true)
                                       + "MODIFIER:" + fieldChanged(oldPoke.statBlock.strMod, tempPoke.statBlock.strMod, true)
                                       + CODE_FORMAT_END,


                                       CODE_FORMAT_START
                                       + "SCORE:" +  fieldChanged(oldPoke.statBlock.dexBase.toFixed(0), tempPoke.statBlock.dexBase.toFixed(0), true)
                                       + "MODIFIER:" + fieldChanged(oldPoke.statBlock.dexMod, tempPoke.statBlock.dexMod, true)
                                       + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                       + "SCORE:" + fieldChanged(oldPoke.statBlock.conBase.toFixed(0), tempPoke.statBlock.conBase.toFixed(0), true)
                                       + "MODIFIER:" + fieldChanged(oldPoke.statBlock.conMod, tempPoke.statBlock.conMod, true)
                                       + CODE_FORMAT_END,


                                       CODE_FORMAT_START
                                       + "SCORE:" + fieldChanged(oldPoke.statBlock.intBase.toFixed(0), tempPoke.statBlock.intBase.toFixed(0), true)
                                       + "MODIFIER:" + fieldChanged(oldPoke.statBlock.intMod, tempPoke.statBlock.intMod, true)
                                       + CODE_FORMAT_END,


                                       CODE_FORMAT_START
                                       + "SCORE:" + fieldChanged(oldPoke.statBlock.wisBase.toFixed(0), tempPoke.statBlock.wisBase.toFixed(0), true)
                                       + "MODIFIER:" + fieldChanged(oldPoke.statBlock.wisMod, tempPoke.statBlock.wisMod, true)
                                       + CODE_FORMAT_END,


                                       "```\n:3c```"
                                   ];

                                   // TODO update above array with charisma calculator when that's done and ready

                                   // Create embed with old/new updates
                                   let comparisonEmbed = {
                                       embed: {
                                           color: 3447003,
                                           author: {
                                               name: client.user.username,
                                               icon_url: client.user.avatarURL
                                           },
                                           title: `Review & Confirm Changes to ${tempPoke.name}`,
                                           thumbnail: {
                                               url: `${tempPoke.pokemonData.sprites.front_default}`,
                                           },
                                           description: `Please review the Pokemon's updated stats, highlighted in color below. If the updates are correct, confirm the changes to the Pokemon by reacting to the message beneath this embed.`,
                                           fields: [
                                               {
                                                   name: "Static Fields",
                                                   value: `These should not change via dynamic field updates.\n`
                                                       + `**Name:** ${tempPoke.name}\n`
                                                       + `**Ability:** ${formatAbility(tempPoke.ability.name)}\n`
                                                       + `**Gender:** ${capitalize(tempPoke.gender)}\n`
                                                       + `**Shiny?** ${tempPoke.shiny}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Core Fields",
                                                   value: `${CODE_FORMAT_START}Level${fieldChanged(oldPoke.level, tempPoke.level, true)}Species${fieldChanged(oldSpecies, newSpecies, false)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                 name: "=====",
                                                 value: "**BASE STATS**"
                                               },
                                               {
                                                   name: "Hit Points (HP)",
                                                   value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[0], tempPoke.statBlock.ivStats[0], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[0], tempPoke.statBlock.evStats[0], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[0], tempPoke.statBlock.finalStats[0], true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Attack (ATK)",
                                                   value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[1], tempPoke.statBlock.ivStats[1], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[1], tempPoke.statBlock.evStats[1], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[1], tempPoke.statBlock.finalStats[1], true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Defense (DEF)",
                                                   value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[2], tempPoke.statBlock.ivStats[2], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[2], tempPoke.statBlock.evStats[2], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[2], tempPoke.statBlock.finalStats[2], true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Spec. Attack (SPA)",
                                                   value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[3], tempPoke.statBlock.ivStats[3], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[3], tempPoke.statBlock.evStats[3], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[3], tempPoke.statBlock.finalStats[3], true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Spec. Defense (SPD)",
                                                   value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[4], tempPoke.statBlock.ivStats[4], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[4], tempPoke.statBlock.evStats[4], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[4], tempPoke.statBlock.finalStats[4], true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Speed (SPE)",
                                                   value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[5], tempPoke.statBlock.ivStats[5], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[5], tempPoke.statBlock.evStats[5], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[5], tempPoke.statBlock.finalStats[5], true)}${CODE_FORMAT_END}`,
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
                                                   value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.fortSave, tempPoke.statBlock.fortSave, true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Reflex (REF)\nBased on DEX",
                                                   value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.refSave, tempPoke.statBlock.refSave, true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Will (WILL)\nBased on WIS",
                                                   value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.willSave, tempPoke.statBlock.willSave, true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "=====",
                                                   value: "**AC & Move Speed**"
                                               },
                                               {
                                                   name: "Armor Class (AC)",
                                                   value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.armorClass, tempPoke.statBlock.armorClass, true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                               {
                                                   name: "Move Speed (measured in feet)",
                                                   value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.armorClass, tempPoke.statBlock.armorClass, true)}${CODE_FORMAT_END}`,
                                                   inline: true
                                               },
                                           ],
                                           timestamp: new Date(),
                                           footer: {
                                               icon_url: client.user.avatarURL,
                                               text: "Chambers and Charizard!"
                                           }
                                       }
                                   };

                                   // ======== END FORMATTED VARIABLES & STRINGS & EMBED ========

                                   // post embed with changes displayed
                                   message.channel.send(comparisonEmbed);

                                   // alert user that they must confirm before actually sending changes
                                   message.reply("Changes displayed in embed above. Confirm with reaction ✅, or cancel with ❌").then(function(response) {
                                       // add reactions for easy user access
                                       response.react('✅');
                                       response.react('❌');

                                       //filter for the reaction collector
                                       const filter = (reaction, user) => user.id === message.author.id && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');

                                       // await user reaction
                                       response.awaitReactions(filter, {max: 1, time: 100000}).then(collected => {
                                           // tell the log
                                           console.log(`Collected ${collected.size} reactions`);
                                           // if confirmed, update the poke and alert the user to such
                                           if (collected.first().emoji.name === '✅') {
                                               // update the pokemon and print confirmation
                                               tempPoke.updatePokemon(connection, message, rows[0].private).then(function (results) {
                                                   let successString = "Success! " + pokeName + "'s " + valName + " has been changed to " + valString + " and all related stats have been updated.\n\nHint: View Pokemon's stat's using `+showpoke [nickname]`";
                                                   console.log(successString);
                                                   message.reply(successString);
                                               }).catch(function (error) {
                                                   message.reply("Error updating SQL for: " + pokeName);
                                                   console.log("Error updating SQL for: " + pokeName);
                                                   console.log(error.toString());
                                               });
                                           } else {
                                               // if you're here, the user clicked X
                                               console.log("Edits to Pokemon cancelled by user.");
                                               message.reply(pokeName + "'s edits have been cancelled");
                                           }
                                       }).catch((err) => {
                                           // timeout message
                                           let timeoutMessage = "Edits to " + pokeName + " cancelled via timeout.";
                                           // if you're here, the action timed out
                                           console.log(timeoutMessage);
                                           console.log(err.toString());
                                           message.reply(timeoutMessage);
                                       });
                                   });

                                   //TODO: Find a better way to preserve health
                                   //As of right now just re-rolls hp
                                   //would have to add this within pokemon to do it neatly.
                                   //We can add an arg to .updatePokemon but I'm already doing that with private
                                   //and a one-off fix here would be messy since hp might change in another part of the bot


                               }).catch(function (error) {
                                   let loadNewPokeMessage = "Error loading new Pokemon to object. Please make sure you've entered a valid field and value.";
                                   message.reply(loadNewPokeMessage);
                                   console.log(loadNewPokeMessage);
                                   console.log(error.toString());
                               });
                           }).catch(function (error) {
                               let loadOriginalPokeMessage = "Error while attempting to load the original Pokemon to an object.";
                               message.reply(loadOriginalPokeMessage);
                               console.log(loadOriginalPokeMessage);
                               console.log(error.toString());
                           });
                       }
                   });
               }
           }
        });


    } catch (error) {
        message.channel.send(error.toString());
        message.channel.send('Error while attempting to modify the Pokemon.').catch(console.error);
    }
};