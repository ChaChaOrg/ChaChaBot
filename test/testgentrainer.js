var assert = require('assert');
var gentrainer = require('../commands/gentrainer.js');
var pokedex = require('pokedex-promise-v2');

describe('+gentrainer', function () {
    describe('help', function () {
        it('should send a help message back to the user, when they use \'+gentrainer help\'', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, "Generates a random trainer. For Arceus Only!\n\n+gentrainer [TrainerType (no spaces)] [# of feats (up to 4)] [min trainer level] [max trainer level] [# of pokemon] [min poke level] [max poke level] [pokeoption1] [pokeoption2] ...\n\nTo list types: +gentrainer types\nTo get a random trainer name/ttype: +gentrainer random")
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
                reply = function (obj) {
                    assert.strictEqual(obj, 'Generates a random trainer. For Arceus Only!\n\n+gentrainer [TrainerType (no spaces)] [# of feats (up to 4)] [min trainer level] [max trainer level] [# of pokemon] [min poke level] [max poke level] [pokeoption1] [pokeoption2] ...\n\nTo list types: +gentrainer types\nTo get a random trainer name/ttype: +gentrainer random');
                    return Promise.resolve()
                }
            }

            let dum_args = ['help'];
            let dum_msg1 = new dum_msg()
            gentrainer.run('', '', '', dum_msg1, dum_args)
        })
    });

    describe("trainer types", function () {
        it('should return a list of all trainer types', function () {
            class dum_channel {
                send = function (obj) {
                    assert.equal(obj.substring(0, obj.indexOf('\n')), "All trainer types: ")
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
                reply = function (obj) {
                    assert.strictEqual(obj, 'Generates a random trainer. For Arceus Only!\n\n+gentrainer [TrainerType (no spaces)] [# of feats (up to 4)] [min trainer level] [max trainer level] [# of pokemon] [min poke level] [max poke level] [pokeoption1] [pokeoption2] ...\n\nTo list types: +gentrainer types\nTo get a random trainer name/ttype: +gentrainer random');
                    return Promise.resolve()
                }
            }

            let dum_args = ['types'];
            let dum_msg1 = new dum_msg()
            gentrainer.run('', '', '', dum_msg1, dum_args)
        })
    });

    describe("random", function () {
        it('should generate a random trainer', function () {
            class dum_channel {
                send = function (obj) {
                    assert.ok(obj.length > 16)
                    assert.equal(obj.substring(0, 16), "Watch out! It's ")
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
            }

            let dum_args = ['random'];
            let dum_msg1 = new dum_msg()
            gentrainer.run('', '', '', dum_msg1, dum_args)
        })

        it('should generate a random name', function () {
            class dum_channel {
                send = function (obj) {
                    assert.ok(obj.length > 24)
                    assert.equal(obj.substring(0, 24), "Watch out! It's Trainer ")
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
            }

            let dum_args = ['name'];
            let dum_msg1 = new dum_msg()
            gentrainer.run('', '', '', dum_msg1, dum_args)
        })
    })

    describe("trying to create a trainer with too few argument", function () {
        it("should throw an error when not enough arguments are supplied", function () {
            class dum_channel {
                send = function (obj) {
                    assert.equal(obj.substring(0, obj.indexOf("(")), "ChaCha Machine :b:roke :^")
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            let dum_args = ['meep'];
            let dum_msg1 = new dum_msg()
            let dum_client = new fake_client()
            gentrainer.run(dum_client, '', '', dum_msg1, dum_args)
        })
    })


});