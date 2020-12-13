var assert = require('assert');
var catchCmd = require('../commands/catch.js');

const HELP_MESSAGE = "Catch Rate Calculator. Variables in order:\n "
    + "[Pokemon Name] [Max HP] [Current HP] [Catch Rate] [Pokeball Bonus] [Status Bonus] "
    + "[Capture Power Bonus] [Player Catch Bonus] [Pokemon Level]\n"
    + "Default bonus values are: \n\tPokeball = 1\n\tStatus = 1\n\tCapture Power = 1\n\tPlayer Catch = 1"

describe('catch', function () {
    describe('help', function () {
        it('should print the help message', function () {
            class dum_msg {
                reply = function (obj) {
                    assert.strictEqual(obj, HELP_MESSAGE);
                    return Promise.resolve()
                }
            }

            class fake_client {
                emojis = [
                    { "name": "poke_shake" }
                ]
            }

            let dum_args = ['help'];
            let dum_msg1 = new dum_msg()
            let dum_client = new fake_client()
            catchCmd.run(dum_client, '', '', dum_msg1, dum_args)
        });
    });

    describe('too few arguments', function () {
        it('should print too few arguments message and the help message', function () {
            class dum_msg {
                reply = function (obj) {
                    assert.strictEqual(obj, "You haven't provided enough arguments. If you'd like help with the command, here you go:\n" + HELP_MESSAGE);
                    return Promise.resolve()
                }
            }

            class fake_client {
                emojis = [
                    { "name": "poke_shake" }
                ]
            }

            let dum_args = [];
            let dum_msg1 = new dum_msg()
            let dum_client = new fake_client()
            catchCmd.run(dum_client, '', '', dum_msg1, dum_args)
        });
    });

    describe('valid arguments', function () {
        it('should print the shake messages', function () {
            class dum_channel {
                send = function (obj) {
                    assert.match(obj, /(data received! loading... :poke_shake:)|(The ball shakes once...)|(...it shakes twice...)|(......it shakes three times... \(so exciting!! :fingers_crossed:\))|(:star2: CLICK :star2:)|(Dadadada! The wild gastly was caught!)/);
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
            }

            class fake_client {
                emojis = [
                    {
                        name: "poke_shake",
                        value: ":poke_shake:",
                        toString: function () {
                            return this.value
                        }
                    }
                ]
            }

            let dum_args = ["gastly", 15, 15, 15, 15, 15, 15, 15, 15];
            let dum_msg1 = new dum_msg()
            let dum_client = new fake_client()
            catchCmd.run(dum_client, '', '', dum_msg1, dum_args)
        });
    });

    describe('more arguments', function () {
        it('should print the shake messages', function () {
            class dum_channel {
                send = function (obj) {
                    assert.match(obj, /(data received! loading... :poke_shake:)|(The ball shakes once...)|(...it shakes twice...)|(......it shakes three times... \(so exciting!! :fingers_crossed:\))|(:star2: CLICK :star2:)|(Dadadada! The wild gastly was caught!)/);
                    return Promise.resolve()
                }
            }

            class dum_msg {
                channel = new dum_channel();
            }

            class fake_client {
                emojis = [
                    {
                        name: "poke_shake",
                        value: ":poke_shake:",
                        toString: function () {
                            return this.value
                        }
                    }
                ]
            }

            let dum_args = ["gastly", 15, 15, 15, 15, 15, 15, 15, 15];
            let dum_msg1 = new dum_msg()
            let dum_client = new fake_client()
            catchCmd.run(dum_client, '', '', dum_msg1, dum_args)
        });
    });
});