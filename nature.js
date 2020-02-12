module.exports = Nature;

const NATURE_POSITIVE_MULIPLIER = 1.1;
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

function Nature()
{
    this.natureFinal = "";

}

Nature.prototype.calculateNatureStats = function(pokemon, natureXCoord, natureYCoord) {
    if (natureXCoord !== natureYCoord) {
        for (let i = 0; i < STAT_ARRAY_MAX; i++) {
            if (natureXCoord === i) {
                pokemon.statBlock.nMultiStats[i + 1] = NATURE_POSITIVE_MULIPLIER;
            }
            if (natureYCoord === i) {
                pokemon.statBlock.nMultiStats[i + 1] = NATURE_NEGATIVE_MULTIPLIER;
            }
        }
    }
};

Nature.prototype.assignNature = function(pokemon, nature)
{
    this.natureFinal = nature;
    let natureXCoord = 0;
    let natureYCoord = 0;
    NATURE_NAMES.forEach( function(natureY, natureYIndex) {
        let natureX = natureY.find(nature);
        if (natureX > -1) {
            natureXCoord = natureX;
            natureYCoord = natureYIndex;
        }
    });

    this.calculateNatureStats(pokemon, natureXCoord, natureYCoord);

};

//generate nature
Nature.prototype.assignRandNature = function(pokemon) {
//x-coord for nature
    let natureXCoord = Math.floor((Math.random() * NATURE_ARRAY_MAX)); //val between 0-4 for array
//y-coord for nature
    let natureYCoord = Math.floor((Math.random() * NATURE_ARRAY_MAX));

//assign nature to final val
    this.natureFinal = NATURE_NAMES[natureXCoord][natureYCoord];

//update attributes based on nature
//if xcoord = ycoord, no changes, otherwise adjusting...
    this.calculateNatureStats(pokemon, natureXCoord, natureYCoord);

};