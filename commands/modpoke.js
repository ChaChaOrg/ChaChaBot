// help message
const HELP_MESSAGE = "\n`+modpoke [nickname] [fieldToChange] [newValue]`\n\nModifies an existing Pokemon in the database. \nUse `+modpoke list` to view all available changeable fields.)";
// list of editable fields
const HELP_FIELDS_LIST = "Here's the list of all available fields on a Pokemon that can be manipulated. Fields marked with a ♢ will update other related stats upon being updated.\n" +
    "\n" +
    "**BASIC FEATURES**\n" +
    "> `NAME` // Nickname (\"Sparky\", \"Blaze\")\n" +
    "> `SPECIES♢` // Species (\"Pikachu\", \"Vulpix\")\n" +
    "> `LEVEL♢` // ChaCha level, ranging from level 1-20. Each ChaCha level is equivalent to 5 in-videogame levels\n" +
    "> `GENDER` // Gender (*Male, Female, or Genderless*)\n" +
    "> `ABILITY` // Ability (\"Static\", \"Flash Fire\")\n" +
    "> `NATURE♢` // Nature (\"Quirky\", \"Sassy\")\n" +
    "> `TYPE1` // First (or only) type. *Cannot be empty*!\n" +
    "> `TYPE2` // Second type, if it has one\n" +
    "\n" +
    "**Base Stats, EVs, & IVs**\n" +
    "> `HP` // `HPIV♢` // `HPEV♢` // Hit Points\n" +
    "> `ATK` // `ATKIV♢` // `ATKEV♢` // Attack\n" +
    "> `DEF` // `DEFIV♢` // `DEFEV♢` // Defense\n" +
    "> `SPA` // `SPAIV♢` // `SPAEV♢` // Special Attack\n" +
    "> `SPD` // `SPDIV♢` // `SPDEV♢` // Special Defense\n" +
    "> `SPE` // `SPEIV` // `SPEIV` // Speed\n" +
    "\n" +
    "**Moves**\n" +
    "> `MOVE1` // `MOVE2` // `MOVE3` //  `MOVE4` // Main 4 moves known\n" +
    "> `MOVE5` // The currently in-progress move\n" +
    "> `MOVEPROGRESS` // Progress on move learning. Can be 0-5; upon 6th success, move is learned and replaces other move.\n" +
    "> (For move learning DCs, use `+movetutor help`)\n" +
    "\n" +
    "**Other**\n" +
    "> `ORIGINALTRAINER` // The Pokemon's trainer\n" +
    "> `SHINY` // Shiny status (0 = false, 1 = true)\n" +
    "> `PRIVATE` // Private marker. (0 = false, 1 = true) (*Private Pokemon can only be seen by their creator*)";
// array of variables that can go straight to being updated
const STATIC_FIELDS = ["NAME", "GENDER", "HP", "ATK", "DEF", "SPA", "SPD", "SPE", "MOVE1", "MOVE2", "MOVE3", "MOVE4", "MOVE5", "MOVEPROGRESS", "ORIGINALTRAINER", "SHINY", "PRIVATE"];

module.exports.run = (client, connection, P, message, args) => {
    let Pokemon = require('../pokemon.js');
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
               let cantAccessSQLMessage = "Error while attempting to search the SQL for " + pokeName;
               console.log(cantAccessSQLMessage);
               message.reply(cantAccessSQLMessage);
           } else if (rows.length === 0) {
                // the pokemon was not found
               console.log(pokeName + " was not found.");
               message.reply(notFoundMessage);
           } else {

               // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
               if (rows[0].private > 0 && message.user.id !== rows[0].userID) {
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
                           if (staticField === valName.toUpperCase()) {
                               // go ahead and run the update string right away
                               connection.query(sqlUpdateString, function(err, results) {
                                   if (err) {
                                       let errorMessage = "Unable to update static field " + valName + " of " + pokeName;
                                       console.log(errorMessage);
                                       console.log(err.toString());
                                       message.reply(errorMessage);
                                   } else {
                                       let successMessage = pokeName + "'s " + valName + " changed to " + valString;
                                       console.log(successMessage);
                                       message.reply(successMessage);
                                       isStaticVal = true;
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

                               // inside thisPoke, update the given field with the given value
                               thisPoke[valName] = valString;

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
                                   message.channel.send("Old Pokemon Below (debug)");
                                   message.channel.send(oldPoke.sendSummaryMessage(client));
                                   message.channel.send("New Pokemon Below (debug)");
                                   message.channel.send(tempPoke.sendSummaryMessage(client));

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

                                   // function to compare old and new item, returning appropriate string
                                   let fieldChanged = function (oldVal, newVal) {
                                       let oldString = oldVal.toString();
                                       let newString = newVal.toString();
                                       // if different, return string with both
                                       if (oldString.localeCompare(newString) == 0) {
                                           return oldVal;
                                       } else {
                                           // if here, the two are different
                                           return "(`OLD: " + oldVal + "` // NEW: " + newVal + ")";
                                       }
                                   };

                                   // formatted ability score strings. STR(0) DEX(1) CON(2) INT(3) WIS(4) CHA(5)
                                   let abilityScoreString = [
                                       "**STR: ** " + fieldChanged(oldPoke.statBlock.strBase.toFixed(0), tempPoke.statBlock.strBase.toFixed(0)) + "( " + fieldChanged(oldPoke.statBlock.strMod, tempPoke.statBlock.strMod) + " )",
                                       "**DEX: ** " + fieldChanged(oldPoke.statBlock.dexBase.toFixed(0), tempPoke.statBlock.dexBase.toFixed(0)) + "( " + fieldChanged(oldPoke.statBlock.dexMod, tempPoke.statBlock.dexMod) + " )",
                                       "**CON: ** " + fieldChanged(oldPoke.statBlock.conBase.toFixed(0), tempPoke.statBlock.conBase.toFixed(0)) + "( " + fieldChanged(oldPoke.statBlock.conMod, tempPoke.statBlock.conMod) + " )",
                                       "**INT: ** " + fieldChanged(oldPoke.statBlock.intBase.toFixed(0), tempPoke.statBlock.intBase.toFixed(0)) + "( " + fieldChanged(oldPoke.statBlock.intMod, tempPoke.statBlock.intMod) + " )",
                                       "**WIS: ** " + fieldChanged(oldPoke.statBlock.wisBase.toFixed(0), tempPoke.statBlock.wisBase.toFixed(0)) + "( " + fieldChanged(oldPoke.statBlock.wisMod, tempPoke.statBlock.wisMod) + " )",
                                       "**CHA: ** :3c"
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
                                           title: `Level ${fieldChanged(oldPoke.level, tempPoke.level)} ${fieldChanged(oldSpecies, newSpecies)} ~ ${tempPoke.name}`,
                                           thumbnail: {
                                               url: `${tempPoke.pokemonData.sprites.front_default}`,
                                           },
                                           description: "Use !data to call info using the Pokedex bot.",
                                           fields: [
                                               {
                                                   name: "Basic Info",
                                                   value: `**Ability:** ${formatAbility(tempPoke.ability.name)} | **Gender:** ${tempPoke.gender} | **Nature: ** ${fieldChanged(oldPoke.nature.natureFinal, tempPoke.nature.natureFinal)} | **Shiny: ** ${tempPoke.shiny}\n=================`
                                               },
                                               {
                                                   name: "HP",
                                                   value: `**IV: ** ${fieldChanged(oldPoke.statBlock.ivStats[0], tempPoke.statBlock.ivStats[0])} | **EV: ** ${fieldChanged(oldPoke.statBlock.evStats[0], tempPoke.statBlock.evStats[0])} | **Final: ** ${fieldChanged(oldPoke.statBlock.finalStats[0], tempPoke.statBlock.finalStats[0])}\n=================`
                                               },
                                               {
                                                   name: "Attack",
                                                   value: `**IV: ** ${fieldChanged(oldPoke.statBlock.ivStats[1], tempPoke.statBlock.ivStats[1])} | **EV: ** ${fieldChanged(oldPoke.statBlock.evStats[1], tempPoke.statBlock.evStats[1])} | **Final: ** ${fieldChanged(oldPoke.statBlock.finalStats[1], tempPoke.statBlock.finalStats[1])}\n=================`
                                               },
                                               {
                                                   name: "Defense",
                                                   value: `**IV: ** ${fieldChanged(oldPoke.statBlock.ivStats[2], tempPoke.statBlock.ivStats[2])} | **EV: ** ${fieldChanged(oldPoke.statBlock.evStats[2], tempPoke.statBlock.evStats[2])} | **Final: ** ${fieldChanged(oldPoke.statBlock.finalStats[2], tempPoke.statBlock.finalStats[2])}\n=================`
                                               },
                                               {
                                                   name: "Special Attack",
                                                   value: `**IV: ** ${fieldChanged(oldPoke.statBlock.ivStats[3], tempPoke.statBlock.ivStats[3])} | **EV: ** ${fieldChanged(oldPoke.statBlock.evStats[3], tempPoke.statBlock.evStats[3])} | **Final: ** ${fieldChanged(oldPoke.statBlock.finalStats[3], tempPoke.statBlock.finalStats[3])}\n=================`
                                               },
                                               {
                                                   name: "Special Defense",
                                                   value: `**IV: ** ${fieldChanged(oldPoke.statBlock.ivStats[4], tempPoke.statBlock.ivStats[4])} | **EV: ** ${fieldChanged(oldPoke.statBlock.evStats[4], tempPoke.statBlock.evStats[4])} | **Final: ** ${fieldChanged(oldPoke.statBlock.finalStats[4], tempPoke.statBlock.finalStats[4])}\n=================`
                                               },
                                               {
                                                   name: "Speed",
                                                   value: `**IV: ** ${fieldChanged(oldPoke.statBlock.ivStats[5], tempPoke.statBlock.ivStats[5])} | **EV: ** ${fieldChanged(oldPoke.statBlock.evStats[5], tempPoke.statBlock.evStats[5])} | **Final: ** ${fieldChanged(oldPoke.statBlock.finalStats[5], tempPoke.statBlock.finalStats[5])}\n=================`
                                               },
                                               {
                                                   name: "Ability Scores",
                                                   value: `${abilityScoreString[0]} | ${abilityScoreString[1]} | ${abilityScoreString[2]}\n${abilityScoreString[3]} | ${abilityScoreString[4]} | ${abilityScoreString[5]}`
                                               },
                                               {
                                                   name: "Saving Throws",
                                                   value: `**FORT: ** ${fieldChanged(oldPoke.statBlock.fortSave, tempPoke.statBlock.fortSave)} | **REF: ** ${fieldChanged(oldPoke.statBlock.refSave, tempPoke.statBlock.refSave)} | **WILL: ** ${fieldChanged(oldPoke.statBlock.willSave, tempPoke.statBlock.willSave)}`
                                               },
                                               {
                                                   name: "AC & Move Speed",
                                                   value: `**AC: ** ${fieldChanged(oldPoke.statBlock.armorClass, tempPoke.statBlock.armorClass)} | **Move Speed: ** ${fieldChanged(oldPoke.statBlock.moveSpeed, tempPoke.statBlock.moveSpeed)} ft`
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
                                       response.react('✅').then(response.react('❌'));

                                       // await user reaction
                                       response.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'), {max: 1, time: 90000}).then(collected => {
                                           // if confirmed, update the poke and alert the user to such
                                           if (collected.first().emoji.name == '✅') {
                                               // update the pokemon and print confirmation
                                               tempPoke.updatePokemon(connection, message, rows[0].private).then(function (results) {
                                                   console.log("Success! " + pokeName + "'s " + valName + "has been changed to " + valString + "and all related stats have been updated.\n\nHint: View Pokemon's stat's using `+showpoke [nickname]`");
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
                                       }).catch(() => {
                                           // timeout message
                                           let timeoutMessage = "Edits to " + pokeName + " cancelled via timeout.";
                                           // if you're here, the action timed out
                                           console.log(timeoutMessage);
                                           message.reply(timeoutMessage);
                                       });
                                   });

                                   //TODO: Find a better way to preserve health
                                   //As of right now just re-rolls hp
                                   //would have to add this within pokemon to do it neatly.
                                   //We can add an arg to .updatePokemon but I'm already doing that with private
                                   //and a one-off fix here would be messy since hp might change in another part of the bot

                                   //TODO: Actually test it


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