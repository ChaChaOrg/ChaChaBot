// JavaScript Document
const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async run(client) {


  console.log(`ChaChaBot V2.0, I choose you! \nReady to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.`);
  },
};
