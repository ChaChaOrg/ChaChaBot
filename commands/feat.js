const logger = require('../logs/logger.js');

// JavaScript Document

//run
exports.run = (client, connection, P, message, args) => {


	//check if asking for help
	if (args[0].includes('help')) {
		logger.info("[feat] Sending help message.")
		message.channel.send('Feat finder, prints a given feat name. +feat [feat name]').catch(console.error);
		return;
	}

	//function to get + send feat
	function sendFeat(featName) {

		var featFather = [

			/*{ // FEAT NAME
				name: "Feat Name",
				cat: "Feat Category",
				prereq: "Prerequisites",
				effect: "Feat Effects",
				normal: "How things work without the feat",
				special: "Special Conditions"
			}*/
			// ============== trainer feats ============== 
			{ // ARCEUS GIFT
				name: "Arceus Gift",
				cat: "Character",
				prereq: "First Level, WIS 15+",
				effect: "Arceus has blessed a human with a talent normally only available to Pokémon. With this feat, you may select any non-signature move. You may use this move a number of times per day equal to your wisdom mod. For more information on using moves, see Pokémon Battles and Pokémon outside of Battle.",
				normal: "N/A",
				special: "This feat can only be taken at first level, and requires permission from the GM. A comprehensive backstory should accompany the feat. This feat cannot be taken if Psychic or Wielder of Aura was taken."
			},
			{ // CAMERA COLLECTOR
				name: "Camera Collector",
				cat: "Character",
				prereq: "First Level, WIS 15+",
				effect: "With each battery, memory card, or similar item placed into a battery, phone, or other photographic device, a character may take up to 5 photos of wild Pokémon. \n\nThis is a standard action that requires an initiative check of a DC equal to 15 + the Pokémon’s dexterity modifier. This can instead be done as a swift action instead at a DC of 25 + their dexterity modifier, or a full-round action at 10 + their dexterity modifier. If they are successful, they store the photo. Once per day, a player may gain a +2 bonus on a gather information, perception, or search check related to any Pokémon they have taken a photo of.\n\nAdditionally, a player who scores a natural 20 (provided they also meet the DC) when taking the photo can use it to gain a +2 reputation bonus on related charisma checks with other humans, such as discussing the species of Pokémon.",
				normal: "N/A",
				special: "N/A"
			},
			{ // CHARM SPECIALIZATION
				name: "Charm Specialization",
				cat: "Character",
				prereq: "Concentration 3+ Ranks, Lesser Charms",
				effect: "When using a charm, a character may choose to use it silently or without moving. In order to do this, the concentration check they make must be made with a -3 penalty. A character must still complete the motions required or state the name of the charm, they may not ignore both components. If other components, such as materials, are required in order to use a charm, these are still required.",
				normal: "A character must state the name of a charm out loud and make specific motions in order to use it",
				special: "N/A"
			},
			{ // CHILDHOOD PET
				name: "Childhood Pet",
				cat: "Character",
				prereq: "N/A",
				effect: "The character may choose a Pokémon to add to their party from that they had in their home before they started their journey. These Pokémon will likely be based on a dog or cat. Examples of Pokémon include Meowth or Lillipup.",
				normal: "N/A",
				special: "This feat can be taken at any level, but it requires permission from the GM. A comprehensive backstory should accompany this feat."
			},
			{ // COMMAND
				name: "Command",
				cat: "Character",
				prereq: "Level 6+, CHA 16+",
				effect: "Pokémon you have captured will always listen to you in battle, regardless of what level they were originally obtained at. However, their attitude towards you will move one step down each level until this feat is no longer needed to control them, at which it will reset to indifferent.",
				normal: "Pokemon obtained at a higher level than you will not listen to you when you are below their level.",
				special: "N/A"
			},
			{ // CRAFT MAGIC ITEM
				name: "Craft Magic Item",
				cat: "Character",
				prereq: "Spellcraft 3+ Ranks",
				effect: "With time, money, and the appropriate Pokémon moves, you can create a magic item that can enhance various attributes. These items can be used by players or Pokémon in a variety of circumstances. For a complete list of craftable items, see Items.",
				normal: "N/A",
				special: "N/A"
			},
			{ // CRAFT MEDICINE
				name: "Craft Medicine",
				cat: "Character Feat",
				prereq: "Heal 6+ ranks, Craft (any) 3+ ranks",
				effect: "With time and money you can craft items that can heal your Pokémon or remove statuses. This functions the same as the craft skill but requires a heal check instead of a craft check. Potions, Super Potions, Hyper Potions, Max Potions, Antidotes, Burn Heals, Awakenings, Paralyze Heals, Ice Heals, Full Heals, Full Restores, Revives, and Max Revives may be crafted in this manner.",
				normal: "A character cannot craft these items without this feat.",
				special: "N/A"
			},
			{ // CRAFT TM
				name: "Craft Technical Machine",
				cat: "Character Feat",
				prereq: "Tinker 6+ ranks, Specialization Item",
				effect: "You can craft a TM to store a move to teach to Pokémon. Trainers at a Pokémon Center or with a Pokédex or Capture Styler can train the Pokémon the move perfectly, without needing any train Pokémon checks to teach the move. In order to craft the disc, you need a Pokémon with the appropriate move present, an hour of work, and half the funds for the price of the item, or an amount deemed appropriate by the GM.",
				normal: "TMs cannot be crafted without this feat.",
				special: "N/A"
			},
			{ // CURVE BALL
				name: "Curve Ball",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "When throwing a Poké ball, you may add your Dex mod instead of your Str mod to your catch bonus for the purposes of determining level catching and critical captures.",
				normal: "A Trainer adds their STR mod to throwing a Pokeball",
				special: "N/A"
			},
			{ // DASH
				name: "Dash",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "Increase your movement speed by 10 ft per move action.",
				normal: "N/A",
				special: "N/A"
			},
			{ // DIEHARD
				name: "Diehard",
				cat: "Character Feat",
				prereq: "Endurance",
				effect: "When your health point total is below 0 but above the negative value of your constitution score, you remain conscious. Each turn, you may take either a move action or a standard action, but not both, nor any full-round actions. If you take a standard action, you still take one point of damage, just as if you were dying.",
				normal: "Characters without this feat are considered disabled at 0 hit points, and experience what is listed above. Characters below 0 hit points are considered dying, and are unconscious and automatically lose one hit point per turn. At negative constitution score hit points, a character dies unless they can be restored by their next turn.",
				special: "N/A"
			},
			{ // DODGE
				name: "Dodge",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "You gain a +1 bonus to AC whenever you maintain your DEX bonus to AC. This requires you to be aware of the target you are evading.",
				normal: "N/A",
				special: "N/A"
			},
			{ // ENDURANCE
				name: "Endurance",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "You gain +4 on certain skill checks and saving throws, as listed following:\n+ Swim checks to avoid drowning\n+ Constitution checks to continue running\n+Constitution checks to avoid nonlethal damage from holding your breath, starvation, or thirst\n+ Fortitude saves to avoid nonlethal damage in hot and cold environments, as well as avoid suffocation.",
				normal: "N/A",
				special: "N/A"
			},
			{ // ENTHUSIASM
				name: "Enthusiasm",
				cat: "Character Feat",
				prereq: "Improved Initiative",
				effect: "You may always have your Pokémon make the first move, regardless of who is faster. After that round, speed returns to be the factor in determining turn order. In order to use this feat, you must choose a leading Pokémon to send out, allowing your opponent to assess which Pokémon they might choose.",
				normal: "Speed determines the turn order in battle. The trainer who rolls the highest initiative can wait in choosing their Pokémon until after their opponent has chosen.",
				special: "N/A"
			},
			{ // HEALTHY
				name: "Healthy",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "Gain an additional +2 health each time you level up. This also adds 2 health to your total for every level you have previously gained.",
				normal: "N/A",
				special: "N/A"
			},
			{ // IMMENSE STRENGTH
				name: "Immense Strength",
				cat: "Character Feat",
				prereq: "First Level, STR 15+",
				effect: "You can carry twice that of a character of your normal level. Double your light, medium, and heavy load limits, as well as your lift overhead and drag/push.",
				normal: "N/A",
				special: "This feat can only be taken at first level, and requires permission from the GM."
			},
			{ // IMPRINTING
				name: "Imprinting",
				cat: "Character Feat",
				prereq: "Proficiency with Incubator, INT 13+",
				effect: "When making a Train Pokémon check on a Pokémon originally obtained at level one, you use your own Int mod for all checks instead of any other mod, the trainer’s or the Pokémon’s. All other bonuses, including skill points, skill synergies, assisting, etc. are the same.",
				normal: "Train Pokémon is based off of Charisma instead of Intelligence, and sometimes requires the Pokémon’s intelligence rather than the trainer’s Charisma.",
				special: "N/A"
			},
			{ // IMPROVED INITIATIVE
				name: "Improved Initiative",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "You get +4 on all initiative checks.",
				normal: "N/A",
				special: "N/A"
			},
			{ // LUCKY
				name: "Lucky",
				cat: "Character Feat",
				prereq: "DEX 11+",
				effect: "Once per day, after seeing the result of a skill or ability check but before knowing the outcome, you may add a +3 luck bonus to the roll.",
				normal: "N/A",
				special: "N/A"
			},
			{ // MEOWTH'S WAVING
				name: "Meowth's Waving",
				cat: "Character Feat",
				prereq: "Referee",
				effect: "Both the victor of a battle and the referee gain extra money after an official battle occurs. The victor gains 1.25 times the normal amount, and the Referee gains .25 the normal amount. A battle still is only considered officiated by a Referee if the Referee does not participate in it.",
				normal: "A character with the Referee feat does not gain any money as a result of a battle, and the loser pays the victor the normal amount as calculated by their class times the level of their highest level Pokémon.",
				special: "N/A"
			},
			{ // MULTI-CLASSING
				name: "Multi-Class",
				cat: "Character Feat",
				prereq: "Level 4+",
				effect: "A character can pick up a second class with less restrictions. If a character takes this feat, they only need to meet the level up requirements of another class once in order to gain a level in that class. For example, if a Connoisseur 4 decides to take a level in master and defeats a gym leader, he becomes a Connoisseur 4/Master 1.His catch bonus and saves stack, but he gains new health, skills, and class features as a Master. Normal: In order to multi-class, a character must first meet the requirements of leveling up in another class twice without meeting their own level-up conditions. Then, they lose a level in their first class and gain a level in the new class, and can multi-class freely between the two after that. For example, if a Type Specialist 4 without this feat decides to take a level in Breeder, she must breed two Pokémon that are not of her chosen types as per breeder rules and then becomes Type Specialist 3/Breeder 1. Again, the relevant bonuses stack and the two classes can now be acquired freely without sacrificing levels.",
				normal: "At level 4, a Connoisseur may gain this feat for free. He need not select it.",
				special: "N/A"
			},
			{ // PSYCHIC
				name: "Psychic",
				cat: "Character Feat",
				prereq: "First Level, WIS 13+",
				effect: "A character with this feat gains psychic powers that allow her to communicate with her Pokémon and perform acts of telekinesis. You may choose one Pokémon in your party to automatically gain the effects of Empathy, as if you were a Master of level 9. Additionally, you may manipulate items of 5lbs or less telekinetically as if using mage hand (see D&D SRD) with a DC 10 concentration check a number of times per day up to your character level. Additionally, once per short rest, you may attempt to move a larger object. The weight limit of the object you can manipulate with this feat is equal to your Wisdom modifier times 15, and the concentration check required is DC 15. This ability functions the same as mage hand otherwise. If you fail a concentration check it does not use your daily uses of telekinetic abilities.",
				normal: "A character does not gain psychic powers.",
				special: "This feat can only be taken at first level, and requires permission from the GM. A comprehensive backstory should accompany the feat. This feat cannot be taken if Arceus Gift or Wielder of Aura was taken."
			},
			{ // QUICK CATCH
				name: "Quick Catch",
				cat: "Character Feat",
				prereq: "Level 4, DEX 13+",
				effect: "You may throw a Poké ball to attempt to catch a Pokémon even after it faints. You throw your catch check at a -6 penalty, stacking with the -4 penalty if you are not proficient for a total of -10. If you are proficient with Poké balls, it is only a -6 penalty. Additionally, the Poké ball you throw has half of the normal catch rate, so a regular Poké ball has a rate of times 1/2, an ultra ball has a rate of times 1, etc. The Pokémon is treated as having half health and being affected by the sleep condition. If the Pokémon is not caught on the first turn after it faints, the battle ends and it gets away. Whether it is caught or not, experience is still given as normal.",
				normal: "A character cannot catch fainted Pokemon.",
				special: "N/A"
			},
			{ // REFEREE
				name: "Referee",
				cat: "Character Feat",
				prereq: "Level 2",
				effect: "A character who takes this feat may act as an official judge of a battle, awarding prize money at the end. The Referee of the battle cannot participate in battle. The loser of the battle must pay the winner a fee equal to their base fee times the level of their highest Pokémon.",
				normal: "Money is not awarded after a battle without a referee.",
				special: "At level 4, a Connoisseur may gain this feat for free. He need not select it."
			},
			{ // RESILIENT
				name: "Resilient",
				cat: "Character Feat",
				prereq: "Endurance, CON 15+",
				effect: "When targeted by a Pokémon move that deals damage, take half damage. If a save is allowed for half damage and succeeded, take ¼ the normal damage.",
				normal: "A character who does not have this feat takes full damage from damage-dealing moves unless they make a save. The save for avoiding a Pokémon move is DC (20-PP/5+ability mod) and is Fortitude for Physical moves, Reflex for Special moves, and Will for Status moves.",
				special: "N/A"
			},
			{ // RUNNING SHOES
				name: "Running Shoes",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "A character with this feat can run at 5 times their normal speed, 30 feet for most human characters, as a full-turn action. If an athletics check is made to jump after a running start, they gain a +4 bonus to their athletics check. Additionally, they retain their dexterity bonus to AC while running.",
				normal: "A character without this feat can only run at up to 4 times their speed, or 3 times under high encumbrance, and they do not retain their dexterity bonus to AC.",
				special: "N/A"
			},
			{ // STUDIOUS
				name: "Studious",
				cat: "Character Feat",
				prereq: "First Level, Knowledge Pokemon 1+ Rank, INT 15+",
				effect: "When making a Knowledge Pokémon check to identify if you know of a Pokémon, extend the area beyond your hometown by one (route, forest, cave, etc.) in each direction. All areas beyond are considered one closer, lowering the DC for identifying Pokémon from them. This may be done as a swift action, but only on the first turn of a battle. Additionally, with a DC 40 Knowledge Pokémon check, a Pokémon from another region may be identified.",
				normal: "A character who does not have this feat only knows of the Pokémon native to their hometown or area, and the further away the Pokémon is from, the less likely they are to be known. Pokémon from other regions cannot be identified.",
				special: "N/A"
			},
			{ // SILENT CHARISMA
				name: "Silent Charisma",
				cat: "Character Feat",
				prereq: "Level 4+, Charisma 15+",
				effect: "A character may always take a 10 on diplomacy or a bluff on simple ideas if they choose to remain silent. For diplomacy, a simple idea would be calming a hostile or unfriendly individual to indifferent or friendly, but nothing further. For bluff, a simple idea would be a nod for yes, shaking your head for no, or keeping a blank face. A GM may rule if another idea is considered simple. If something is spoken, the check result instead becomes a 1 plus any modifiers, increasing the chance of failing. After somebody else continue the conversation, you may again speak without penalty.",
				normal: "In an intense social situation, such as an argument, a character has to roll for skill checks like diplomacy and bluff, possibly causing them to be more likely to fail.",
				special: "N/A"
			},
			{ // TIRELESS
				name: "Tireless",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "A trainer may add 3 to the points of fatigue a Pokémon may take before it reaches its maximum fatigue. For example, a trainer with a 16 constitution, for a +3 modifier, has 9 points of fatigue maximum on each of their Pokémon.",
				normal: "Pokémon may take a maximum number of points of fatigue up to twice their trainer’s constitution modifier, minimum one.",
				special: "N/A"
			},
			{ // TRACK
				name: "Feat Name",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "A character with this feet may make survival checks to follow tracks. Every mile traveled requires a survival check. The character moves at half their speed, or full speed if they take a -5 penalty to their check. Special: A ranger gains this feat as a bonus feat at first level, he needs not select it. By surpassing the survival DC by 10, a trainer may identify a Pokémon they are tracking, if they have seen the Pokémon before. Information on the DCs can be found under survival.",
				normal: "N/A",
				special: "N/A"
			},
			{ // TRAPFINDING
				name: "Trapfinding",
				cat: "Character Feat",
				prereq: "N/A",
				effect: "Characters with this feat may find hidden traps. By making a search check, a character with this feat may attempt to find hidden traps, which often have DCs above 20. Making this search check takes one minute and does not ally retries. Additionally, these traps can be disabled with the Tinker skill. This is a separate check, that also takes at least a minute, in order to disable the trap and allow a safe pass.",
				normal: "Characters without this feat can only find traps with search if the DC is below 20.",
				special: "N/A"
			},
			{ // WIELDER OF AURA
				name: "Wielder of Aura",
				cat: "Character Feat",
				prereq: "First Level, CHA 13+",
				effect: "A character with this feat gains powers of aura that allow him to communicate with his Pokémon and produce aura spheres. You may choose one Pokémon in your party to automatically gain the effects of Empathy, as if you were a Master of level 9. Additionally, you gain a number of d6 equal to your charisma mod per day. With a concentration check of DC 11, you may fire an aura sphere that deals 1d6+charisma mod fighting type damage as a ranged touch attack. Use your catch, capture, or befriend bonus as an additional bonus to hit.\n\nThis feat's description is too long for the bot lol, pls check the ChaChaBeta.pdf page 76 for more details.",
				normal: "A character does not gain aura.",
				special: "This feat can only be taken at first level, and requires permission from the GM. A comprehensive backstory should accompany the feat. This feat cannot be taken if Arceus Gift or Psychic was taken."
			},

			// ============== Proficiency feats ============== 
			{ // CATCH FOCUS
				name: "Catch Focus",
				cat: "Proficiency Feat",
				prereq: "Proficient with a catch method",
				effect: "+1 when using Pokeballs or Stylers, chosen when the feat is selected.",
				normal: "N/A",
				special: "N/A"
			},
			{ // EGG CARING
				name: "Egg Caring",
				cat: "Proficiency Feat",
				prereq: "Level 4",
				effect: "Gain the ability to raise an egg and use an incubator",
				normal: "N/A",
				special: "N/A"
			},
			{ // IMPROVED CATCH FOCUS
				name: "Improved Catch Focus",
				cat: "Proficiency Feat",
				prereq: "Catch Focus, Catch Bonus 3+",
				effect: "Gain an additional +1 to your catch bonus.",
				normal: "N/A",
				special: "N/A"
			},
			{ // POKEBALL PROFICIENCY
				name: "Pokeball Proficiency",
				cat: "Proficiency Feat",
				prereq: "N/A",
				effect: "Proficient with Pokeballs",
				normal: "N/A",
				special: "N/A"
			},
			{ // STYLER PROFICIENCY
				name: "Styler Proficiency",
				cat: "Proficiency Feat",
				prereq: "N/A",
				effect: "Proficient with Capture Stylers.",
				normal: "N/A",
				special: "N/A"
			},
			{ // TRAINERS LICENSE
				name: "Trainer's License",
				cat: "Proficiency Feat",
				prereq: "N/A",
				effect: "Free visits to the Pokemon Center, 1 free meal a day, can stay the night.",
				normal: "N/A",
				special: "N/A"
			},
			{ // DEEP THOUGHT
				name: "Deep Thought",
				cat: "Save Feat",
				prereq: "N/A",
				effect: "**+2** to **Will** saves",
				normal: "N/A",
				special: "N/A"
			},
			{ // HARDY
				name: "Hardy",
				cat: "Save Feat",
				prereq: "N/A",
				effect: "**+2** to **Fortitude** saves",
				normal: "N/A",
				special: "N/A"
			},
			{ // QUICK MOVES
				name: "Quick Moves",
				cat: "Save Feat",
				prereq: "N/A",
				effect: "**+2** to **Reflex** saves",
				normal: "N/A",
				special: "N/A"
			},
			{ // COORDINATED MIND
				name: "Coordinated Mind",
				cat: "Skill Feat",
				prereq: "N/A",
				effect: "**+2** to **Ride** and **Concentration**",
				normal: "N/A",
				special: "N/A"
			},
			{ // EMOTIONAL
				name: "Emotional",
				cat: "Skill Feat",
				prereq: "N/A",
				effect: "**+2** to **Intimidate** and **Motivate**",
				normal: "n/a",
				special: "n/a"
			},
			{ // FINE CRAFTS
				name: "Fine Crafts",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+2** to **Use Rope** and **Sleight of Hand**",
				normal: "n/a",
				special: "n/a"
			},
			{ // OBSERVANT
				name: "Observant",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+2** to **Perception** and **Search**",
				normal: "n/a",
				special: "n/a"
			},
			{ // PEOPLE PERSON
				name: "People Person",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+2** to **Gather Info** and **Diplomacy**",
				normal: "n/a",
				special: "n/a"
			},
			{ // PHYSICAL FITNESS
				name: "Physical Fitness",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+2** to **Acrobatics** and **Athletics**",
				normal: "n/a",
				special: "n/a"
			},
			{ // SKILL FOCUS
				name: "Skill Focus",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+3** to any skill of your choice.",
				normal: "n/a",
				special: "n/a"
			},
			{ // SNEAKY
				name: "Sneaky",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+2** to **Stealth** and **Bluff**",
				normal: "n/a",
				special: "n/a"
			},
			{ // STAGE HAND
				name: "Stage Hand",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+2** to **Disguise** and **Perform**",
				normal: "n/a",
				special: "n/a"
			},
			{ // TECH SAVVY
				name: "Tech Savvy",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+2** to **Use Magic Device** and **Tinker**",
				normal: "n/a",
				special: "n/a"
			},
			{ // WOODSMAN
				name: "Woodsman",
				cat: "Skill Feat",
				prereq: "n/a",
				effect: "**+2** to **Survival** and **Heal**",
				normal: "How things work without the feat",
				special: "Special Conditions"
			},
			// ============== trainer feats ==============
			{ // BLAZING OATH
				name: "Blazing Oath",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only fire type starters can use this feat. Fire type starters can choose a 15x15 foot square of the field to singe. The area of the field must be within 5feet times the Pokémon using this feat’s level. The flames rise 5 feet above the ground, even reaching flying Pokémon. Above the flames forms a cloud of smoke granting concealment. Anyone caught in the flames catches fire. Each turn, a reflex save of DC 15 must be attempted in order to extinguish flames on a person, or else they take 1d6 fire damage. A 5 foot square of singed terrain can be put out as a full turn action. Otherwise the flames last one round per Pokémon level, with the smoke lasting that amount plus 1d4 turns. Pokémon immune to burns do not take damage from the fire.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // CLOSED-QUARTERS COMBAT
				name: "Closed-Quarters Combat",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "When battling indoors, a Pokémon may choose to spend one fatigue to do extra damage. When the Pokémon uses a damage-dealing move, an extra 4d8 is rolled for determining base power of the move (as if the move’s base power was raised by 20).",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // COUNTER-SHIELD
				name: "Counter-Shield",
				cat: "Trainer Feat",
				prereq: "6+ ranks in Acrobatics, Pokemon with 2+ ranks in Acrobatics",
				effect: "Only Pokémon with 2 or more ranks in the acrobatics skill can use this feat. A Pokémon may choose to use offensive moves in a defensive way, creating a shield with the damage they would have dealt. The Pokémon uses this feat by using a damage dealing move that has a range greater than 5 feet and choosing to spend two fatigue. This move creates a counter-shield. Calculate damage on the opposing Pokémon as normal, but do not deal damage to that Pokémon. Each turn, as a free action, the Pokémon using this feat must make an acrobatics check. If the result is equal to or higher than the opposing Pokémon’s level, whenever the opposing Pokémon uses a move that makes contact, it takes ¼ of the damage it would normally take from the move selected for the counter shield. Additionally, subtract the damage done from the counter shield move from the damage the opposing Pokémon does. Moves that are guaranteed to hit will not have their damage reduced, but damage is still done to the opposing Pokémon. Each turn after the first that Counter Shield is active costs an additional point of fatigue. Instead of making an acrobatics check, the counter shield may be ended without costing fatigue. Failure to make the acrobatics check ends the counter shield. A Pokémon using a Counter Shield may not use damage-dealing moves until they end their Counter Shield. If the Pokémon using this feat is removed from battle, by fainting, being withdrawn, or otherwise, it ends the Counter Shield.",
				normal: "This action cannot be done",
				special: "Fatigue Cost: 2"
			},
			{ // DEFENSIVE STANCE
				name: "Defensive Stance",
				cat: "Trainer Feat",
				prereq: "Level 2, INT 13+",
				effect: "In battle, your Pokémon can exchange accuracy for protection. Each turn, as a swift action, a Pokémon under your control in battle may lower their accuracy by a number of stages up to your class level. This increases their defense or special defense (but not both), chosen at the time of exchange, by the same number of stages. Moves that are normally guaranteed to hit cannot be used. At the beginning of the next turn, these bonuses reset.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // FINAL BREATH
				name: "Final Breath",
				cat: "Trainer Feat",
				prereq: "N/A",
				effect: "Only Water or Flying type Pokémon may use this feat. As a full-turn action, by removing breathable air in a whirlwind or torrent, the Pokémon using this feat may suffocate an opposing Pokémon. The target must make a fortitude save or faint for three turns. On a successful save, nothing happens. This has no effect if the opposing Pokémon is the last Pokémon able to battle on the opposing team, or if the opposing Pokémon is a higher level. The DC to avoid fainting is 12 + Strength mod of the Pokémon using this feat. At the end of the three turns, the Pokémon returns to its current state as if nothing happened.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 3"
			},
			{ // FOCUSED MIND
				name: "Focused Mind",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Psychic type Pokémon may use this feat. When being targeted by a status move, a Pokémon using this feat may make a will save against the move (the DC is calculated normally). If they beat the DC, they are not affected by the status move. Regardless of the outcome of the will save, this move still costs one fatigue. This feat can only be used once per battle.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // ENERGY FISSION
				name: "Energy Fission",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Dragon type Pokémon may use this feat. When attacking with a dragon type move, you may choose to change the type of the move into one or two other types. These types are based off a combination of types of basic energy from the trading card game, as Fire, Fighting, Electric, Grass, Water, Psychic, Dark, Steel, Normal, or Fairy. These types are not chosen at time of use, but are determined by the Pokémon. Look up the most recent printing of the Pokémon as a dragon type and determine what energies are required to use attacks. If multiple types of energies could be used (whether shared in one attack or on many), split the damage done by the move equally in those types. This may prevent STAB from being applied to moves, but may allow other modifiers, such as super effective damage, to occur.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // GO FOR THE HORN
				name: "Go For the Horn",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Each turn, your Pokémon may target a specific area on the opponent to hit for increased damage. Depending on the size of the opponent and the targeted area, the GM calculates an AC for the target. The Pokémon must make an attack roll with whatever move they choose, using Str as a bonus for physical attacks, Int for special attacks. If the move makes contact the Pokémon must be able to make contact as normal. The trainer of the Pokémon rolls a d20 and adds their Pokémon’s Str or Int mod against the other Pokémon’s AC, modified by the new target area. If the attack is greater than the AC, extra damage is done as calculated on the following table, based on how effective the move normally would be. This target area’s bonus to AC is +4.\n\nType Effectiveness || New Damage\n0 - 1/4 || 1/2\n1/2 || .75\n1 || 1.25\n2 || 2.5\n4 || 5\n>4 || 6",
				normal: "This action cannot be done",
				special: "Fatigue Cost: 1"
			},
			{ // HAUNTING VISION
				name: "Haunting Vision",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Ghost type Pokémon may use this feat. As a full-turn action, a Ghost type Pokémon using a move they receive STAB on may choose to haunt a target. If the target is currently in a semi-invulnerable turn of a move such as bounce, dig, dive, or fly, the move selected hits and does full damage. By spending an additional fatigue, for a total of 2, a target may be hit even when behind the effects of Protect, Detect, King’s Shield, Spiky Shield, and Baneful Bunker. For a total of 3 fatigue, a target may be hit for ¼ of the normal damage even if they are within their Pokéball or otherwise removed from the battle, though they cannot faint as a result of this and will always have at least one health. Non-damaging moves cannot be used when the target is in their Pokéball or removed from the battle. The target must have seen the Pokémon within the past turn in order for Haunting Vision to function.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // ICE AGE
				name: "Ice Age",
				cat: "Trainer Feat",
				prereq: "Level 3",
				effect: "Only Ice type Pokémon above level three may use this feat, in addition to the requirement of a trainer being at least level three to select it. As a standard action, the Pokémon using this feat absorbs all heat within a radius of 10 feet/Pokémon level. All non-Ice types within that area move at half their movement speed. Additionally, any Pokémon within this area for more than three turns becomes frozen. This effect lasts for one round/3 Pokémon levels If the Pokémon using this feat is removed from battle, by fainting, being withdrawn, or otherwise, it ends Ice Age.",
				normal: "This action cannot be done",
				special: "Fatigue Cost: 1"
			},
			{ // IGNORE
				name: "Ignore",
				cat: "Trainer Feat",
				prereq: "Level 2",
				effect: "When switching a Pokémon into battle, that Pokémon may ignore the effects of entry hazards, such as spikes, sticky web, stealth rock, and toxic spikes. If a new Pokémon is switched in following this one and chooses to ignore entry hazards, the fatigue cost increases by 1 per time ignore has been used already in the battle.",
				normal: "This action cannot be done",
				special: "Fatigue Cost: 1"
			},
			{ // IMMOVABLE OBJECT
				name: "Immovable Object",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Rock or Steel type Pokémon may use this feat. When being targeted by a physical move, the Pokémon attacking the one using this feat must also successfully overcome the Armor Class of the one using the feat. Regardless of the outcome of the attack roll, using this feat still costs one fatigue. This feat may only be used once per battle.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // INDEPENDENT POKEMON
				name: "Independent Pokemon",
				cat: "Trainer Feat",
				prereq: "First Level, must be a Pokemon",
				effect: "A player may choose to play as a Pokémon instead of a human. They cannot be caught, captured, befriended, or rebuked, though they can choose to associate with a trainer. They progress as Pokémon normally would. They gain a number of skill points per level equal to their Int Mod, minimum 1. They do not gain any other benefits, such as feats or ability bonuses, or class levels, as a human does. The GM can choose to modify these rules depending on the setting.",
				normal: "A player is a human instead of a Pokemon",
				special: "This feat can only be taken at first level, and requires permission from the GM. A comprehensive backstory should accompany the feat."
			},
			{ // INNOCENT TRICK
				name: "Innocent Trick",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Fairy or Dark type Pokémon may use this feat. When selecting a status move, the opposing Pokémon makes a will save against the move. If they fail the DC (as calculated normally), the move is used in a priority bracket one higher than previously, allowing it to act before moves in lower priority brackets, regardless of each Pokémon’s speed. Regardless of the outcome of the will save, this move still costs one fatigue.",
				normal: "This action cannot be done",
				special: "Fatigue Cost: 1"
			},
			{ // LIMIT BREAK
				name: "Limit Break",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Normal or Electric type Pokémon may use this feat. When declaring an attack, a surge of energy can rush through this Pokémon. They may choose to drain their own max HP by a percentage to increase the amount of damage a move does, provided the Pokémon using this feat does not knock themselves out. For example, a Pokémon may lose one quarter of its max health to increase the damage done their move by 1.25 times.",
				normal: "This action cannot be done",
				special: "Fatigue Cost: 2"
			},
			{ // MANEUVERABILITY
				name: "Maneuverability",
				cat: "Trainer Feat",
				prereq: "Level 2, DEX 13+, Dodge",
				effect: "Your Pokémon gains multiple new benefits that can be used with dodging. These are all done as part of dodging, instead of as a full-round action. Only one can be done at a time.\n+ When dodging a move, a Pokémon can combine their dodge with a move action, allowing the Pokémon to move on the grid up to their movement speed.\n+ Instead of dodging for full damage, a Pokémon can take half damage and gain a stage of accuracy for their next attack.\n+ A Pokémon may use their modified stages of defense instead of evasion to when rolling for a move’s accuracy.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // OVERGROWN OATH
				name: "Overgrown Oath",
				cat: "Trainer Feat",
				prereq: "Grass-Type Starter",
				effect: "Only grass type starters can use this feat. Grass type starters immediately make surrounding terrain covered in roots, vines, and shrubs, making movement difficult. The area is a radius of 5 feet per level of the Pokémon using this feat. When in this difficult terrain, speed is halved and all perception checks are at a -4 penalty, unless the Pokémon is a grass type. Additionally, there is a 20% chance that movement on a turn will be too difficult for a non-grass type Pokémon to continue progress through the terrain, forcing motion to stop for the turn.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // OVERWORK
				name: "Overwork",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Fighting type Pokémon may use this feat. As a standard action, the Pokémon using this feat forces a series of difficult maneuvers to keep up with. This feat may only be used if the opposing Pokémon has used a trainer feat, taken the dodge trainer action, or spent fatigue (other than from using a move multiple times in a row). The opposing Pokémon gains two points of fatigue as it attempts to follow this procedure, but cannot be brought to their maximum fatigue. Overwork can be used any number of times, but may only affect each individual opponent once per battle.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // PITFALL
				name: "Pitfall",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Ground type Pokémon may use this feat. As a full-turn action, the Pokémon causes a tremor that creates a deep hole in the ground. This may be targeted directly underneath a Pokémon or trainer. Anybody beneath the pitfall must make a reflex save or fall in. The DC to escape the pit is 10 + Half the Pokémon’s level + The Pokémon’s Intelligence mod. An individual that falls into the pit, whether it is the initial target or fell in from failing to maneuver over the pit, cannot move, possibly preventing it from taking other actions such as attacking. As a full-turn action, a trapped individual can attempt a DC 15 athletics check to escape. This feat may only be used once per battle.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // RADIATE
				name: "Radiate",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Fire or Poison type Pokémon may use this feat. As a standard action, the Pokémon using this feat releases bursts of dangerous energy. Any person or Pokémon within 5 feet of this Pokémon will lose 1/16th of its maximum HP per turn. This effect stacks with other similar damage dealing effects, such as poison and burn, but is considered a form of typeless damage. Water types and Steel types are immune to this effect. The radiation effect lasts for a number of turns equal to the Pokémon’s level. If the Pokémon using this feat is removed from battle, by fainting, being withdrawn, or otherwise, it ends Radiate.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // RECKLESS ATTACK
				name: "Reckless Attack",
				cat: "Trainer Feat",
				prereq: "Level 2, STR 13+",
				effect: "In battle, your Pokémon can exchange accuracy for more damage. Each turn, as a swift action, a Pokémon under your control in battle may lower their accuracy by a number of stages up to your class level. This increases their attack or special attack (but not both), chosen at the time of exchange, by the same number of stages. Moves that are normally guaranteed to hit cannot be used. At the beginning of the next turn, these bonuses reset.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // STING
				name: "Sting",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Bug type Pokémon may use this feat. A bug type Pokémon may impale the target with a painful stinger. This lowers the user’s evasion by one stage. Each turn, the impaled opponent takes damage equal to 1/8th their maximum HP until the stinger is removed. As a standard action, one can attempt to remove the stinger with a strength check. The DC to remove the stinger is equal to 5+the Strength Mod of the bug type that impaled it. This feat can only be used once per battle.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // SYMBIOTE
				name: "Symbiote",
				cat: "Trainer Feat",
				prereq: "n/a",
				effect: "Only Grass type Pokémon may use this feat. As a standard action, the Pokémon chooses a target to recover from. Whenever the target Pokémon gains HP due to a move, an item being used on it, or eating a berry, the Pokémon using this feat also recovers 1/8th of its maximum HP. The symbiote effect lasts for a number of rounds equal to the Pokémon’s level. If the Pokémon using this feat is removed from battle, by fainting, being withdrawn, or otherwise, it ends Symbiote.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // TORRENTIAL OATH
				name: "Torrential Oath",
				cat: "Trainer Feat",
				prereq: "Water Type Starter",
				effect: "Only water type starters can use this feat. Water type starters can shoot a blast of water up to 60 feet away. They make a ranged touch attack against the opponent, and if they hit, that opponent’s movement speed is cut in half (but not the speed statistic). Additionally, the only form of movement that Pokémon may take is walking at their halved speed for a number of rounds equal to the Pokémon using this feat’s level. This does not affect Pokémon that are underwater, but it does affect other water types.",
				normal: "This action cannot be done.",
				special: "Fatigue Cost: 1"
			},
			{ // TRAINER BOND
				name: "Trainer Bond",
				cat: "Trainer Feat",
				prereq: "Level 4+",
				effect: "During a turn in battle, a trainer may make a skill check that takes a standard action in addition to having their Pokémon use a move, which takes a standard action. No other actions may be taken, except a single swift action and unlimited free actions, such as talking. The trainer must make a skill check, they may not switch Pokémon, use an item, or anything else that could be done in this action.",
				normal: "A character who does not have this feat must choose to either have their Pokémon use a move or for the trainer to make a skill check during a standard action.",
				special: "Fatigue Cost: 1"
			},
			{ // BATTLE READY
				name: "Battle Ready",
				cat: "Type Specialist Feat",
				prereq: "Type Specialist",
				effect: "Type Specialists who take this feat are better at training Pokémon of their non-specialty types than other type specialists would be. If Pokémon would take a penalty to the experience they gain due to not belonging to a specialty type, that penalty no longer applies. In addition, Type Specialists may level up through their normal methods or through any method a Master would level up, provided she only uses Pokémon of her type to do so.",
				normal: "Beginning at Level 4, Pokémon that gain experience under a Type Specialist that are not of her specialty type gain one less experience point per battle.",
				special: "n/a"
			},
			{ // DON'T FALL FAR
				name: "Don't Fall Far",
				cat: "Type Specialist Feat",
				prereq: "Type Specialist",
				effect: "Type Specialists who take this feat often have insight into how young Pokémon are similar to their parents, and thus understand some of the mechanics of breeding. This feat grants proficiency with an incubator (though it does not give one) and allows a Type Specialist to breed and hatch eggs of Pokémon of their own type.. In addition, Type Specialists may level up through their normal methods or through any method a Breeder would level up, provided she only uses Pokémon of her type to do so.",
				normal: "n/a",
				special: "n/a"
			},
			{ // COORDINATED
				name: "Coordinated",
				cat: "Type Specialist Feat",
				prereq: "Type Specialist",
				effect: "Type Specialists who take this feat have a knack for performance and the arts. Perform (contest) and Disguise are treated as class skills, meaning if a rank is put in them, a +3 bonus is also given to checks using those skills. In addition, Type Specialists may level up through their normal methods or through any method a Performer would level up, provided she only uses Pokémon of her type to do so.",
				normal: "Disguise and Perform (contest) are not class skills for a Type Specialist.",
				special: "n/a"
			},
			{ // NATIVE TALENT
				name: "Native Talent",
				cat: "Type Specialist Feat",
				prereq: "Type Specialist",
				effect: "Type Specialists who take this feat blend in naturally with the area their Pokémon are from. This grants them the benefits of the Endurance feat, as well as a +2 bonus on perception, stealth, and survival checks when in an area strongly associated with Pokémon that share a type with the Type Specialist’s specialties. The area is up to GM discretion. For example, a fire Type Specialist may gain these bonuses near a volcano, a ghost Type Specialist in a graveyard, and a Rock Type Specialist in mountains. In addition, Type Specialists may level up through their normal methods or through any method a Ranger would level up, provided she only uses Pokémon of her type to do so.",
				normal: "n/a",
				special: "n/a"
			}
		];

		//find feat based on name given
		for (var i = 0; i < featFather.length; i++) {
			if (featName.toUpperCase().trim() === featFather[i].name.toUpperCase().trim()) {
				return featFather[i];
			}
		}

		//if we're here, no feats were found
		return null;
	}

	try {	//feat name given

		//elements.join('-')
		let givenFeat = args.join(' ');


		//try to find the feat
		let featFound = sendFeat(givenFeat);

		//if the feat isn't null, print it out

		if (featFound !== null) {
			logger.info("[feat] Sending embed message.")
			message.channel.send({
				embed: {
					color: 3447003,
					author: {
						name: client.user.username,
						icon_url: client.user.avatarURL
					},
					title: `${featFound.name}`,
					description: `**Category:** ${featFound.cat}`,
					fields: [
						{
							name: "Prerequisite",
							value: `${featFound.prereq}\n=================`
						},
						{
							name: "Effect",
							value: `${featFound.effect}\n=================`
						},
						{
							name: "Normal",
							value: `${featFound.normal}\n=================`
						},
						{
							name: "Special",
							value: `${featFound.special}\n=================`
						},
					],
					timestamp: new Date(),
					footer: {
						icon_url: client.user.avatarURL,
						text: "Chambers and Charizard!"
					}
				}
			});
		} else {
			logger.info("[feat] No feat found.")
			message.channel.send("No feat found, sorry :^(").catch(error);
		}
	} catch (error) {
		logger.error("[feat] " + error)
		message.channel.send(`No feat found, sorry :^( ${error}`).catch(error);
	}
};



