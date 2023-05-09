const logger = require('../logs/logger.js');

const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;
const CRITICAL_HIT_MULTIPLIER = 1.5;

// help message
const HELP_MESSAGE = "A damage calculator that uses the Pokemon in the database. (★ = required)\n\n" +
  "`+neodamage [Attacker Name★] [Move Used (with dashes for spaces)★] [Defender Name★] [Critical Hit (y/n)] [Stages of Attack] [Stages of Defense] [Additive Damage Bonus] [Multiplicative Damage Bonus]`\n\n" +
  "**Attacker Name★** The name of the attacker, as listed in the database\n" +
  "**Move Used★** The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, 'rock-smash'\n" +
  "**Defender Name★** The name of the pokemon being hit by the attack, as listed in the database\n" +
  "**Critical Hit** If the attacker struck a critical hit, as 'y' for yes and 'n' for no. Defaults to no. A critical hit multiplies the total damage done by 1.5\n" +
  "**Stages of Attack** Stages of attack/special attack the attacker has. Minimum -6, maximum +6\n" +
  "**Stages of Defense** Stages of defense/special defense (matching the attack) the defender has. Minimum -6, maximum +6\n" +
  "**Additive Damage Bonus** Extra damage *added* to the base power. Usually done through ChaCha feats. Defaults to 0\n" +
  "**Multiplicative Damage Bonus** Extra damage *multiplying* the base power. Usually done through abilities, such as Rivalry or Technician. Defaults to 1, add .X to multiply (ie 1.5 = Technician Boost)";

// OLD HELP MESSAGE - Damage Calculator. Variables in order:
//  [Attacker (A) Name] [Attacker Move] [Defender (D) Name] [Stages of Attack] [Stages of Defense] [Extra Base Power (min 0)] [MultDamage (min 1)] [Critical Hit (y/n)]

module.exports.run = (client, connection, P, message, args) => {
  try {

    //clause for helping!
    if (args[0].includes("help")) {
      logger.info("[damage] Sending help message.");
      message.reply(HELP_MESSAGE)
        .catch(console.error);
      return;
    }

    if (args.length < 3) {
      logger.info("[damage] Sending too few parameters message.");
      message.reply("You haven't provided enough parameters, please try again.").catch(console.error);
      return;
    }

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

    let args_string = args.slice(0).join(" ")

    let attackerName;
    let attackerMove;
    let defenderName;
    let bonusDef = 0;
    let bonusAtk = 0;
    let other = 0;
    let otherMult = 1;

    var critHit;
    let critHit_regex = /(-ch \d+)|(-critical(\s|-|_)?hit \d+)/
    let critHit_match = critHit_regex.exec(args_string);
    if (critHit_match)
      critHit = critHit[0].split(" ")[1]
    else
      critHit = "n"


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
    args.forEach(function (element, index) {
      if (element !== null) {
        switch (index) {
          case 0:
            attackerName = args[0];
            break;
          case 1:
            attackerMove = args[1];
            break;
          case 2:
            defenderName = args[2];
            break;
          case 3:
            if (args[3])
              critHit = args[3]; //critical hit
            else
              critHit = 'n'
            break;
          case 4:
            bonusAtk = Number(args[4]); //Stages Attack
            break;
          case 5:
            bonusDef = Number(args[5]); //Stages Defense
            break;
          case 6:
            other = Number(args[6]);
            break;
          case 7:
            otherMult = Number(args[7]);
            break;

        }
      }
      else if (index < 3) throw Error(`ARG at ${index} not found! Check your input`);
    });

    //values used for calculation
    let stageModAtk = 0;
    let stageModDef = 0;
    let damageTotal = 0;

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

    /* istanbul ignore next */
    connection.query(sql, function (err, response) {
      if (err) {
        let errMsg = `Error with SQL query: ${err}`;
        logger.error(errMsg);
        message.reply(errMsg);
        return;
      };

      if (response.length === 0) {
        let errMsg = `Cannot find neither '${attackerName}' nor '${defenderName}'. Please check your spelling + case-sensitivity.`
        logger.error(errMsg);
        message.reply(errMsg);
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
        message.reply(errMsg);
        return;
      }

      logger.info('[damage] Attacker: ' + response[0].name + ' retrieved from SQL database.');
      logger.info('[damage] Defender: ' + response[1].name + ' retrieved from SQL database.');

      //
      // Load the found pokemon into pokemon objects, then wait til they both complete before continuing.
      //
      response.forEach((element) => {
        if (element["name"].toLowerCase() === attackerName.toLowerCase())
          loadSQLPromise.push(attackPoke.loadFromSQL(connection, P, element));
        else loadSQLPromise.push(defendPoke.loadFromSQL(connection, P, element));
      });

      Promise.all(loadSQLPromise).then((response) => {
        //
        // Now that the pokemon have been found, grab the move information and the relevant type information.
        //
        P.getMoveByName(attackerMove.toLowerCase()).then((moveData) => {
          P.getTypeByName(moveData.type.name).then((typeData) => {

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
            // calculate damage dice roll
            //
            let numDice = (moveData.power + other) * 0.2;

            for (numDice; numDice > 0; numDice--) {
              dice += Math.floor(Math.random() * 8 + 1);
            }

            //critical hit - done manually, checks first letter only

            if ("Y" === critHit.charAt(0).toUpperCase()) {
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

            damageTotal =
              ((10 * attackPoke.level + 10) / 250) *
              ((tempAttack *
                stageModAtk) /
                (tempDefense *
                  stageModDef)) *
              dice *
              stab *
              effective *
              critical *
              otherMult;

            damageTotal = damageTotal.toFixed(2);

            combatString =
              `**${attackerName}** (level ${attackPoke.level} ${attackPoke.species}) used ${moveData.name} on ${defenderName} (level ${defendPoke.level} ${defendPoke.species})\n` +
              effectiveString +
              criticalString +
              `${attackerName} deals ${damageTotal} damage to the defending ${defenderName}\n(Base Power: ${moveData.power} - damage roll: ${dice}`;

            // Embed for damage

            //format pokemon names
            let atkPokeSpecies_formatted =
              attackPoke.form.charAt(0).toUpperCase() +
              attackPoke.form.slice(1);
            let defPokeSpecies_formatted =
              defendPoke.form.charAt(0).toUpperCase() +
              defendPoke.form.slice(1);

            // get # of dice rolled
            let diceRolled = moveData.power / 5;
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
            
            let combatEmbedString = {
              embed: {
                color: 3447003,
                author: {
                  name: client.user.username,
                  icon_url: client.user.avatarURL,
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
                        `\n**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dice} (${diceRolled})\n**Hunger Cost:** ${moveHungerCost}`,
                  },
                ],
                timestamp: new Date(),
                footer: {
                  icon_url: client.user.avatarURL,
                  text: "Chambers and Charizard!",
                },
              },
            };

            // comment out embed if necessary

            //embed message
            logger.info("[damage] Sending combat embed string.");
            message.channel.send(combatEmbedString).catch(console.error);
          });
        }).catch(function (error) {
          if (error.response.status == 404) {
            logger.error("[damage] Move not found. " + error)
            message.reply("Move not found, check your spelling and whether dashes are needed or not!");
            return;
          } else {
            logger.error('[damage] There was an error: ' + error);
            message.reply("Error getting move!");
            return;
          }
        });
      });
    });
  } catch (error) {
    logger.error(error);
    message.channel.send(error.toString());
    message.channel
      .send("ChaCha machine :b:roke, please try again later")
      .catch(console.error);
  }
};

let capitalizeWord = function (tempWord) {
  return tempWord.charAt(0).toUpperCase() + tempWord.substr(1);
};
