#Models
The objects that we split pokemon into to keep things organized.

##moveset.js
An object that holds an object for a "moveset", and an object for a "move".
Not fully implemented, but used in neodamage.
####move.createFromName(moveName, P)
Makes a new move object just from a name. Grabs info from pokeApi.

##nature.js
An object that handles functions relating with natures for a pokemon object.
- ####calculateNatureStats(pokemon)
Adds the stat modifier to the given pokemon for this object's nature.
This function is called from within a pokemon object. For simplicity it accepts the pokemon to assign the relevant stats to. Kinda messy so this should probably be refactored back into the Pokemon object.
- ####assignNature(pokemon, nature)
 Given a nature, sets the nature object's nature to that nature it then calculates the pokemon's Stats with that nature. Will be refactored when calculateNatureStats is moved. 
- ####assignRandomNature(pokemon)
 Does the same as above, but randomized.

##statblock.js
Holds all the stats and relevant functions for those stats for a pokemon.
HP, ATK, DEF, SPA, SPD, SPE are included in this.
- ####assignRandIVs() 
Assigns all random IVs to this statblock.
- ####calculateSaves(pokemon) 
Assigns the dnd saves for this statblock. Takes in the pokemon to grab the types correctly.
- ####calculateStats(pokemon) 
Actually runs through and calculates the stats given a pokemon.
At this point the IVs and EVs have been handled already.
Rolls HP seperately from the rest of the calculated stats becuase of how ChaCha works.

All other stats should end up exactly the same given a set of base stats and IVs and EVs.
Should probably refactor statblock to contain the pokemon's level so we don't have to pass the pokemon into it
- ####assignBaseStats(pokemon) 
assigns the the base stats of a pokemon from the api call.
simple forEach loop.
Can probably be refactored into constructor now that I think about it.
##pokemon.js
Our generic pokemon object that does a lot of the legwork when organizing and handling a pokemon.
Should contain all of the information to describe any pokemon.
Its on my list to build this into a nodemodule that can be interchanged between this and a webapp (I just have to learn how to do that at some point)
- ####init(p) 
The second step to initializing a pokemon, where it actually makes api calls and any DB queries. This is nesecary because you can't have your constructor return a promise. Runs through and calls all the other functions that create a pokemon.
- ####assignTypes() 
Simply checks to see if the pokemon has one or two types then assigns those types.
- ####genRandAbility() 
Searches through a pokemon's abilities then randomly assigns one from the list. This is based off of the hiddenability chance that is assigned earlier.
- ####assignRandGender() 
assigns a random gender based off of the pokemon species gender ratio.
gender rate is a number from -1-8 that tells us out of 8 given pokemon of that species how many would be female typically. -1 represents a genderless species.
- ####assignShiny() 
rolls for if a pokemon is shiny.
- ####sendSummaryMessage(client) 
Generates a discord embed that displays a summary of this pokemon.
currently requires client for discord formatting, this is one of the few places that is discord specific and will likely be cleaned up somehow.
- ####uploadPokemon(connection, message) 
Generates a mySQL query that uploads this pokemon object as a new entry into the pokemon table.
- ####updatePokemon(connection,message) 
Generates a mySQL query that updates this pokemon onto a pokemon with the same name. Will likely change this to based off a pokemon's unique ID which requires more work in modpoke.js
- ####importPokemon(connection, P, importString) 
Takes in a string formatted like the Pokemon Showdown import/export stings and assigns all the relevant info into this pokemon object. Used primarily in importpoke.js for easy pokemon creation.
many for loops that parse this text. Is not very Robust currently ands small mistakes in the string can cause problems.
Ends by running the relevant pokemon generation functions to recalculate all stats with the imported data in mind.
- ####getPokemonAndSpeciesData(P) 
A function that wraps the two most common pokeAPI calls into one function and returns a promise that resolves when both datasets have been assigned.
- ####loadFromSQL (P, sqlObject) 
Generates a brand new pokemon given the object from a mySQL query. This allows for quick generation from one function call after a query.