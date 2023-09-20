const logger = require('../logs/logger.js');
const { SlashCommandBuilder } = require('@discordjs/builders');


// Command to lookup move info.

module.exports.data = new SlashCommandBuilder()
  .setName('movedex')
  .setDescription('Used to get information for a specific move.')
  .addStringOption(option =>
    option.setName('move')
      .setDescription('Move to fetch information for, lowercase with dashes instead of spaces. IE, "rock-smash"')
      .setRequired(true)
  );

module.exports.run = async (interaction) => {
  await interaction.deferReply();

  let moveName = interaction.options.getString('move');

  let moveType;
  let moveCategory;
  let movePP;
  let movePower;
  let moveAccuracy;
  let moveTarget;
  let moveCCondition;
  let movePriority;
  let effect_chance;
  let moveEffect;

  //TODO: Learn DC, save DC

  interaction.client.pokedex.getMoveByName(moveName.toLowerCase()).then((moveData) => {
    moveName = moveData.name;
    moveType = moveData.type.name;
    moveCategory = moveData.damage_class.name;
    movePower = moveData.power;
    movePP = moveData.pp;
    moveAccuracy = moveData.accuracy;
    moveTarget = moveData.target.name;
    moveCCondition = moveData.contest_type.name;
    movePriority = moveData.priority;
    effect_chance = moveData.effect_chance;
    moveEffect = moveData.effect_entries[0].short_effect;


    let moveHunger = (8 - movePP / 5) + 1;
    let moveTrainOut1 = 20 + (8 - movePP / 5);
    let moveTrainOut2 = moveTrainOut1 - 3;
    let moveTrainOut3 = moveTrainOut2 - 2;
    let moveTrainIn1 = moveTrainOut3 - 2;
    let moveTrainIn2 = moveTrainIn1 - 3;
    let moveTrainIn3 = moveTrainIn2 - 2;

    let saveType = "N/A";
    let moveStat = "N/A";
    if (moveData.damage_class.name === "physical") {
      saveType = "Fortitude";
      moveStat = "Strength";
    }else if (moveData.damage_class.name === "special"){
      saveType = "Reflex";
      moveStat = "Intelligence";
    }else if (moveData.damage_class.name === "status"){
      saveType = "Will";
      moveStat = "Charisma";
    }
    let saveDC = 20 - (movePP / 5);

    let moveEmbedString = {
      color: 3447003,
      author: {
        name: interaction.user.username,
        icon_url: interaction.user.avatarURL,
      },
      title: `**${moveName}** Info`,
      url: `https://bulbapedia.bulbagarden.net/wiki/${moveName.replace(
        "-",
        "_"
      )}_(Move)`,
      description: `${moveEffect}`,
      
      fields: [
        {
          name: "Type",
          value: `${moveType}`,
        },
        {
          name: "Category",
          value: `${moveCategory}`,
        },
        {
          name: "Power",
          value: `${movePower}`,
        },
        {
          name: "PP",
          value: `${movePP}`,
        },
        {
          name: "Hunger Cost",
          value: `${moveHunger}`,
        },
        {
          name: "Accuracy",
          value: `${moveAccuracy}`,
        },
        {
          name: "Target",
          value: `${moveTarget}`,
        },
        {
          name: "Contest Condition",
          value: `${moveCCondition}`,
        },
        {
          name: "Priority",
          value: `${movePriority}`,
        },
        {
          name: "Train Pokemon DC - Out of battle (Trainer checks)",
          value: `**First:** DC ${moveTrainOut1}, **Second:** DC ${moveTrainOut2}, **Third:** DC ${moveTrainOut3}`,
        },
        {
          name: "Train Pokemon DC - In battle (Pokemon checks)",
          value: `**First:** DC ${moveTrainIn1}, **Second:** DC ${moveTrainIn2}, **Third:** DC ${moveTrainIn3}`,
        },
        {
          name: "Saving Throw Info",
          value: `**Saving Throw Required:** ${saveType}, **Saving Throw DC:** ${saveDC} + ${moveStat} modifier of Pokemon`,
        }
      ],
      timestamp: new Date(),
      footer: {
        icon_url: interaction.client.user.avatarURL,
        text: "Chambers and Charizard!",
      },
    };

    //embed message
    logger.info("[movedex] Sending combat embed string.");
    interaction.followUp({ embeds: [moveEmbedString] }).catch(console.error);
  }).catch(function (error) {
    if (error.response.status == 404) {
      logger.error("[movedex] Move not found. " + error)
      interaction.followUp("Move not found, check your spelling and whether dashes are needed or not!");
      return;
    } else {
      logger.error('[movedex] There was an error: ' + error);
      interaction.followUp("Error getting move!");
      return;
    }
  });
};

