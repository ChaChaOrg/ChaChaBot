const logger = require('../logs/logger.js');
// Calculates a Pokemon Ranger's DC to loop/catch a Pokemon is, given its dex and catch rate.

exports.run = (client, connection, P, message, args) => {

    //The Pokemon's name
    let name = args[0];

    // help message
    let helpMessage = "Pokemon Ranger Catch/Loop calculator.\n\n**Manual Entry:** +ranger [DexMod]" +
        " [CatchRate]\n**Bot-calculated Entry:** +ranger [PokeName (Must be in the bot)]";

    //check if asking for help
    if (args[0].includes('help')) {
        logger.info("[ranger] Sending help message.")
        message.reply(helpMessage).catch(console.error);
        return;
    }

    // check if asking for manual (2 args)

    if (args.length === 2) {
        //the Pokemon's dex mod
        let dexmod = parseFloat(args[0]);
        //the Pokemon's catch rate
        let catchrate = parseFloat(args[1]);

        //calculate the catch DC
        let catchDC = Math.round((.15 * (255 - catchrate) + 1.55) + dexmod);

        //calculate loop DC
        let loopDC = (10 + dexmod);

        //print results

        let finalMessage = `The DC to catch this Pokemon is **${catchDC}**. The DC to put a loop around it is **${loopDC}**.\
    \n\nDon't forget, a Nat 1 is an auto-fail, and a Nat 20 is an auto-success.`

        logger.info("[ranger] " + finalMessage);
        message.reply(finalMessage);

        return;

    }

    // if there's only one arg and it's not help, the user is trying to to find pokemon in the bot

    let Pokemon = require(`../models/pokemon`);
    let tempPoke = new Pokemon;

    let sql = `SELECT * FROM pokemon WHERE name = '${name}';`;
    logger.info(`[showpoke] SQL query: ${sql}`);

    let notFoundMessage = name + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `+listpoke` to view the Pokemon you can edit.)";

    //console.log(sql);
    connection.query(sql, function (err, response) {
        if (err) throw err;

        if (response.length === 0) {
            let pokeNotFoundMessage = "Pokemon not found in database. Please check your spelling, or the Pokemon may" +
                " not be there.";
            logger.info("[showpoke] " + pokeNotFoundMessage);
            message.reply(pokeNotFoundMessage);
        }
        else {
            // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
            if (response[0].private > 0 && message.author.id !== response[0].discordID) {
                logger.info("[modpoke] Detected user attempting to edit private Pokemon that isn't their own.")
                // If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
                message.reply(notFoundMessage);
                return;
            }

            tempPoke.loadFromSQL(connection, P, response[0])
                .then(response => {

                    // if you're here, the pokemon has been found! Use this to calculate DCs & return

                    logger.info("[ranger] Calculating DCs for Ranger Capture & Loop");

                    //the Pokemon's dex mod
                    let dexmod = parseInt(tempPoke.statBlock.dexMod);
                    //the Pokemon's catch rate
                    let catchrate = tempPoke.speciesData.capture_rate;

                    //if there is no catch rate found it's a custom form, so try to pull from there
                    if (catchrate === undefined) {
                        //TODO look up catch rate for custom pokemon in pokeForms; remove text swap when done
                        catchrate = "Unknown (Custom Pokemon)";
                    }

                    //calculate the catch DC
                    let catchDC = Math.round((.15 * (255 - catchrate) + 1.55) + dexmod);
                    if (isNaN(catchDC)) { //TODO remove this when previous note is fixed
                        catchDC = "Unknown";
                    }

                    //calculate loop DC
                    let loopDC = (10 + dexmod);

                    //print results

                    var finalData = `The DC to catch ${name} is **${catchDC}**. The DC to put a loop around ${name} is **${loopDC}**.
                    \n\`Catch Rate: ${catchrate} // Dex Mod: ${dexmod} \`
                    \nDon't forget, a Nat 1 is an auto-fail, and a Nat 20 is an auto-success.`;

                    logger.info("[ranger] " + finalData)
                    message.reply(finalData);

                });
        }
    });


}