const logger = require('../logs/logger.js');
// JavaScript Document

exports.run = (client, connection, message, args) => {
  if (!args || args.size < 1) {
    logger.info("[reload] Must provide a command name to reload.")
    return interaction.reply("Must provide a command name to reload.");
  }
  const commandName = args[0];
  // Check if the command exists and is valid
  if (!client.commands.has(commandName)) {
    logger.info("[reload] That command does not exist.")
    return interaction.reply("That command does not exist");
  }
  // the path is relative to the *current folder*, so just ./filename.js
  delete require.cache[require.resolve(`./${commandName}.js`)];
  // We also need to delete and reload the command from the client.commands Enmap
  client.commands.delete(commandName);
  const props = require(`./${commandName}.js`);
  client.commands.set(commandName, props);
  logger.info("[reload] " + `The command ${commandName} has been reloaded`)
  interaction.reply(`The command ${commandName} has been reloaded`);
};