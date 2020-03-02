// This is the main pokemon js. Put a better description here later maybe lol

// ==== CONSTANTS ====

//pokemon stats
const GENDER_MAX = 8;
const NATURE_ARRAY_MAX = 5;
const STAT_ARRAY_MAX = 6;
const NATURE_POSITIVE_MULIPLIER = 1.1;
const NATURE_NEGATIVE_MULTIPLIER = 0.9;
const BASE_HP = 16;
const EV_MULTIPLIER = 4;
const BASE_STAT_MULTIPLIER = 2;
const ATTACK_BST_INDEX = 1;
const SPECIALATTACK_BST_INDEX = 3;
const SPECIALDEFENSE_BST_INDEX = 4;
const SPEED_BST_INDEX = 5;
const NATURAL_ARMOUR_MULT = 0.08;
const DEFENSE_BST_INDEX = 2;
const NATURAL_ARMOUR_SHIFT = 0.6;
const AC_BASE = 10;
const DEX_AC_CALC_BASE = 10;
const DEX_AC_CALC_MULT = 2;
const STAT_CALC_MULT = 0.15;
const STAT_CALC_BASE = 1.5;
const DTEN = 10;
const FORM_DIVISOR = 20;
const FORM_SHIFT = 5;
const MOVE_SPEED_MULT = 0.38;
const MOVE_SPEED_SHIFT = 4;
const SHINY_CHANCE = 4096;
const IV_MAX = 32;
const CON_CALC_DIVISOR = 4;

// "good" saves by type
const GOOD_FORT_SAVE = ["grass", "ground", "ice", "poison", "rock", "steel"];
const GOOD_WILL_SAVE = ["bug", "fairy", "dragon", "ghost", "normal", "psychic"];
const GOOD_REFLEX_SAVE = ["dark", "electric", "fighting", "fire", "flying", "water"];

// stat array indices for the sql upload
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;

module.exports.Pokemon = Pokemon;

//TODO: add hidden ability % chance functionality
function Ability(name, ha)
{
    this.name = name;
    this.hiddenAbility = ha;
}

// TODO: assign trainer id to pokemon
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
    //stat arrays: HP, ATK, DEF, SPA, SPD, SPE
    this.baseStats = [1, 1, 1, 1, 1, 1];
    //size bonus
    this.sizeBonus = 1;
    //hidden ability percentile
    this.haChance = 1;

    // IVs
    this.ivStats = [0, 0, 0, 0, 0, 0];

    // EVs ... all naturally 0
    this.evStats = [0, 0, 0, 0, 0, 0];

    //formula for stats
    this.formStats = [0, 0, 0, 0, 0, 0];
    // nmulti, calculator stats
    this.nMultiStats = [1, 1, 1, 1, 1, 1];

    // final stats
    this.finalStats = [0, 0, 0, 0, 0, 0];

    // gender, ability, shiny
    this.gender = "";
    // the final ability chosen
    this.ability = "";
    // if the pokemon is shiny or not
    this.shiny = false;

    //nature + correlating names
    this.natureFinal = "";
    //nature names
    this.natureNames = [
        ["Hardy", "Lonely", "Adamant", "Naughty", "Brave"],
        ["Bold", "Docile", "Impish", "Lax", "Relaxed"],
        ["Modest", "Mild", "Bashful", "Rash", "Quiet"],
        ["Calm", "Gentle", "Careful", "Quirky", "Sassy"],
        ["Timid", "Hasty", "Jolly", "Naive", "Serious"]
    ];


    // DND STATS - natural armor, armor class, and move speed
    this.natArmor = 0;
    this.armorClass = 10;
    this.moveSpeed = 20;

    // DND STATS - ability scores + mods
    this.conBase = 10;
    this.conMod = 0;
    this.strBase = 0;
    this.strMod = 0;
    this.intBase = 0;
    this.intMod = 0;
    this.wisBase = 0;
    this.wisMod = 0;
    this.dexBase = 10;
    this.dexMod = 0;

    // DND STATS - saving throw bonuses
    this.fortSave = 0;
    this.willSave = 0;
    this.refSave = 0;

    this.move1 = "";
    this.move2 = "";
    this.move3 = "";
    this.move4 = "";
    this.move5 = "";
    this.moveProgress = 0;
    this.originalTrainer = "";
    this.dateCreated = 0;

}

Pokemon.prototype.init = function(P, message) {
    return new Promise(function (resolve, reject) {
        P.getPokemonByName(this.species)
            .then(function (response) {
                this.pokemonData = response;
                console.log(this.pokemonData);
                P.getPokemonSpeciesByName(this.species)
                    .then(function (response) {
                        console.log("Retrieved Pokemon and Species Data!");

                        this.speciesData = response;

                        console.log("Reading Type(s)");
                        this.assignTypes(this.speciesData);

                        console.log("Assigning Gender");
                        this.assignRandGender(this.speciesData.gender_rate);

                        console.log("Assigning Ability");
                        this.genRandAbility(this.pokemonData);

                        console.log("Assigning IVs");
                        this.assignRandIVs();

                        console.log("Assigning Nature");
                        this.assignRandNature();

                        console.log("assigning shiny");
                        this.assignShiny();

                        console.log("Reading Base Stats");

                        let i = 1;
                        this.pokemonData["stats"].forEach(element => {
                            this.baseStats[STAT_ARRAY_MAX - i] = element["base_stat"];
                            i++;
                        });

                        console.log("Calculating Stats");

                        this.calculateStats();
                        this.calculateSaves();
                        
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
    if(this.pokemonData.types.length == 2) {
        this.type2 = this.pokemonData.types[1].type.name;
    }
}

//generate random ability
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
Pokemon.prototype.assignRandGender = function(genderChance) {
    //assign gender
    let gender = "genderless";
    //Calculates Gender as a fraction of 8
    const genderNum = Math.floor((Math.random() * GENDER_MAX) + 1);
    if (genderChance <= -1) return gender;
    else if (genderNum <= genderChance) {
           gender = "female";
    }
    else gender = "male";

     this.gender = gender;
};

//shiny generator!
Pokemon.prototype.assignShiny = function() {
    this.shiny = (Math.floor((Math.random() * SHINY_CHANCE) + 1)) >= SHINY_CHANCE;
};

// ========================= STAT ARRAY GENERATOR!!! =========================

//assign IVs
Pokemon.prototype.assignRandIVs = function() {
    for (let i = 0; i < STAT_ARRAY_MAX; i++) {
        this.ivStats[i] = Math.floor((Math.random() * IV_MAX)); //assigns a value between 0 & 31 to all the IVs
    }
};

//generate nature
Pokemon.prototype.assignRandNature = function() {
//x-coord for nature
    let natureXCoord = Math.floor((Math.random() * NATURE_ARRAY_MAX)); //val between 0-4 for array
//y-coord for nature
    let natureYCoord = Math.floor((Math.random() * NATURE_ARRAY_MAX));

//assign nature to final val
    this.natureFinal = this.natureNames[natureXCoord][natureYCoord];

//update attributes based on nature
//if xcoord = ycoord, no changes, otherwise adjusting...
    if (natureXCoord !== natureYCoord) {
        for (let i = 0; i < STAT_ARRAY_MAX; i++) {
            if (natureXCoord === i) {
                this.nMultiStats[i + 1] = NATURE_POSITIVE_MULIPLIER;
            }
            if (natureYCoord === i) {
                this.nMultiStats[i + 1] = NATURE_NEGATIVE_MULTIPLIER;
            }
        }
    }
};

// calculate saving throws - RUN AFTER ABILITY SCORES ARE GENERATED
Pokemon.prototype.calculateSaves = function() {
    //temp values
    let tempTypes = [this.type1, this.type2];

    let fortTypeBonus = 0;
    let refTypeBonus = 0;
    let willTypeBonus = 0;

    //check if types match good saves for fort, ref, and will
    tempTypes.forEach(element => {
        if (element != null) {
            GOOD_FORT_SAVE.forEach (fortType => {
                if (fortType == element) {fortTypeBonus = 2;}
            });
            GOOD_REFLEX_SAVE.forEach (refType => {
                if (refType == element) {refTypeBonus = 2;}
            });
            GOOD_WILL_SAVE.forEach (willType => {
                if (willType == element) {willTypeBonus = 2;}
            });
        }
    });

    //add type/level mod and ability score mod to final save
    this.fortSave = Math.floor(.5 * this.level + fortTypeBonus) + modGen(this.conBase);
    this.refSave = Math.floor(.5 * this.level + refTypeBonus) + modGen(this.dexBase);
    this.willSave = Math.floor(.5 * this.level + willTypeBonus) + modGen(this.wisBase);

}

// calculate actual stats themselves
Pokemon.prototype.calculateStats = function() {
//get CON + hit points
//calculate con +  EQ: [(BaseStats + IVs + EVs/4) * .15 +1.5]
    this.conBase = Math.round(((this.baseStats[0] + this.ivStats[0] + this.evStats[0]) / CON_CALC_DIVISOR) * STAT_CALC_MULT + STAT_CALC_BASE);
    this.conMod = modPrint(this.conBase);

//calculate = attribute max HP
//formula for hp... 16 + Conmod, with an additional 2d10 + conmod per level.
    let diceRoll = BASE_HP;
    for (let i = 1; i < this.level; i++) {
        diceRoll += Math.floor((Math.random() * DTEN) + 1) + Math.floor((Math.random() * DTEN) + 1) + (modGen(this.conBase));
    }
    this.finalStats[0] = BASE_HP + (modGen(this.conBase) + diceRoll);

//get all ability scores
//go through base formula for stat creation
    for (let ii = 1; ii < STAT_ARRAY_MAX; ii++) {
        this.formStats[ii] = Math.floor((((BASE_STAT_MULTIPLIER * this.baseStats[ii] + this.ivStats[ii] + (this.evStats[ii] / EV_MULTIPLIER)) * this.level) / FORM_DIVISOR) + FORM_SHIFT);
        this.finalStats[ii] = Math.floor(this.formStats[ii] * this.nMultiStats[ii]);
    }

//get dnd stats
//stat calculator
    const getAbility = function (a) {
        return (STAT_CALC_MULT * a + STAT_CALC_BASE);
    };

//strength is based off of attack stat
    this.strBase = Math.round(getAbility(this.finalStats[ATTACK_BST_INDEX]));
    this.strMod = modPrint(this.strBase);

//int is based off of special attack stat
    this.intBase = Math.round(getAbility(this.finalStats[SPECIALATTACK_BST_INDEX]));
    this.intMod = modPrint(this.intBase);

//wis is based off of special defense stat
    this.wisBase = Math.round(getAbility(this.finalStats[SPECIALDEFENSE_BST_INDEX]));
    this.wisMod = modPrint(this.wisBase);

//dex is based off of speed stat
    this.dexBase = Math.round(getAbility(this.finalStats[SPEED_BST_INDEX]));
    this.dexMod = modPrint(this.dexBase);

//get nat armor, ac
//natArmor is based off defense stat
    this.natArmor = (NATURAL_ARMOUR_MULT * (this.finalStats[DEFENSE_BST_INDEX])) - NATURAL_ARMOUR_SHIFT;

//armor class
//message.channel.send(`Natural Armor: ${natArmor} || Size Bonus: ${sizeBonus} || Dex: ${dexMod}`);
    this.armorClass = (AC_BASE + this.natArmor + this.sizeBonus + ((this.dexBase - DEX_AC_CALC_BASE) / DEX_AC_CALC_MULT)).toFixed(0);

//get move speed
    this.moveSpeed = (MOVE_SPEED_MULT * this.finalStats[SPEED_BST_INDEX] + MOVE_SPEED_SHIFT).toFixed(2);

// generate saves based on types + scores

/*

let

*/

};

// capitalize words

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
                    value: `**Ability:** ${tempAbility} | **Gender:** ${this.gender} | **Nature: ** ${this.natureFinal} | **Shiny: ** ${this.shiny}\n=================`
                },
                {
                    name: "HP",
                    value: `**IV: ** ${this.ivStats[0]} | **Final: ** ${this.finalStats[0]}\n=================`
                },
                {
                    name: "Attack",
                    value: `**IV: ** ${this.ivStats[1]} | **Final: ** ${this.finalStats[1]}\n=================`
                },
                {
                    name: "Defense",
                    value: `**IV: ** ${this.ivStats[2]} | **Final: ** ${this.finalStats[2]}\n=================`
                },
                {
                    name: "Special Attack",
                    value: `**IV: ** ${this.ivStats[3]} | **Final: ** ${this.finalStats[3]}\n=================`
                },
                {
                    name: "Special Defense",
                    value: `**IV: ** ${this.ivStats[4]} | **Final: ** ${this.finalStats[4]}\n=================`
                },
                {
                    name: "Speed",
                    value: `**IV: ** ${this.ivStats[5]} | **Final: ** ${this.finalStats[5]}\n=================`
                },
                {
                    name: "Ability Scores",
                    value: `**STR: ** ${this.strBase.toFixed(0)}(${this.strMod}) | **DEX: ** ${this.dexBase.toFixed(0)}(${this.dexMod}) | **CON: ** ${this.conBase.toFixed()}(${this.conMod})\n**INT: ** ${this.intBase.toFixed(0)}(${this.intMod}) | **WIS: ** ${this.wisBase.toFixed(0)}(${this.wisMod}) | **CHA: ** :3c`
                },
                {
                    name: "Saving Throws",
                    value: `**FORT: ** ${this.fortSave} | **REF: ** ${this.refSave} | **WILL: ** ${this.willSave}`
                },
                {
                    name: "AC & Move Speed",
                    value: `**AC: ** ${this.armorClass} | **Move Speed: ** ${this.moveSpeed} ft`
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

//upload the pokemon to the sql

Pokemon.prototype.uploadPokemon = function(connection, message) {

//uploads everything to the sql and returns a nice lil embed on a success
// TODO: send info to different sql depending on trainer id?
    const sql = 'INSERT INTO pokemon (name, species, level, nature, gender, ability, '
        + `hp, atk, def, spa, spd, spe, ` +
        `hpIV, atkIV, defIV, spaIV, spdIV, speIV, ` +
        `EVhp, atkEV, defEV, spaEV, spdEV, speEV, ` +
        `move1, move2, move3, move4, move5, moveProgress, ` +
        `originalTrainer, userID, dateCreated) ` +
        `VALUES (${this.name}, ${this.species}, ${this.level}, ${this.natureFinal}, ${this.gender}, ${this.ability},` +
        `${this.finalStats[HP_ARRAY_INDEX]}, ${this.finalStats[ATK_ARRAY_INDEX]}, ${this.finalStats[DEF_ARRAY_INDEX]}, ` +
        `${this.finalStats[SPA_ARRAY_INDEX]}, ${this.finalStats[SPD_ARRAY_INDEX]}, ${this.finalStats[SPE_ARRAY_INDEX]}, ` +
        `${this.ivStats[HP_ARRAY_INDEX]}, ${this.ivStats[ATK_ARRAY_INDEX]}, ${this.ivStats[DEF_ARRAY_INDEX]}, ` +
        `${this.ivStats[SPA_ARRAY_INDEX]}, ${this.ivStats[SPD_ARRAY_INDEX]}, ${this.ivStats[SPE_ARRAY_INDEX]}, ) ` +
        `${this.evStats[HP_ARRAY_INDEX]}, ${this.evStats[ATK_ARRAY_INDEX]}, ${this.evStats[DEF_ARRAY_INDEX]}, ` +
        `${this.evStats[SPA_ARRAY_INDEX]}, ${this.evStats[SPD_ARRAY_INDEX]}, ${this.evStats[SPE_ARRAY_INDEX]}, ` +
        `${this.move1}, ${this.move2}, ${this.move3}, ${this.move4}, ${this.move5}, ${this.moveProgress}, ` +
        `${this.originalTrainer}, ${message.author.id}, ${this.dateCreated})`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(sql);
        console.log("1 record inserted");
    });

    //return nice lil embed

    return {embed: {
            color: 3447003,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            title: `${this.name} the ${tempSpecies} has been added to the SQL.`,
            url: `https://bulbapedia.bulbagarden.net/wiki/${this.species}_(Pok%C3%A9mon)`,
            thumbnail: {
                url:  `${this.pokemonData.sprites.front_default}`,
            },
            description: "ChaChaBot will remember this.",

            fields: [
                {
                    name: "",
                    value: `You can now use the bot to view this pokemon, calculate combat damage between it and other pokemon in the database, and edit the pokemon's stored info.`
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

