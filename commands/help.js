exports.run = (client, connection, P, message, args) => {

    // if (args.length > 1) {
    //     message.channel.send("Woahh, slow down pardner. Just give me one number and I'll give you it's modifier.");
    //     return;
    // }.

    // //message.channel.send('Bang! <:gunspurr:356191158017196032>').catch(console.error);
    // var score = args[0];
    // if (score % 2 !== 0) { score = score - 1; } //lower odd numbers by 1
    // var rawMod = ((score - 10) / 2);
    // rawMod = rawMod.toFixed(0);
    // var modString;
    // if (rawMod > 0) {
    //     modString = "+" + rawMod.toString();
    // } else {
    //     modString = rawMod.toString();
    // }

    // message.channel.send(`${args[0]}(${modString})`).catch(console.error);



    // fs.readdir("./commands/", (err, files) => {
    //     if (err) console.error(err);

    //     let jsfiles = files.filter(f => f.split(".").pop() === "js");
    //     if (jsfiles.length <= 0) {
    //         console.log("No commands to load!");
    //         return;
    //     }

    //     var namelist = "";

    //     message.channel.send("Available commands are as follows. Use `+[command] help` to learn more.")
    //     let result = jsfiles.forEach((f, i) => {
    //         var big_string = f.slice(0, -3) + "\n"
    //     }).then;

    //     message.channel.send(big_string)


    // });

    const fs = require("fs");
    fs.readFile("./commands/help", 'utf8', function (err, data) {
        if (err) throw err;
        //console.log('OK: ' + filename);
        console.log(data)
        message.channel.send(data)
    });


};