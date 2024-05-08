const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const REGEX_SANI_STRING = /[^a-zA-Z0-9'_()\/:\n]/;
const REGEX_FORBID = /(DROP)|(TABLE)|(SELECT)/i;

module.exports.data = new SlashCommandBuilder()
    .setName('import')
    .setDescription('Imports pokemon from a pokemon showdown export. Use help to check formatting')
        .addSubcommand(subcommand =>
            subcommand
            .setName('help')
            .setDescription('Posts format help')) 
        .addSubcommand(subcommand =>
            subcommand
            .setName('import')
            .setDescription('imports a pokemon from a pokemon showdown export')
            .addStringOption(option => option.setName('import-data').setDescription('The import string. CHECK HELP FOR FORMAT').setRequired(true)));

module.exports.run = async(interaction) => {
    let Pokemon = require('../models/pokemon.js');
    let importPoke = new Pokemon();

    interaction.deferReply();

    if (interaction.options.getSubcommand() === 'help') {
        logger.info("[importpoke] Sending help interaction.")
        interaction.followUp('Pokemon importer. Paste showdown export string or fill in as follows.\nNote that you can omit individual EVs or the entire EV line if they all equal 0.\nReplace any instances of [] with the desired Pokemon\'s info (without the brackets themselves), and make sure that each piece of info is on its own line.\n Showdown Teambuilder: https://play.pokemonshowdown.com/teambuilder\n' +
            '```[Nickname] ([Species]) ([M/F/N])\n' +
            'Ability: [Ability Name]\n' +
            'Level: [Level]\n' +
            'EVs: [#] HP / [#] Atk / [#] Def / [#] SpA / [#] SpD / [#] Spe\n' +
            '[Nature] Nature\n' +
            'IVs: [#] HP / [#] Atk / [#] Def / [#] SpA / [#] SpD / [#] Spe```').catch(console.error);
        /*
        Pokemon importer. Paste showdown export string or fill in as follows. Note that you can omit individual EVs or the entire EV line if they equal 0. Replace any instances of [] with the desired Pokemon's info.
        ```/importpoke [Nickname] ([Species]) ([M/F/N])
            Ability: [Ability Name]
            Level: [Level]
            EVs: [#] HP / [#] Atk / [#] Def / [#] SpA / [#] SpD / [#] Spe
            [Nature] Nature
            IVs: [#] HP / [#] Atk / [#] Def / [#] SpA / [#] SpD / [#] Spe```
         */
        return;
    }
    let importContent = interaction.options.getString('import-data');
    if (importContent.match(REGEX_SANI_STRING)) {
        logger.error("[importpoke] Invalid characters detected.");
        console.log("String format error: invalid characters.");
        interaction.followUp("Invalid format detected. Please refer to the help subcommand for proper formatting.");
        return;
    }
    logger.info("[importpoke] " + importContent);
    importPoke.importPokemon(interaction.client.mysqlConnection, interaction.client.pokedex, importContent).then(() => { 
        logger.info("[importpoke] Sending summary interaction.");
        interaction.followUp({ embeds: [importPoke.sendSummaryMessage(interaction).embed] });
        importPoke.uploadPokemon(interaction.client.mysqlConnection, interaction);
        interaction.followUp("Your pokemon has been added!")
    })
};
