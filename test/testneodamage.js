var assert = require('assert');
var neodmg = require('../commands/neodamage.js');
var genpoke = require('../commands/genpoke.js');

describe('+neodamage', function () {
    describe('help', function () {
        it('should display the help message for the user', function () {

            const HELP_MESSAGE = "A damage calculator that uses the Pokemon in the database. (★ = required)\n\n" +
                "`+neodamage [Attacker Name★] [Move Used (with dashes for spaces)★] [Defender Name★] [Critical Hit (y/n)] [Stages of Attack] [Stages of Defense] [Additive Damage Bonus] [Multiplicative Damage Bonus]`\n\n" +
                "**Attacker Name★** The name of the attacker, as listed in the database\n" +
                "**Move Used★** The move used (gen 1-7 only sorry :<) lowercase with dashes instead of spaces. Ie, 'rock-smash'\n" +
                "**Defender Name★** The name of the pokemon being hit by the attack, as listed in the database\n" +
                "**Critical Hit** If the attacker struck a critical hit, as 'y' for yes and 'n' for no. Defaults to no. A critical hit multiplies the total damage done by 1.5\n" +
                "**Stages of Attack** Stages of attack/special attack the attacker has. Minimum -6, maximum +6\n" +
                "**Stages of Defense** Stages of defense/special defense (matching the attack) the defender has. Minimum -6, maximum +6\n" +
                "**Additive Damage Bonus** Extra damage *added* to the base power. Usually done through ChaCha feats. Defaults to 0\n" +
                "**Multiplicative Damage Bonus** Extra damage *multiplying* the base power. Usually done through abilities, such as Rivalry or Technician. Defaults to 1, add .X to multiply (ie 1.5 = Technician Boost)";

            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, HELP_MESSAGE)
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
                reply = function (obj) {
                    assert.strictEqual(obj, HELP_MESSAGE);
                    return Promise.resolve()
                }
            }

            let dum_args = ['help'];
            let dum_msg1 = new dum_msg()
            neodmg.run('', '', '', dum_msg1, dum_args)
        });
    });

    describe("too few args", function () {
        it("should give an error message", function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, "You haven't provided enough parameters, please try again.")
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
                reply = function (obj) {
                    assert.strictEqual(obj, "You haven't provided enough parameters, please try again.");
                    return Promise.resolve()
                }
            }

            let dum_args = ['dum'];
            let dum_msg1 = new dum_msg()
            neodmg.run('', '', '', dum_msg1, dum_args)
        })
    })
});