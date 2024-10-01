const logger = require('../logs/logger.js');

module.exports = Nature;

const NATURE_POSITIVE_MULTIPLIER = 1.1;
const NATURE_NEGATIVE_MULTIPLIER = 0.9;
const NATURE_ARRAY_MAX = 5;
const STAT_ARRAY_MAX = 6;

const NATURE_NAMES = [
    ["Hardy", "Lonely", "Adamant", "Naughty", "Brave"],
    ["Bold", "Docile", "Impish", "Lax", "Relaxed"],
    ["Modest", "Mild", "Bashful", "Rash", "Quiet"],
    ["Calm", "Gentle", "Careful", "Quirky", "Sassy"],
    ["Timid", "Hasty", "Jolly", "Naive", "Serious"]
];

function Nature() {
    this.natureFinal = "";
    this.natureXCoord = 0;
    this.natureYCoord = 0;

}

Nature.prototype.calculateNatureStats = function (pokemon) {
    logger.info("[nature] Calculating nature stats.")
//    console.log("x " + this.natureXCoord + " Y: " + this.natureYCoord + " final: " + this.natureFinal);
    if (this.natureXCoord !== this.natureYCoord) {
        for (let i = 0; i < STAT_ARRAY_MAX; i++) {
            if (this.natureYCoord === i) {
                pokemon.statBlock.nMultiStats[i + 1] = NATURE_POSITIVE_MULTIPLIER;
            }
            if (this.natureXCoord === i) {
                pokemon.statBlock.nMultiStats[i + 1] = NATURE_NEGATIVE_MULTIPLIER;
            }
        }
    }
    console.log("nmulti="+ pokemon.statBlock.nMultiStats);
};
/**
 * Assigns a nature to a Pokemon given both the Pokemon itself and the desired nature
 * @param pokemon the Pokemon to update
 * @param nature the desired new Nature
 */
Nature.prototype.assignNature = function (pokemon, nature) {
    logger.info("[nature] Assigning nature.")
    this.natureFinal = nature;
    this.natureXCoord = 0;
    this.natureYCoord = 0;



    NATURE_NAMES.forEach(function (natureY, natureYIndex) {
        let natureX = -1;
        natureX = natureY.findIndex(element => {
            return element.toString().toLowerCase() === nature.toString().toLowerCase();
        });
        if (natureX > -1) {
            this.natureXCoord = natureX;
            this.natureYCoord = natureYIndex;
        }
    }.bind(this));

    this.calculateNatureStats(pokemon);

};

//generate nature
Nature.prototype.assignRandNature = function (pokemon) {
    logger.info("[nature] Assigning random nature.")
    //x-coord for nature
    //these temp vars are the reason genpoke was messing up the nature
    let natureXCoord = Math.floor((Math.random() * NATURE_ARRAY_MAX)); //val between 0-4 for array
    //y-coord for nature
    let natureYCoord = Math.floor((Math.random() * NATURE_ARRAY_MAX));
    console.log(natureXCoord + ", " + natureYCoord);
    //assign selected nature
    //temp var issue can be corrected by going through assignNature like this
    this.assignNature(pokemon, NATURE_NAMES[natureXCoord][natureYCoord]);
    //assign nature to final val
    //this.natureFinal = NATURE_NAMES[natureXCoord][natureYCoord];
    //console.log(this.natureFinal);
    //update attributes based on nature
    //if xcoord = ycoord, no changes, otherwise adjusting...
    //this.calculateNatureStats(pokemon, natureXCoord, natureYCoord);
    //this.calculateNatureStats(pokemon);
};