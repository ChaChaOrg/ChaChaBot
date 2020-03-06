

module.exports.run = (client, connection, P, message, args) => {
    let Pokemon = require('../models/pokemon.js');
    let importPoke = new Pokemon();

    let importContent = message.content.substr("+pokeimport ".length, message.content.length - "+pokeimport ".length);

    if(args[0] === "help") {
        message.reply('Pokemon importer. Paste a pokemon showdown export string. DO NOT FORGET ANY FIELDS. DOES NOT HANDLE ALL VARIATIONS').catch(console.error);
        return;
    }
    console.log(importContent);
    importPoke.importPokemon(connection, P, importContent)
        .then(response =>{
            message.channel.send(importPoke.sendSummaryMessage(client));
            importPoke.uploadPokemon(connection, message);
        });
};