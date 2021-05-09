const GENDER_MAX = 8;
const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;
const SHINY_CHANCE = 4096;

const logger = require('../logs/logger.js');
let Nature = require("./nature.js");
let Moveset = require("./moveset.js");
let Statblock = require("./statblock.js");
let fs = require('fs');




module.exports = Pokemon;

/**
 * Creates an Ability object, which hold's the ability's name and whether or not it's a hidden ability
 * @param abilityName The Ability's name
 * @param isHiddenAbility Whether or not the ability is hidden
 * @constructor
 */
function Ability(abilityName, isHiddenAbility) {
  this.name = abilityName;
  this.isHiddenAbility = isHiddenAbility;
}

// ======================= POKEMON OBJECT =======================
function Pokemon(tempSpecies, tempLevel, tempName, tempFormName) {
  // ======================= VARIABLES =======================

  //assign name and species
  this.name = tempName;
  this.species = tempSpecies;
  this.formName = tempFormName;

  //level
  if (tempLevel > 0 && tempLevel <= 100)
    this.level = tempLevel;
  else this.level = 1;

  //type(s)
  this.type1 = "";
  this.type2 = "";

  this.ability = new Ability("", false);

  //Pokemon's Statblock
  this.statBlock = new Statblock();

  //hidden ability percentile
  this.haChance = 0;

  this.moveSet = new Moveset.MoveSet();

  this.originalTrainer = "";

  let date = new Date();
  this.dateCreated = date.toISOString().slice(0, 19).replace("T", " ");

  this.nature = new Nature();
  this.shiny = false;

  this.pokemonData = undefined;
    this.speciesData = undefined;
  this.private = true;
  this.speciesData = undefined;


}

Pokemon.prototype.init = function (connection, P) {
  return this.getPokemonAndSpeciesData(connection, P)
    .then(
      function (response) {
        //let the log know the poke is initializing
        console.log("Initializing " + this.name + "...");
        logger.info("[pokemon] Initializing " + this.name + "...");
        //console.log("Retrieved Pokemon and Species Data!");

        //console.log("Reading Type(s)");
        this.assignTypes();
        //console.log("Assigning Gender");
        this.assignRandGender();
        //console.log("Assigning Ability");
        this.genRandAbility();
        //console.log("Assigning IVs");
        this.statBlock.assignRandIVs();
        //console.log("Assigning Nature");
        this.nature.assignRandNature(this);
        //console.log("Assigning shiny");
        this.assignShiny();
        //console.log("Reading Base Stats");
        this.statBlock.assignBaseStats(this);
        //console.log("Calculating Stats");
        this.statBlock.calculateStats(this);
        //console.log("Calculating Saves");
        this.statBlock.calculateSaves(this);

        console.log("Pokemon Initialization Sequence Complete!");
        logger.info("[pokemon] Pokemon Initialization Sequence Complete!");
      }.bind(this))
    .catch(function (error) {
      throw error;
    })
    .finally(function () {
    });
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
  return Math.floor((abilityScore - 10) / 2);
};

// grab + stow types
logger.info("[pokemon] Assigning types.");

Pokemon.prototype.assignTypes = function () {
  this.type1 = this.pokemonData.types[0].type.name;
  if (this.pokemonData.types.length === 2) {
    this.type2 = this.pokemonData.types[1].type.name;
  }
};

// Generates a random ability given the ability options from PokeAPI & the assigned hidden ability chance
logger.info("[pokemon] Generating random ability.");
Pokemon.prototype.genRandAbility = function () {
  // the total # of abilities the pokemon can have
  let abilityTotal = 0;
  // the list of abilities the pokemon has, to be populated by sifting through pokemonData
  let normalAbilities = [];

  // hidden ability, if they have one
  let hiddenAbility = new Ability("", true);

  // a coin flip, for if you need to pick through two abilities
  let coinFlip = Math.floor(Math.random() * 2);

  // go through abilities and grab hidden + non-hidden abilities
  this.pokemonData.abilities.forEach((speciesAbility, index) => {
      if(speciesAbility["ability"]["name"] != null) {
          if (speciesAbility["is_hidden"])
              hiddenAbility = new Ability(
                  speciesAbility["ability"]["name"],
                  speciesAbility["is_hidden"]
              );
          else
              normalAbilities.push(
                  new Ability(
                      speciesAbility["ability"]["name"],
                      speciesAbility["is_hidden"]
                  )
              );
          abilityTotal++;
      }
  });

  // first check if the poke can even have other abilities, or if it only has one
  if (abilityTotal === 1) {
    // if it can only have one ability, assign and be done
    this.ability = normalAbilities[0];
  } else if (this.haChance > 0) {
    // if you're here, there's a possibility for it to have it's hidden ability

    // roll for ha
    let haChanceRoll = Math.floor(Math.random() * 100) + 1;
    // check if you struck gold B)
    if (haChanceRoll <= this.haChance) {
      // if you're here, you rolled the HA!
      this.ability = hiddenAbility;
    } else {
      // no hidden ability chosen, so roll through & assign from non-hidden
      if (abilityTotal < 3) this.ability = normalAbilities[0];
      else this.ability = normalAbilities[coinFlip];
    }
  } else {
    // no hidden ability enabled, so roll through & assign from non-hidden
    if (abilityTotal < 3) this.ability = normalAbilities[0];
    else this.ability = normalAbilities[coinFlip];
  }

  /*
      // go through each item in pokemonData.Abilities, adding them to abilityList
      this.pokemonData.abilities.forEach(element => {
          abilityList.push(new Ability(element["ability"]["name"], element["is_hidden"]));
          abilityTotal++;
      } );
      // roll through some checks- if there's only one ability, or if there's a chance for hidden
      if (abilityTotal === 1) {
          // if there's only one ability, go ahead and assign it and be done
          this.ability = abilityList[0];
          // TODO remove when done testing
          console.log("Only one ability available, " + this.ability.name);
      } else if (this.haChance > 0) {
          // if you're here, it's time to roll to see if you have a hidden ability or not
          // roll to see if you hit the hidden ability
          let hiddenAbilityRoll = Math.floor(Math.random() * 100) + 1; // 1-100 value
          // if the roll is between 1 & the HA chance, the ability is assigned as hidden and this whole shebang is done
          if (hiddenAbilityRoll <= this.haChance) {
              // roll through and grab the ha
              abilityList.forEach(ability => {
                  if (ability.isHiddenAbility) {
                      // if it's the hidden one, assign it and scoot boots
                      this.ability = ability;
                      // TODO remove when done testing
                      console.log("Rolled a " + hiddenAbilityRoll + " on HA chance, so assigned ability " + this.ability.name);
                  }
              });
          } else {
              // if you here, you didn't win the HA roll and get a normal ability
              if (abilityList.length < 3) {
                  this.ability = abilityList[0];
              } else {
                  this.ability = abilityList[coinFlip];
              }
              // TODO remove when done testing
              console.log("Lost HA roll with a " + hiddenAbilityRoll + ", so assigned ability " + this.ability.name);
          }
      } else {
          // if you're here, then the pokemon has multiple abilities and isn't getting it's HA, so it's a 50/50 roll
          this.ability = abilityList[coinFlip];
          // todo remove this when done testing
          console.log("No HA chance detected, so assigned ability " + this.ability.name);
      }*/
};

//Assign gender
logger.info("[pokemon] Assigning random gender.");
Pokemon.prototype.assignRandGender = function () {
  //assign gender, default to genderless
  let gender;

  //Calculates Gender as a fraction of 8
  const genderNum = Math.floor(Math.random() * GENDER_MAX + 1);

  if (this.speciesData.gender_rate <= -1) {
    gender = "genderless";
  } else if (genderNum <= this.speciesData.gender_rate) {
    gender = "female";
  } else gender = "male";

  this.gender = gender;
};

//shiny generator!
logger.info("[pokemon] Assigning shiny value.");
Pokemon.prototype.assignShiny = function () {
  this.shiny = Math.floor(Math.random() * SHINY_CHANCE + 1) >= SHINY_CHANCE;
};

// capitalize words

let capitalizeWord = function (tempWord) {
  return tempWord.charAt(0).toUpperCase() + tempWord.substr(1);
};

// =========== EMBED ===========

Pokemon.prototype.sendSummaryMessage = function (client) {
  // set up formatted ability name
  let tempAbility = this.ability.name;
  if (~tempAbility.indexOf("-")) {
    let tempA = tempAbility.slice(0, tempAbility.indexOf("-"));
    let tempB = tempAbility.slice(
      tempAbility.indexOf("-") + 1,
      tempAbility.length
    );
    tempA = capitalizeWord(tempA);
    tempB = capitalizeWord(tempB);
    tempAbility = tempA + " " + tempB;
  } else tempAbility = capitalizeWord(tempAbility);

  // if the ability is hidden, append a lil O to it
  if (this.ability.isHiddenAbility) tempAbility = tempAbility.concat(" (HA)");

  let tempSpecies = this.species;

  if(this.formName != null)
      tempSpecies = this.formName;
  tempSpecies = capitalizeWord(tempSpecies);

  var thumbnail_url = `${this.pokemonData.sprites.front_default}`

  if (thumbnail_url === null) {
    thumbnail_url = "https://e7.pngegg.com/pngimages/960/239/png-clipart-internet-archive-http-404-wayback-machine-error-miscellaneous-text-thumbnail.png"
    logger.error("[pokemon] Pokemon thumbnail URL was not found, using 404 image.");
  }

  let shiny = this.shiny ? "yes" : "no";

  return {
    embed: {
      color: 3447003,
      author: {
        name: client.user.username,
        icon_url: client.user.avatarURL,
      },
      title: `Level ${this.level} ${tempSpecies} ~ ${this.name}`,
      url: `https://bulbapedia.bulbagarden.net/wiki/${this.species}_(Pok%C3%A9mon)`,
      thumbnail: {
        url: thumbnail_url,
      },
      description:
        "Click the link for the Bulbapedia page, or use !data to call info using the Pokedex bot.",

      fields: [
        {
          name: "Basic Info",
          value: `**Ability:** ${tempAbility} | **Gender:** ${this.gender} \n**Nature: ** ${this.nature.natureFinal} | **Shiny: ** ${shiny}\n**Type 1:** ${capitalizeWord(this.type1)} **Type 2:** ${capitalizeWord(this.type2)}\n=================`,
        },
        {
          name: "HP",
          value: `**IV: ** ${this.statBlock.ivStats[0]} | **EV: ** ${this.statBlock.evStats[0]} | **Final: ** ${this.statBlock.finalStats[0]}\n=================`,
        },
        {
          name: "Attack",
          value: `**IV: ** ${this.statBlock.ivStats[1]} |  **EV: ** ${this.statBlock.evStats[1]} | **Final: ** ${this.statBlock.finalStats[1]}\n=================`,
        },
        {
          name: "Defense",
          value: `**IV: ** ${this.statBlock.ivStats[2]} |  **EV: ** ${this.statBlock.evStats[2]} | **Final: ** ${this.statBlock.finalStats[2]}\n=================`,
        },
        {
          name: "Special Attack",
          value: `**IV: ** ${this.statBlock.ivStats[3]} |  **EV: ** ${this.statBlock.evStats[3]} | **Final: ** ${this.statBlock.finalStats[3]}\n=================`,
        },
        {
          name: "Special Defense",
          value: `**IV: ** ${this.statBlock.ivStats[4]} |  **EV: ** ${this.statBlock.evStats[4]} | **Final: ** ${this.statBlock.finalStats[4]}\n=================`,
        },
        {
          name: "Speed",
          value: `**IV: ** ${this.statBlock.ivStats[5]} |  **EV: ** ${this.statBlock.evStats[5]} | **Final: ** ${this.statBlock.finalStats[5]}\n=================`,
        },
        {
          name: "Ability Scores",
          value: `**STR: ** ${this.statBlock.strBase.toFixed(0)}(${this.statBlock.strMod
            }) | **DEX: ** ${this.statBlock.dexBase.toFixed(0)}(${this.statBlock.dexMod
            }) | **CON: ** ${this.statBlock.conBase.toFixed()}(${this.statBlock.conMod
            })\n**INT: ** ${this.statBlock.intBase.toFixed(0)}(${this.statBlock.intMod
            }) | **WIS: ** ${this.statBlock.wisBase.toFixed(0)}(${this.statBlock.wisMod
            }) | **CHA: ** :3c`,
        },
        {
          name: "Saving Throws",
          value: `**FORT: ** +${this.statBlock.fortSave} | **REF: ** +${this.statBlock.refSave} | **WILL: ** +${this.statBlock.willSave}`,
        },
        {
          name: "AC & Move Speed",
          value: `**AC: ** ${this.statBlock.armorClass} | **Move Speed: ** ${this.statBlock.moveSpeed} ft\n\n((NOTE - AC does *not* include Size Bonus, which you can find based on the Pokemon's height and [this chart](https://www.d20pfsrd.com/BASICS-ABILITY-SCORES/GLOSSARY/#Size)`,
        },
      ],
      timestamp: new Date(),
      footer: {
        icon_url: client.user.avatarURL,
        text: "Chambers and Charizard!",
      },
    },
  };
};

// =========== Upload ===========

Pokemon.prototype.uploadPokemon = function (connection, message) {
  let sql = `INSERT INTO pokemon (name, species, formName, level, nature, gender, ability, type1, type2, shiny, 
        hp, atk, def, spa, spd, spe, 
        hpIV, atkIV, defIV, spaIV, spdIV, speIV, 
        hpEV, atkEV, defEV, spaEV, spdEV, speEV, 
        move1, move2, move3, move4, move5, moveProgress, 
        originalTrainer, discordID, private, dateCreated) 
        VALUES (
        "${this.name}",
        "${this.species}",
        "${this.formName}",
        ${this.level},
        "${this.nature.natureFinal}",
        "${this.gender}",
        "${this.ability.name}",
        "${this.type1}",
        "${this.type2}",
        ${this.shiny},
        ${this.statBlock.finalStats[HP_ARRAY_INDEX]},
        ${this.statBlock.finalStats[ATK_ARRAY_INDEX]},
        ${this.statBlock.finalStats[DEF_ARRAY_INDEX]},
        ${this.statBlock.finalStats[SPA_ARRAY_INDEX]},
        ${this.statBlock.finalStats[SPD_ARRAY_INDEX]},
        ${this.statBlock.finalStats[SPE_ARRAY_INDEX]},
        ${this.statBlock.ivStats[HP_ARRAY_INDEX]},
        ${this.statBlock.ivStats[ATK_ARRAY_INDEX]},
        ${this.statBlock.ivStats[DEF_ARRAY_INDEX]},
        ${this.statBlock.ivStats[SPA_ARRAY_INDEX]},
        ${this.statBlock.ivStats[SPD_ARRAY_INDEX]},
        ${this.statBlock.ivStats[SPE_ARRAY_INDEX]},
        ${this.statBlock.evStats[HP_ARRAY_INDEX]},
        ${this.statBlock.evStats[ATK_ARRAY_INDEX]},
        ${this.statBlock.evStats[DEF_ARRAY_INDEX]},
        ${this.statBlock.evStats[SPA_ARRAY_INDEX]},
        ${this.statBlock.evStats[SPD_ARRAY_INDEX]},
        ${this.statBlock.evStats[SPE_ARRAY_INDEX]},
        "${this.moveSet.move1.name}",
        "${this.moveSet.move2.name}",
        "${this.moveSet.move3.name}",
        "${this.moveSet.move4.name}",
        "${this.moveSet.move5.name}",
        ${this.moveSet.moveProgress},
        "${this.originalTrainer}",
        ${message.author.id},
        ${this.private},
        '${this.dateCreated}');`;
  //console.log(sql);
  logger.info(`[pokemon] upload SQL query: ${sql}`);
  connection.query(sql, function (err, result) {
    if (err) {
      logger.error(err);
      throw err;
    }
    console.log("1 record inserted");
    logger.info("[pokemon] upload SQL was successful.")
  });
};

//Instead of uploading a new pokemon, instead updates the existing entry BASED OFF OF POKEMON NAME
//BE CAREFUL
Pokemon.prototype.updatePokemon = function (connection, message, pokePrivate) {
  if (pokePrivate === null) pokePrivate = false;

  //uses SQL UPDATE to alter the existing entry
  // SQL UPDATE reference: https://www.w3schools.com/sql/sql_update.asp
  let sql = `UPDATE pokemon
        SET 
            name = "${this.name}",
            species = "${this.species}",
            level =  ${this.level},
            nature = "${this.nature.natureFinal}",
            gender = "${this.gender}",
            ability = "${this.ability.name}",
            type1 = "${this.type1}",
            type2 = "${this.type2}",
            shiny = ${this.shiny},
        
            hp = ${this.statBlock.finalStats[HP_ARRAY_INDEX]},
            atk = ${this.statBlock.finalStats[ATK_ARRAY_INDEX]},
            def = ${this.statBlock.finalStats[DEF_ARRAY_INDEX]},
            spa = ${this.statBlock.finalStats[SPA_ARRAY_INDEX]},
            spd = ${this.statBlock.finalStats[SPD_ARRAY_INDEX]},
            spe = ${this.statBlock.finalStats[SPE_ARRAY_INDEX]},
            hpIV = ${this.statBlock.ivStats[HP_ARRAY_INDEX]},
            atkIV = ${this.statBlock.ivStats[ATK_ARRAY_INDEX]},
            defIV = ${this.statBlock.ivStats[DEF_ARRAY_INDEX]},
            spaIV = ${this.statBlock.ivStats[SPA_ARRAY_INDEX]},
            spdIV = ${this.statBlock.ivStats[SPD_ARRAY_INDEX]},
            speIV = ${this.statBlock.ivStats[SPE_ARRAY_INDEX]},
            hpEV = ${this.statBlock.evStats[HP_ARRAY_INDEX]},
            atkEV = ${this.statBlock.evStats[ATK_ARRAY_INDEX]},
            defEV = ${this.statBlock.evStats[DEF_ARRAY_INDEX]},
            spaEV = ${this.statBlock.evStats[SPA_ARRAY_INDEX]},
            spdEV = ${this.statBlock.evStats[SPD_ARRAY_INDEX]},
            speEV = ${this.statBlock.evStats[SPE_ARRAY_INDEX]},
            move1 = "${this.moveSet.move1.name}",
            move2 = "${this.moveSet.move2.name}",
            move3 = "${this.moveSet.move3.name}",
            move4 = "${this.moveSet.move4.name}",
            move5 = "${this.moveSet.move5.name}",
            moveProgress = ${this.moveSet.moveProgress},
            private = ${pokePrivate}
         WHERE name = "${this.name}";`;

  //console.log(sql);
  logger.info(`[pokemon] update SQL query: ${sql}`);
  return new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) {
        logger.error(`pokemon update SQL error: ${err}`)
        return reject(err);
      }
      logger.info("[pokemon] update SQL query was successful.");
      console.log("1 record updated.");
      return resolve(result);
    });
  });
};

// =========== Import (Showdown Style) ===========

Pokemon.prototype.importPokemon = function (connection, P, importString) {
  logger.info("[pokemon] Importing Pokemon.");
  //splits the message into lines then splits the lines into words separated by spaces.
  let lines = importString.split("\n");
  let nameLineVals = lines[0].split(" ");
  let evLineVals;
  let natureLineVals;
  let ivLineVals;
  let nameArgs = [];

  //
  //Interprets the name line
  //
  this.name = nameLineVals[0]; //First word is always the name or the species;
  nameLineVals.forEach((element) => {
    if (element.charAt(0) === "(") {
      nameArgs.push(element.substr(1, element.length - 2));
    }
  });

  // ======= FIRST LINE - NAME/SPECIES/GENDER =======

  //If there's two options, the first is the species and the second is the gender
  if (nameArgs.length === 2) {
    this.species = nameArgs[0].toLowerCase();
    if (nameArgs[1] === "M") {
      this.gender = "male";
    } else if (nameArgs[1] === "F") {
      this.gender = "female";
    } else this.gender = "genderless";
  } else if (nameArgs.length === 1) {
    //If there's just one option, check if pokemon name or if it is the pokemon's gender
    if (
      nameArgs[0].toUpperCase() === "M" ||
      nameArgs[0].toUpperCase() === "F" ||
      nameArgs[0].toUpperCase() === "N"
    ) {
      this.species = nameLineVals[0].toLowerCase();
      if (nameArgs[0] === "M") {
        this.gender = "male";
      } else if (nameArgs[0] === "F") {
        this.gender = "female";
      } else this.gender = "genderless";
    }
  } else if (nameArgs.length === 0) {
    this.species = nameLineVals[0];
  }

  lines.forEach(
    function (element) {
      switch (element.split(" ")[0]) {
        case "Ability:": {
          //Grabs ability
          this.ability.name = element
            .substr(9, element.length - 9)
            .toLowerCase()
            .replace(" ", "-");
          break;
        }
        case "Level:": {
          //Grabs level
          this.level = element.substr(7, element.length - 7) / 5;
          break;
        }
        case "EVs:": {
          //For each listed EV: look at name then assign the corresponding value
          evLineVals = element.split(" ");
          evLineVals.forEach(
            function (evElement, i) {
              let j = -1;
              switch (evElement) {
                case "Atk":
                  j = ATK_ARRAY_INDEX;
                  break;
                case "Def":
                  j = DEF_ARRAY_INDEX;
                  break;
                case "SpD":
                  j = SPD_ARRAY_INDEX;
                  break;
                case "SpA":
                  j = SPA_ARRAY_INDEX;
                  break;
                case "Spe":
                  j = SPE_ARRAY_INDEX;
                  break;
                case "HP":
                  j = HP_ARRAY_INDEX;
                  break;
              }
              if (j >= 0) this.statBlock.evStats[j] = Number(evLineVals[i - 1]);
            }.bind(this)
          );
          break;
        }
        case "IVs:": {
          //For each listed IV: look at name then assign the corresponding value
          ivLineVals = element.split(" ");
          ivLineVals.forEach(
            function (ivElement, i) {
              let j = -1;
              switch (ivElement) {
                case "Atk":
                  j = ATK_ARRAY_INDEX;
                  break;
                case "Def":
                  j = DEF_ARRAY_INDEX;
                  break;
                case "SpD":
                  j = SPD_ARRAY_INDEX;
                  break;
                case "SpA":
                  j = SPA_ARRAY_INDEX;
                  break;
                case "Spe":
                  j = SPE_ARRAY_INDEX;
                  break;
                case "HP":
                  j = HP_ARRAY_INDEX;
                  break;
              }
              if (j >= 0) this.statBlock.ivStats[j] = Number(ivLineVals[i - 1]);
            }.bind(this)
          );
          break;
        }
        //If the line is any of the Natures, Grab it.
        case "Hardy":
        case "Lonely":
        case "Adamant":
        case "Naughty":
        case "Brave":
        case "Bold":
        case "Docile":
        case "Impish":
        case "Lax":
        case "Relaxed":
        case "Modest":
        case "Mild":
        case "Bashful":
        case "Rash":
        case "Quiet":
        case "Calm":
        case "Gentle":
        case "Careful":
        case "Quirky":
        case "Sassy":
        case "Timid":
        case "Hasty":
        case "Jolly":
        case "Naive":
        case "Serious": {
          natureLineVals = element.split(" ");
          this.nature.assignNature(this, natureLineVals[0]);
          break;
        }
      }
    }.bind(this)
  );

  return this.getPokemonAndSpeciesData(P).then(
    //assign types, base states and then calculate those Stats
    function (response) {
      this.assignTypes();
      this.statBlock.assignBaseStats(this);
      this.statBlock.calculateStats(this);
      this.statBlock.calculateSaves(this);
    }.bind(this)
  );
};

Pokemon.prototype.getPokemonAndSpeciesData = function (connection, P) {
    return new Promise(
        function (resolve, reject) {

            let sqlFindPokeForm = `SELECT * FROM pokeForms WHERE species = '${this.species}'`;
            connection.query(sqlFindPokeForm, function (err, response) {
                //Check for all Pokemon Forms from that species
                let found = 0;
                if (response.length > 0) {
                    response.forEach(function (pokeForm, pokeFormIndex) {
                        if (pokeForm.formName === this.formName) {
                            found = 1;
                            //Found the correct form and species in the SQL!
                            let formtemplate
                            let speciestemplate
                            try {
                                formtemplate = fs.readFileSync('./formTemplate.json', 'utf8');
                                speciestemplate = fs.readFileSync('./speciesType.json', 'utf8');
                            } catch (e) {
                                console.log('Error:', e.stack);
                            }

                            //fill out the dummy json file-
                            this.pokemonData = JSON.parse(formtemplate);
                            this.speciesData = JSON.parse(speciestemplate);

                            this.pokemonData.types[0].name = pokeForm.type1;
                            this.pokemonData.types[1].name = pokeForm.type2;

                            this.pokemonData.types[0].type.name = pokeForm.type1;
                            this.pokemonData.types[1].type.name = pokeForm.type2;

                            this.pokemonData.stats[0].base_stat = pokeForm.hpBST;
                            this.pokemonData.stats[1].base_stat = pokeForm.atkBST;
                            this.pokemonData.stats[2].base_stat = pokeForm.spaBST;
                            this.pokemonData.stats[3].base_stat = pokeForm.defBST;
                            this.pokemonData.stats[4].base_stat = pokeForm.spdBST;
                            this.pokemonData.stats[5].base_stat = pokeForm.speBST;

                            this.pokemonData.abilities[0].ability.name = pokeForm.ability1;
                            this.pokemonData.abilities[1].ability.name = pokeForm.ability2;
                            this.pokemonData.abilities[2].ability.name = pokeForm.ability3;

                            this.speciesData.gender_rate = pokeForm.gender_rate;
                            this.speciesData.capture_rate = pokeForm.capture_rate;
                            //you now have the "pokemon data"
                            //

                            resolve(this.pokemonData);
                        }
                    }.bind(this))

                }
                if (found === 0) {
                    P.getPokemonSpeciesByName(this.species.toLowerCase())
                        .then(function (response) {
                                this.speciesData = response;
                                P.getPokemonByName(this.speciesData.id)
                                    .then(
                                        function (response) {
                                            this.pokemonData = response;
                                            resolve(this.pokemonData);
                                        }.bind(this)
                                    )
                                    .catch(function (error) {
                                        console.log(
                                            "Error when retrieving pokemon species Data :C  ERROR: ",
                                            error
                                        );
                                        reject("Error when retrieving pokemon species Data :C  ERROR: " + error)
                                        //message.channel.send("Error when retrieving pokemon species Data :C  ERROR: ");
                                    });
                            }.bind(this)
                        )
                        .catch(function (error) {
                            console.log("Error when retrieving pokemon Data :C  ERROR: ", error.response.statusText);
                            if (error.response.status === 404) {
                                let errMsg = "Pokemon not found, please check your spelling."
                                reject(errMsg)
                            }
                            //message.channel.send("Error when retrieving pokemon Data :C");
                        });
                }
            }.bind(this));



            P.getPokemonSpeciesByName(this.species.toLowerCase())
                .then(function (response) {
                    this.speciesData = response;
                    P.getPokemonByName(this.speciesData.id)
                        .then(
                            function (response) {
                                this.pokemonData = response;
                                resolve("done");
                            }.bind(this)
                        )
                        .catch(function (error) {
                            console.log(
                                "Error when retrieving pokemon species Data :C  ERROR: ",
                                error
                            );
                            logger.error(`[pokemon] Error retrieving species data: ${error}`)
                            reject("Error when retrieving pokemon species Data :C  ERROR: " + error);
                        });

                }.bind(this))
        }.bind(this)
    )
}




Pokemon.prototype.loadFromSQL = function (connection, P, sqlObject) {
    return new Promise(
        function (resolve, reject) {
            this.name = sqlObject.name;
            this.species = sqlObject.species;
            this.formName = sqlObject.formName;

            this.getPokemonAndSpeciesData(connection, P).then(
                function (response) {
                    this.pokemonData = response;
                    //type(s)
                    this.type1 = sqlObject.type1;
                    this.type2 = sqlObject.type2;

                    this.gender = sqlObject.gender;
                    this.ability.name = sqlObject.ability;

                    // roll through abilities and check if this one is hidden
                    response.abilities.forEach((ability) => {
                        if (ability.ability.name === this.ability.name) {
                            this.ability.isHiddenAbility = ability["is_hidden"];
                        }
                    });

                    this.nature.assignNature(this, sqlObject.nature);

                    //level
                    this.level = sqlObject.level;

                    this.statBlock.evStats = [
                        sqlObject.hpEV,
                        sqlObject.atkEV,
                        sqlObject.defEV,
                        sqlObject.spaEV,
                        sqlObject.spdEV,
                        sqlObject.speEV,
                    ];
                    this.statBlock.ivStats = [
                        sqlObject.hpIV,
                        sqlObject.atkIV,
                        sqlObject.defIV,
                        sqlObject.spaIV,
                        sqlObject.spdIV,
                        sqlObject.speIV,
                    ];

                    this.moveSet.move1 = sqlObject.move1;
                    this.moveSet.move2 = sqlObject.move2;
                    this.moveSet.move3 = sqlObject.move3;
                    this.moveSet.move4 = sqlObject.move4;
                    this.moveSet.move5 = sqlObject.move5;
                    this.moveSet.moveProgress = sqlObject.moveProgress;

                    this.originalTrainer = sqlObject.originalTrainer;

                    if (sqlObject.shiny != null) {
                        this.shiny = sqlObject.shiny;
                    }

                    let i = 6;
                    this.pokemonData["stats"].forEach((element) => {
                        this.statBlock.baseStats[STAT_ARRAY_MAX - i] =
                            element["base_stat"];
                        i--;
                    });

                    console.log("Calculating Stats of " + this.name);
                    logger.info("[pokemon] Calculating stats of " + this.name);

                    //this.statBlock.finalStats[HP_ARRAY_INDEX] = sqlObject.hp;
                    //this.statBlock.finalStats[ATK_ARRAY_INDEX] = sqlObject.atk;
                    //this.statBlock.finalStats[DEF_ARRAY_INDEX] = sqlObject.def;
                    //this.statBlock.finalStats[SPA_ARRAY_INDEX] = sqlObject.spa;
                    //this.statBlock.finalStats[SPD_ARRAY_INDEX] = sqlObject.spd;
                    //this.statBlock.finalStats[SPE_ARRAY_INDEX] = sqlObject.spe;

                    // calculate stats and saves before re-assigning actual stats
                    this.statBlock.calculateStats(this);
                    this.statBlock.calculateSaves(this);

                    // We WANT the stats to be recalculated. This was originally used to keep track of health.
                    //
                    //assign again to make sure you have true inside-sql values
                    //this.statBlock.finalStats[HP_ARRAY_INDEX] = sqlObject.hp;
                    //this.statBlock.finalStats[ATK_ARRAY_INDEX] = sqlObject.atk;
                    //this.statBlock.finalStats[DEF_ARRAY_INDEX] = sqlObject.def;
                    //this.statBlock.finalStats[SPA_ARRAY_INDEX] = sqlObject.spa;
                    //this.statBlock.finalStats[SPD_ARRAY_INDEX] = sqlObject.spd;
                    //this.statBlock.finalStats[SPE_ARRAY_INDEX] = sqlObject.spe;

                    resolve("Stats calculated.");
                }.bind(this)
            )
                .catch(function (error) {
                    logger.error(`[pokemon] Error retrieving pokemon species data: ${error}`)
                    console.log(
                        "Error when retrieving pokemon species Data :C  ERROR: ",
                        error
                    );
                    //message.channel.send("Error when retrieving pokemon species Data :C  ERROR: ");
                });
        }.bind(this)
    )
        .catch(function (error) {
            console.log("Error when Loading from SQL :C  ERROR: ", error);
            //message.channel.send("Error when retrieving pokemon Data :C");
        });
}
