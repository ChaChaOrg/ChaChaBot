const { REST, Routes } = require('discord.js');
const { clientID, guildID, token} = require('./config-test.json');
const fs = require('node:fs');
const logger = require('./logs/logger');
const { data } = require('./commands/damage');

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ('data' in command && 'run' in command){
        commands.push(command.data.toJSON());
        logger.info(`Command ${command.data.name} has been added!`);
        console.log(`Command ${command.data.name} has been added!`);
    }
    else {
        //logger.error(`[WARNING] The command at ./commands/${file} is missing a required "data" or "execute" property`);
    }
}

const rest = new REST({version: '10'}).setToken(token);

(async () => {
    try{
        logger.info(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientID),
            { body: commands },
        );

        logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        logger.error(error);
    }
})();