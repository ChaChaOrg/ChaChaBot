// JavaScript Document
const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	run(client) {
  console.log(`ChaChaBot V2.0, I choose you! \nReady to server in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
  },
};