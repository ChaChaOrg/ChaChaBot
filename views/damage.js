

function calculateDamage(document) {
    // const dmgCall = require("../commands/damage.js")
    

    var attacker = document.getElementById("attackerName")
    var defender = document.getElementById("defenderName")
    var moveName = document.getElementById("moveName")

    mysqlConnection = mysql.createConnection({
        host: config.mysql_host,
        user: config.mysql_user,
        password: config.mysql_pass,
        database: config.mysql_db,
        port: config.mysql_port,
        supportBigNumbers: true,
        bigNumberStrings: true
        
    });
    mysqlConnection.connect();

    interaction = {
        client : mysqlConnection,
        deferReply : function() {},
        options : {
            getSubcommand : function() {},
            "attacker-name" : attacker,
            "defender-name" : defender,
            "move-name" : moveName
        },
        editReply : function() {},
        followUp : function() {},
        channel : {
            send : function() {}
        }

        
    }

    console.log(dmgCall.run(interaction))
}