const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;

module.exports.run = (client, connection, P, message, args) => {
    try {
        //variables required
        let attackerName = args[0];
        let attackerMove = args[1];
        let defenderName = args[2];
        let Pokemon = require('../pokemon.js');
        let attackPoke = new Pokemon();
        let defendPoke = new Pokemon();

        let level;
        let attack;
        let defense;
        let dice;
        let stab;
        let effective;
        let critical = args[3];
        let other = args[6];
        let bonusAtk = args[4]; //Stages Attack
        let bonusDef = args[5];
        let otherMult = args[6];

        //values used for calculation
        let stageModAtk = 0;
        let stageModDef = 0;
        let damageTotal = 0;


        let effectiveString = "";
        let criticalString = "";
        let combatString = "";

        //clause for helping!
        if (attackName.includes('help')) {
            message.reply('Damage Calculator. Variables in order:\n [Attacker (A) Name] [Attacker Move] [Defender (D) Name] [Stages of Attack] [Stages of Defense] [Extra Base Power] [MultDamage]').catch(console.error);
            return;
        }

        let sql = 'SELECT * FROM pokemon WHERE name = `${attackerName}` OR name = `${defenderName}`;';

        console.log(sql);
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log("attacker and defender read");
        }).then(function (response) {
            response.forEach(element => {
                if (element.name() === attackerName) attackPoke.loadFromSQL(element);
                else defendPoke.loadFromSQL(element);
            });

            P.getMoveByName(attackerMove.toLowerCase())
                .then(moveData => {
                    P.getTypeByName(moveData.name)
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
                            typeData.damage_relations.half_damage_to.forEach(typeElement =>
                            {
                                if (typeElement.name === defenderTypes[0] || typeElement.name === defenderTypes[1]) effective = effective * .5;
                            });

                            typeData.damage_relations.double_damage_to.forEach(typeElement =>
                            {
                                if (typeElement.name === defenderTypes[0] || typeElement.name === defenderTypes[1]) effective = effective * 2;
                            });

                            typeData.damage_relations.no_damage_to.forEach(typeElement =>
                            {
                                if (typeElement.name === defenderTypes[0] || typeElement.name === defenderTypes[1]) effective = 0;
                            });

                            if (effective > 1 )
                            {
                                effectiveString = "It's super effective!\n";
                            }
                            else if (effective < 1)
                            {
                                effectiveString = "It's not very effective.\n"
                            }





                            let numDice = (moveData.power + other) / 5;

                            for(numDice; numDice>0 ; numDice--){
                                dice += Math.floor(Math.random() * 8 + 1);
                            }

                            if(Math.floor(Math.random() * 20 + 1))
                            {
                                critical = 1.5;
                                criticalString = "A critical hit!\n"
                            }

                            damageTotal = ((10 * attackPoke.level + 10) / 250 * ((attackPoke.statBlock.baseStats[ATK_ARRAY_INDEX] * stageModAtk) / (defense * stageModDef)) * dice) * stab * effective * critical * otherMult;
                            damageTotal = damageTotal.toFixed(2);

                            combatString = effectiveString + criticalString + `${attackerName} deals ${damageTotal} damage to the defending ${defendName}`;

                            message.channel.send(combatString).catch(console.error);
                        })
                });
        })
    } catch (error) {
        message.channel.send(error.toString);
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);

    }

};
