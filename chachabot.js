//
// Dependencies
//
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const logger = require('./logs/logger');
//const { REST } = require('@discordjs/rest');
const mysql = require("mysql");
const Pokedex = require('pokedex-promise-v2');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require("./config-test.json");

//Create the Connection with the mysql Database
//Append the pool to the Client object
client.mysqlConnection = mysql.createPool({
    host: config.mysql_host,
    user: config.mysql_user,
    password: config.mysql_pass,
    database: config.mysql_db,
    port: config.mysql_port,
    supportBigNumbers: true,
    bigNumberStrings: true
  });

client.mysqlConnection.getConnection(function (err) {
    if (err) return logger.error(err);
    logger.info('Connection to mySQL database successful! Connected as id ' + client.mysqlConnection.threadId);
  });

client.commands = new Collection();
client.pokedex = new Pokedex();


//Load each command
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    //Check if they have a Slash Command "data" and a "run" field
    if ('data' in command && 'run' in command) {
        client.commands.set(command.data.name, command);
        logger.info(`Added command ${command.data.name}!`);
    } else {
        //logger.info(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property`)
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    logger.info(`Added event ${event.name}!`);
    if( event.once) {
        client.once(event.name, (...args) => event.run(...args));
    } else {
        client.on(event.name, (...args) => event.run(...args));
    }
}

client.login(config.token);