

module.exports.run = (client, connection, P, message, args) => {
    let Pokemon = require('../models/pokemon.js');
    let importPoke = new Pokemon();

    let importContent = message.content.substr("+pokeimport ".length, message.content.length - "+pokeimport ".length);

    if(args[0] === "help") {
        message.reply('Pokemon importer. Paste showdown export string or fill in as follows.\nNote that you can omit individual EVs or the entire EV line if they all equal 0.\nReplace any instances of [] with the desired Pokemon\'s info (without the brackets themselves), and make sure that each piece of info is on its own line.\n' +
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
    console.log(importContent);
    importPoke.importPokemon(connection, P, importContent)
        .then(response => {
            message.channel.send(importPoke.sendSummaryMessage(client));
            importPoke.uploadPokemon(connection, message);
        });
};