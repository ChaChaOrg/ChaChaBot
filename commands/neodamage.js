const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;
const CRITICAL_HIT_MULTIPLIER = 1.5;

module.exports.run = (client, connection, P, message, args) => {
    try {
        let attackerName;
        let attackerMove;
        let defenderName;
        let bonusDef = 0;
        let bonusAtk = 0;
        let other = 0;
        let otherMult = 1;
        let critHit = "n";

        //variables required
        let Pokemon = require('../pokemon.js');
        let attackPoke = new Pokemon();
        let defendPoke = new Pokemon();

        let dice = 0;
        let stab = 1;
        let effective = 1;
        let critical = 1;
        args.forEach(function(element, index) {
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
                        bonusDef = args[4]; //Stages Defense
                        break;
                    case 4:
                        bonusAtk = args[3]; //Stages Attack
                        break;
                    case 5:
                        other =  Number(args[5]);
                        break;
                    case 6:
                        otherMult = args[6];
                        break;
                    case 7:
                        critHit = args[7]; //critical hit
                        break;
                }
            }
        });


        //values used for calculation
        let stageModAtk = 0;
        let stageModDef = 0;
        let damageTotal = 0;


        let effectiveString = "";
        let criticalString = "";
        let combatString = "";

        //clause for helping!
        if (args[0].includes('help')) {
            message.reply('Damage Calculator. Variables in order:\n [Attacker (A) Name] [Attacker Move] [Defender (D) Name] [Stages of Attack] [Stages of Defense] [Extra Base Power] [MultDamage (min 1)] [Critical Hit (y/n)]').catch(console.error);
            return;
        }

        let sql = `SELECT * FROM pokemon WHERE name = '${attackerName}' OR name = '${defenderName}';`;

        console.log(sql);

        let loadSQLPromise = [];

        connection.query(sql, function (err, response) {
            if (err) throw err;
            console.log("attacker and defender read");
            console.log(response[0].name);
            console.log(response[1].name);
            response.forEach(element => {
                if (element["name"] === attackerName) loadSQLPromise.push(attackPoke.loadFromSQL(P, element));
                else loadSQLPromise.push(defendPoke.loadFromSQL(P, element));
            });

            Promise.all(loadSQLPromise)
                .then( response => {

                    P.getMoveByName(attackerMove.toLowerCase())
                        .then(moveData => {
                            P.getTypeByName(moveData.type.name)
                                .then(typeData => {
                                    //check if attack or defense are modded by terrain
                                    // attack stages
                                    if (bonusAtk > -1) {
                                        stageModAtk = ((2 + bonusAtk) / 2);
                                    } else {
                                        stageModAtk = (2 / (Math.abs(bonusAtk) + 2));
                                    }
                                    //defense stages
                                    if (bonusDef > -1) {
                                        stageModDef = (2 + bonusDef) / 2;
                                    } else {
                                        stageModDef = (2 / (Math.abs(bonusDef) + 2));
                                    }

                                    let attackerTypes = [attackPoke.type1, attackPoke.type2];
                                    let defenderTypes = [defendPoke.type1, defendPoke.type2];


                                    //Set STAB bonus;
                                    if (attackerTypes[0] === moveData.type.name || attackerTypes[1] === moveData.type.name) {
                                        stab = 1.5;
                                    }

                                    //Calculate Type Effectiveness
                                    typeData.damage_relations.half_damage_to.forEach(typeElement => {
                                        if (typeElement.name === defenderTypes[0] || typeElement.name === defenderTypes[1]) effective = effective * .5;
                                    });

                                    typeData.damage_relations.double_damage_to.forEach(typeElement => {
                                        if (typeElement.name === defenderTypes[0] || typeElement.name === defenderTypes[1]) effective = effective * 2;
                                    });

                                    typeData.damage_relations.no_damage_to.forEach(typeElement => {
                                        if (typeElement.name === defenderTypes[0] || typeElement.name === defenderTypes[1]) effective = 0;
                                    });

                                    if (effective > 1) {
                                        effectiveString = "*It's super effective!*\n";
                                    } else if (effective === 0) {
                                        effectiveString = `*It has no effect on ${defendPoke.name}*\n`;
                                    } else if (effective < 1) {
                                        effectiveString = "*It's not very effective.*\n";
                                    }

                                    //calculate damage dice roll
                                    let numDice = (moveData.power + other) * .2;

                                    for (numDice; numDice > 0; numDice--) {
                                        dice += Math.floor(Math.random() * 8 + 1);
                                    }

                                    //critical hit - done manually, checks first letter only

                                    if ("Y" === critHit.charAt(0).toUpperCase()) {
                                        critical = CRITICAL_HIT_MULTIPLIER;
                                        criticalString = "**A critical hit!**\n";
                                    }

                                    damageTotal = ((10 * attackPoke.level + 10) / 250 * ((attackPoke.statBlock.baseStats[ATK_ARRAY_INDEX] * stageModAtk) / (defendPoke.statBlock.baseStats[DEF_ARRAY_INDEX] * stageModDef)) * dice) * stab * effective * critical * otherMult;
                                    damageTotal = damageTotal.toFixed(2);

                                    combatString = `**${attackerName}** (level ${attackPoke.level} ${attackPoke.species}) used ${moveData.name} on ${defenderName} (level ${defendPoke.level} ${defendPoke.species})\n` +
                                        effectiveString + criticalString +
                                        `${attackerName} deals ${damageTotal} damage to the defending ${defenderName}\n(Base Power: ${moveData.power} - damage roll: ${dice}`;
                                   
                                    // Embed for damage, comment out if necessary /*

                                    //format pokemon names
                                    let atkPokeSpecies_formatted = attackPoke.species.charAt(0).toUpperCase() + attackPoke.species.slice(1);
                                    let defPokeSpecies_formatted = defendPoke.species.charAt(0).toUpperCase() + defendPoke.species.slice(1);
                                   
                                    //format move
                                    let tempMove = moveData.name;
                                    if( ~tempMove.indexOf("-"))
                                    {
                                        let tempA = tempMove.slice(0,tempMove.indexOf("-"));
                                        let tempB = tempMove.slice(tempMove.indexOf("-") + 1, tempMove.length);
                                        tempA = capitalizeWord(tempA);
                                        tempB = capitalizeWord(tempB);
                                        tempMove = tempA + " " + tempB;
                                    }
                                    else tempMove = tempMove.charAt(0).toUpperCase() + tempMove.slice(1);


                                    let combatEmbedString = {
                                        embed: {
                                            color: 3447003,
                                            author: {
                                                name: client.user.username,
                                                icon_url: client.user.avatarURL
                                            },
                                            title: `**${attackerName}** used ${tempMove} on **${defenderName}**!`,
                                            url: `https://bulbapedia.bulbagarden.net/wiki/${tempMove.replace(" ", "")}_(Move)`,
                                            // thumbnail: { url:  `${this.pokemonData.sprites.front_default}`,
                                            description: `${effectiveString}${criticalString}`,

                                            fields: [
                                                {
                                                    name: "Damage Dealt",
                                                    value: `${defenderName} takes ${damageTotal} damage.`
                                                },
                                                {
                                                    name: "Attacker Info",
                                                    value: `**${attackerName}**, Lv ${attackPoke.level} ${atkPokeSpecies_formatted}\n=================`
                                                },
                                                {
                                                    name: "Defender Info",
                                                    value: `**${defenderName}**, Lv ${defendPoke.level} ${defPokeSpecies_formatted}\n=================`
                                                },
                                                {
                                                    name: `${tempMove} Info`,
                                                    value: `**Base Power:** ${moveData.power} pw\n**Damage Roll:** ${dice}\n=================`
                                                },
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                                icon_url: client.user.avatarURL,
                                                text: "Chambers and Charizard!"
                                            }
                                        }
                                    };

                                    // */ comment out embed if necessary

                                    //original message
                                    //message.channel.send(combatString).catch(console.error);

                                    //embed message
                                    message.channel.send(combatEmbedString).catch(console.error);

                                })
                        });
                });
        })
    } catch (error) {
        message.channel.send(error.toString());
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);

    }

};

let capitalizeWord = function (tempWord)
{
    return tempWord.charAt(0). toUpperCase() + tempWord.substr(1);
};