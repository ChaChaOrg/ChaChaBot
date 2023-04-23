let logger = require("../logs/logger.js");
const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;

module.exports.data = new SlashCommandBuilder()
	.setName('movetutor')
	.setDescription("'Creates a copy of a pokemon in the bot. Just give the command the pokemon's name.")
	.addStringOption(option =>
		option.setName('name')
		.setDescription("Pokemon you're copying")
		.setRequired(true)
        );


module.exports.run = async (interaction) => {
	try {
        /*if (args[0] === "help") {
            logger.info("[clonepoke] Displaying help interaction.");
            interaction.reply("Creates a copy of a pokemon in the bot. Just give the command the pokemon's name.");
        */
        
            let name = interaction.getStringOption();
            logger.info("[clonepoke] Searching database for " + name);
            let Pokemon = require("../models/pokemon");
            let basePoke = new Pokemon();
            let clonePoke = new Pokemon();
            let sql = `SELECT * FROM pokemon WHERE name = '${name}';`;
            logger.info(`[showpoke] SQL query: ${sql}`);

            connection.query(sql, function (err, response) {

                if (err) throw err;

                if (response.length == 0) {
                    logger.info("[clonepoke] " + name + " not found.");
                    interaction.reply("Your pokemon wasn't found. Can't clone something that isn't there.");
                } else {
                    logger.info("[clonepoke] Pokemon found.");
                    let cloneName = name + "Clone";
                    let iterations = 0;
                    let foundClone = true;
                    logger.info("[clonepoke] Checking for other clones.");
                    //while (foundClone) {
                     //   let clonesql = `SELECT * FROM pokemon WHERE name = '${name + iterations}';`;
                     //   connection.query(clonesql, function (err, response) {
                      //      if (err) throw err;

                       //     if (response.length == 0) {
                       //         foundClone = false;
                       //     } else {
                        //        iterations++;
                          //  }
                        //});
                   // }                    
                    
                    interaction.reply("Extracting " + name + "'s DNA sequence....");
                    basePoke.loadFromSQL(P, response[0]).then(response => {

                        let clonesql = `SELECT * FROM pokemon WHERE name LIKE '${cloneName}%';`;
                        connection.query(clonesql, function (err, response) {
                            iterations = response.length + 1;
                            console.log("Clone Count: " + iterations);
                            if (iterations >= 2) {
                                cloneName += iterations;
                                console.log("Clone's name: " + cloneName);
                            }

                            let nameLine = "";
                            let ability = "Ability: ";
                            let level = "Level: ";
                            let evs = "EVs: ";
                            let nature = "";
                            let ivs = "IVs: ";
                            let importString = "";

                            nameLine += cloneName + " (" + basePoke.species + ") (" + basePoke.gender + ")\n";
                            ability += basePoke.ability + "\n";
                            level += basePoke.level + "\n";

                            evs += basePoke.statBlock.evStats[HP_ARRAY_INDEX] + " HP / " + basePoke.statBlock.evStats[ATK_ARRAY_INDEX] + " Atk / " +
                                basePoke.statBlock.evStats[DEF_ARRAY_INDEX] + " Def / " + basePoke.statBlock.evStats[SPA_ARRAY_INDEX] + " SpA / " +
                                basePoke.statBlock.evStats[SPD_ARRAY_INDEX] + " SpD / " + basePoke.statBlock.evStats[SPE_ARRAY_INDEX] + " Spe\n";

                            nature += basePoke.nature.natureFinal + "\n";

                            ivs += basePoke.statBlock.ivStats[HP_ARRAY_INDEX] + " HP / " + basePoke.statBlock.ivStats[ATK_ARRAY_INDEX] + " Atk / " +
                                basePoke.statBlock.ivStats[DEF_ARRAY_INDEX] + " Def / " + basePoke.statBlock.ivStats[SPA_ARRAY_INDEX] + " SpA / " +
                                basePoke.statBlock.ivStats[SPD_ARRAY_INDEX] + " SpD / " + basePoke.statBlock.ivStats[SPE_ARRAY_INDEX] + " Spe\n";

                            importString += nameLine + ability + level + evs + nature + ivs;
                            //interaction.reply("DNA sequencing complete.");
                            //interaction.reply("Beginning incubation procedure....");
                            logger.info("[clonepoke] Importing clone.");
                            clonePoke.importPokemon(connection, P, importString).then(response => {
                                clonePoke.uploadPokemon(connection, message);
                            });
                            //interaction.reply("We tried to create a perfect copy of your pokemon.....");
                            //interaction.reply("We suceeded.");
                            interaction.reply("Cloning procedure complete. Use +showpoke " + cloneName + " to view your new old friend.");
                            logger.info("[clonepoke] Cloning completed.");
                        });

                        
                    });

                }
            });
        }
    catch (error) {
        logger.error("[clonepoke] Error: " + error.toString());
        interaction.channel.send(error.toString());
        interaction.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
    
}