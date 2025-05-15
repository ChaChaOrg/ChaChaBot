const GENDER_MAX = 8;
const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;
const SHINY_CHANCE = 4096;

const FRIEND_TRESH = [35, 71, 121, 171, 221]
const FRIEND_VAL = ["Hostile", "Unfriendly", "Indifferent", "Friendly", "Helpful", "Fanatic"]

const logger = require('../logs/logger.js');
let Nature = require("./nature.js");
let Moveset = require("./moveset.js");
let Statblock = require("./statblock.js");
let fs = require('fs');

const MIN_EXP = 0;
const BASE_FRIEND = 70;


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
function Pokemon(tempSpecies, tempLevel, tempName, tempform) {
  // ======================= VARIABLES =======================

  //assign name and species
  this.name = tempName;
  this.species = tempSpecies;
  if(tempform === null)
      this.form = this.species;
  else this.form = tempform;

  //level
  if (tempLevel > 0)
    this.level = tempLevel;
  else this.level = 1;

  //type(s)
  this.type1 = "";
  this.type2 = "";

  this.ability = new Ability("", false);

  //Pokemon's Statblock
  this.statBlock = new Statblock();

  // pokemon's exp
  this.exp = MIN_EXP;

    // pokemon's default friendship value
    this.friendship = BASE_FRIEND;

  //hidden ability percentile
  this.haChance = 0;

  this.moveSet = new Moveset.MoveSet();

  this.originalTrainer = "Wild";

  let date = new Date();
  this.dateCreated = date.toISOString().slice(0, 19).replace("T", " ");

  this.nature = new Nature();
  this.shiny = false;

  this.pokemonData = undefined;
  this.speciesData = undefined;
  this.private = true;
  this.speciesData = undefined;

  this.campaign = "None";


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

        // calculate random moves
          this.assignMoves();

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

// assign random moves based on level
logger.info("[pokemon] Assigning random moves based on level");
Pokemon.prototype.assignMoves = function () {

    // video game level
    let vgLevel = this.level * 5;

    //moves the pokemon can legally learn
    let legalMoves = [];
    // make a blank move for use later if needed
    let blankMove = new Moveset.Move();

    // function to verify that a move is learned via level-up & at the pokemon's level or lower
    let verifyLevelUp = function (move) {
        // grab two newest appearances
        let newestAppearance = move.version_group_details.length - 1;
        let secondNewestAppearance = move.version_group_details.length -2;
        // variables for checking em out
        let learnMethod = "";
        let levelLearned = 101;
        let secondLearnMethod = "";
        let secondLevelLearned = 101;

        if (secondNewestAppearance < 0) { // if there's only one appearance, use that
            learnMethod = move.version_group_details[newestAppearance].move_learn_method.name;
            levelLearned = move.version_group_details[newestAppearance].level_learned_at;
            if (learnMethod === "level-up" && levelLearned <= vgLevel) { legalMoves.push(move) }

        } else { // otherwise, use both!
            learnMethod = move.version_group_details[newestAppearance].move_learn_method.name;
            levelLearned = move.version_group_details[newestAppearance].level_learned_at;
            secondLearnMethod = move.version_group_details[secondNewestAppearance].move_learn_method.name;
            secondLevelLearned = move.version_group_details[secondNewestAppearance].level_learned_at;
            if ((learnMethod === "level-up" && levelLearned <= vgLevel) || (secondLearnMethod === "level-up" && secondLevelLearned <= vgLevel)) { legalMoves.push(move) }
        }
    }

    // find all moves that can legally be learned by the pokemon
    this.pokemonData.moves.forEach(nextMove =>
    {
        // use the verifyMove function to stow the move if it's gucci
        verifyLevelUp(nextMove);

    })

    // if there aren't enough moves to fill out the known moves, grab the ones that do exist
    if (legalMoves.length < 4) {
        try {
            console.log("moveloop");
            this.moveSet.move1 = legalMoves[0];
            this.moveSet.move2 = legalMoves[1];
            this.moveSet.move3 = legalMoves[2];
            this.moveSet.move4 = legalMoves[3];
        } catch (e) {
            if (!this.moveSet.move2) this.moveSet.move2 = blankMove;
            if (!this.moveSet.move3) this.moveSet.move3 = blankMove;
            if (!this.moveSet.move4) this.moveSet.move4 = blankMove;
        }
    } else{//roll four random numbers between 0 & # of moves found
        let moveRoller = [];

        //
        while (moveRoller.length < 4) {
            let randMove = Math.floor(Math.random() * legalMoves.length);
            if (moveRoller.indexOf(randMove) === -1) moveRoller.push(randMove);
        }

        // for each random number picked, assign!
        this.moveSet.move1 = legalMoves[moveRoller[0]];
        this.moveSet.move2 = legalMoves[moveRoller[1]];
        this.moveSet.move3 = legalMoves[moveRoller[2]];
        this.moveSet.move4 = legalMoves[moveRoller[3]];
    }
}

// capitalize words
let capitalizeWord = function (tempWord) {
  return tempWord.charAt(0).toUpperCase() + tempWord.substr(1);
};

// camel case function
// convert the input array to title case
function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
}

// format dashed stuff nicely
let fixAbilityOrMoveFormatting = function (tempWord, middle) {
    // set up formatted ability name
    //list of sticking points: mud-slap, double-edge, soft-boiled, self-destruct, will-o-wisp, wake-up slap, 
    //u-turn, x-scissor, v-create, trick-or-treat
    //topsy-turvy, freeze-dry, baby-doll eyes, power-up punch,soul-stealing 7-star strike, multi-attack
    //well-baked body, soul-heart
    //light that burns, power of alch, good as gold, ruin stuff
    let lower = tempWord.toLowerCase();
    if (lower === "will-o-wisp") {
        return "Will-O-Wisp";
    }
    if (lower === "trick-or-treat") {
        return "Trick-or-Treat";
    }
    if (lower === "v-create") {
        return "V-create";
    }
    if (lower === "u-turn") {
        return "U-turn"
    }
    try {
        if (tempWord.indexOf("-") > -1) {
            // if the word is only a dash, return it
            if (tempWord === "-") return tempWord;
            // otherwise replace the dashes with the requested middle!
            tempWord = tempWord.replaceAll("-", middle);
        } else if (tempWord.indexOf(" ") > -1) {
            tempWord = tempWord.replaceAll(" ", middle)
        } else {
            tempWord = capitalizeWord(tempWord);
        }
    } catch (oops) {
        return tempWord;
    }
    //camel case the word before going out
    let parts = tempWord.split(middle);
    let word = "";
    parts.forEach((p, i) => {
        let littlep = p.toLowerCase();
        if (littlep === "the" || littlep === "or" || littlep === "as") {
            word += littlep;
        } else {
            word += toTitleCase(p);
        }
        
        if (i != (parts.length -1)) {
            //add chosen middle to end if not last word
            word += middle;
        }
    });
    return word;
}

// assign four moves at random based on given level


// =========== EMBED ===========

Pokemon.prototype.sendSummaryMessage = function (interaction) {
  // set up formatted ability name
  let tempAbility = this.ability.name;
  let tempAbilityURL = this.ability.name;
    tempAbility = fixAbilityOrMoveFormatting(tempAbility, " ");
    tempAbilityURL = "https://bulbapedia.bulbagarden.net/wiki/" + fixAbilityOrMoveFormatting(tempAbility, "_") + "_(Ability)";

  // if the ability is hidden, append a lil O to it
  if (this.ability.isHiddenAbility) tempAbility = tempAbility.concat(" (HA)");

  let tempSpecies = this.species;

  if(this.form != null)
      tempSpecies = this.form;
  tempSpecies = capitalizeWord(tempSpecies);

  var thumbnail_url = `${this.pokemonData.sprites.front_default}`;

  if (thumbnail_url === null) {
    thumbnail_url = "https://e7.pngegg.com/pngimages/960/239/png-clipart-internet-archive-http-404-wayback-machine-error-miscellaneous-text-thumbnail.png"
    logger.error("[pokemon] Pokemon thumbnail URL was not found, using 404 image.");
  }

  // set shiny to yes or no based on the boolean
  let shiny = this.shiny ? "yes" : "no";

  // grab all the stored moves
  let moves = [this.moveSet.move1,this.moveSet.move2,this.moveSet.move3,this.moveSet.move4,this.moveSet.move5];
  let movesURL = [this.moveSet.move1,this.moveSet.move2,this.moveSet.move3,this.moveSet.move4,this.moveSet.move5];

  for (let i = 0; i < moves.length; i++) {
      if (!moves[i] || moves[i] === "undefined") {
        moves[i] = "-";
      } else if ((typeof moves[i] === 'object' && moves[i] !== null) || moves[i] === undefined) {
          try {moves[i] = fixAbilityOrMoveFormatting(moves[i].move.name, " ");
          } catch (e) {
              moves[i] = '-';
          }
      } else {
          try {moves[i] = fixAbilityOrMoveFormatting(moves[i], " ");
          } catch (e) {
              moves[i] = '-';
          }
      }
  }

    for (let i = 0; i < movesURL.length; i++) {
        if (!movesURL[i] || movesURL[i] === "undefined") {
            movesURL[i] = "-";
        } else if ((typeof movesURL[i] === 'object' && movesURL[i] !== null) || movesURL[i] === undefined) {
            try {movesURL[i] = fixAbilityOrMoveFormatting(movesURL[i].move.name, "_");
            } catch (e) {
                movesURL[i] = '-';
            }
        } else {
            try {movesURL[i] = fixAbilityOrMoveFormatting(movesURL[i], "_");
            } catch (e) {
                movesURL[i] = '-';
            }
        }
        console.log(movesURL[i]);
        movesURL[i] = "https://bulbapedia.bulbagarden.net/wiki/" + movesURL[i] + "_(move)";
    }


  let fullName = "";

  // check if species and name are the same; don't display twice if not
    if (this.species.toLowerCase() === this.form.toLowerCase()) {
        fullName = capitalizeWord(this.species);
    } else {
        fullName = capitalizeWord(this.species) + " (" + capitalizeWord(this.form) + ")";
    }

    //add + to stat list if positive, do nothing if negative
    let addPlusOrNah = function (num) {
        if (num > 0) return "+" + num;
        else return num;
    }

    let saveStats = [
        addPlusOrNah(this.statBlock.fortSave),
        addPlusOrNah(this.statBlock.refSave),
        addPlusOrNah(this.statBlock.willSave)
    ]

    let avatarURL = interaction.user.avatarURL();
    let username = interaction.user.username;

    //Converting friendship value to words based on thresholds in FRIEND_THRESH
    let frndwrd = "";
    let val = this.friendship;
    if (val >= FRIEND_TRESH[4]) {
        frndwrd = FRIEND_VAL[5];
    } else if (val >= FRIEND_TRESH[3]) {
        frndwrd = FRIEND_VAL[4];
    } else if (val >= FRIEND_TRESH[2]) {
        frndwrd = FRIEND_VAL[3];
    } else if (val >= FRIEND_TRESH[1]) {
        frndwrd = FRIEND_VAL[2];
    } else if (val >= FRIEND_TRESH[0]) {
        frndwrd = FRIEND_VAL[1];
    } else {
        frndwrd = FRIEND_VAL[0];
    }

  return {
    embed: {
      description: 'Click the link for the Bulbapedia page, or use !data to call info using the Pokedex bot.',
      color: 3447003,
      author: {
        name: username,
        icon_url: avatarURL,
      },
      title: `Level ${this.level} ${fullName} ~ ${this.name}`,
      url: `https://bulbapedia.bulbagarden.net/wiki/${this.species}_(Pok%C3%A9mon)`,
      thumbnail: {
        url: thumbnail_url,
      },
      

      fields: [
       
        {
              name: "Experience Points",
              value: `${this.exp}`,
             
        },
        {
            name: "Friendship",
            value: `${this.friendship} : ${frndwrd}`,
        },
        {
            name: "Basic Info",
            value: `**Ability:** [${tempAbility}](${tempAbilityURL}) | **Gender:** ${this.gender} \n**Nature: ** ${this.nature.natureFinal} | ` +
            `**Shiny: ** ${shiny} ` + `\n**OT:** ${this.originalTrainer} | **Campaign:** ${this.campaign}` +
            `\n**Type 1:** [${capitalizeWord(this.type1)}](https://bulbapedia.bulbagarden.net/wiki/${this.type1}_(type)) ` +
            `**Type 2:** [${capitalizeWord(this.type2)}](https://bulbapedia.bulbagarden.net/wiki/${this.type2}_(type))`+
            `\n**Form:** ${capitalizeWord(this.form)} **Species:** ${capitalizeWord(this.species)}\n=================`,
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
              name: "Moves",
              value: `[${moves[0]}](${movesURL[0]}) | ` +
                  `[${moves[1]}](${movesURL[1]}) | ` +
                  `[${moves[2]}](${movesURL[2]}) | ` +
                  `[${moves[3]}](${movesURL[3]}) ` +
                  `\n **In Progress: ** [${moves[4]}](${movesURL[4]}), ${this.moveSet.moveProgress}/6\n=================`,
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
          value: `**FORT: ** ${saveStats[0]} | **REF: ** ${saveStats[1]} | **WILL: ** ${saveStats[2]}`,
        },
        {
          name: "AC & Move Speed",
          value: `**AC: ** ${this.statBlock.armorClass} | **Move Speed: ** ${this.statBlock.moveSpeed} ft\n\n((NOTE - AC does *not* include Size Bonus, which you can find based on the Pokemon's height and [this chart](https://www.d20pfsrd.com/BASICS-ABILITY-SCORES/GLOSSARY/#Size) ))`,
        },
      ],
      timestamp: new Date(),
      footer: {
        icon_url: avatarURL,
        text: "Chambers and Charizard!",
      },
    },
  };
};

// =========== Upload ===========

Pokemon.prototype.uploadPokemon = function (connection, interaction) {
  let finalMoveList = [this.moveSet.move1,this.moveSet.move2,this.moveSet.move3,this.moveSet.move4,this.moveSet.move5];
  for (i = 0; i < 5; i++) {
      try {
          if (!finalMoveList[i]) {
              finalMoveList[i] = "-"
          } else {
              finalMoveList[i] = finalMoveList[i].move.name;
          }
      } catch (e) {
          finalMoveList[i] = "-";
      }
  }

    let sql = `INSERT INTO pokemon (name, species, form, level, nature, gender, ability, type1, type2, shiny, 
        hp, atk, def, spa, spd, spe, 
        hpIV, atkIV, defIV, spaIV, spdIV, speIV, 
        hpEV, atkEV, defEV, spaEV, spdEV, speEV, exp,
        move1, move2, move3, move4, move5, moveProgress, 
        originalTrainer, discordID, private, dateCreated, campaign) 
        VALUES (
        "${this.name}",
        "${this.species}",
        "${this.form}",
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
        ${this.exp},
        "${finalMoveList[0]}",
        "${finalMoveList[1]}",
        "${finalMoveList[2]}",
        "${finalMoveList[3]}",
        "${finalMoveList[4]}",
        ${this.moveSet.moveProgress},
        "${this.originalTrainer}",
        ${interaction.user.id},
        ${this.private},
        '${this.dateCreated}',
        "${this.campaign}")`
  //console.log(sql);
  logger.info(`[pokemon] upload SQL query: ${sql}`);
  connection.query(sql, function (err, result) {
    if (err) {
      logger.error(err);
      throw err;
    }
    interaction.client.pokemonCacheUpdate();
    console.log("1 record inserted");
    logger.info("[pokemon] upload SQL was successful.")
  });
};

//Instead of uploading a new pokemon, instead updates the existing entry BASED OFF OF POKEMON NAME
//BE CAREFUL
Pokemon.prototype.updatePokemon = function (connection, message, pokePrivate, interaction) {
  if (pokePrivate === null) pokePrivate = false;

  //uses SQL UPDATE to alter the existing entry
  // SQL UPDATE reference: https://www.w3schools.com/sql/sql_update.asp
  let sql = `UPDATE pokemon
        SET 
            name = "${this.name}",
            form = "${this.form}",
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
            exp = ${this.exp},
            friendship = ${this.friendship},

            move1 = "${this.moveSet.move1}",
            move2 = "${this.moveSet.move2}",
            move3 = "${this.moveSet.move3}",
            move4 = "${this.moveSet.move4}",
            move5 = "${this.moveSet.move5}",
            moveProgress = ${this.moveSet.moveProgress},
            private = ${pokePrivate},
            
            campaign = "${this.campaign}"
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
      interaction.client.pokemonCacheUpdate();
      return resolve(result);
    });
  });
};

// =========== Import (Showdown Style) ===========

Pokemon.prototype.importPokemon = function (connection, P, importString) {
  return new Promise((resolve,reject) => {
  logger.info("[pokemon] Importing Pokemon.");
  //splits the message into lines then splits the lines into words separated by spaces.
  let lines = ""
  if (importString.includes("\n")) lines = importString.split("\n");
  else lines = importString.split("   ")
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
        if (nameLineVals.length < 3)
        {
            throw error;
        }
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
  this.form = this.species;
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
    
  if (this.name.match(SQL_SANITATION_REGEX) || this.name.match(SQL_SANITATION_REGEX)){
    logger.error("[modpoke] User tried to put in invalid string input.");
    interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
    reject();
    return;
  }


  let sql = `SELECT * FROM pokemon WHERE name = '${this.name}';`;

  console.log(sql);
  connection.query(sql, function (err, response) {
      if (err) throw err;

      if (response.length != 0) {
          this.name = this.name + ('' + (response.length + 1))

          return this.getPokemonAndSpeciesData(connection, P).then(
            //assign types, base states and then calculate those Stats
            function (response) {
              this.assignTypes();
              this.statBlock.assignBaseStats(this);
              this.statBlock.calculateStats(this);
              this.statBlock.calculateSaves(this);
            }.bind(this)
          );
      }
  }.bind(this))


  
  connection.query(sql, function (err, response) {
    if (err) reject(err);

    if (response.length != 0) {
      resolve(this.name = this.name + ('' + (response.length + 1)))
      }

      resolve()

    })
  }).then(() => { 
    return this.getPokemonAndSpeciesData(connection, P).then(
      //assign types, base states and then calculate those Stats
      function (response) {
        this.assignTypes();
        this.statBlock.assignBaseStats(this);
        this.statBlock.calculateStats(this);
        this.statBlock.calculateSaves(this);
      }.bind(this)
    );
  })

  
};

Pokemon.prototype.getPokemonAndSpeciesData = function (connection, P) {
    console.log("starting getPokemonAndSpeciesData.\n");
    return new Promise(
        function (resolve, reject) {
            let sqlFindPokeForm = `SELECT * FROM pokeForms WHERE species = '${this.species}'`;
            connection.query(sqlFindPokeForm, function (err, response) {
                //Check for all Pokemon Forms from that species
                let found = 0;
                if (response.length > 0) {
                    response.forEach(function (pokeForm, pokeFormIndex) {
                        //console.log(response)
                        if (pokeForm.form.toLowerCase() === this.form.toLowerCase()) {
                            found = 1;
                            //Found the correct form and species in the SQL!
                            console.log("sanity check, adsfjlaseifj lsdkjgjldfkg");
                            console.log(pokeForm);
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
                            this.pokemonData.stats[2].base_stat = pokeForm.defBST;
                            this.pokemonData.stats[3].base_stat = pokeForm.spaBST;
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
                //
                // List Forms, including default
                //
                if (found === 0) {
                    console.log(this);
                    //do we want to display just the species or the form?
                    //this.form = this.species;
                    //F it SCIENCE!
                    if (this.species.toLowerCase() != this.form.toLowerCase()) {
                        P.getPokemonFormByName(this.form.toLowerCase())
                            .then(function (response) {
                               // console.log("In the science block");
                               // console.log(response);
                                this.speciesData = response;
                                let urlparts = response.pokemon.url.split("/");
                                //console.log(urlparts);
                                this.speciesData.id = urlparts[urlparts.length - 2];
                                //console.log(this.speciesData.id);
                                P.getPokemonByName(this.speciesData.id)
                                    .then(
                                        function (response) {
                                           // console.log("Form Retrieved");
                                           // console.log(response);
                                            this.pokemonData = response;
                                            resolve(this.pokemonData);
                                        }.bind(this)
                                    ).catch(function (error) {
                                        console.log("Error when retrieving pokemon form Data :C   ERROR: ", error);
                                        reject("Error when retrieving pokemon form Data :C   ERROR: " + error);
                                    });
                            }.bind(this))
                            .catch(function (error) {
                                console.log("Error in getPokemonFormByName Science block: ", error);
                                reject("Error finding form. Please double check your spelling.");
                            });
                    } else {
                        console.log("Are we here?");
                        P.getPokemonSpeciesByName(this.species.toLowerCase())
                            .then(function (response) {
                                console.log(response.varieties[0]);
                                //need to include a check for the .varieties length, just grabbing the id uses the default form
                                //not quite, how do I know which P call to use from here?
                                this.speciesData = response;
                                P.getPokemonByName(this.speciesData.id)
                                    .then(
                                        function (response) {
                                            console.log("we here? Good.");
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
                                        //interaction.channel.send("Error when retrieving pokemon species Data :C  ERROR: ");
                                    });
                            }.bind(this))
                            .catch(function (error) {
                                if (!error.response) {
                                    console.log("Empty error response detected. Error: " + error);

                                    reject("Unknown Error.");
                                } else {
                                    console.log("Error when retrieving pokemon Data :C  ERROR: ", error.response.statusText);

                                    if (error.response.status === 404) {
                                        let errMsg = "Pokemon not found, please check your spelling."
                                        reject(errMsg)
                                    }
                                //interaction.channel.send("Error when retrieving pokemon Data :C");
                                }
                                
                               
                            });
                    }
                    
                   
                }
            }.bind(this));
        }.bind(this))
}

Pokemon.prototype.loadFromSQL = function (connection, P, sqlObject) {
    return new Promise(
        function (resolve, reject) {
            this.name = sqlObject.name;
            this.species = sqlObject.species;
            this.form = sqlObject.form;

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

                    this.exp = sqlObject.exp;
                    this.friendship = sqlObject.friendship;

                    this.moveSet.move1 = sqlObject.move1;
                    this.moveSet.move2 = sqlObject.move2;
                    this.moveSet.move3 = sqlObject.move3;
                    this.moveSet.move4 = sqlObject.move4;
                    this.moveSet.move5 = sqlObject.move5;
                    this.moveSet.moveProgress = sqlObject.moveProgress;

                    this.originalTrainer = sqlObject.originalTrainer;

                    this.campaign = sqlObject.campaign;

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

                    // calculate stats and saves before re-assigning actual stats
                    this.statBlock.calculateStats(this);
                    this.statBlock.calculateSaves(this);

                    resolve("Stats calculated.");
                }.bind(this)
            )
                .catch(function (error) {
                    logger.error(`[pokemon] Error retrieving pokemon species data: ${error}`)
                    console.log(
                        "Error when retrieving pokemon species Data :C  ERROR: ",
                        error
                    );
                    reject(error);
                    //interaction.channel.send("Error when retrieving pokemon species Data :C  ERROR: ");
                });
        }.bind(this)
    )
        .catch(function (error) {
            console.log("Error when Loading from SQL :C  ERROR: ", error);
            //interaction.channel.send("Error when retrieving pokemon Data :C");
        });
}
