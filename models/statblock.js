const logger = require('../logs/logger.js');

module.exports = Statblock;

const IV_MAX = 32;
const CON_CALC_DIVISOR = 4;
const GOOD_FORT_SAVE = ["grass", "ground", "ice", "poison", "rock", "steel"];
const GOOD_WILL_SAVE = ["bug", "fairy", "dragon", "ghost", "normal", "psychic"];
const GOOD_REFLEX_SAVE = [
  "dark",
  "electric",
  "fighting",
  "fire",
  "flying",
  "water",
];
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
const STAT_ARRAY_MAX = 6;

function Statblock() {
  //stat arrays: HP, ATK, DEF, SPA, SPD, SPE
  this.baseStats = [1, 1, 1, 1, 1, 1];
  //size bonus
  this.sizeBonus = 1;

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
}

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

// ========================= STAT ARRAY GENERATOR!!! =========================

//assign IVs
Statblock.prototype.assignRandIVs = function () {
  logger.info("[statblock] Assigning IVs.")
  for (let i = 0; i < STAT_ARRAY_MAX; i++) {
    this.ivStats[i] = Math.floor(Math.random() * IV_MAX); //assigns a value between 0 & 31 to all the IVs
  }
};

//takes an array of types and assigns Saves
// calculate saving throws - RUN AFTER ABILITY SCORES ARE GENERATED
Statblock.prototype.calculateSaves = function (pokemon) {
  logger.info("[statblock] Calculating saves.")
  //temp values
  tempTypes = [pokemon.type1, pokemon.type2];

  let fortTypeBonus = 0;
  let refTypeBonus = 0;
  let willTypeBonus = 0;

  //check if types match good saves for fort, ref, and will
  tempTypes.forEach((element) => {
    if (element != null) {
      GOOD_FORT_SAVE.forEach((fortType) => {
        if (fortType === element) {
          fortTypeBonus = 2;
        }
      });
      GOOD_REFLEX_SAVE.forEach((refType) => {
        if (refType === element) {
          refTypeBonus = 2;
        }
      });
      GOOD_WILL_SAVE.forEach((willType) => {
        if (willType === element) {
          willTypeBonus = 2;
        }
      });
    }
  });

  //add type/level mod and ability score mod to final save
  this.fortSave =
    Math.floor(0.5 * pokemon.level + fortTypeBonus) + modGen(this.conBase);
  this.refSave =
    Math.floor(0.5 * pokemon.level + refTypeBonus) + modGen(this.dexBase);
  this.willSave =
    Math.floor(0.5 * pokemon.level + willTypeBonus) + modGen(this.wisBase);
};

Statblock.prototype.calculateStats = function (pokemon) {
  logger.info("[statblock] Calculating stats.")
  // start by taking care of Nature
  //pokemon.nature.calculateNatureStats(pokemon);
  //pokemon.Nautre.calculateNatureStats(pokemon)

  //get CON + hit points
  //calculate con +  EQ: [(BaseStats + IVs + (EVs/4)) * .15 +1.5]

  this.conBase = Math.round(
    (this.baseStats[0] + this.ivStats[0] + this.evStats[0] / CON_CALC_DIVISOR) *
    STAT_CALC_MULT +
    STAT_CALC_BASE
  );
  this.conMod = modPrint(this.conBase);

  // OLD HP CALCULATOR
  //calculate = attribute max HP
  //formula for hp... 16 + Conmod, with an additional 2d10 + conmod per level.
  /*let diceRoll = BASE_HP;
  for (let i = 1; i < pokemon.level; i++) {
    diceRoll +=
      Math.floor(Math.random() * DTEN + 1) +
      Math.floor(Math.random() * DTEN + 1) +
      modGen(this.conBase);
  }
  this.finalStats[0] = BASE_HP + (modGen(this.conBase) + diceRoll);*/

  //get all ability scores
  //go through base formula for stat creation
  for (let ii = 1; ii < STAT_ARRAY_MAX; ii++) {
    this.formStats[ii] = Math.floor(
      ((BASE_STAT_MULTIPLIER * this.baseStats[ii] +
        this.ivStats[ii] +
        this.evStats[ii] / EV_MULTIPLIER) *
        pokemon.level) /
      FORM_DIVISOR +
      FORM_SHIFT
    );
    this.finalStats[ii] = Math.floor(this.formStats[ii] * this.nMultiStats[ii]);
  }

  // update hp proper
  this.finalStats[0] = Math.floor(.01 * (2 * this.baseStats[0] + this.ivStats[0] + Math.floor(.25 * this.evStats[0])) * pokemon.level) + pokemon.level + 10;


  //get dnd stats
  //stat calculator
  const getAbility = function (a) {
    return STAT_CALC_MULT * a + STAT_CALC_BASE;
  };

  //strength is based off of attack stat
  this.strBase = Math.round(getAbility(this.finalStats[ATTACK_BST_INDEX]));
  this.strMod = modPrint(this.strBase);

  //int is based off of special attack stat
  this.intBase = Math.round(
    getAbility(this.finalStats[SPECIALATTACK_BST_INDEX])
  );
  this.intMod = modPrint(this.intBase);

  //wis is based off of special defense stat
  this.wisBase = Math.round(
    getAbility(this.finalStats[SPECIALDEFENSE_BST_INDEX])
  );
  this.wisMod = modPrint(this.wisBase);

  //dex is based off of speed stat
  this.dexBase = Math.round(getAbility(this.finalStats[SPEED_BST_INDEX]));
  this.dexMod = modPrint(this.dexBase);

  //get nat armor, ac
  //natArmor is based off defense stat
  this.natArmor =
    NATURAL_ARMOUR_MULT * this.finalStats[DEFENSE_BST_INDEX] -
    NATURAL_ARMOUR_SHIFT;

  //armor class
  //message.channel.send(`Natural Armor: ${natArmor} || Size Bonus: ${sizeBonus} || Dex: ${dexMod}`);
  this.armorClass = (
    AC_BASE +
    this.natArmor +
    this.sizeBonus +
    (this.dexBase - DEX_AC_CALC_BASE) / DEX_AC_CALC_MULT
  ).toFixed(0);

  //get move speed
  this.moveSpeed = (
    MOVE_SPEED_MULT * this.finalStats[SPEED_BST_INDEX] +
    MOVE_SPEED_SHIFT
  ).toFixed(2);
};

Statblock.prototype.assignBaseStats = function (pokemon) {
  logger.info("[statblock] Assigning base stats.")
  let i = 6;
  pokemon.pokemonData["stats"].forEach((element) => {
    this.baseStats[STAT_ARRAY_MAX - i] = element["base_stat"];
    i--;
  });
};
