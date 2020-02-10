module.exports.run = (client, connection, P, message, args) => {
    let importPoke = new Pokemon();

    if(args[0] === "help") message.reply('Pokemon importer. Paste a pokemon showdown export string. DO NOT FORGET ANY FIELDS. DOES NOT HANDLE ALL VARIATIONS').catch(console.error);
    else console.log(message.content.substr("+pokeimport ".length, message.content.length - "+pokeimport ".length));
    //importPoke.importPokemon(message.content.substr("+pokeimport ".length, message.content.length - "+pokeimport ".length));
};