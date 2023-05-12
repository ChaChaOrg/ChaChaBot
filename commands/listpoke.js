const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders')

// emotes to put at start of each string
// created by someone else
const otherCreator = ":small_blue_diamond:";
// created by you, public
const userCreator = ":small_orange_diamond:";
// created by you, private
const userCreatorPrivate = ":orange_circle:";

//chacha database site
const CHACHA_SITE = " **ChaCha Database Site:** http://34.226.119.6:7000/";

const HELP_MESSAGE = "Lists all Pokemon you can see. \n\n`+listpoke` lists all Pokemon that are public or visible" +
    " only" +
    " to you , while you can add a filter word & keyword afterwords to filter specific Pokemon. \n\n**Current" +
    " Filters:**" +
    " \n> -species (ie Talonflame) \n>  -form (ie Meowth-af) (TODO: Add note about how to view forms here)\n >  -type" +
    " (ie Fire, Flying; list one per filter) \n>  -discordid (unique number for user- use +myid to get your ID if you" +
    " don't know it) \n>  -private (yes or no) \n>  -level (#+ for that level or higher, #- for that level or lower," +
    " or" +
    " just # for only pokemon of that level) \n\n**Examples:** `+listpoke -species Talonflame`, `+listpoke -private" +
    " yes" +
    " -level 10+`, `+listpoke -type fire -type flying`, etc\n\nYou can view these in more comprehensive detail at" +
    " the" + CHACHA_SITE;

// the first page that the user can be on
const FIRST_PAGE_NUM = 1;

// the max number of pokemon that can be on one page
const MAX_POKES = 15;

const filterOptions = ["species", "type", "discordid", "form", "level", "private"];
const FILTER_NOT_FOUND = "Whoops! Either you didn't give enough arguments, or that filter wasn't found.\n**Current" +
    " Filters:** Species, Type, DiscordID";

/**
 * listpoke looks at the user's discord ID and displays all pokemon in the SQL they can see
 * @param client
 * @param connection
 * @param P
 * @param message
 * @param args
 */
// TODO fill out comment info above
//TODO split printed string by creator/ ensure it doesn't break discord character limit
module.exports.data = new SlashCommandBuilder()
	.setName('listpoke')
	.setDescription("Lists all Pokemon you can see.")
	.addStringOption(option =>
		option.setName('species')
		.setDescription("Filter by species")
		.setRequired(false)
        )
    .addStringOption(option =>
		option.setName('type1')
		.setDescription("Filter by a type")
		.setRequired(false)
        .addChoices(
            {name: 'water', value: 'water'},
            {name: 'fire', value: 'fire'},
            {name: 'grass', value: 'grass'},
            {name: 'electric', value: 'electric'},
            {name: 'normal', value: 'normal'},
            {name: 'flying', value: 'flying'},
            {name: 'ground', value: 'ground'},
            {name: 'fighting', value: 'fighting'},
            {name: 'bug', value: 'bug'},
            {name: 'psychic', value: 'psychic'},
            {name: 'dark', value: 'dark'},
            {name: 'ghost', value: 'ghost'},
            {name: 'steel', value: 'steel'},
            {name: 'rock', value: 'rock'},
            {name: 'poison', value: 'poison'},
            {name: 'dragon', value: 'dragon'},
            {name: 'fairy', value: 'fairy'},
            {name: 'ice', value: 'ice'}
        )
        )
        .addStringOption(option =>
		option.setName('type2')
		.setDescription("Filter by a second type")
		.setRequired(false)
        .addChoices(
            {name: 'water', value: 'water'},
            {name: 'fire', value: 'fire'},
            {name: 'grass', value: 'grass'},
            {name: 'electric', value: 'electric'},
            {name: 'normal', value: 'normal'},
            {name: 'flying', value: 'flying'},
            {name: 'ground', value: 'ground'},
            {name: 'fighting', value: 'fighting'},
            {name: 'bug', value: 'bug'},
            {name: 'psychic', value: 'psychic'},
            {name: 'dark', value: 'dark'},
            {name: 'ghost', value: 'ghost'},
            {name: 'steel', value: 'steel'},
            {name: 'rock', value: 'rock'},
            {name: 'poison', value: 'poison'},
            {name: 'dragon', value: 'dragon'},
            {name: 'fairy', value: 'fairy'},
            {name: 'ice', value: 'ice'}
        )
        )
    .addUserOption(option =>
		option.setName('user')
		.setDescription("Filter by discordID")
		.setRequired(false)
        )
    .addIntegerOption(option =>
		option.setName('level')
		.setDescription("Filter by level")
		.setRequired(false)
        )
    .addBooleanOption(option =>
		option.setName('private')
		.setDescription("Filter by Private")
		.setRequired(false)
        )

module.exports.run = async (interaction) => {

    try {
        /*
        // if there are less than 2 args, they either need help or didn't put enough info in
        if (args.length < 2 && args.length > 0) {
            if (args[0].includes('help')) {
                logger.info("[listpoke] Sending help interaction.");
                interaction.reply(HELP_MESSAGE);
            } else {
                logger.info("[listpoke] Filter option not found or not enough args. Sending error message");
                interaction.reply(FILTER_NOT_FOUND);
            }
        } else {
            */
            await interaction.deferReply();
            await interaction.followUp("Looking for that now!");

            // if you're here, it's time to create an array/pages to hold and display pokemon

            // the array of strings of Pokemon to be presented.
            let pokeArray = [];

            // items to filter for
            // ?? checks if the option is null, and if it is sets the vaule to ""
            let filterSpecies = interaction.options.getString("species") ?? "";
            let filterForm = interaction.options.getString("form") ?? "";
            let filterType1 = interaction.options.getString("type1") ?? "";
            let filterType2 = interaction.options.getString("type2") ?? "";
            let filterDiscordID = interaction.options.getUser("user") ?? "";
            let filterLevel = interaction.options.getInteger("level") ?? "";
            let filterPrivate = interaction.options.getString("species") ?? "";

            /**
             * The function to get the exact string needed from the given Pokemon object
             * @param pokemon The Pokemon to get the string from
             * @return pokeString The brief string summary of the Pokemon
             */
            let getPokeString = function (pokemon) {

                // create base string, and add creator emote to front
                let pokeString = "";

                // if discord id matches message sender, start with userCreator; otherwise start with otherCreator
                if (pokemon.discordID == interaction.user.id) {
                    if (pokemon.private) pokeString += userCreatorPrivate;
                    else pokeString += userCreator;
                } else {
                    pokeString += otherCreator;
                }

                // add pokemon info
                pokeString += " **" + pokemon.name + "**, LV " + pokemon.level + " ";
                // list form if different from species
                if (pokemon.species.toUpperCase() !== pokemon.form.toUpperCase()) {
                    pokeString += pokemon.form.toUpperCase() + " (" + pokemon.species.toUpperCase() + ") "
                } else {
                    pokeString += pokemon.species.toUpperCase();
                }
                // return the string!
                return pokeString;
            }

            // query for the info
            interaction.client.mysqlConnection.query("SELECT * FROM pokemon", function (err, result) {
                // an array of promises to be fulfilled before actually sending the message to the user
                let promises = [];
                // for each pokemon to be created, go through a promise
                new Promise(function (resolve) {

                    // go through each pokemon, creating their summary string and adding it to the array of pokes to be displayed
                    result.forEach(pokemon => {
                        // only add the pokemon if they are private BUT belong to the user, or are public
                        if (pokemon.private === 0 || pokemon.discordID === interaction.user.id) {
                            // true/false checks for grabbing the pokemon; if any are false, don't process it
                            let filterSpeciesSwitch = true;
                            let filterFormSwitch = true;
                            let filterType1Switch = true;
                            let filterType2Switch = true;
                            let filterDiscordIDSwitch = true;
                            let filterLevelSwitch = true;
                            let filterPrivateSwitch = true;

                            //check if any filter items are not blank; if a filter is not blank and doesn't match what's
                            // in the pokemon, then flip one of the switches to false
                            if (filterSpecies || filterForm || filterType1 || filterType2 || filterDiscordID || filterLevel || filterPrivate) {
                                //check species if not blank
                                if (filterSpecies && (pokemon.species.toLowerCase() !== filterSpecies)) {
                                    filterSpeciesSwitch = false;
                                }
                                // check form if not blank
                                if (filterForm && (pokemon.form.toLowerCase() !== filterForm)) {
                                    filterFormSwitch = false;
                                }
                                // check type 1
                                if (filterType1 && (pokemon.type1.toLowerCase() !== filterType1 && pokemon.type2.toLowerCase() !== filterType1)) {
                                    filterType1Switch = false;
                                }
                                // check type 2
                                if (filterType2 && (pokemon.type1.toLowerCase() !== filterType2 && pokemon.type2.toLowerCase() !== filterType2)) {
                                    filterType2Switch = false;
                                }
                                // check discord id
                                if (filterDiscordID.id && pokemon.discordID !== filterDiscordID.id) {
                                    filterDiscordIDSwitch = false;
                                }
                                //check private
                                if (filterPrivate) {
                                    if (filterPrivate === "yes") { // they do want only private items
                                        if (!pokemon.private) filterPrivateSwitch = false;
                                    } else { // assume if they didn't say yes they want public items only
                                        if (pokemon.private) filterPrivateSwitch = false;
                                    }
                                }
                                //check level
                                if (filterLevel) {
                                    //check if they want above or below a certain level
                                    try {
                                        let levelRange = filterLevel.charAt(filterLevel.length - 1);
                                        //if the final character is a +, check if at the level or above
                                        if (levelRange === "+" || levelRange === "-") {
                                            let levelRangeNumOnly = parseInt(filterLevel.substr(0, filterLevel.length - 1));
                                            if (levelRange === "+") { // they want pokemon at the given level or higher
                                                if (pokemon.level < levelRangeNumOnly) filterLevelSwitch = false;
                                            } else {
                                                if (pokemon.level > levelRangeNumOnly) filterLevelSwitch = false;
                                            }
                                        } else { // if you're here, they want the exact level
                                            let levelRange = parseInt(filterLevel);
                                            if (pokemon.level !== levelRange) {
                                                filterLevelSwitch = false;
                                            }
                                        }
                                    } catch (oopsie) {
                                        interaction.followUp("Error while attempting to find level range");
                                    }
                                }
                            }

                            // walk through each filter
                            /*if (filterChoice === filterOptions[0]) { // filter by species
                                // only grab the pokemon IF either species or form matches
                                if (pokemon.species.toLowerCase() === filterCriteria || pokemon.form.name === filterCriteria) {
                                    // push the promise of fetching the user to the outside promise array
                                    promises.push(client.fetchUser(pokemon.discordID)
                                        .then(function (response) {
                                            // create the pokestring and add it to the array
                                            pokeArray.push(getPokeString(pokemon));
                                        })
                                        .catch(error => {
                                            // if you're here, there was an issue pushing the pokemon into the list
                                            let pushPokeError = "Error while converting Pokemon into summary interaction.";
                                            logger.error("[listpoke] " + error + "\n" + pushPokeError);
                                            interaction.reply(pushPokeError);
                                        }));
                                }
                            } else if (filterChoice === filterOptions[1]) { // filter by type
                                if (pokemon.type1.toLowerCase() === filterCriteria || pokemon.type2.toLowerCase() === filterCriteria) {
                                    // push the promise of fetching the user to the outside promise array
                                    promises.push(client.fetchUser(pokemon.discordID)
                                        .then(function (response) {
                                            // create the pokestring and add it to the array
                                            pokeArray.push(getPokeString(pokemon));
                                        })
                                        .catch(error => {
                                            // if you're here, there was an issue pushing the pokemon into the list
                                            let pushPokeError = "Error while converting Pokemon into summary interaction.";
                                            logger.error("[listpoke] " + error + "\n" + pushPokeError);
                                            interaction.reply(pushPokeError);
                                        }));
                                }
                            } else if (filterChoice === filterOptions[2]) { // filter by discord id
                                if (pokemon.discordID === filterCriteria) {
                                    // push the promise of fetching the user to the outside promise array
                                    promises.push(client.fetchUser(pokemon.discordID)
                                        .then(function (response) {
                                            // create the pokestring and add it to the array
                                            pokeArray.push(getPokeString(pokemon));
                                        })
                                        .catch(error => {
                                            // if you're here, there was an issue pushing the pokemon into the list
                                            let pushPokeError = "Error while converting Pokemon into summary interaction.";
                                            logger.error("[listpoke] " + error + "\n" + pushPokeError);
                                            interaction.reply(pushPokeError);
                                        }));
                                }*/
                            console.log("test");
                            //if any of the switches are false, don't push
                            if (filterSpeciesSwitch && filterFormSwitch && filterType1Switch && filterType2Switch &&
                                filterDiscordIDSwitch && filterPrivateSwitch && filterLevelSwitch) {
                                 // if you're here, the pokemon is good to add!
                                // push the promise of fetching the user to the outside promise array
                                promises.push(interaction.client.users.fetch(pokemon.discordID)
                                    .then(function (response) {
                                        // create the pokestring and add it to the array
                                        pokeArray.push(getPokeString(pokemon));
                                    })
                                    .catch(error => {
                                        // if you're here, there was an issue pushing the pokemon into the list
                                        let pushPokeError = "Error while converting Pokemon into summary interaction.";
                                        logger.error("[listpoke] " + error + "\n" + pushPokeError);
                                        interaction.followUp(pushPokeError);
                                    }));
                            }
                        }
                    });
                    Promise.all(promises).then(function () {
                        // resolve the promise when the poke is done being processed!
                        resolve("Done");
                    });
                })
                    .then(function (response) {
                        //  === START PAGE COUNTERS ===

                        // the last page the user can be on
                        let lastPageNum = Math.ceil(pokeArray.length / MAX_POKES);

                        // the current page the user is on
                        let currentPageNum = 1;

                        // === END PAGE COUNTERS ===

                        // create an embed for each set of 10 pokemon to be displayed
                        let embedPage = function (pokeArray, pageNum) {
                            // create string to hold all pokes to be listed
                            let pokeList = "";
                            // for each poke, add to a string
                            pokeArray.forEach(pokeString => { pokeList += pokeString + "\n"; });

                            // create and return embed
                            return {
                                embed: {
                                    color: 3447003,
                                    title: `ChaChaBot Database - Visible Pokemon`,
                                    description: `.`,
                                    fields: [
                                        {
                                            name: "**=========**",
                                            value: `${pokeList}`
                                        }
                                    ],
                                    footer: {
                                        text: `Page ${pageNum} of ${lastPageNum} of visible Pokemon`
                                    }
                                }
                            };

                        };

                        // create "pages" of embeds based on every 10 pokemon in the total list
                        let pokeEmbedPages = [];

                        // temporary array for making pages
                        let pokeTempArray = [];

                        // throw pokemon into pages until all are loaded up
                        for (let i = 0; i < pokeArray.length; i++) {
                            // push the poke into the temporary array
                            pokeTempArray.push(pokeArray[i]);
                            // if the array = 10 or this is the last pokemon in pokeArray, push and reset
                            if (pokeTempArray.length === MAX_POKES) {
                                // push embed page into list of embed pages
                                pokeEmbedPages.push(embedPage(pokeTempArray, currentPageNum));
                                // increase current page
                                currentPageNum++;
                                // reset temp array
                                pokeTempArray = [];
                            }
                        }

                        // after the for loop, if the tempArray isn't empty push and empty one more time
                        if (pokeTempArray.length > 0) {
                            pokeEmbedPages.push(embedPage(pokeTempArray, currentPageNum));
                            pokeTempArray = [];
                        }

                        // TODO turn this into page flipping variant later
                        if (pokeEmbedPages.length > 0) {
                            interaction.user.send("Here are the Pokemon you can view." +
                                "\n\nYou can also view them on the site at http://34.226.119.6:7000/\n\n" +
                                userCreatorPrivate + " = Created by you, private/visible only to you\n" +
                                userCreator + " = Created by you, but public\n" +
                                otherCreator + " = Created by someone else");
                            pokeEmbedPages.forEach(pokePage => {
                                interaction.author.send(pokePage);
                            });
                            interaction.followUp("I've DM'd you the list!");
                        } else {
                            interaction.followUp("No results found.");
                        }
                        logger.info("[listpoke] Sent all pages to user");

                        // once all pokemon have been yoinked, print em as a list
                        //console.log(`String: ${printString}`);
                        //interaction.author.send(printString);
                    })
                    .catch(error => {
                        // if you're here, there was an error while attempting to resolve the Big Promise
                        let errorMessage = "Error while attempting to create promises."
                        interaction.followUp(errorMessage);
                        logger.info("[listpoke] " + errorMessage + "\n" + error);
                    });

            });

        
    } catch (err) {
        // if you're here, there was a broad error that wasn't caught by the other stuff!
        let broadErrMessage = "Error while attempting to execute the listpoke command.";
        logger.info("[listpoke] " + broadErrMessage + "\n" + err);
        interaction.followUp(broadErrMessage);
    }
};
