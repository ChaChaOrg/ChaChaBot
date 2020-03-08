module.exports.run = (client, connection, P, message, args) => {
    let authorID = message.author.id;
    client.fetchUser(authorID)
        .then(response =>{
            message.channel.send(`Your ID is ${authorID}.\nYour Username is ${response}`);
        })
};