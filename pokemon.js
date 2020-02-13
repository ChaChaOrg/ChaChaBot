const GENDER_MAX = 8;

const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;
const SHINY_CHANCE = 4096;

let Nature = require('./nature.js');
let Moveset = require('./moveset.js');
let Statblock = require('./statblock.js');


module.exports = Pokemon;

function Ability(name, ha)
{
    this.name = name;
    this.hiddenAbility = ha;
}


// ======================= POKEMON OBJECT =======================
function Pokemon(tempSpecies, tempLevel, tempName) {

    // ======================= VARIABLES =======================

    this.name = tempName;
    this.species = tempSpecies;
    //level
    this.level = tempLevel;
    //type(s)
    this.type1 = "";
    this.type2 = "";

    this.ability = new Ability("", false);

    //Pokemon's Statblock
    this.statBlock = new Statblock();

    //hidden ability percentile
    this.haChance = 1;

    this.moveSet = new Moveset.MoveSet();

    this.originalTrainer = "";

    let date = new Date();
    this.dateCreated = date.toISOString().slice(0, 19).replace('T', ' ');

    this.nature = new Nature();

}

Pokemon.prototype.init = function(P, message) {
    return new Promise(function (resolve, reject) {
        P.getPokemonSpeciesByName(this.species)
            .then(function (response) {
                this.speciesData = response;
                console.log(this.speciesData);
                P.getPokemonByName(this.speciesData.id)
                    .then(function (response) {
                        console.log("Retrieved Pokemon and Species Data!");

                        this.pokemonData = response;

                        console.log("Reading Type(s)");
                        this.assignTypes();

                        console.log("Assigning Gender");
                        this.assignRandGender();

                        console.log("Assigning Ability");
                        this.genRandAbility();

                        console.log("Assigning IVs");
                        this.statBlock.assignRandIVs();

                        console.log("Assigning Nature");
                        this.nature.assignRandNature(this);

                        console.log("assigning shiny");
                        this.assignShiny();

                        console.log("Reading Base Stats");

                        let i = 1;
                        this.pokemonData["stats"].forEach(element => {
                            this.statBlock.baseStats[STAT_ARRAY_MAX - i] = element["base_stat"];
                            i++;
                        });

                        console.log("Calculating Stats");

                        this.statBlock.calculateStats(this);
                        this.statBlock.calculateSaves([this.type1, this.type2]);
                        
                        console.log("Pokemon Complete!");
                        resolve("done");
                    }.bind(this))
                    .catch(function (error) {
                        console.log("Error when retrieving pokemon species Data :C  ERROR: ", error);
                        //message.channel.send("Error when retrieving pokemon species Data :C  ERROR: ");
                    })
            }.bind(this))
            .catch(function (error) {
                console.log("Error when retrieving pokemon Data :C  ERROR: ", error);
                //message.channel.send("Error when retrieving pokemon Data :C");
            });
    }.bind(this));
};

// ========================= MISC VAL GENERATORS =========================
//modifier generator
let modPrint = function (abilityScore) {
    let mainScore = abilityScore;
    let rawMod = modGen(abilityScore);
    let modString;

    rawMod = rawMod.toFixed(0);

    if (rawMod > 0) {
        modString = "+" + rawMod.toString();
    } else {
        modString = rawMod.toString();
    }
    return modString;
};

let modGen = function (abilityScore) {
    return Math.floor((abilityScore - 10)/2);
};

// grab + stow types
Pokemon.prototype.assignTypes = function() {
    this.type1 = this.pokemonData.types[0].type.name;
    if(this.pokemonData.types.length === 2) {
        this.type2 = this.pokemonData.types[1].type.name;
    }
};

Pokemon.prototype.genRandAbility = function() {

    let abilityTotal = 0;
    let abilityList = [];
    this.pokemonData.abilities.forEach(element => {
        abilityList.push(new Ability(element["ability"]["name"], element["is_hidden"]));
        abilityTotal++;
    } );

    this.ability = abilityList[Math.floor((Math.random()*abilityList.length))];

    /*
    if (Math.floor((Math.random() * 100) + 1) <= haChance) {
        this.ability = abilityNum;
    } else {
        if (abilityNum === 2) {
            this.ability = 1;
        } else {
            this.ability = Math.floor((Math.random()) + 1);
        }
    }
    */
};
//Assign gender
Pokemon.prototype.assignRandGender = function() {
    //assign gender
    let gender = "genderless";
    //Calculates Gender as a fraction of 8
    const genderNum = Math.floor((Math.random() * GENDER_MAX) + 1);
    if (this.speciesData.gender_rate <= -1) return gender;
    else if (genderNum <= this.speciesData.gender_rate) {
           gender = "female";
    }
    else gender = "male";

     this.gender = gender;
};

//shiny generator!
Pokemon.prototype.assignShiny = function() {
    this.shiny = (Math.floor((Math.random() * SHINY_CHANCE) + 1)) >= SHINY_CHANCE;
};

// captialize words

let capitalizeWord = function (tempWord)
{
    return tempWord.charAt(0). toUpperCase() + tempWord.substr(1);
};

// =========== EMBED ===========

Pokemon.prototype.sendSummaryMessage = function(client) {

    let tempAbility = this.ability.name;
    if( ~tempAbility.indexOf("-"))
    {
        let tempA = tempAbility.slice(0,tempAbility.indexOf("-"));
        let tempB = tempAbility.slice(tempAbility.indexOf("-") + 1, tempAbility.length);
        tempA = capitalizeWord(tempA);
        tempB = capitalizeWord(tempB);
        tempAbility = tempA + " " + tempB;
    }
    else tempAbility = capitalizeWord(tempAbility);
    let tempSpecies = this.species;
    tempSpecies = capitalizeWord(tempSpecies);


    return {embed: {
            color: 3447003,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            title: `Level ${this.level} ${tempSpecies} ~ ${this.name}`,
            url: `https://bulbapedia.bulbagarden.net/wiki/${this.species}_(Pok%C3%A9mon)`,
            thumbnail: {
                url:  `${this.pokemonData.sprites.front_default}`,
            },
            description: "Click the link for the Bulbapedia page, or use !data to call info using the Pokedex bot.",

            fields: [
                {
                    name: "Basic Info",
                    value: `**Ability:** ${tempAbility} | **Gender:** ${this.gender} | **Nature: ** ${this.nature.natureFinal} | **Shiny: ** ${this.shiny}\n=================`
                },
                {
                    name: "HP",
                    value: `**IV: ** ${this.statBlock.ivStats[0]} | **Final: ** ${this.statBlock.finalStats[0]}\n=================`
                },
                {
                    name: "Attack",
                    value: `**IV: ** ${this.statBlock.ivStats[1]} | **Final: ** ${this.statBlock.finalStats[1]}\n=================`
                },
                {
                    name: "Defense",
                    value: `**IV: ** ${this.statBlock.ivStats[2]} | **Final: ** ${this.statBlock.finalStats[2]}\n=================`
                },
                {
                    name: "Special Attack",
                    value: `**IV: ** ${this.statBlock.ivStats[3]} | **Final: ** ${this.statBlock.finalStats[3]}\n=================`
                },
                {
                    name: "Special Defense",
                    value: `**IV: ** ${this.statBlock.ivStats[4]} | **Final: ** ${this.statBlock.finalStats[4]}\n=================`
                },
                {
                    name: "Speed",
                    value: `**IV: ** ${this.statBlock.ivStats[5]} | **Final: ** ${this.statBlock.finalStats[5]}\n=================`
                },
                {
                    name: "Ability Scores",
                    value: `**STR: ** ${this.statBlock.strBase.toFixed(0)}(${this.statBlock.strMod}) | **DEX: ** ${this.statBlock.dexBase.toFixed(0)}(${this.statBlock.dexMod}) | **CON: ** ${this.statBlock.conBase.toFixed()}(${this.statBlock.conMod})\n**INT: ** ${this.statBlock.intBase.toFixed(0)}(${this.statBlock.intMod}) | **WIS: ** ${this.statBlock.wisBase.toFixed(0)}(${this.statBlock.wisMod}) | **CHA: ** :3c`
                },
                {
                    name: "Saving Throws",
                    value: `**FORT: ** ${this.statBlock.fortSave} | **REF: ** ${this.statBlock.refSave} | **WILL: ** ${this.statBlock.willSave}`
                },
                {
                    name: "AC & Move Speed",
                    value: `**AC: ** ${this.statBlock.armorClass} | **Move Speed: ** ${this.statBlock.moveSpeed} ft`
                },
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "Chambers and Charizard!"
            }
        }
    };
};

Pokemon.prototype.uploadPokemon = function(connection, message) {

    message.channel.send("Debug: " + message.author.id + "\n" + message.author.username);

    let sql =
        'INSERT INTO pokemon (name, species, level, nature, gender, ability, type1, type2, shiny, ' +
        `hp, atk, def, spa, spd, spe, ` +
        `hpIV, atkIV, defIV, spaIV, spdIV, speIV, ` +
        `hpEV, atkEV, defEV, spaEV, spdEV, speEV, ` +
        `move1, move2, move3, move4, move5, moveProgress, ` +
        `originalTrainer, userID, dateCreated) ` +
        `VALUES ("${this.name}", "${this.species}", ${this.level}, "${this.nature.natureFinal}", "${this.gender}", "${this.ability.name}", "${this.type1}", "${this.type2}", ${this.shiny}, ` +
        `${this.statBlock.finalStats[HP_ARRAY_INDEX]}, ${this.statBlock.finalStats[ATK_ARRAY_INDEX]}, ${this.statBlock.finalStats[DEF_ARRAY_INDEX]}, ` +
        `${this.statBlock.finalStats[SPA_ARRAY_INDEX]}, ${this.statBlock.finalStats[SPD_ARRAY_INDEX]}, ${this.statBlock.finalStats[SPE_ARRAY_INDEX]}, ` +
        `${this.statBlock.ivStats[HP_ARRAY_INDEX]}, ${this.statBlock.ivStats[ATK_ARRAY_INDEX]}, ${this.statBlock.ivStats[DEF_ARRAY_INDEX]}, ` +
        `${this.statBlock.ivStats[SPA_ARRAY_INDEX]}, ${this.statBlock.ivStats[SPD_ARRAY_INDEX]}, ${this.statBlock.ivStats[SPE_ARRAY_INDEX]}, ` +
        `${this.statBlock.evStats[HP_ARRAY_INDEX]}, ${this.statBlock.evStats[ATK_ARRAY_INDEX]}, ${this.statBlock.evStats[DEF_ARRAY_INDEX]}, ` +
        `${this.statBlock.evStats[SPA_ARRAY_INDEX]}, ${this.statBlock.evStats[SPD_ARRAY_INDEX]}, ${this.statBlock.evStats[SPE_ARRAY_INDEX]}, ` +
        `"${this.moveSet.move1.name}", "${this.moveSet.move2.name}", "${this.moveSet.move3.name}", "${this.moveSet.move4.name}", "${this.moveSet.move5.name}", ${this.moveSet.moveProgress}, ` +
        `"${this.originalTrainer}", ${message.author.id}, '${this.dateCreated}');`;

    console.log(sql);
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
};

Pokemon.prototype.importPokemon = function(connection, P, importString) {
    //splits the message into lines then splits the lines into words separated by spaces.
    let lines = importString.split("/n");
    let nameLineVals = lines[0].split(" ");
    let evLineVals;
    let natureLineVals;
    let ivLineVals;

    let hasNickname = false;
    let hasGender = false;

    let nameArgs = [];

    //
    //Interprets the name line
    //
    this.name = nameLineVals[0]; //First word is always the name or the species;
    nameLineVals.forEach(element => {
        if(element.charAt(0) === "(") {
            nameArgs.push(element.substr(1, element.length - 2));
        }
    });

    //If there's two options, the first is the species and the second is the gender
    if (nameArgs.length === 2){
        this.species = nameArgs[0];
        this.gender = nameArgs[1];
    }
    else if (nameArgs.length === 1){
        //If there's just one option, check if pokemon name or if it is the pokemon's gender
        if (nameArgs[0] === "M" || nameArgs[0] === "F") {
            this.species = nameLineVals[0];
            if (nameArgs[0] === "M") {this.gender = "male";} else this.gender ="female";
        }
    }
    else if (nameArgs.length === 0) {
        this.species = nameLineVals[0];
    }

    lines.forEach(element => {
        switch (element.split(" ")) {
            case ("Ability:"): {
                //Grabs ability
                this.ability = element.substr(8, element.length - 8).toLowerCase().replace(" ", "-");
                break;
            }
            case("Level:"): {
                this.level = element.substr(7, element.length - 7);
                break;
            }
            case("EVs:"): {
                evLineVals = element.split(" ");
                evLineVals.forEach(function (evElement, i) {
                    let j = -1;
                    switch (evElement) {
                        case ("Atk"):
                            j = ATK_ARRAY_INDEX;
                        case ("Def"):
                            j = DEF_ARRAY_INDEX;
                        case ("SpD"):
                            j = SPD_ARRAY_INDEX;
                        case ("SpA"):
                            j = SPA_ARRAY_INDEX;
                        case ("Spe"):
                            j = SPE_ARRAY_INDEX;
                        case ("HP"):
                            j = HP_ARRAY_INDEX;
                    }
                    if (j >= 0) this.evStats[ATK_ARRAY_INDEX] = evLineVals[i - 1];
                });
                break;
            }
            case("IVs:"): {
                ivLineVals = element.split(" ");
                ivLineVals.forEach(function (ivElement, i) {
                    let j = -1;
                    switch (ivElement) {
                        case ("Atk"):
                            j = ATK_ARRAY_INDEX;
                            break;
                        case ("Def"):
                            j = DEF_ARRAY_INDEX;
                            break;
                        case ("SpD"):
                            j = SPD_ARRAY_INDEX;
                            break;
                        case ("SpA"):
                            j = SPA_ARRAY_INDEX;
                            break;
                        case ("Spe"):
                            j = SPE_ARRAY_INDEX;
                            break;
                        case ("HP"):
                            j = HP_ARRAY_INDEX;
                            break;
                    }
                    if (j >= 0) this.statBlock.ivStats[ATK_ARRAY_INDEX] = evLineVals[i - 1];
                });
                break;
            }
            case "Hardy":
            case "Lonely":
            case "Adamant":
            case "Naughty":
            case "Brave":
            case "Bold":
            case "Docile":
            case "Impish":
            case "Lax":
            case "Relaxed" :
            case "Modest":
            case "Mild":
            case "Bashful":
            case "Rash":
            case "Quiet" :
            case "Calm":
            case "Gentle":
            case "Careful":
            case "Quirky":
            case "Sassy" :
            case "Timid":
            case "Hasty":
            case "Jolly":
            case "Naive":
            case "Serious":
                {
                    natureLineVals = element.split(" ");
                    this.nature.assignNature(this, natureLineVals[0]);
                    break;
                }
        }


    })


};

Pokemon.prototype.loadFromSQL = function (P, sqlObject) {
    return new Promise(function (resolve, reject) {
        P.getPokemonSpeciesByName(sqlObject.species)
            .then(function (response) {
                this.speciesData = response;
                P.getPokemonByName(this.speciesData.id)
                    .then(function (response) {
                        this.pokemonData = response;

                        //type(s)
                        this.type1 = sqlObject.type1;
                        this.type2 = sqlObject.type2;

                        this.gender = sqlObject.gender;
                        this.ability.name = sqlObject.ability;


                        this.name = sqlObject.name;
                        this.species = sqlObject.species;
                        //level
                        this.level = sqlObject.level;

                        this.statBlock.evStats = [sqlObject.hpEV, sqlObject.atkEV, sqlObject.defEV, sqlObject.spaEV, sqlObject.spdEV, sqlObject.speEV];
                        this.statBlock.ivStats = [sqlObject.hpIV, sqlObject.atkIV, sqlObject.defIV, sqlObject.spaIV, sqlObject.spdIV, sqlObject.speIV];

                        this.moveSet.move1 = sqlObject.move1;
                        this.moveSet.move2 = sqlObject.move2;
                        this.moveSet.move3 = sqlObject.move3;
                        this.moveSet.move4 = sqlObject.move4;
                        this.moveSet.move5 = sqlObject.move5;
                        this.moveSet.moveProgress = sqlObject.moveProgress;

                        this.originalTrainer = sqlObject.originalTrainer;

                        this.nature.assignNature(this, sqlObject.nature);

                        this.shiny = sqlObject.shiny;

                        let i = 1;
                        this.pokemonData["stats"].forEach(element => {
                            this.statBlock.baseStats[STAT_ARRAY_MAX - i] = element["base_stat"];
                            i++;
                        });

                        console.log("Calculating Stats");

                        this.statBlock.calculateStats(this);
                        this.statBlock.calculateSaves(this);

                        this.statBlock.finalStats[HP_ARRAY_INDEX] = sqlObject.hp;
                        this.statBlock.finalStats[ATK_ARRAY_INDEX] = sqlObject.atk;
                        this.statBlock.finalStats[DEF_ARRAY_INDEX] = sqlObject.def;
                        this.statBlock.finalStats[SPA_ARRAY_INDEX] = sqlObject.spa;
                        this.statBlock.finalStats[SPD_ARRAY_INDEX] = sqlObject.spd;
                        this.statBlock.finalStats[SPE_ARRAY_INDEX] = sqlObject.spe;

                        resolve("done");
                    }.bind(this))
                    .catch(function (error) {
                        console.log("Error when retrieving pokemon species Data :C  ERROR: ", error);
                        //message.channel.send("Error when retrieving pokemon species Data :C  ERROR: ");
                    })
            }.bind(this))
            .catch(function (error) {
                console.log("Error when retrieving pokemon Data :C  ERROR: ", error);
                //message.channel.send("Error when retrieving pokemon Data :C");
            });
    }.bind(this));




};