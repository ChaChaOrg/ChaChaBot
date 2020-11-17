var assert = require('assert');
var showpoke = require('../commands/showpoke.js');
var pokedex = require('pokedex-promise-v2');

const HELP_MESSAGE = "Displays a Pokemon as it appears in the database. Please do not name your Pokemon 'help'. \n+showpoke [Pokemon Name]"

describe('+showpoke', function () {

    describe('help', function () {
        it('should send a help message back to the user, when they use \'+showpoke help\'', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, HELP_MESSAGE)
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
            }

            let dum_args = ['help'];
            let dum_msg1 = new dum_msg()
            showpoke.run('', '', '', dum_msg1, dum_args)
        })
    });

    describe('valid name', function () {
        it('should send the correct SQL query', function () {
            class dum_conn {
                query = function (obj) {
                    assert.strictEqual(obj, 'SELECT * FROM pokemon WHERE name = \'sweet\';');
                }
            }

            class dum_channel {
                send = function (obj) {

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

            let dum_conn1 = new dum_conn();
            let dum_msg1 = new dum_msg();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            let dum_args = ['sweet'];
            showpoke.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args);
        })
    })
});