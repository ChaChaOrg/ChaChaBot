module.exports.run = (client, connection, P, message, args) => {

    connection.query("SELECT * FROM pokemon", function (err, result) {
        let printString = "";
        result.forEach(element => {
            printString += `${element.name} (Level ${element.level} ${element.species})\n`;
        });
        message.channel.send(printString);
        message.author.dmChannel.send("test\n" + printString);
    }.bind(this, message));

};
