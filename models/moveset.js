const logger = require('../logs/logger.js');

module.exports =
{
    MoveSet,
    Move
};

function MoveSet() {
    this.move1 = new Move();
    this.move2 = new Move();
    this.move3 = new Move();
    this.move4 = new Move();
    this.move5 = new Move();

    this.moveArray = [this.move1, this.move2, this.move3, this.move4, this.move5];

    this.moveProgress = 0;

}

//When given an array of names, grabs all relevent data and makes a move object.
//Then it creates a new Moveset from the Moves.
MoveSet.prototype.createMovesetByName = function (moveNamesArray, P) {
    return new Promise(function () {
        moveNamesArray.forEach(function (element, index) {
            if (typeof element == "number") {
                this.moveProgress = element
            }
            else {
                let tempMove = new Move();
                tempMove.createFromName(element, P)
                    .then(function (moveElement) {
                        this.moveArray[index] = tempMove;
                    });
            }
        });
    });
};

//A generic move object
function Move() {
    this.name = "";
    this.basePower = 0;
    this.effectChance = 0;
    this.pokePower = 0;
    this.accuracy = 0;
    this.type = "";
    this.description = "";
    this.contestType = "";
}

//Creates a move object from a name from the Pokedex.
Move.prototype.createFromName = function (moveName, P) {
    //takes pokedex P and grabs move data from the name;
    return new Promise(function () {
        logger.info("[moveset] Getting move by name.")
        return interaction.pokedex.getMoveByName(moveName)
            .then(function (response) {
                logger.info("[moveset] Got move by name, setting fields.")
                let moveData = response;
                this.name = moveData["name"];
                this.basePower = moveData["power"];
                this.accuracy = moveData["accuracy"];
                this.effectChance = moveData["effect_chance"];
                this.type = moveData["type"]["name"];
                this.contestType = moveData["contest_type"]["name"];
                this.description = moveData["effect_entries"][0]["effect"];
            }).catch(function (error) {
                logger.error("[moveset] Error: " + error)
            });
    });
};