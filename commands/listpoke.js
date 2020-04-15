//TODO split printed string by creator/ ensure it doesn't break discord character limit
module.exports.run = (client, connection, P, message, args) => {

    connection.query("SELECT * FROM pokemon", function (err, result) {
        let printString = "";
        let promises = [];
        new Promise(function(resolve){
            result.forEach(element => {
                //console.log(element.userID);
                if (element.userID === message.author.id || element.private === 0) {
                promises.push(client.fetchUser(element.userID)
                    .then(function (response) {
                        printString += `${element.name} (Level ${element.level} ${element.species}) - Created by ${response.username} [Private: ${element.private}]\n`;
                    })
                    .catch(error => {
                        console.log(error);
                    }))
                }
            });
            Promise.all(promises).then( function()
            {
                resolve("Done");
            });
        })
            .then( function(response)
            {
                //console.log(`String: ${printString}`);
                message.author.send(printString);
                message.channel.send("I've DM'd you the list!");
            })
            .catch(error =>
            {
            console.log(error);
            });

    });


};
