// help message
const HELP_MESSAGE = "\n`+modpoke [nickname] [fieldToChange] [newValue]`\n\nModifies an existing Pokemon in the database. \nUse `+modpoke list` to view all available changeable fields.";
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
const STATIC_FIELDS = ["NAME", "GENDER", "NATURE", "HP", "ATK", "DEF", "SPA", "SPD", "SPE", "MOVE1", "MOVE2", "MOVE3", "MOVE4", "MOVE5", "MOVEPROGRESS", "ORIGINALTRAINER", "SHINY", "PRIVATE"];

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

        // ======================= OLD =======================
        /*let valueString;
        if (typeof args[2] == "string") valueString = `${args[2]}`; else valueString = args[2];

        let sql = `UPDATE pokemon SET ${args[1]} = ${valueString} WHERE name = '${args[0]}';`;

        console.log(sql);
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log(`Pokemon ${args[0]} :${args[1]} set to ${args[2]}`);
            message.channel.send(`Pokemon ${args[0]}: ${args[1]} set to ${args[2]}`);
        });*/

        // ======================= NEW =======================
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
        let sqlUpdateString = `UPDATE pokemon SET ${valName} = ${valString} WHERE name = '${pokeName}'`;

        // try to find the poke in the array first
        connection.query(sqlFindPoke, function(err, rows, fields) {
            // if you're here, the name couldn't be found in the table
           if (err) {
               console.log(pokeName + " was not found.");
               message.reply(pokeName + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `+listpoke` to view the Pokemon you can edit.");
           } else {
               // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
               if (rows[0].private > 0 && message.user.id !== rows[0].userID) {
                   console.log("Detected user attempting to edit private Pokemon that isn't their own.");
                   message.reply("Nice try!" + pokeName + " is private and not owned by you!");
               } else {
                   // if you're here, the pokemon can in fact be edited by this user! Yayy
                   // check if the variable is a "static" one, and go straight to updating if so
                   STATIC_FIELDS.forEach(staticField => function() {
                       if (staticField == valName.toUpperCase()) {
                           // go ahead and run the update string right away
                           connection.query(sqlUpdateString, function(err, results) {
                              if (err) {
                                  let errorMessage = "Unable to update static field " + valName + " of " + pokeName;
                                  console.log(errorMessage);
                                  message.reply(errorMessage);
                              } else {
                                  let successMessage = pokeName + "'s " + valName + " changed to " + valString;
                                  console.log(successMessage);
                                  message.reply(successMessage);
                              }
                           });
                       }
                   });
                   // if not a static field, it's one that updates other fields as well...
                   console.log(pokeName + " found. Attempting to update non-static field " + valName + " to " + valString + "...");

                   // grab the row and stow it as thisPoke
                   let thisPoke = rows[0];

                   // === NEW HP CALCULATION(if needed)===
                   // roll 2d10 to get new hp
                   let hpRoll1 = Math.floor(Math.random() * 10) + 1;
                   let hpRoll2 = Math.floor(Math.random() * 10) + 1;
                   // stow away old HP
                   let oldHP = rows[0].hp;

                   // roll through the poke array pre-conversion and adds the new variable

                    //TODO this is where I left off! Don't stay up too late kiyomi <>


               }

           }
        });


    } catch (error) {
        message.channel.send(error.toString());
        message.channel.send('Error while attempting to modify the Pokemon.').catch(console.error);
    }
};