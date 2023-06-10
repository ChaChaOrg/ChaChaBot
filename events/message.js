// Message Event

module.exports = (client, message) => {
  // Ignore all bots
  if (interaction.author.bot) {return;}
	
	// ---------------------- PHRASE ANSWERS ----------------------
	//non-prefix responses
	const sentence = interaction.content.toLowerCase();
	//ligma
	if (sentence.includes('ligma')) {
        interaction.react('504175902393892875').catch(console.error);
		interaction.channel.send('Ligma ballz xD').catch(console.error);
	} else
	//sugondese/sugandese
	if (sentence.includes('sugondese') || sentence.includes('sugandese')) {
        interaction.react('504175902393892875').catch(console.error);
		interaction.channel.send('Sugondese nuts!').catch(console.error);
	} else
	//sukon
	if (sentence.includes('sukon') || sentence.includes('sukan')) {
        interaction.react('504175902393892875').catch(console.error);
		interaction.channel.send('Sukon deez nuts!').catch(console.error);
	} else
	//dabbin on em
	if (sentence.includes('dab') || interaction.content.includes('soren')) {
		interaction.channel.send('<:dab:355952925635379202>').catch(console.error);
	} else
	// big think
	if (sentence.includes('think')) {
		var randomThink = Math.floor((Math.random() * 10) + 1);
		//1-5 = castform think, 6-10= ashthink
		if (randomThink <= 5) {
			interaction.react('355493467800993794').catch(console.error);
		} else {interaction.react('361725356396380161').catch(console.error);}
	} else
	//stick em up
	if (sentence.includes('gun') || sentence.includes('shoot') || sentence.includes('schut') || sentence.includes('schüt')) {
		interaction.react('356191158017196032').catch(console.error);
	} else
	//bofa
	if (sentence.includes('bofa')) {
        interaction.react('504175902393892875').catch(console.error);
		interaction.channel.send('BOFA DEEZ NUTS!!!');
	} else
	//nut
	if (sentence.includes('nut')) {
        interaction.react('504175902393892875').catch(console.error);
	} else
	//ditto
	if (sentence.includes('ditto')) {
        interaction.react('359359698098585600').catch(console.error);
	} else
	//jynx
	if (sentence.includes('jynx') || sentence.includes('jinx')) {
        interaction.react('361730318618853376').catch(console.error);
	} else
	//you're welcome
	if (sentence.includes('thank') && sentence.includes('chachabot')) {
		interaction.channel.send("You're welcome :wink:");
	}
	// ---------------------- END PHRASE ANSWERS ----------------------
/*
///
///Obselete with shift to slash commands.
///

  // Ignore messages not starting with the prefix (in config.json)
  if (interaction.content.indexOf(client.config.prefix) !== 0) {return;}

  // Our standard argument/command name definition.
  const args = interaction.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Run the command
  cmd.run(interaction);
  */
 return;


};