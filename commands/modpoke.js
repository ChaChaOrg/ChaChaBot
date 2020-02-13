const STAT_ARRAY_MAX = 6;
const HP_ARRAY_INDEX = 0;
const ATK_ARRAY_INDEX = 1;
const DEF_ARRAY_INDEX = 2;
const SPA_ARRAY_INDEX = 3;
const SPD_ARRAY_INDEX = 4;
const SPE_ARRAY_INDEX = 5;

module.exports.run = (client, connection, P, message, args) => {
    try {
        if (args[0].includes('help')) {
            message.reply('Modify Pokemon Command USE "list" to get all available fields- Args: [Pokemon Name] [Field to change] [new value]');
            return;
        }

        if (args[0].includes('help')) {
            message.reply('Modify Pokemon Command USE "list" to get all available fields- Args: [Pokemon Name] [Field to change] [new value]');
            return;
        }


    } catch (error) {
        message.channel.send(error.toString());
        message.channel.send('ChaCha machine :b:roke, please try again later').catch(console.error);
    }
};