var assert = require('assert');
var genpoke = require('../commands/genpoke.js');
var pokedex = require('pokedex-promise-v2');
const { doesNotMatch } = require('assert');

describe('+genpoke', function () {
    describe('help', function () {
        it('should send a help message back to the user, when they use \'+genpoke help\'', function () {
            class dum_msg {
                reply = function (obj) {
                    assert.strictEqual(obj, 'New Pokemon Generator. Variables in order:\n [Pokemon Species] [Level] [Pokemon Name] [Hidden Ability % (optional - CURRENTLY BROKEN)]');
                    return Promise.resolve()
                }
            }

            let dum_args = ['help'];
            let dum_msg1 = new dum_msg()
            genpoke.run('', '', '', dum_msg1, dum_args)
        })
    });

    describe('too few args', function () {
        it('should tell the user there are too few arguments when they supply less than 3', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, "You haven't provided enough arguments. Should be [Pokemon Species] [Level] [Pokemon Name] [Hidden Ability % (optional - CURRENTLY BROKEN)]")
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
            }

            let dum_args = ['one', 'two'];
            let dum_msg1 = new dum_msg();
            genpoke.run('', '', '', dum_msg1, dum_args);
        })
    })

    describe('catching an error', function () {
        it('should throw an error when something goes wrong', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, 'ChaCha machine :b:roke while attempting to generate a Pokemon, please try again later')
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
                reply = function () { }
            }

            let dum_args = ['one', 'two', 'three'];
            let dum_msg1 = new dum_msg();
            genpoke.run('', '', '', dum_msg1, dum_args);
        })
    })

    describe('valid use case WITHOUT hidden ability %', function () {
        it('should generate the pokemon properly', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, 'ChaCha machine :b:roke while attempting to generate a Pokemon, please try again later')
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
                reply = function (obj) {
                    assert(obj, 'fartcloud has been added to the database\nTo remove it, use this command: `+rempoke fartcloud "`')
                    return Promise.resolve()
                }
            }

            class dum_conn {
                query = function () { }
            }

            let dum_args = ['gastly', '17', 'fartcloud'];
            let dum_msg1 = new dum_msg();
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            genpoke.run('', dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })
});