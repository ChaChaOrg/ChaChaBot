var assert = require('assert');
var neodmg = require('../commands/neodamage.js');
var pokedex = require('pokedex-promise-v2');

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
    });

    describe("valid attack", function () {
        it("should compute all that is necessary", function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);
                    return Promise.resolve()
                }
            }

            class dum_conn {
                query = function () { }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            class dum_msg {
                channel = new dum_channel();

                reply = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);

                    return Promise.resolve()
                }
            }


            let dum_args = ['sweet', 'fire-blast', 'SteelyDan'];
            let dum_msg1 = new dum_msg()
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            neodmg.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })

    describe("valid attack with critical hit", function () {
        it("should compute all that is necessary", function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);
                    return Promise.resolve()
                }
            }

            class dum_conn {
                query = function () { }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            class dum_msg {
                channel = new dum_channel();

                reply = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);

                    return Promise.resolve()
                }
            }


            let dum_args = ['sweet', 'fire-blast', 'SteelyDan', 'y'];
            let dum_msg1 = new dum_msg()
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            neodmg.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })

    describe("valid attack with 2 stages of attack", function () {
        it("should compute all that is necessary", function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);
                    return Promise.resolve()
                }
            }

            class dum_conn {
                query = function () { }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            class dum_msg {
                channel = new dum_channel();

                reply = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);

                    return Promise.resolve()
                }
            }


            let dum_args = ['sweet', 'fire-blast', 'SteelyDan', 'n', '2'];
            let dum_msg1 = new dum_msg()
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            neodmg.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })

    describe("valid attack with 1 stage of attack and 2 stages of defense", function () {
        it("should compute all that is necessary", function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);
                    return Promise.resolve()
                }
            }

            class dum_conn {
                query = function () { }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            class dum_msg {
                channel = new dum_channel();

                reply = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);

                    return Promise.resolve()
                }
            }


            let dum_args = ['sweet', 'fire-blast', 'SteelyDan', 'n', '1', '2'];
            let dum_msg1 = new dum_msg()
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            neodmg.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })

    describe("valid attack with 1 stage of attack, 2 stages of defense, some additive damage", function () {
        it("should compute all that is necessary", function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);
                    return Promise.resolve()
                }
            }

            class dum_conn {
                query = function () { }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            class dum_msg {
                channel = new dum_channel();

                reply = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);

                    return Promise.resolve()
                }
            }


            let dum_args = ['sweet', 'fire-blast', 'SteelyDan', 'n', '1', '2', '3'];
            let dum_msg1 = new dum_msg()
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            neodmg.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })

    describe("valid attack with 1 stage of attack, 2 stages of defense, some additive damage, some multiplicative damage", function () {
        it("should compute all that is necessary", function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);
                    return Promise.resolve()
                }
            }

            class dum_conn {
                query = function () { }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            class dum_msg {
                channel = new dum_channel();

                reply = function (obj) {
                    assert.strictEqual(obj.embd.title, "sweet used Fire Blast on SteelyDan!");
                    assert.match(obj.embed.fields['Damage Dealt'], /SteelyDan takes \d+.\d+ damage./);
                    assert.match(obj.embed.fields['Attacker Info'], /\*\*sweet\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Defender Info'], /\*\*SteelyDan\*\*, Lv \d+ Vulpix/);
                    assert.match(obj.embed.fields['Fire Blast Info'], /\*\*Base Power\*\* \d+ pw\n\*\*Damage Roll\*\* \d+\n=================/);

                    return Promise.resolve()
                }
            }


            let dum_args = ['sweet', 'fire-blast', 'SteelyDan', 'n', '1', '2', '3', '4'];
            let dum_msg1 = new dum_msg()
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            neodmg.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })
});