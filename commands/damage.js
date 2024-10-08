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

const SQL_SANITATION_REGEX = /[^a-zA-Z0-9-'_]/;

// help message
const HELP_MESSAGE = "A damage calculator that uses the Pokemon in the database. (★ = required)\n\n" +
  "**Attacker Name ★** \n> The name of the attacker, as listed in the database\n" +
  "**Move Used ★** \n> The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, 'rock-smash'\n" +
  "**Defender Name ★** \n> The name of the pokemon being hit by the attack, as listed in the database\n" +
  "**Critical Hit** \n> If the attacker struck a critical hit, as 'y' for yes and 'n' for no. Defaults to no. A critical hit multiplies the total damage done by 1.5\n" +
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
      .addBooleanOption(option =>
        option.setName('critical-hit')
          .setDescription('If the attacker struck a critical hit Defaults to no.'))
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
          .setDescription('Extra damage *multiplying* the base power.')
          .setMinValue(0))
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
    }

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

    var critHit;


    //variables required
    let Pokemon = require("../models/pokemon.js");
    let attackPoke = new Pokemon();
    let defendPoke = new Pokemon();

    let dice = 0;
    let stab = 1;
    let effective = 1;
    let critical = 1;
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

    if (interaction.options.getBoolean('critical-hit'))
      critHit = true; //critical hit
    else
      critHit = false;

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
    let criticalString = "";
    let combatString = "";

    //
    // Grabs the SQL entry for both attacking and defending pokemon.
    //


    let sql = `SELECT * FROM pokemon WHERE name = '${attackerName}' OR name = '${defenderName}';`;
    logger.info(`[damage] SQL query: ${sql}`)
    //console.log(sql);

    let loadSQLPromise = [];

    if (attackerName.match(SQL_SANITATION_REGEX) || defenderName.match(SQL_SANITATION_REGEX)){
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
            try{
              numHits = moveData.meta.max_hits ?? 1;
            }catch{
              // Catch for any mvoes that don't have meta (from recent gens)
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

            //critical hit - done manually, checks first letter only

            if (critHit) {
              critical = CRITICAL_HIT_MULTIPLIER;
              criticalString = "**A critical hit!**\n";
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

            if (numHits > 1){
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
              description: `${effectiveString}${criticalString}`,

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
          }else{
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
              description: `${effectiveString}${criticalString}`,

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
