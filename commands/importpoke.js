module.exports.run = (client, connection, P, message, args) => {
    let importPoke = new Pokemon();
    console.log(message.content.substr("+pokeimport ".length, message.content.length - "+pokeimport ".length));
    //importPoke.importPokemon(message.content.substr("+pokeimport ".length, message.content.length - "+pokeimport ".length));
};