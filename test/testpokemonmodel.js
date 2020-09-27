var assert = require('assert');
var Pokemon = require('../models/pokemon.js');

describe('Pokemon', function () {
    let overallTestPoke = new Pokemon("gastly", "2", "fart cloud");
    describe('init()', function () {
        it('should create a pokemon with given name, level, and nickname', function () {
            let testpoke = new Pokemon("gastly", "2", "fart cloud");
            assert.equal(testpoke.species, "gastly")
            assert.equal(testpoke.level, "2")
            assert.equal(testpoke.name, "fart cloud")
        });
        it('should set level to 1 if input is not a positive integer', function () {
            let testpoke = new Pokemon("", "-5", "")
            assert.equal(testpoke.level, "1")

            testpoke = new Pokemon("", "nan", "")
            assert.equal(testpoke.level, "1")

            testpoke = new Pokemon("", "1289371298", "")
            assert.equal(testpoke.level, "1")
        })
    });

    describe('modPrint(abilityScore)', function() {

    });
});