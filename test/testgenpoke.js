var assert = require('assert');
var genpoke = require('../commands/genpoke.js');
var pokedex = require('pokedex-promise-v2');



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
                reply = function () {
                }
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
                    assert.strictEqual(obj.embed.title, 'Level 17 Gastly ~ fartcloud')
                    assert.strictEqual(obj.embed.url, `https://bulbapedia.bulbagarden.net/wiki/gastly_(Pok%C3%A9mon)`)
                    assert.strictEqual(obj.embed.description, "Click the link for the Bulbapedia page, or use !data to call info using the Pokedex bot.")
                }
            }

            class dum_msg {
                channel = new dum_channel();
                author = {
                    "id": 1
                }
                reply = function (obj) {
                    assert(obj, 'fartcloud has been added to the database\nTo remove it, use this command: `+rempoke fartcloud "`')
                }
            }

            class dum_conn {
                query = function (sql, cb) {
                    let response = {
                        0:{
                            formName: 'quicksilver-spiritomb',
                            type1: 'ghost',
                            type2: 'flying',
                            hpBST: 108,
                            atkBST: 108,
                            spaBST: 108,
                            defBST: 108,
                            spdBST: 108,
                            speBST: 108,
                            ability1: 'Pressure',
                            ability2: null,
                            ability3: null,
                            gender_rate: -1,
                            capture_rate: 3
                        }
                    };
                    let err = null;
                    cb(err, response);
                }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            let dum_args = ['gastly', '17', 'fartcloud'];
            let dum_msg1 = new dum_msg();
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            genpoke.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })

    describe('valid use case ~CUSTOM FORM~ WITHOUT hidden ability %', function () {
        it('should generate the pokemon properly', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj.embed.title, 'Level 10 quicksilver-spiritomb ~ TestQS')
                    assert.strictEqual(obj.embed.url, `https://bulbapedia.bulbagarden.net/wiki/spiritomb(Pok%C3%A9mon)`)
                    assert.strictEqual(obj.embed.description, "Click the link for the Bulbapedia page, or use !data to call info using the Pokedex bot.")
                }
            }

            class dum_msg {
                channel = new dum_channel();
                author = {
                    "id": 1
                }
                reply = function (obj) {
                    assert(obj, 'TestQS has been added to the database\nTo remove it, use this command: `+rempoke fartcloud "`')
                }
            }

            class dum_conn {
                query = function (sql, cb) {
                    //FINISH
                    let response = {
                        0:{
                            formName: 'quicksilver-spiritomb',
                            type1: 'ghost',
                            type2: 'flying',
                            hpBST: 108,
                            atkBST: 108,
                            spaBST: 108,
                            defBST: 108,
                            spdBST: 108,
                            speBST: 108,
                            ability1: 'Pressure',
                            ability2: null,
                            ability3: null,
                            gender_rate: -1,
                            capture_rate: 3
                        }
                    };
                    let err = null;
                    cb(err, response);
                }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            let dum_args = ['Spiritomb', '10', 'TestQS', 'spiritomb-quicksilver'];
            let dum_msg1 = new dum_msg();
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            genpoke.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args);
        })
    })
});