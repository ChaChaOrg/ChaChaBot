function Pokemon (connection, args){
    let species = args[0];
    //level
    let level = args[1];
    //stat arrays: HP, ATK, DEF, SPA, SPD, SPE
    let baseStats = [args[2], args[3], args[4], args[5], args[6], args[7]];
    //chance of being male
    let genderChance = args[8];
    //number of abilities available
    let abilityNum = args[9];
    //size bonus
    let sizeBonus = args[10];
    //hidden ability percentile
    let haChance = args[11];
    //pokemon nickname
    let nickname = args[12];
    //moves
    let move1 = args[13];
    let move2 = args[14];
    let move3 = args[15];
    let move4 = args[16];
    let move5 = args[17];
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
    let gender = 'male';
    // the final ability chosen
    let ability;
    // if the pokemon is shiny or not
    let shiny = 0;

    //nature + correlating names
    var natureFinal;
    //nature names
    var natureNames = [
        ["Hardy", "Lonely", "Adamant", "Naughty", "Brave"],
        ["Bold", "Docile", "Impish", "Lax", "Relaxed"],
        ["Modest", "Mild", "Bashful", "Rash", "Quiet"],
        ["Calm", "Gentle", "Careful", "Quirky", "Sassy"],
        ["Timid", "Hasty", "Jolly", "Naive", "Serious"]
    ];

    //modifier generator
    let modGen = function (a) {
        var mainScore = a;
        if (a % 2 !== 0) {
            mainScore = mainScore - 1;
        }
        var rawMod = ((mainScore - 10) / 2);
        rawMod = rawMod.toFixed(0);
        var modString;
        if (rawMod > 0) {
            modString = "+" + rawMod.toString();
        } else {
            modString = rawMod.toString();
        }
        return modString;
    };
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
    // ======================= END VARIABLES =======================

}

exports.data = (connection, args) => {
    try{
        let ident = args[0];

        let sql = '';

        if (typeof(ident) == 'number')
            sql = `SELECT * FROM pokemon WHERE id = ${ident};`;
        else if (typeof(ident) == 'string')
            sql = `SELECT * FROM pokemon WHERE name = ${ident};`;
        connection.query(sql, function (err, result) {
            if(err) throw err;
            return result;
        });
    }
    catch(error)
    {
        message.channel.send(error.toString);
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
};