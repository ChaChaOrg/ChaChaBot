module.exports.run = (client, connection, P, message, args) => {
    try {
        if (args[0].includes('help')) {
            message.reply('Modify Pokemon Command USE "list" to get all available fields- Args: [Pokemon Name] [Field to change] [new value]');
            return;
        }

        if (args[0].includes('list')) {
            message.reply(
                'Fields available to modify:\n' +
                'hp atk def spa spd spe\n' +
                'type1 type2 gender ability name species level\n' +
                'hpEV atkEV defEV spaEV pdEV speEV\n' +
                'hpIV atkIV defIV spaIV spdIV speIV\n' +
                'move1 move2 move3 move4 move5 moveProgress\n' +
                'originalTrainer nature shiny private');
            return;
        }
        let valueString;
        if (typeof args[2] == "string") valueString = `${args[2]}`; else valueString = args[2];

        let sql = `UPDATE pokemon SET ${args[1]} = ${valueString} WHERE name = '${args[0]}';`;

        console.log(sql);
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log(`Pokemon ${args[0]} :${args[1]} set to ${args[2]}`);
            message.channel.send(`Pokemon ${args[0]}: ${args[1]} set to ${args[2]}`);
        });


    } catch (error) {
        message.channel.send(error.toString());
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
};