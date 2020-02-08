module.exports.run = (client, connection, P, message, args) => {

    message.author.createDM.send("test");
    connection.query("SELECT * FROM pokemon", function (err, result) {
        let printString = "";
        result.forEach(element => {
            printString += `${element.name} (Level ${element.level} ${element.species})\n`;
        });
        message.channel.send(printString);

    });


};
