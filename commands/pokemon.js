
const GENDER_MAX = 8;

// Generates a new ChaCha Pokemon, given level & base stats

// ======================= POKEMON OBJECT =======================

function Pokemon(tempSpecies, tempLevel, tempName, P){

    // ======================= VARIABLES =======================

    let name = tempName;
    let species = tempSpecies;
    let level = tempLevel;
    //level
    //stat arrays: HP, ATK, DEF, SPA, SPD, SPE
    let baseStats = [ 1,1,1,1,1,1 ];
    //chance of being male
    let genderChance = 1;
    //number of abilities available
    let abilityNum = 1;
    //size bonus
    let sizeBonus = 1;
    //hidden ability percentile
    let haChance = 1;

    // IVs
    let ivStats = [0, 0, 0, 0, 0, 0];

    // EVs ... all naturally 0
    let evStats = [0, 0, 0, 0, 0, 0];

    //formula for stats
    let formStats = [0, 0, 0, 0, 0, 0];
    // nmulti 1, calculator stats
    let nmultiStats1 = [1, 1, 1, 1, 1, 1];
    // nmulti 2, calculator stats
    let nmultiStats2 = [1, 1, 1, 1, 1, 1];

    // final stats
    let finalStats = [0, 0, 0, 0, 0, 0];

    // gender, ability, shiny
    let gender = '';
    // the final ability chosen
    let ability;
    // if the pokemon is shiny or not
    let shiny = false;

    //nature + correlating names
    let natureFinal;
    //nature names
    let natureNames = [
        ["Hardy", "Lonely", "Adamant", "Naughty", "Brave"],
        ["Bold", "Docile", "Impish", "Lax", "Relaxed"],
        ["Modest", "Mild", "Bashful", "Rash", "Quiet"],
        ["Calm", "Gentle", "Careful", "Quirky", "Sassy"],
        ["Timid", "Hasty", "Jolly", "Naive", "Serious"]
    ];


    // DND STATS
    let natArmor;
    let armorClass;
    let moveSpeed;
    let conBase;
    let conMod;
    let strBase;
    let strMod;
    let intBase;
    let intMod;
    let wisBase;
    let wisMod;
    let dexBase;
    let dexMod;
}
// ========================= MISC VAL GENERATORS =========================
//modifier generator
Pokemon.prototype.modGen = function (a) {
    let mainScore = a;
    if (a % 2 !== 0) {mainScore = mainScore - 1;}
    let rawMod = ((mainScore - 10)/2);
    rawMod = rawMod.toFixed(0);
    let modString;
    if (rawMod > 0) {
        modString = "+" + rawMod.toString();
    } else {
        modString = rawMod.toString();
    }
    return modString;
};

//Assign gender
Pokemon.prototype.assignGender = function(genderChance) {
    //assign gender
    let gender = "genderless";
    let calcChance = GENDER_MAX; // genderChance / 8
    const genderNum = Math.floor((Math.random() * GENDER_MAX) + 1);
    if (genderChance <= -1) return gender;
    else if (genderNum <= genderChance) {
           gender = "female";
    }
    else gender = "male";

    return gender;
};

//shiny generator!
Pokemon.prototype.assignShiny = function() {
    if ((Math.floor((Math.random() * 4096) + 1)) >= 4093) return true;
};

// ========================= STAT ARRAY GENERATOR!!! =========================
//assign IVs
Pokemon.prototype.assignIVs = function(ivStats) {
    for (i = 0; i < 6; i++) {
        ivStats[i] = Math.floor((Math.random() * 32)); //assigns a value between 0 & 31 to all the IVs
    };
};
exports.run = (client, connection, P, message, args) => {

    // ======================= END VARIABLES =======================

    //check if asking for help
    if (name.includes('help')) {
        message.reply('New Pokemon Generator. Variables in order:\n [Pokemon Name] [Level] [Base HP] [Base Atk] [Base Def] [Base SpA] [Base SpD] [Base Speed] [\% Male] [Number of Abilities Available (including hidden abilities)] [Size Bonus] [Hidden Ability % (optional)]').catch(console.error);
        return;
    }

    try {


        //generate nature
        //x-coord for nature
        var natureXCoord = Math.floor((Math.random() * 5)); //val between 0-4 for array
        //y-coord for nature
        var natureYCoord = Math.floor((Math.random() * 5));

        //assign nature to final val
        natureFinal = natureNames[natureXCoord][natureYCoord];

        //update attributes based on nature
        //if xcoord = ycoord, no changes, otherwise adjusting...
        if (natureXCoord !== natureYCoord) {
            for (i = 0; i < 6; i++) {
                if (natureXCoord === i) {nmultiStats1[i + 1] = 1.1;}
                if (natureYCoord === i) {nmultiStats2[i + 1] = 0.9;}
            }
        }

        //get CON + hit points
        //calculate con + conmod
        conBase = Math.round((parseFloat(baseStats[0]) + parseFloat(ivStats[0]))*0.15 + 1.5);

        conMod = modGen(conBase);

        //calculate = attribute max HP
        //formula for hp... 16 + Conmod, with an additional 2d10 + conmod per level.
        var diceRoll = 16;
        for (var i = 1; i < level; i++) {
            diceRoll += Math.floor((Math.random() * 18) + 2) + ((conBase - 10)/2);
        }
        finalStats[0] = 16 + ((conBase - 10)/2) + diceRoll;

        //get all ability scores
        //go through base formula for stat creation
        for (var ii = 1; ii < 6; ii++) {
            formStats[ii] = Math.floor((((2*baseStats[ii]+ivStats[ii]+(evStats[ii]/4))*level)/20)+5);
            finalStats[ii] = Math.floor(formStats[ii] * nmultiStats1[ii] * nmultiStats2[ii]);
        }

        //get dnd stats
        //stat calculator
        var getAbility = function (a) { return (0.15 * a + 1.5); };

        //strength is based off of attack stat
        strBase = Math.round(getAbility(finalStats[1]));
        strMod = modGen(strBase);

        //int is based off of special attack stat
        intBase = Math.round(getAbility(finalStats[3]));
        intMod = modGen(intBase);

        //wis is based off of special defense stat
        wisBase = Math.round(getAbility(finalStats[4]));
        wisMod = modGen(wisBase);

        //dex is based off of speed stat
        dexBase = Math.round(getAbility(finalStats[5]));
        dexMod = modGen(dexBase);

        //get nat armor, ac
        //natArmor is based off defense stat
        natArmor = (0.08*(parseFloat(finalStats[2])))-0.6;

        //armor class
        //message.channel.send(`Natural Armor: ${natArmor} || Size Bonus: ${sizeBonus} || Dex: ${dexMod}`);
        armorClass = (10 + parseFloat(natArmor) + parseFloat(sizeBonus) + ((dexBase - 10)/2)).toFixed(0);

        //get move speed
        moveSpeed = (0.38*finalStats[5]+4).toFixed(2);

        //upload
        connection.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            var sql = "INSERT INTO pokemon (name, species, level, nature, gender, ability, hp, atk, def, spa, spd, spe, IVhp, IVatk, IVdef, IVspa, IVspd, IVspe, EVhp, EVatk, EVdef, EVspa, EVspd, EVspe) VALUES ('Company Inc', 'Highway 37')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
        });


        // Final Print
        message.channel.send({embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: `Level ${level} ${name}`,
                url: `https://bulbapedia.bulbagarden.net/wiki/${name}_(Pok%C3%A9mon)`,
                description: "Click the link for the Bulbapedia page, or use !data to call info using the Pokedex bot.",
                fields: [
                    {
                        name: "Basic Info",
                        value: `**Ability:** ${ability} | **Gender:** ${gender} | **Nature: ** ${natureFinal} | **Shiny: ** ${shiny}\n=================`
                    },
                    {
                        name: "HP",
                        value: `**IV: ** ${ivStats[0]} | **Final: ** ${finalStats[0]}\n=================`
                    },
                    {
                        name: "Attack",
                        value: `**IV: ** ${ivStats[1]} | **Final: ** ${finalStats[1]}\n=================`
                    },
                    {
                        name: "Defense",
                        value: `**IV: ** ${ivStats[2]} | **Final: ** ${finalStats[2]}\n=================`
                    },
                    {
                        name: "Special Attack",
                        value: `**IV: ** ${ivStats[3]} | **Final: ** ${finalStats[3]}\n=================`
                    },
                    {
                        name: "Special Defense",
                        value: `**IV: ** ${ivStats[4]} | **Final: ** ${finalStats[4]}\n=================`
                    },
                    {
                        name: "Speed",
                        value: `**IV: ** ${ivStats[5]} | **Final: ** ${finalStats[5]}\n=================`
                    },
                    {
                        name: "Ability Scores",
                        value: `**STR: ** ${strBase.toFixed(0)}(${strMod}) | **DEX: ** ${dexBase.toFixed(0)}(${dexMod}) | **CON: ** ${conBase.toFixed()}(${conMod})\n**INT: ** ${intBase.toFixed(0)}(${intMod}) | **WIS: ** ${wisBase.toFixed(0)}(${wisMod})\n**AC: ** ${armorClass} | **Move Speed: ** ${moveSpeed} ft`
                    },
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "Chambers and Charizard!"
                }
            }
        });

    } catch(error) {
        message.channel.send(error.toString);
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }

}