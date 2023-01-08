const logger = require('../logs/logger.js');

module.exports.run = (interaction) => {
    let Pokemon = require('../models/pokemon.js');
    let importPoke = new Pokemon();

    let importContent = interaction.content.substr("+pokeimport ".length, interaction.content.length - "+pokeimport ".length);

    if (args.length == 0 || args[0] === "help") {
        logger.info("[importpoke] Sending help interaction.")
        interaction.reply('Pokemon importer. Paste showdown export string or fill in as follows.\nNote that you can omit individual EVs or the entire EV line if they all equal 0.\nReplace any instances of [] with the desired Pokemon\'s info (without the brackets themselves), and make sure that each piece of info is on its own line.\n' +
            '```+importpoke [Nickname] ([Species]) ([M/F/N])\n' +
            'Ability: [Ability Name]\n' +
            'Level: [Level]\n' +
            'EVs: [#] HP / [#] Atk / [#] Def / [#] SpA / [#] SpD / [#] Spe\n' +
            '[Nature] Nature\n' +
            'IVs: [#] HP / [#] Atk / [#] Def / [#] SpA / [#] SpD / [#] Spe```').catch(console.error);
        /*
        Pokemon importer. Paste showdown export string or fill in as follows. Note that you can omit individual EVs or the entire EV line if they equal 0. Replace any instances of [] with the desired Pokemon's info.
        ```+importpoke [Nickname] ([Species]) ([M/F/N])
            Ability: [Ability Name]
            Level: [Level]
            EVs: [#] HP / [#] Atk / [#] Def / [#] SpA / [#] SpD / [#] Spe
            [Nature] Nature
            IVs: [#] HP / [#] Atk / [#] Def / [#] SpA / [#] SpD / [#] Spe```
         */
        return;
    }
    logger.info("[importpoke] " + importContent);
    importPoke.importPokemon(connection, P, importContent)
        .then(response => {
            logger.info("[importpoke] Sending summary interaction.")
            interaction.channel.send(importPoke.sendSummaryMessage(client));
            importPoke.uploadPokemon(connection, message);
        });
};