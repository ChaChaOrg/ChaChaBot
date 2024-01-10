const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../logs/logger.js');
// Calculates a Pokemon Ranger's DC to loop/catch a Pokemon is, given its dex and catch rate.

//Help Message
const HELP_MESSAGE = "Pokemon Ranger Catch/Loop Calculator. Variables Required:\n "
    + "[DexMod] [CatchRate]\n"
    + "Or:\n"
    + "[Pokemon Name]"

//Build slash command
module.exports.data = new SlashCommandBuilder()
    .setName('ranger')
    .setDescription('Pokemon Ranger Catch/Loop Calculator')
    //Subcommand to calculate based on dexmod + catch rate
    .addSubcommand(subcommand =>
        subcommand
            .setName('manual')
            .setDescription('Calculates based on DexMod and CatchRate')
            .addIntegerOption(option => 
                option.setName('dexmod')
                .setDescription('Dexterity Modifier of the Pokemon being caught')
                .setRequired(true))
            .addIntegerOption(option => 
                option.setName('capture-rate')
                .setDescription('Capture Rate of the Pokemon being caught')
                .setRequired(true)))
    //Subcommand to pull dexmod + catch rate from Pokemon in bot
    .addSubcommand(subcommand =>
        subcommand
            .setName('automatic')
            .setDescription('Calculates based on a Pokemon')
            .addStringOption(option => 
                option.setName('pokemon-name')
                .setDescription('Name of the Pokemon to calculate DC for')
                .setRequired(true)
                .setAutocomplete(true)));

module.exports.autocomplete = async (interaction) => {
    const focusedValue = interaction.options.getFocused(true);
    var choices = interaction.client.pokemonCache;
    const filtered = choices.filter(choice => (!choice.private || (choice.discordID == interaction.user)) && choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
    await interaction.respond(
        filtered.map(choice => ({ name: choice.name, value: choice.name })),
    )
}

//Interaction to generate response
module.exports.run = async (interaction) => {
        //If the dexmod and rate have been given, calculate manually
        if (interaction.options.getSubcommand() === 'manual') {
            let dexmod = interaction.options.getInteger('dexmod');
            let rate = interaction.options.getInteger('capture-rate');

            //Calculcate Catch DC
            let catchDC = Math.round((.15 * (255 - rate) + 1.55) + dexmod);

            //Calculcate Loop DC
            let loopDC = (10 + dexmod);

            //Print results
            var finalData = `The catch DC is **${catchDC}**. The DC to put a loop around this Pokemon is **${loopDC}**.
                                \n\`Catch Rate: ${rate} // Dex Mod: ${dexmod} \`
                                \nDon't forget, a Nat 1 is an auto-fail, and a Nat 20 is an auto-success.`;

            logger.info("[ranger] " + finalData)
            interaction.reply(finalData);
        
        //If Pokemon has been given, calculate automatically
        } else if (interaction.options.getSubcommand() === 'automatic') {
            let pokeName = interaction.options.getString('pokemon-name');       
            let Pokemon = require(`../models/pokemon`);
            let tempPoke = new Pokemon;

            let sql = `SELECT * FROM pokemon WHERE name = '${pokeName}';`;
            logger.info(`[ranger] SQL query: ${sql}`);

             let notFoundMessage = pokeName + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `/listpoke` to view the Pokemon you can edit.)";

                //console.log(sql);
                interaction.client.mysqlConnection.query(sql, function (err, response) {
                    if (err) throw err;

                    if (response.length === 0) {
                        let pokeNotFoundMessage = "Pokemon not found in database. Please check your spelling, or the Pokemon may" +
                            " not be there.";
                        logger.info("[showpoke] " + pokeNotFoundMessage);
                        interaction.reply(pokeNotFoundMessage);
                    }
                    else {
                        // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
                        if (response[0].private > 0 && interaction.user.id !== response[0].discordID) {
                            logger.info("[modpoke] Detected user attempting to access private Pokemon.")
                            // If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
                            interaction.reply(notFoundMessage);
                            return;
                        }

                        tempPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0])
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

                                var finalData = `The DC to catch ${pokeName} is **${catchDC}**. The DC to put a loop around ${pokeName} is **${loopDC}**.
                                \n\`Catch Rate: ${catchrate} // Dex Mod: ${dexmod} \`
                                \nDon't forget, a Nat 1 is an auto-fail, and a Nat 20 is an auto-success.`;

                                logger.info("[ranger] " + finalData)
                                interaction.reply(finalData);

                            });
                   }
             });
        }
};