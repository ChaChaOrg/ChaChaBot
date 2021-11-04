const logger = require('../logs/logger.js');

//get help on various chachabot topics
exports.run = (client, connection, P, message, args) => {

    //help topics
    let helpTopics = ["pokemon","chacha","legacy","all"];

    //message to post when info was sent directly to user
    let helpAlert = "Help info sent! Check your DMs.";

    // help message for legacy commands
    let helpLegacy = [
        {
            name: "Legacy Commands",
            value: `These are older commands that are fully manual, using no content/connection to the bot.`,
        },
        {
            name: "+damagelegacy",
            value: 'Calculates damage between two Pokemon given all info manually. See `+damagelegacy` for more info.',
        },
        {
            name: "+genpokelegacy",
            value: 'Generates a Pokemon given all the base info manually. See `+genpokelegacy` for more info.',
        },
        {
            name: "+movetutorlegacy",
            value: 'Calculates the move teaching DC given all info manually. See `+movetutorlegacy` for more info.',
        },
    ]

    // help messages for pokemon-specific commands
    let helpPokemon = [
        {
            name: 'Pokemon Specific Commands',
            value: 'These commands are used specifically to add, remove, view, or manipulate' +
                ' Pokemon that are in the bot.',
        },
        {
        name: '+catch',
        value: 'Rolls to see if a Pokemon is caught! See `+catch help`',
        },
        {
            name: '+damage',
            value: 'Takes two Pokemon and a move and calculates the damage done. See `+damage help`',
        },
        {
            name: '+genpoke',
            value: 'Generates a Pokemon! See `+genpoke help`',
        },
        {
            name: '+importpoke',
            value: 'Imports a Pokemon given certain formatting. See `+importpoke help`',
        },
        {
            name: '+listpoke',
            value: 'Lists all Pokemon in the bot, or certain ones with a filter given. See `+listpoke help`',
        },
        {
            name: '+modpoke',
            value: 'Modifies the contents of a Pokemon in the bot. See `+modpoke help`',
        },
        {
            name: '+rempoke',
            value: 'Removes a Pokemon that exists in the bot. See `+rempoke help`',
        },
        {
            name: '+showpoke',
            value: 'Shows a Pokemon that\'s in the bot! See `+showpoke help`',
        },
    ]

    // help messages for chacha-specific commands
    let helpChaCha = [
        {
            name: 'Chambers & Charizard (ChaCha) Specific Commands',
            value: 'These commands are used specifically to figure out ChaCha-related values.',
        },
        {
            name: '+charisma',
            value: 'Given the # of moves known of each contest category, returns the Pokemon\'s default charisma. See' +
                ' `+movetutor help`',
        },
        {
            name: '+movetutor',
            value: 'Calculates and returns the DCs to teach a Pokemon a move. See `+movetutor help`',
        },
        {
            name: '+ranger',
            value: 'Gets the DCs to Loop or Catch a Pokemon as a Ranger. See `+ranger help`',
        },
    ]

    // help message that just lists all available commands:
    let helpList = {
        name: "List of ChaChaBot Commands",
        value: "**Pokemon:** catch, damage, genpoke, importpoke, listpoke, modpoke, rempoke, showpoke.\n" +
            "**ChaCha:** charisma, movetutor, ranger\n" + "**Legacy:** damagelegacy, genpokelegacy, movetutorlegacy\n" +
            "\nTo view more info about each one, try `+help (category)`, ie `+help pokemon`. Or, use `+help all` to " +
            "show the detailed info of all commands!"
    }

    // overarching help command
    let helpMessage =  {
        embed: {
            color: 3447003,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL,
            },
            title: `Welcome to the ChaChaBot!`,
            description:
                `Hello there! Here are the commands we have available- use "+(command) help" to` +
                ` learn more, and message a ChaChaBot wrangler if you need help!`,
            fields: [],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "Chambers and Charizard!",
            },
        },
    };

    //function to print default message
    let helpDefault = function () {
        // if there were no args given, just print help message with list
        helpMessage.embed.fields.push(helpList);
        message.channel.send(helpMessage);
    }

    // function to push array of fields into help message
    let helpAdd = function(helpFields) {
        helpMessage.embed.fields = helpMessage.embed.fields.concat(helpFields);
    }

    //grab specific help info, if it was requested
    let helpDetails = '';


    if (args[0]) {
        //set what was given to lowercase
        helpDetails = args[0].toLowerCase();

        //look for a specific search result
        switch (helpDetails) {
            case helpTopics[0]: //pokemon
                helpAdd(helpPokemon);
                break;
            case helpTopics[1]: //chacha
                helpAdd(helpChaCha);
                break;
            case helpTopics[2]: //legacy
                helpAdd(helpLegacy);
                break;
            case helpTopics[3]: //all
                helpAdd(helpPokemon);
                helpAdd(helpChaCha);
                helpAdd(helpLegacy);
                break;
            default:
                helpDefault();
                return;
        }

        // after the proper items are added, send the message to the user directly & make a note of it in the
        // channel they requested it
        message.author.send(helpMessage);
        message.reply(helpAlert);
    }
    else {
        // if there were no args given, just print help message with list
        helpDefault();
    }

}