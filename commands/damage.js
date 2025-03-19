const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;
const CRITICAL_HIT_MULTIPLIER = 1.5;
const SAVING_THROW_MULTIPLIER = 0.5;

const SQL_SANITATION_REGEX = /[^a-zA-Z0-9-'_]/;

// help message
const HELP_MESSAGE = "A damage calculator that uses the Pokemon in the database. (★ = required)\n\n" +
  "**Attacker Name ★** \n> The name of the attacker, as listed in the database\n" +
  "**Move Used ★** \n> The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, 'rock-smash'\n" +
  "**Defender Name ★** \n> The name of the pokemon being hit by the attack, as listed in the database\n" +
  "**Stages of Attack** \n> Stages of attack/special attack the attacker has. Minimum -6, maximum +6\n" +
  "**Stages of Defense** \n> Stages of defense/special defense (matching the attack) the defender has. Minimum -6, maximum +6\n" +
  "**Additive Damage Bonus** \n> Extra damage *added* to the base power. Usually done through ChaCha feats. Defaults to 0\n" +
  "**Multiplicative Damage Bonus** \n> Extra damage *multiplying* the base power. Usually done through abilities, such as Rivalry or Technician. Defaults to 1, add .X to multiply (ie 1.5 = Technician Boost)";

// OLD HELP MESSAGE - Damage Calculator. Variables in order:
//  [Attacker (A) Name] [Attacker Move] [Defender (D) Name] [Stages of Attack] [Stages of Defense] [Extra Base Power (min 0)] [MultDamage (min 1)] [Critical Hit (y/n)]

module.exports.data = new SlashCommandBuilder()
  .setName('damage')
  .setDescription('A damage calculator that uses the Pokemon in the database.')
  .addSubcommand(subcommand =>
    subcommand
      .setName('help')
      .setDescription('Tells the user more about the command.')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('battle')
      .setDescription('Simulate a battle between two pokemon.')
      .addStringOption(option =>
        option.setName('attacker-name')
          .setDescription('The name of the attacker, as listed in the database')
          .setRequired(true)
          .setAutocomplete(true))
      .addStringOption(option =>
        option.setName('move-name')
          .setDescription('The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, "rock-smash"')
          .setRequired(true)
          .setAutocomplete(true))
      .addStringOption(option =>
        option.setName('defender-name')
          .setDescription('The name of the pokemon being hit by the attack, as listed in the database')
          .setRequired(true)
          .setAutocomplete(true))
      .addIntegerOption(option =>
        option.setName('stages-of-attack')
          .setDescription('Stages of attack/special attack the attacker has. Minimum -6, maximum +6')
          .setMaxValue(6)
          .setMinValue(-6))
      .addIntegerOption(option =>
        option.setName('stages-of-defense')
          .setDescription('Stages of defense/special defense the attacker has. Minimum -6, maximum +6')
          .setMaxValue(6)
          .setMinValue(-6))
      .addNumberOption(option =>
        option.setName('additive-bonus')
          .setDescription('Extra damage *added* to the base power. Usually done through ChaCha feats. Defaults to 0'))
      .addNumberOption(option =>
        option.setName('multiplicitive-bonus')
          .setDescription('Extra damage *multiplying* the base power. Must be at least 0.001')
          .setMinValue(0.001))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('vstrainer')
      .setDescription('For damaging a human hit by a Pokemon attack.')
      .addStringOption(option =>
        option.setName('attacker-name')
          .setDescription('The name of the attacker, as listed in the database')
          .setRequired(true)
          .setAutocomplete(true))
      .addStringOption(option =>
        option.setName('move-name')
          .setDescription('The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, "rock-smash"')
          .setRequired(true)
          .setAutocomplete(true))
      .addStringOption(option =>
        option.setName('type1')
          .setDescription('Trainers are usually typeless. If they do have a type, add one here.')
          .setRequired(false))
      .addStringOption(option =>
        option.setName('type2')
          .setDescription('Trainers are usually typeless. If they have _two_ types, set the second here.')
          .setRequired(false))
      .addNumberOption(option =>
        option.setName('additive-bonus')
          .setDescription('Extra damage *added* to the base power. Usually done through ChaCha feats. Defaults to 0'))
      .addNumberOption(option =>
        option.setName('multiplicitive-bonus')
          .setDescription('Extra damage *multiplying* the base power. Must be at least 0.001')
          .setMinValue(0.001))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('arceusgift')
      .setDescription('For users of Arceus Gift or other times humans might use a Move against a Pokemon.')
      .addIntegerOption(option =>
        option.setName('basestat')
          .setDescription('The relevant attribute - strength for physical moves, intelligence for special.')
          .setMinValue(0)
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('level')
          .setDescription('The character level of the trainer using the move')
          .setMinValue(1)
          .setRequired(true))
      .addStringOption(option =>
        option.setName('move-name')
          .setDescription('The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, "rock-smash"')
          .setRequired(true)
          .setAutocomplete(true))
      .addStringOption(option =>
        option.setName('defender-name')
          .setDescription('The name of the defending Pokemon, as listed in the database')
          .setRequired(true)
          .setAutocomplete(true))
      .addBooleanOption(option =>
        option.setName('stab')
          .setDescription('Whether the trainer gets STAB for this move. Defaults to false.')
          .setRequired(false))
      .addIntegerOption(option =>
        option.setName('stages-of-attack')
          .setDescription('Stages of attack/special attack the attacker has. Minimum -6, maximum +6')
          .setMaxValue(6)
          .setMinValue(-6))
      .addIntegerOption(option =>
        option.setName('stages-of-defense')
          .setDescription('Stages of defense/special defense the attacker has. Minimum -6, maximum +6')
          .setMaxValue(6)
          .setMinValue(-6))
      .addNumberOption(option =>
        option.setName('additive-bonus')
          .setDescription('Extra damage *added* to the base power. Usually done through ChaCha feats. Defaults to 0'))
      .addNumberOption(option =>
        option.setName('multiplicitive-bonus')
          .setDescription('Extra damage *multiplying* the base power. Must be at least 0.001')
          .setMinValue(0.001))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('arceusgiftvstrainer')
      .setDescription('For damaging a human hit by an Arceus Gift attack.')
      .addIntegerOption(option =>
        option.setName('level')
          .setDescription('The character level of the trainer using the move')
          .setMinValue(1)
          .setRequired(true))
      .addStringOption(option =>
        option.setName('move-name')
          .setDescription('The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, "rock-smash"')
          .setRequired(true)
          .setAutocomplete(true))
      .addIntegerOption(option =>
        option.setName('basestat')
          .setDescription('The relevant attribute - strength for physical moves, intelligence for special.')
          .setMinValue(0)
          .setRequired(true))
      .addBooleanOption(option =>
        option.setName('stab')
          .setDescription('Whether the trainer gets STAB for this move. Defaults to false.'))
      .addStringOption(option =>
        option.setName('type1')
          .setDescription('Add a type (if applicable) to the defending trainer.')
          .setRequired(false))
      .addStringOption(option =>
        option.setName('type2')
          .setDescription('Trainers are usually typeless. If the defending trainer has _two_ types, set the second here.')
          .setRequired(false))
      .addNumberOption(option =>
        option.setName('additive-bonus')
          .setDescription('Extra damage *added* to the base power. Usually done through ChaCha feats. Defaults to 0'))
      .addNumberOption(option =>
        option.setName('multiplicitive-bonus')
          .setDescription('Extra damage *multiplying* the base power. Must be at least 0.001')
          .setMinValue(0.001))
  );

module.exports.autocomplete = async (interaction) => {
  const focusedValue = interaction.options.getFocused(true);
  if (focusedValue.name === 'attacker-name' || focusedValue.name === 'defender-name') {
    var choices = interaction.client.pokemonCache;
    const filtered = choices.filter(choice => (!choice.private || (choice.discordID == interaction.user)) && choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
    await interaction.respond(
      filtered.map(choice => ({ name: choice.name, value: choice.name })),
    )
  } else if (focusedValue.name === 'move-name') {
    var choices = interaction.client.movelist;
    const filtered = choices.filter(choice => choice[1].toLowerCase().startsWith(focusedValue.value.toLowerCase())).slice(0, 24);
    await interaction.respond(
      filtered.map(choice => ({ name: choice[1], value: choice[1].replace(' ', '-').replace('\'', '') })),
    )
  }
};



module.exports.run = async (interaction) => {
  try {


    await interaction.deferReply();

    if (interaction.options.getSubcommand() === 'help') {
      interaction.editReply(HELP_MESSAGE);
      return;
    } else if (interaction.options.getSubcommand() === 'battle') {

      //clause for helping!
      /* if (args[0].includes("help")) {
        logger.info("[damage] Sending help interaction.");
        interaction.reply(HELP_MESSAGE)
          .catch(console.error);
        return;
      }
      
  
      if (args.length < 3) {
        logger.info("[damage] Sending too few parameters interaction.");
        interaction.reply("You haven't provided enough parameters, please try again.").catch(console.error);
        return;
      }
      */
      // DAMAGE
      // args[0] = attacker's name [REQUIRED]
      // args[1] = move name [REQUIRED]
      // args[2] = defender's name [REQUIRED]
      // args[3] = Crit [y/n Defaults to n]
      // args[4] = stages of attack [Defaults to 1]
      // args[5] = stages of defense [Defaults to 1]
      // args[6] = additive damage bonus [Defaults to 0]
      // args[7] = multiplicative damage bonus [Defaults to 1]
      //

      //let args_string = args.slice(0).join(" ")

      let attackerName;
      let attackerMove;
      let defenderName;
      let bonusDef = 0;
      let bonusAtk = 0;
      let other = 0;
      let otherMult = 1;


      //variables required
      let Pokemon = require("../models/pokemon.js");
      let attackPoke = new Pokemon();
      let defendPoke = new Pokemon();

      let dice = 0;
      let stab = 1;
      let effective = 1;
      //
      // Checks if an arg is there, than assigns it. This keeps null values out of the way.
      // This means that if an arg is left off, it will just keep the defaults, but you CAN'T put them out of order.
      //

      attackerName = interaction.options.getString('attacker-name');
      attackerMove = interaction.options.getString('move-name');
      defenderName = interaction.options.getString('defender-name');

      if (attackerName.toLowerCase() === defenderName.toLowerCase()) {
        let errMsg = 'Did you mean to attack yourself? :thinking: You can\'t do that.';
        logger.error(errMsg);
        interaction.followUp(errMsg);
        return;
      }

      if (interaction.options.getInteger('stages-of-attack'))
        bonusAtk = interaction.options.getInteger('stages-of-attack'); //Stages Attack
      if (interaction.options.getInteger('stages-of-defense'))
        bonusDef = interaction.options.getInteger('stages-of-defense'); //Stages Defense    
      if (interaction.options.getNumber('additive-bonus'))
        other = interaction.options.getNumber('additive-bonus');
      if (interaction.options.getNumber('multiplicitive-bonus'))
        otherMult = interaction.options.getNumber('multiplicitive-bonus');


      //values used for calculation
      let stageModAtk = 0;
      let stageModDef = 0;
      let damageTotal = 0;
      let critTotal = 0;

      let effectiveString = "";
      let combatString = "";

      //
      // Grabs the SQL entry for both attacking and defending pokemon.
      //


      let sql = `SELECT * FROM pokemon WHERE name = '${attackerName}' OR name = '${defenderName}';`;
      logger.info(`[damage] SQL query: ${sql}`)
      //console.log(sql);

      let loadSQLPromise = [];

      if (attackerName.match(SQL_SANITATION_REGEX) || defenderName.match(SQL_SANITATION_REGEX)) {
        logger.error("[modpoke] User tried to put in invalid string input.");
        interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
        return;
      }
      interaction.client.mysqlConnection.query(sql, function (err, response) {
        if (err) {
          let errMsg = `Error with SQL query: ${err}`;
          logger.error(errMsg);
          interaction.followUp(errMsg);
          return;
        };

        if (response.length === 0) {
          let errMsg = `Cannot find neither '${attackerName}' nor '${defenderName}'. Please check your spelling + case-sensitivity.`
          logger.error(errMsg);
          interaction.followUp(errMsg);
          return;
        }
        else if (response.length === 1) {
          let foundPokeName = response[0].name;
          let errMsg = '';

          if (foundPokeName === attackerName)
            errMsg = `I found the attacker '${attackerName}' but not the defender. Please check your spelling + case-sensitivity.`
          else if (foundPokeName === defenderName)
            errMsg = `I found the defender '${defenderName}' but not the attacker. Please check your spelling + case-sensitivity.`

          logger.error(errMsg);
          interaction.followUp(errMsg);
          return;
        }

        logger.info('[damage] Attacker: ' + response[0].name + ' retrieved from SQL database.');
        logger.info('[damage] Defender: ' + response[1].name + ' retrieved from SQL database.');

        //
        // Load the found pokemon into pokemon objects, then wait til they both complete before continuing.
        //
        response.forEach((element) => {
          if (element["name"].toLowerCase() === attackerName.toLowerCase())
            loadSQLPromise.push(attackPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, element));
          else loadSQLPromise.push(defendPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, element));
        });

        Promise.all(loadSQLPromise).then((response) => {
          //
          // Now that the pokemon have been found, grab the move information and the relevant type information.
          //
          interaction.client.pokedex.getMoveByName(attackerMove.toLowerCase()).then((moveData) => {
            interaction.client.pokedex.getTypeByName(moveData.type.name).then((typeData) => {

              //
              // parse attack stages into the effect it has on damage.
              //
              if (bonusAtk > -1) {
                stageModAtk = (2 + bonusAtk) / 2;
              } else {
                stageModAtk = 2 / (Math.abs(bonusAtk) + 2);
              }
              //
              // parse defense stages into the effect it has on damage.
              //
              if (bonusDef > -1) {
                stageModDef = (2 + bonusDef) / 2;
              } else {
                stageModDef = 2 / (Math.abs(bonusDef) + 2);
              }
              //
              // Grab each pokemon's types into a temporary object
              //
              let attackerTypes = [attackPoke.type1, attackPoke.type2];
              let defenderTypes = [defendPoke.type1, defendPoke.type2];

              //Set STAB bonus
              //If either of the Pokemon's types are the same as the move, stab is set to 1.5. Other wise it is 1.0
              //
              if (
                attackerTypes[0] === moveData.type.name ||
                attackerTypes[1] === moveData.type.name
              ) {
                stab = 1.5;
              }

              //
              // Calculate Type Effectiveness
              //
              typeData.damage_relations.half_damage_to.forEach((typeElement) => {
                if (
                  // Loops through the "typeData" api object for the types that this move deals half damage to.
                  // It then multiplies the effectiveness accordingly.
                  //
                  typeElement.name === defenderTypes[0] ||
                  typeElement.name === defenderTypes[1]
                )
                  effective = effective * 0.5;
              });

              typeData.damage_relations.double_damage_to.forEach(
                (typeElement) => {
                  if (
                    // Loops through the "typeData" api object for the types that this move deals double damage to.
                    // It then multiplies the effectiveness accordingly.
                    //
                    typeElement.name === defenderTypes[0] ||
                    typeElement.name === defenderTypes[1]
                  )
                    effective = effective * 2;
                }
              );

              typeData.damage_relations.no_damage_to.forEach((typeElement) => {
                if (
                  // Loops through the "typeData" api object for the types that this move deals no damage to.
                  // It then sets the effectiveness accordingly.
                  //
                  typeElement.name === defenderTypes[0] ||
                  typeElement.name === defenderTypes[1]
                )
                  effective = 0;
              });

              //
              // Sets the relevant effectiveness string.
              //
              if (effective > 1) {
                effectiveString = "*It's super effective!*\n";
              } else if (effective === 0) {
                effectiveString = `*It has no effect on ${defendPoke.name}*\n`;
              } else if (effective < 1) {
                effectiveString = "*It's not very effective.*\n";
              }

              //
              // Check for mult-hit move
              //
              let numHits = 1;
              try {
                numHits = moveData.meta.max_hits ?? 1;
              } catch {
                // Catch for any moves that don't have meta (from recent gens)
                numHits = 1;
              };
              let dicePool = new Array(numHits);

              for (let hitNum = 0; hitNum < numHits; hitNum++) {
                dice = 0;
                //
                // calculate damage dice roll
                //

                for (let numDice = Math.floor((moveData.power + other) * 0.2); numDice > 0; numDice--) {
                  dice += Math.floor(Math.random() * 8 + 1);
                }
                dicePool[hitNum] = dice;
              }


              //Checks if the move does physical or special damage.
              // then grabs the relevant stat.
              //
              let tempAttack = 0;
              let tempDefense = 0;

              if (moveData.damage_class.name === "physical") {
                tempAttack = attackPoke.statBlock.finalStats[ATK_ARRAY_INDEX];
                tempDefense = defendPoke.statBlock.finalStats[DEF_ARRAY_INDEX];
              } else {
                tempAttack = attackPoke.statBlock.finalStats[SPA_ARRAY_INDEX];
                tempDefense = defendPoke.statBlock.finalStats[SPD_ARRAY_INDEX];
              }

              //
              // Final damage calculation
              //

              let multiHitString = ``;
              let multiHitTotal = 0;
              let critBonus = 0;
              for (let hitNum = 0; hitNum < numHits; hitNum++) {
                damageTotal =
                  ((10 * attackPoke.level + 10) / 250) *
                  ((tempAttack * stageModAtk) /
                    (tempDefense * stageModDef)) *
                  dicePool[hitNum] *
                  stab *
                  effective *
                  otherMult;

                multiHitTotal += damageTotal;
                damageTotal = damageTotal.toFixed(0);
                critTotal = (damageTotal * CRITICAL_HIT_MULTIPLIER).toFixed(0);
                critBonus = critTotal - damageTotal;
                multiHitString += `Hit #` + (hitNum + 1) + ` -- **` + damageTotal + `** -- (+` + critBonus + `)\n`
                combatString +=
                  `For hit ${hitNum}: \n` +
                  `**${attackerName}** (level ${attackPoke.level} ${attackPoke.species}) used ${moveData.name} on ${defenderName} (level ${defendPoke.level} ${defendPoke.species})\n` +
                  effectiveString +
                  `${attackerName} deals ${damageTotal} damage to the defending ${defenderName}\n(Base Power: ${moveData.power} - damage roll: ${dicePool[hitNum]}\n` +
                  `For a crit, instead ${attackerName} deals ${critTotal} damage to the defending ${defenderName}\n(Base Power: ${moveData.power} - damage roll: ${dicePool[hitNum]}\n`;
              }
              multiHitString += `**Total: ` + multiHitTotal.toFixed(0) + `**`;


              // Embed for damage

              //format pokemon names
              let atkPokeSpecies_formatted =
                attackPoke.form.charAt(0).toUpperCase() +
                attackPoke.form.slice(1);
              let defPokeSpecies_formatted =
                defendPoke.form.charAt(0).toUpperCase() +
                defendPoke.form.slice(1);

              // get # of dice rolled
              let diceRolled = Math.floor(moveData.power / 5);
              diceRolled += "d8";

              //format move
              let tempMove = moveData.name;
              if (~tempMove.indexOf("-")) {
                let tempA = tempMove.slice(0, tempMove.indexOf("-"));
                let tempB = tempMove.slice(
                  tempMove.indexOf("-") + 1,
                  tempMove.length
                );
                tempA = capitalizeWord(tempA);
                tempB = capitalizeWord(tempB);
                tempMove = tempA + " " + tempB;
              } else
                tempMove = tempMove.charAt(0).toUpperCase() + tempMove.slice(1);

              let moveHungerCost = (8 - moveData.pp / 5) + 1;

              let combatEmbedString = {};

              if (numHits > 1) {
                combatEmbedString = {
                  color: 3447003,
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL,
                  },
                  title: `**${attackerName}** used ${tempMove} on **${defenderName}**!`,
                  url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(
                    " ",
                    ""
                  )}_(Move)`,
                  // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
                  description: `${effectiveString}`,

                  fields: [
                    {
                      name: "Damage Dealt",
                      value: `${tempMove} hits ${defenderName} up to ${numHits} times!`,
                    },
                    {
                      name: "HITS -- **DAMAGE** -- (EXTRA DAMAGE IF CRIT)",
                      value: `${multiHitString}`,
                    },
                    {
                      name: "Attacker Info",
                      value: `**${attackerName}**, Lv ${attackPoke.level} ${atkPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: "Defender Info",
                      value: `**${defenderName}**, Lv ${defendPoke.level} ${defPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: `${tempMove} Info`,
                      value: `**Move Info:** ${capitalizeWord(moveData.damage_class.name)} ${capitalizeWord(moveData.type.name)} Attack` +
                        `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dicePool} (${diceRolled} for ${numHits} hits)\n**Hunger Cost:** ${moveHungerCost}`,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    icon_url: interaction.client.user.avatarURL,
                    text: "Chambers and Charizard!",
                  },
                };
              } else {
                combatEmbedString = {
                  color: 3447003,
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL,
                  },
                  title: `**${attackerName}** used ${tempMove} on **${defenderName}**!`,
                  url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(
                    " ",
                    ""
                  )}_(Move)`,
                  // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
                  description: `${effectiveString}`,

                  fields: [
                    {
                      name: "Damage Dealt",
                      value: `${defenderName} takes ${damageTotal} damage.`,
                    },
                    {
                      name: "Critical Hit Damage",
                      value: `${defenderName} takes ${critTotal} damage.`,
                    },
                    {
                      name: "Attacker Info",
                      value: `**${attackerName}**, Lv ${attackPoke.level} ${atkPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: "Defender Info",
                      value: `**${defenderName}**, Lv ${defendPoke.level} ${defPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: `${tempMove} Info`,
                      value: `**Move Info:** ${capitalizeWord(moveData.damage_class.name)} ${capitalizeWord(moveData.type.name)} Attack` +
                        `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dicePool} (${diceRolled} for ${numHits} hit(s))\n**Hunger Cost:** ${moveHungerCost}`,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    icon_url: interaction.client.user.avatarURL,
                    text: "Chambers and Charizard!",
                  },
                };
              }

              // comment out embed if necessary

              //embed message
              logger.info("[damage] Sending combat embed string.");
              interaction.followUp({ embeds: [combatEmbedString] }).catch(console.error);
            }
            );
          }).catch(function (error) {
            if (error.response.status == 404) {
              logger.error("[damage] Move not found. " + error)
              interaction.followUp("Move not found, check your spelling and whether dashes are needed or not!");
              return;
            } else {
              logger.error('[damage] There was an error: ' + error);
              interaction.followUp("Error getting move!");
              return;
            }
          });
        });
      });


    } else if (interaction.options.getSubcommand() === 'vstrainer') {
      let attackerName;
      let attackerMove;
      let other = 0;
      let otherMult = 1;


      //variables required
      let Pokemon = require("../models/pokemon.js");
      let attackPoke = new Pokemon();

      let dice = 0;
      let stab = 1;
      let effective = 1;
      //
      // Checks if an arg is there, than assigns it. This keeps null values out of the way.
      // This means that if an arg is left off, it will just keep the defaults, but you CAN'T put them out of order.
      //

      attackerName = interaction.options.getString('attacker-name');
      attackerMove = interaction.options.getString('move-name');


      if (interaction.options.getNumber('additive-bonus'))
        other = interaction.options.getNumber('additive-bonus');
      if (interaction.options.getNumber('multiplicitive-bonus'))
        otherMult = interaction.options.getNumber('multiplicitive-bonus');


      //values used for calculation
      let damageTotal = 0;
      let critTotal = 0;
      let saveTotal = 0;
      let saveCrit = 0;

      let effectiveString = "";
      let combatString = "";

      //
      // Grabs the SQL entry for both attacking and defending pokemon.
      //


      let sql = `SELECT * FROM pokemon WHERE name = '${attackerName}';`;
      logger.info(`[damage] SQL query: ${sql}`)
      //console.log(sql);

      let loadSQLPromise = [];

      if (attackerName.match(SQL_SANITATION_REGEX)) {
        logger.error("[modpoke] User tried to put in invalid string input.");
        interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
        return;
      }
      interaction.client.mysqlConnection.query(sql, function (err, response) {
        if (err) {
          let errMsg = `Error with SQL query: ${err}`;
          logger.error(errMsg);
          interaction.followUp(errMsg);
          return;
        };

        if (response.length === 0) {
          let errMsg = `Cannot find '${attackerName}'. Please check your spelling + case-sensitivity.`
          logger.error(errMsg);
          interaction.followUp(errMsg);
          return;
        }

        logger.info('[damage] Attacker: ' + response[0].name + ' retrieved from SQL database.');

        //
        // Load the found pokemon into a pokemon object, then wait til it both complete before continuing.
        //

        loadSQLPromise.push(attackPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0]));

        Promise.all(loadSQLPromise).then((response) => {
          //
          // Now that the pokemon has been found, grab the move information and the relevant type information.
          //
          interaction.client.pokedex.getMoveByName(attackerMove.toLowerCase()).then((moveData) => {
            interaction.client.pokedex.getTypeByName(moveData.type.name).then((typeData) => {

              //
              // Grab the pokemon's types into a temporary object, create a type for the trainer
              //
              let attackerTypes = [attackPoke.type1, attackPoke.type2];
              let defenderTypes = [2];
              defenderTypes[0] = interaction.options.getString("type1") ?? '';
              defenderTypes[1] = interaction.options.getString("type2") ?? '';

              //Set STAB bonus
              //If either of the Pokemon's types are the same as the move, stab is set to 1.5. Other wise it is 1.0
              //
              if (
                attackerTypes[0] === moveData.type.name ||
                attackerTypes[1] === moveData.type.name
              ) {
                stab = 1.5;
              }

              //
              // Calculate Type Effectiveness
              //
              typeData.damage_relations.half_damage_to.forEach((typeElement) => {
                if (
                  // Loops through the "typeData" api object for the types that this move deals half damage to.
                  // It then multiplies the effectiveness accordingly.
                  //
                  typeElement.name === defenderTypes[0] ||
                  typeElement.name === defenderTypes[1]
                )
                  effective = effective * 0.5;
              });

              typeData.damage_relations.double_damage_to.forEach(
                (typeElement) => {
                  if (
                    // Loops through the "typeData" api object for the types that this move deals double damage to.
                    // It then multiplies the effectiveness accordingly.
                    //
                    typeElement.name === defenderTypes[0] ||
                    typeElement.name === defenderTypes[1]
                  )
                    effective = effective * 2;
                }
              );

              typeData.damage_relations.no_damage_to.forEach((typeElement) => {
                if (
                  // Loops through the "typeData" api object for the types that this move deals no damage to.
                  // It then sets the effectiveness accordingly.
                  //
                  typeElement.name === defenderTypes[0] ||
                  typeElement.name === defenderTypes[1]
                )
                  effective = 0;
              });

              //
              // Sets the relevant effectiveness string.
              //
              if (effective > 1) {
                effectiveString = "*It's super effective!*\n";
              } else if (effective === 0) {
                effectiveString = `*It has no effect on the trainer.*\n`;
              } else if (effective < 1) {
                effectiveString = "*It's not very effective.*\n";
              }

              //
              // Check for mult-hit move
              //
              let numHits = 1;
              try {
                numHits = moveData.meta.max_hits ?? 1;
              } catch {
                // Catch for any moves that don't have meta (from recent gens)
                numHits = 1;
              };
              let dicePool = new Array(numHits);

              for (let hitNum = 0; hitNum < numHits; hitNum++) {
                dice = 0;
                //
                // calculate damage dice roll
                //

                for (let numDice = Math.floor((moveData.power + other) * 0.2); numDice > 0; numDice--) {
                  dice += Math.floor(Math.random() * 8 + 1);
                }
                dicePool[hitNum] = dice;
              }

              //Attack and defense don't matter for hitting trainers.
              // Calculate Save info instead
              let saveType = "";
              let saveDC = 20;
              saveDC -= (moveData.pp) / 5;

              if (moveData.damage_class.name === "physical") {
                saveType = "Fortitude";
                saveDC += parseInt(attackPoke.statBlock.strMod);
              } else {
                saveType = "Reflex";
                saveDC += parseInt(attackPoke.statBlock.intMod);
              }

              //
              // Final damage calculation
              //

              let multiHitString = ``;
              let multiHitTotal = 0;
              let critBonus = 0;
              for (let hitNum = 0; hitNum < numHits; hitNum++) {
                damageTotal =
                  ((10 * attackPoke.level + 10) / 250) *
                  dicePool[hitNum] *
                  stab *
                  effective *
                  otherMult;

                multiHitTotal += damageTotal;
                damageTotal = damageTotal.toFixed(0);
                critTotal = (damageTotal * CRITICAL_HIT_MULTIPLIER).toFixed(0);
                saveTotal = Math.floor((damageTotal * SAVING_THROW_MULTIPLIER)).toFixed(0);
                saveCrit = Math.floor((damageTotal * CRITICAL_HIT_MULTIPLIER * SAVING_THROW_MULTIPLIER)).toFixed(0);
                critBonus = critTotal - damageTotal;
                multiHitString += `Hit #` + (hitNum + 1) + ` -- **` + damageTotal + `** -- (+` + critBonus + `)\n`
                combatString +=
                  `For hit ${hitNum}: \n` +
                  `**${attackerName}** (level ${attackPoke.level} ${attackPoke.species}) used ${moveData.name} on a trainer\n` +
                  effectiveString +
                  `${attackerName} deals ${damageTotal} damage to the defending trainer, or ${saveTotal} if the trainer passes a DC ${saveDC} ${saveType} save. \n(Base Power: ${moveData.power} - damage roll: ${dicePool[hitNum]}\n` +
                  `For a crit, instead ${attackerName} deals ${critTotal} damage to the defending trainer, or ${saveCrit} if the trainer passes a DC ${saveDC} ${saveType} save.\n(Base Power: ${moveData.power} - damage roll: ${dicePool[hitNum]}\n`;
              }
              multiHitString += `**Total: ` + multiHitTotal.toFixed(0) + `**`;


              // Embed for damage

              //format pokemon names
              let atkPokeSpecies_formatted =
                attackPoke.form.charAt(0).toUpperCase() +
                attackPoke.form.slice(1);

              // get # of dice rolled
              let diceRolled = Math.floor(moveData.power / 5);
              diceRolled += "d8";

              //format move
              let tempMove = moveData.name;
              if (~tempMove.indexOf("-")) {
                let tempA = tempMove.slice(0, tempMove.indexOf("-"));
                let tempB = tempMove.slice(
                  tempMove.indexOf("-") + 1,
                  tempMove.length
                );
                tempA = capitalizeWord(tempA);
                tempB = capitalizeWord(tempB);
                tempMove = tempA + " " + tempB;
              } else
                tempMove = tempMove.charAt(0).toUpperCase() + tempMove.slice(1);

              let moveHungerCost = (8 - moveData.pp / 5) + 1;

              let combatEmbedString = {};

              if (numHits > 1) {
                combatEmbedString = {
                  color: 3447003,
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL,
                  },
                  title: `**${attackerName}** used ${tempMove} on **Trainer**!`,
                  url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(
                    " ",
                    ""
                  )}_(Move)`,
                  // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
                  description: `${effectiveString}`,

                  fields: [
                    {
                      name: "Damage Dealt",
                      value: `${tempMove} hits the trainer up to ${numHits} times!`,
                    },
                    {
                      name: "HITS -- **DAMAGE** -- (EXTRA DAMAGE IF CRIT)",
                      value: `${multiHitString}`,
                    },
                    {
                      name: "Attacker Info",
                      value: `**${attackerName}**, Lv ${attackPoke.level} ${atkPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: "Defender Info",
                      value: `**Trainer**\n=================`,
                    },
                    {
                      name: "Saving Throw",
                      value: `**DC ${saveDC} ${saveType} save**\n=================`,
                    },
                    {
                      name: `${tempMove} Info`,
                      value: `**Move Info:** ${capitalizeWord(moveData.damage_class.name)} ${capitalizeWord(moveData.type.name)} Attack` +
                        `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dicePool} (${diceRolled} for ${numHits} hits)\n**Hunger Cost:** ${moveHungerCost}`,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    icon_url: interaction.client.user.avatarURL,
                    text: "Chambers and Charizard!",
                  },
                };
              } else {
                combatEmbedString = {
                  color: 3447003,
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL,
                  },
                  title: `**${attackerName}** used ${tempMove} on **Trainer**!`,
                  url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(
                    " ",
                    ""
                  )}_(Move)`,
                  // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
                  description: `${effectiveString}`,

                  fields: [
                    {
                      name: "Damage Dealt",
                      value: `Trainer takes ${damageTotal} damage (${saveTotal} if save succeeded).`,
                    },
                    {
                      name: "Critical Hit Damage",
                      value: `Trainer takes ${critTotal} damage (${saveCrit} if save succeeded).`,
                    },
                    {
                      name: "Attacker Info",
                      value: `**${attackerName}**, Lv ${attackPoke.level} ${atkPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: "Defender Info",
                      value: `**Trainer**\n=================`,
                    },
                    {
                      name: "Saving Throw",
                      value: `**DC ${saveDC} ${saveType} save**\n=================`,
                    },
                    {
                      name: `${tempMove} Info`,
                      value: `**Move Info:** ${capitalizeWord(moveData.damage_class.name)} ${capitalizeWord(moveData.type.name)} Attack` +
                        `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dicePool} (${diceRolled} for ${numHits} hit(s))\n**Hunger Cost:** ${moveHungerCost}`,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    icon_url: interaction.client.user.avatarURL,
                    text: "Chambers and Charizard!",
                  },
                };
              }

              // comment out embed if necessary

              //embed message
              logger.info("[damage] Sending combat embed string.");
              interaction.followUp({ embeds: [combatEmbedString] }).catch(console.error);
            }
            );
          }).catch(function (error) {
            if (error.response.status == 404) {
              logger.error("[damage] Move not found. " + error)
              interaction.followUp("Move not found, check your spelling and whether dashes are needed or not!");
              return;
            } else {
              logger.error('[damage] There was an error: ' + error);
              interaction.followUp("Error getting move!");
              return;
            }
          });
        });
      });

    } else if (interaction.options.getSubcommand() === 'arceusgift') {

      let attackerMove;
      let defenderName;
      let bonusDef = 0;
      let bonusAtk = 0;
      let other = 0;
      let otherMult = 1;


      //variables required
      let Pokemon = require("../models/pokemon.js");
      let defendPoke = new Pokemon();

      let dice = 0;
      let stab = 1;
      let effective = 1;
      //
      // Checks if an arg is there, than assigns it. This keeps null values out of the way.
      // This means that if an arg is left off, it will just keep the defaults, but you CAN'T put them out of order.
      //

      attackerName = "Trainer";
      attackerMove = interaction.options.getString('move-name');
      defenderName = interaction.options.getString('defender-name');

      if (interaction.options.getInteger('stages-of-attack'))
        bonusAtk = interaction.options.getInteger('stages-of-attack'); //Stages Attack
      if (interaction.options.getInteger('stages-of-defense'))
        bonusDef = interaction.options.getInteger('stages-of-defense'); //Stages Defense    
      if (interaction.options.getNumber('additive-bonus'))
        other = interaction.options.getNumber('additive-bonus');
      if (interaction.options.getNumber('multiplicitive-bonus'))
        otherMult = interaction.options.getNumber('multiplicitive-bonus');


      //values used for calculation
      let stageModAtk = 0;
      let stageModDef = 0;
      let damageTotal = 0;
      let critTotal = 0;

      let effectiveString = "";
      let combatString = "";

      let level = interaction.options.getInteger('level');

      //
      // Grabs the SQL entry for both attacking and defending pokemon.
      //


      let sql = `SELECT * FROM pokemon WHERE name = '${defenderName}';`;
      logger.info(`[damage] SQL query: ${sql}`)
      //console.log(sql);

      let loadSQLPromise = [];

      if (defenderName.match(SQL_SANITATION_REGEX)) {
        logger.error("[modpoke] User tried to put in invalid string input.");
        interaction.editReply("That is not a valid string input, please keep input alphanumeric, ', - or _");
        return;
      }
      interaction.client.mysqlConnection.query(sql, function (err, response) {
        if (err) {
          let errMsg = `Error with SQL query: ${err}`;
          logger.error(errMsg);
          interaction.followUp(errMsg);
          return;
        };

        if (response.length === 0) {
          let errMsg = `Cannot find '${defenderName}'. Please check your spelling + case-sensitivity.`
          logger.error(errMsg);
          interaction.followUp(errMsg);
          return;
        }

        logger.info('[damage] Defender: ' + response[0].name + ' retrieved from SQL database.');

        //
        // Load the found pokemon into a pokemon object, then wait til then wait to complete
        //

        loadSQLPromise.push(defendPoke.loadFromSQL(interaction.client.mysqlConnection, interaction.client.pokedex, response[0]));

        Promise.all(loadSQLPromise).then((response) => {
          //
          // Now that the pokemon have been found, grab the move information and the relevant type information.
          //
          interaction.client.pokedex.getMoveByName(attackerMove.toLowerCase()).then((moveData) => {
            interaction.client.pokedex.getTypeByName(moveData.type.name).then((typeData) => {

              //
              // parse attack stages into the effect it has on damage.
              //
              if (bonusAtk > -1) {
                stageModAtk = (2 + bonusAtk) / 2;
              } else {
                stageModAtk = 2 / (Math.abs(bonusAtk) + 2);
              }
              //
              // parse defense stages into the effect it has on damage.
              //
              if (bonusDef > -1) {
                stageModDef = (2 + bonusDef) / 2;
              } else {
                stageModDef = 2 / (Math.abs(bonusDef) + 2);
              }
              //
              // Grab each pokemon's types into a temporary object
              //
              let defenderTypes = [defendPoke.type1, defendPoke.type2];

              //Set STAB bonus
              //If either of the Pokemon's types are the same as the move, stab is set to 1.5. Other wise it is 1.0
              //
              if (interaction.options.getBoolean('stab'))
              {
                stab = 1.5;
              }

              //
              // Calculate Type Effectiveness
              //
              typeData.damage_relations.half_damage_to.forEach((typeElement) => {
                if (
                  // Loops through the "typeData" api object for the types that this move deals half damage to.
                  // It then multiplies the effectiveness accordingly.
                  //
                  typeElement.name === defenderTypes[0] ||
                  typeElement.name === defenderTypes[1]
                )
                  effective = effective * 0.5;
              });

              typeData.damage_relations.double_damage_to.forEach(
                (typeElement) => {
                  if (
                    // Loops through the "typeData" api object for the types that this move deals double damage to.
                    // It then multiplies the effectiveness accordingly.
                    //
                    typeElement.name === defenderTypes[0] ||
                    typeElement.name === defenderTypes[1]
                  )
                    effective = effective * 2;
                }
              );

              typeData.damage_relations.no_damage_to.forEach((typeElement) => {
                if (
                  // Loops through the "typeData" api object for the types that this move deals no damage to.
                  // It then sets the effectiveness accordingly.
                  //
                  typeElement.name === defenderTypes[0] ||
                  typeElement.name === defenderTypes[1]
                )
                  effective = 0;
              });

              //
              // Sets the relevant effectiveness string.
              //
              if (effective > 1) {
                effectiveString = "*It's super effective!*\n";
              } else if (effective === 0) {
                effectiveString = `*It has no effect on ${defendPoke.name}*\n`;
              } else if (effective < 1) {
                effectiveString = "*It's not very effective.*\n";
              }

              //
              // Check for mult-hit move
              //
              let numHits = 1;
              try {
                numHits = moveData.meta.max_hits ?? 1;
              } catch {
                // Catch for any moves that don't have meta (from recent gens)
                numHits = 1;
              };
              let dicePool = new Array(numHits);

              for (let hitNum = 0; hitNum < numHits; hitNum++) {
                dice = 0;
                //
                // calculate damage dice roll
                //

                for (let numDice = Math.floor((moveData.power + other) * 0.2); numDice > 0; numDice--) {
                  dice += Math.floor(Math.random() * 8 + 1);
                }
                dicePool[hitNum] = dice;
              }

              //Checks if the move does physical or special damage.
              // then grabs the relevant stat.
              //
              let tempAttack = 0;
              let tempDefense = 0;

              tempAttack = interaction.options.getInteger('basestat');
              tempAttack = Math.floor((tempAttack-1.5) * (20/3));

              if (moveData.damage_class.name === "physical") {
                tempDefense = defendPoke.statBlock.finalStats[DEF_ARRAY_INDEX];
              } else {
                tempDefense = defendPoke.statBlock.finalStats[SPD_ARRAY_INDEX];
              }

              //
              // Final damage calculation
              //

              let multiHitString = ``;
              let multiHitTotal = 0;
              let critBonus = 0;
              for (let hitNum = 0; hitNum < numHits; hitNum++) {
                damageTotal =
                  ((10 * level + 10) / 250) *
                  ((tempAttack * stageModAtk) /
                    (tempDefense * stageModDef)) *
                  dicePool[hitNum] *
                  stab *
                  effective *
                  otherMult;

                multiHitTotal += damageTotal;
                damageTotal = damageTotal.toFixed(0);
                critTotal = (damageTotal * CRITICAL_HIT_MULTIPLIER).toFixed(0);
                critBonus = critTotal - damageTotal;
                multiHitString += `Hit #` + (hitNum + 1) + ` -- **` + damageTotal + `** -- (+` + critBonus + `)\n`
                combatString +=
                  `For hit ${hitNum}: \n` +
                  `**$Trainer** (level ${level}) used ${moveData.name} on ${defenderName} (level ${defendPoke.level} ${defendPoke.species})\n` +
                  effectiveString +
                  `Trainer deals ${damageTotal} damage to the defending ${defenderName}\n(Base Power: ${moveData.power} - damage roll: ${dicePool[hitNum]}\n` +
                  `For a crit, instead Trainer deals ${critTotal} damage to the defending ${defenderName}\n(Base Power: ${moveData.power} - damage roll: ${dicePool[hitNum]}\n`;
              }
              multiHitString += `**Total: ` + multiHitTotal.toFixed(0) + `**`;


              // Embed for damage

              //format pokemon names
              let atkPokeSpecies_formatted =
                "Trainer";
              let defPokeSpecies_formatted =
                defendPoke.form.charAt(0).toUpperCase() +
                defendPoke.form.slice(1);

              // get # of dice rolled
              let diceRolled = Math.floor(moveData.power / 5);
              diceRolled += "d8";

              //format move
              let tempMove = moveData.name;
              if (~tempMove.indexOf("-")) {
                let tempA = tempMove.slice(0, tempMove.indexOf("-"));
                let tempB = tempMove.slice(
                  tempMove.indexOf("-") + 1,
                  tempMove.length
                );
                tempA = capitalizeWord(tempA);
                tempB = capitalizeWord(tempB);
                tempMove = tempA + " " + tempB;
              } else
                tempMove = tempMove.charAt(0).toUpperCase() + tempMove.slice(1);

              let moveHungerCost = (8 - moveData.pp / 5) + 1;

              let combatEmbedString = {};

              if (numHits > 1) {
                combatEmbedString = {
                  color: 3447003,
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL,
                  },
                  title: `**Trainer** used ${tempMove} on **${defenderName}**!`,
                  url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(
                    " ",
                    ""
                  )}_(Move)`,
                  // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
                  description: `${effectiveString}`,

                  fields: [
                    {
                      name: "Damage Dealt",
                      value: `${tempMove} hits ${defenderName} up to ${numHits} times!`,
                    },
                    {
                      name: "HITS -- **DAMAGE** -- (EXTRA DAMAGE IF CRIT)",
                      value: `${multiHitString}`,
                    },
                    {
                      name: "Attacker Info",
                      value: `**Trainer**, Lv ${level} ${atkPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: "Defender Info",
                      value: `**${defenderName}**, Lv ${defendPoke.level} ${defPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: `${tempMove} Info`,
                      value: `**Move Info:** ${capitalizeWord(moveData.damage_class.name)} ${capitalizeWord(moveData.type.name)} Attack` +
                        `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dicePool} (${diceRolled} for ${numHits} hits)\n**Hunger Cost:** ${moveHungerCost}`,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    icon_url: interaction.client.user.avatarURL,
                    text: "Chambers and Charizard!",
                  },
                };
              } else {
                combatEmbedString = {
                  color: 3447003,
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL,
                  },
                  title: `**Trainer** used ${tempMove} on **${defenderName}**!`,
                  url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(
                    " ",
                    ""
                  )}_(Move)`,
                  // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
                  description: `${effectiveString}`,

                  fields: [
                    {
                      name: "Damage Dealt",
                      value: `${defenderName} takes ${damageTotal} damage.`,
                    },
                    {
                      name: "Critical Hit Damage",
                      value: `${defenderName} takes ${critTotal} damage.`,
                    },
                    {
                      name: "Attacker Info",
                      value: `**Trainer**, Lv ${level} ${atkPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: "Defender Info",
                      value: `**${defenderName}**, Lv ${defendPoke.level} ${defPokeSpecies_formatted}\n=================`,
                    },
                    {
                      name: `${tempMove} Info`,
                      value: `**Move Info:** ${capitalizeWord(moveData.damage_class.name)} ${capitalizeWord(moveData.type.name)} Attack` +
                        `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dicePool} (${diceRolled} for ${numHits} hit(s))\n**Hunger Cost:** ${moveHungerCost}`,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    icon_url: interaction.client.user.avatarURL,
                    text: "Chambers and Charizard!",
                  },
                };
              }

              // comment out embed if necessary

              //embed message
              logger.info("[damage] Sending combat embed string.");
              interaction.followUp({ embeds: [combatEmbedString] }).catch(console.error);
            }
            );
          }).catch(function (error) {
            if (error.response.status == 404) {
              logger.error("[damage] Move not found. " + error)
              interaction.followUp("Move not found, check your spelling and whether dashes are needed or not!");
              return;
            } else {
              logger.error('[damage] There was an error: ' + error);
              interaction.followUp("Error getting move!");
              return;
            }
          });
        });
      });


    } else if (interaction.options.getSubcommand() === 'arceusgiftvstrainer') {

      let attackerMove;
      let other = 0;
      let otherMult = 1;


      let dice = 0;
      let stab = 1;
      let effective = 1;
      //
      // Checks if an arg is there, than assigns it. This keeps null values out of the way.
      // This means that if an arg is left off, it will just keep the defaults, but you CAN'T put them out of order.
      //

      attackerName = "Attacking Trainer";
      attackerMove = interaction.options.getString('move-name');

      if (interaction.options.getNumber('additive-bonus'))
        other = interaction.options.getNumber('additive-bonus');
      if (interaction.options.getNumber('multiplicitive-bonus'))
        otherMult = interaction.options.getNumber('multiplicitive-bonus');


      //values used for calculation
      let damageTotal = 0;
      let critTotal = 0;
      let saveTotal = 0;
      let saveCrit = 0;

      let effectiveString = "";
      let combatString = "";

      let level = interaction.options.getInteger('level');


      //
      // Grab the move information and the relevant type information.
      //
      interaction.client.pokedex.getMoveByName(attackerMove.toLowerCase()).then((moveData) => {
        interaction.client.pokedex.getTypeByName(moveData.type.name).then((typeData) => {

          //
          // Grab defender's types into a temporary object
          //
          let defenderTypes = [interaction.options.getString("type1"), interaction.options.getString("type2")];

          //Set STAB bonus
          //If either of the Pokemon's types are the same as the move, stab is set to 1.5. Other wise it is 1.0
          //
          if (interaction.options.getBoolean('stab')) {
            stab = 1.5;
          }

          //
          // Calculate Type Effectiveness
          //
          typeData.damage_relations.half_damage_to.forEach((typeElement) => {
            if (
              // Loops through the "typeData" api object for the types that this move deals half damage to.
              // It then multiplies the effectiveness accordingly.
              //
              typeElement.name === defenderTypes[0] ||
              typeElement.name === defenderTypes[1]
            )
              effective = effective * 0.5;
          });

          typeData.damage_relations.double_damage_to.forEach(
            (typeElement) => {
              if (
                // Loops through the "typeData" api object for the types that this move deals double damage to.
                // It then multiplies the effectiveness accordingly.
                //
                typeElement.name === defenderTypes[0] ||
                typeElement.name === defenderTypes[1]
              )
                effective = effective * 2;
            }
          );

          typeData.damage_relations.no_damage_to.forEach((typeElement) => {
            if (
              // Loops through the "typeData" api object for the types that this move deals no damage to.
              // It then sets the effectiveness accordingly.
              //
              typeElement.name === defenderTypes[0] ||
              typeElement.name === defenderTypes[1]
            )
              effective = 0;
          });

          //
          // Sets the relevant effectiveness string.
          //
          if (effective > 1) {
            effectiveString = "*It's super effective!*\n";
          } else if (effective === 0) {
            effectiveString = `*It has no effect on the defending trainer.*\n`;
          } else if (effective < 1) {
            effectiveString = "*It's not very effective.*\n";
          }

          //
          // Check for mult-hit move
          //
          let numHits = 1;
          try {
            numHits = moveData.meta.max_hits ?? 1;
          } catch {
            // Catch for any moves that don't have meta (from recent gens)
            numHits = 1;
          };
          let dicePool = new Array(numHits);

          for (let hitNum = 0; hitNum < numHits; hitNum++) {
            dice = 0;
            //
            // calculate damage dice roll
            //

            for (let numDice = Math.floor((moveData.power + other) * 0.2); numDice > 0; numDice--) {
              dice += Math.floor(Math.random() * 8 + 1);
            }
            dicePool[hitNum] = dice;
          }
          //Attack and defense don't matter for hitting trainers.
          // Calculate Save info instead
          let saveType = "";
          let saveDC = 20;
          saveDC -= (moveData.pp) / 5;
          saveDC += Math.floor((interaction.options.getInteger('basestat') - 10) / 2);

          if (moveData.damage_class.name === "physical") {
            saveType = "Fortitude";
          } else {
            saveType = "Reflex";
          }

          //
          // Final damage calculation
          //

          let multiHitString = ``;
          let multiHitTotal = 0;
          let critBonus = 0;
          for (let hitNum = 0; hitNum < numHits; hitNum++) {
            damageTotal =
              ((10 * level + 10) / 250) *
              dicePool[hitNum] *
              stab *
              effective *
              otherMult;

            multiHitTotal += damageTotal;
            damageTotal = damageTotal.toFixed(0);
            critTotal = (damageTotal * CRITICAL_HIT_MULTIPLIER).toFixed(0);
            saveTotal = Math.floor((damageTotal * SAVING_THROW_MULTIPLIER)).toFixed(0);
            saveCrit = Math.floor((damageTotal * CRITICAL_HIT_MULTIPLIER * SAVING_THROW_MULTIPLIER)).toFixed(0);
            critBonus = critTotal - damageTotal;
            multiHitString += `Hit #` + (hitNum + 1) + ` -- **` + damageTotal + `** -- (+` + critBonus + `)\n`
            combatString +=
              `For hit ${hitNum}: \n` +
              `Attacking Trainer (level ${level}) used ${moveData.name} on Defending Trainer\n` +
              effectiveString +
              `Attacking Trainer deals ${damageTotal} damage to the defending trainer, or ${saveTotal} if the defending trainer passes a DC ${saveDC} ${saveType} save.\n(Base Power: ${moveData.power} - damage roll: ${dicePool[hitNum]}\n` +
              `For a crit, instead Trainer deals ${critTotal} damage to the defending trainer, or ${saveCrit} if the defending trainer passes a DC ${saveDC} ${saveType} save.\n(Base Power: ${moveData.power} - damage roll: ${dicePool[hitNum]}\n`;
          }
          multiHitString += `**Total: ` + multiHitTotal.toFixed(0) + `**`;


          // Embed for damage

          //format pokemon names
          let atkPokeSpecies_formatted =
            "Trainer";
          let defPokeSpecies_formatted =
            "Trainer";

          // get # of dice rolled
          let diceRolled = Math.floor(moveData.power / 5);
          diceRolled += "d8";

          //format move
          let tempMove = moveData.name;
          if (~tempMove.indexOf("-")) {
            let tempA = tempMove.slice(0, tempMove.indexOf("-"));
            let tempB = tempMove.slice(
              tempMove.indexOf("-") + 1,
              tempMove.length
            );
            tempA = capitalizeWord(tempA);
            tempB = capitalizeWord(tempB);
            tempMove = tempA + " " + tempB;
          } else
            tempMove = tempMove.charAt(0).toUpperCase() + tempMove.slice(1);

          let moveHungerCost = (8 - moveData.pp / 5) + 1;

          let combatEmbedString = {};

          if (numHits > 1) {
            combatEmbedString = {
              color: 3447003,
              author: {
                name: interaction.user.username,
                icon_url: interaction.user.avatarURL,
              },
              title: `**Attacking Trainer** used ${tempMove} on **Defending Trainer**!`,
              url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(
                " ",
                ""
              )}_(Move)`,
              // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
              description: `${effectiveString}`,

              fields: [
                {
                  name: "Damage Dealt",
                  value: `${tempMove} hits Defending Trainer up to ${numHits} times!`,
                },
                {
                  name: "HITS -- **DAMAGE** -- (EXTRA DAMAGE IF CRIT)",
                  value: `${multiHitString}`,
                },
                {
                  name: "Attacker Info",
                  value: `**Attacking Trainer**, Lv ${level} ${atkPokeSpecies_formatted}\n=================`,
                },
                {
                  name: "Defender Info",
                  value: `**Defending Trainer**\n=================`,
                },
                {
                  name: "Saving Throw",
                  value: `**DC ${saveDC} ${saveType} save**\n=================`,
                },
                {
                  name: `${tempMove} Info`,
                  value: `**Move Info:** ${capitalizeWord(moveData.damage_class.name)} ${capitalizeWord(moveData.type.name)} Attack` +
                    `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dicePool} (${diceRolled} for ${numHits} hits)\n**Hunger Cost:** ${moveHungerCost}`,
                },
              ],
              timestamp: new Date(),
              footer: {
                icon_url: interaction.client.user.avatarURL,
                text: "Chambers and Charizard!",
              },
            };
          } else {
            combatEmbedString = {
              color: 3447003,
              author: {
                name: interaction.user.username,
                icon_url: interaction.user.avatarURL,
              },
              title: `**Attacking Trainer** used ${tempMove} on **Defending Trainer**!`,
              url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(
                " ",
                ""
              )}_(Move)`,
              // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
              description: `${effectiveString}`,

              fields: [
                {
                  name: "Damage Dealt",
                  value: `Defending Trainer takes ${damageTotal} damage. (${saveTotal} if the save succeeded.)`,
                },
                {
                  name: "Critical Hit Damage",
                  value: `Defending Trainer takes ${critTotal} damage (${saveCrit} if save succeeded).`,
                },
                {
                  name: "Attacker Info",
                  value: `**Attacking Trainer**, Lv ${level} Trainer\n=================`,
                },
                {
                  name: "Defender Info",
                  value: `**Defending Trainer**\n=================`,
                },
                {
                  name: "Saving Throw",
                  value: `**DC ${saveDC} ${saveType} save**\n=================`,
                },
                {
                  name: `${tempMove} Info`,
                  value: `**Move Info:** ${capitalizeWord(moveData.damage_class.name)} ${capitalizeWord(moveData.type.name)} Attack` +
                    `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dicePool} (${diceRolled} for ${numHits} hit(s))\n**Hunger Cost:** ${moveHungerCost}`,
                },
              ],
              timestamp: new Date(),
              footer: {
                icon_url: interaction.client.user.avatarURL,
                text: "Chambers and Charizard!",
              },
            };
          }

          // comment out embed if necessary

          //embed message
          logger.info("[damage] Sending combat embed string.");
          interaction.followUp({ embeds: [combatEmbedString] }).catch(console.error);
        }
        );
      }).catch(function (error) {
        if (error.response.status == 404) {
          logger.error("[damage] Move not found. " + error)
          interaction.followUp("Move not found, check your spelling and whether dashes are needed or not!");
          return;
        } else {
          logger.error('[damage] There was an error: ' + error);
          interaction.followUp("Error getting move!");
          return;
        }
      });

    }
    
  } catch (error) {
    logger.error(error);
    interaction.channel.send(error.toString());
    interaction.channel
      .send("ChaCha machine :b:roke, please try again later")
      .catch(console.error);
  }
}

let capitalizeWord = function (tempWord) {
  return tempWord.charAt(0).toUpperCase() + tempWord.substr(1);
};
