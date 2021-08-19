const logger = require('../logs/logger.js');

// emotes to put at start of each string
// created by someone else
const otherCreator = ":small_blue_diamond:";
// created by you
const userCreator = ":large_orange_diamond:";

//chacha database site
const CHACHA_SITE = " **ChaCha Database Site:** http://34.226.119.6:7000/";

const HELP_MESSAGE = "Lists all Pokemon you can see. `+listpoke` lists all Pokemon that are public or visible only" +
    " to you , while you can add a filter word & keyword afterwords to filter specific Pokemon.\n\n" +
    "**Current Filters:** \n - Species (*ie Talonflame, meowth-af*)\n - Type (*ie Fire, Flying*)\n - DiscordID" +
    "*(unique number for user- use `+myid` to get your ID if you don't know it)*" +
    "\n\nSample: `+listpoke species Talonflame`" +
    "\n\nYou can view these in more comprehensive detail" +
    " at the" + CHACHA_SITE;

// the first page that the user can be on
const FIRST_PAGE_NUM = 1;

// the max number of pokemon that can be on one page
const MAX_POKES = 15;


const filterOptions = ["species", "type", "discordid"];
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
module.exports.run = (client, connection, P, message, args) => {

    try {

        // if there are less than 2 args, they either need help or didn't put enough info in
        if (args.length < 2 && args.length > 0) {
            if (args[0].includes('help')) {
                logger.info("[listpoke] Sending help message.");
                message.reply(HELP_MESSAGE);
            } else {
                logger.info("[listpoke] Filter option not found or not enough args. Sending error message");
                message.reply(FILTER_NOT_FOUND);
            }
        } else {
            // if you're here, it's time to create an array/pages to hold and display pokemon

            // the array of strings of Pokemon to be presented.
            let pokeArray = [];

            /**
             * The function to get the exact string needed from the given Pokemon object
             * @param pokemon The Pokemon to get the string from
             * @return pokeString The brief string summary of the Pokemon
             */
            let getPokeString = function (pokemon) {

                // create base string, and add creator emote to front
                let pokeString = "";

                // if discord id matches message sender, start with userCreator; otherwise start with otherCreator
                if (pokemon.discordID == message.author.id) {
                    pokeString += userCreator;
                } else {
                    pokeString += otherCreator;
                }

                // add pokemon info
                pokeString += " **" + pokemon.name + "**, LV " + pokemon.level + " " + pokemon.species.toUpperCase();
                // add (p) if private to user
                if (pokemon.private) pokeString += " (p)";
                // return the string!
                return pokeString;
            }

            // query for the info
            connection.query("SELECT * FROM pokemon", function (err, result) {
                // an array of promises to be fulfilled before actually sending the message to the user
                let promises = [];
                // for each pokemon to be created, go through a promise
                new Promise(function (resolve) {

                    // lock in whatever filter was entered, if any
                    let filterChoice = "none";
                    if (args[0]) filterChoice = args[0].toLowerCase();
                    let filterCriteria = "none";
                    if (args[1]) filterCriteria = args[1].toLowerCase();

                    // go through each pokemon, creating their summary string and adding it to the array of pokes to be displayed
                    result.forEach(pokemon => {
                        // only add the pokemon if they are private BUT belong to the user, or are public
                        if (pokemon.discordID === message.author.id || pokemon.private === 0) {
                            // walk through each filter
                            if (filterChoice === filterOptions[0]) { // filter by species
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
                                            let pushPokeError = "Error while converting Pokemon into summary message.";
                                            logger.error("[listpoke] " + error + "\n" + pushPokeError);
                                            message.reply(pushPokeError);
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
                                            let pushPokeError = "Error while converting Pokemon into summary message.";
                                            logger.error("[listpoke] " + error + "\n" + pushPokeError);
                                            message.reply(pushPokeError);
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
                                            let pushPokeError = "Error while converting Pokemon into summary message.";
                                            logger.error("[listpoke] " + error + "\n" + pushPokeError);
                                            message.reply(pushPokeError);
                                        }));
                                }
                            } else { // if you're here, they didn't request any filters
                                // push the promise of fetching the user to the outside promise array
                                promises.push(client.fetchUser(pokemon.discordID)
                                    .then(function (response) {
                                        // create the pokestring and add it to the array
                                        pokeArray.push(getPokeString(pokemon));
                                    })
                                    .catch(error => {
                                        // if you're here, there was an issue pushing the pokemon into the list
                                        let pushPokeError = "Error while converting Pokemon into summary message.";
                                        logger.error("[listpoke] " + error + "\n" + pushPokeError);
                                        message.reply(pushPokeError);
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
                                    description: `Navigate to other pages using reactions at bottom of embed.`,
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
                        message.author.send("Here are the Pokemon you can view." +
                            "\n\nYou can also view them on the site at http://34.226.119.6:7000/\n\n" +
                            userCreator + " = Created by you\n" +
                            otherCreator + " = Created by someone else\n(p) = Private (only visible to you)");
                        pokeEmbedPages.forEach(pokePage => {
                            message.author.send(pokePage);
                        });
                        logger.info("[listpoke] Sent all pages to user");

                        // once all pokemon have been yoinked, print em as a list
                        //console.log(`String: ${printString}`);
                        //message.author.send(printString);
                        message.channel.send("I've DM'd you the list!");
                    })
                    .catch(error => {
                        // if you're here, there was an error while attempting to resolve the Big Promise
                        let errorMessage = "Error while attempting to create promises."
                        message.reply(errorMessage);
                        logger.info("[listpoke] " + errorMessage + "\n" + error);
                    });

            });

        }
    } catch (err) {
        // if you're here, there was a broad error that wasn't caught by the other stuff!
        let broadErrMessage = "Error while attempting to execute the listpoke command.";
        logger.info("[listpoke] " + broadErrMessage + "\n" + err);
        message.reply(broadErrMessage);
    }
};
