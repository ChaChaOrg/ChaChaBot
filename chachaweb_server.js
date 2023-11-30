//create constants to ensure that express & other items are present
const express = require('express');
const mysql = require("mysql");
const config = require("./config.json");
const session = require('express-session');
const bodyParser = require('body-parser');
const EventEmitter = require('events');
//const path = require('path');

const DiscordOauth2 = require("discord-oauth2");

const oauth = new DiscordOauth2({
    clientId: config.webClientID,
    clientSecret: config.clientSecret,
    redirectUri: "http://localhost:7000/discord_auth"
});


// pokemon values
let Pokemon = require(`./models/pokemon.js`);
const pokedex = require('pokedex-promise-v2');
const { resolve } = require('path');

// get the Pokedex
let P = new pokedex();
// create list of Pokemon to hold the pokes in the SQL
let pokemonList = [];
let allPokemonList = [];
let pageCount = 0;
let currentPage = 1;
let pageSize = 25;

// Pokemon Stat constants
// Array list of possible Pokemon types
const TYPE_LIST = ['', 'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'];
// The maximum level a Pokemon can be
const LEVEL_MAX = 20;
const PAGE_SIZE = 25;

// Reused text lines
const TRY_AGAIN_LINKS = '<a href="/discord_auth">Try Again</a> or <a href="/">Return Home</a>';

const STATIC_FIELDS = ["name", "gender", "hp", "atk", "def", "spa", "spd", "spe", "move1", "move2", "move3", "move4", "move5", "moveProgress", "originalTrainer", "shiny", "private"];

// get all pokemon species from API for adding/editing pokemon
var SPECIES_LIST = []
var interval = {
    limit: 898, //no extra forms for now
    offset: 0
  }
P.getPokemonsList(interval)
    .then(function(response) {
        SPECIES_LIST = response.results.map(function(item) { return item["name"]; });
        // console.log(response);
        // console.log(SPECIES_LIST)
    })

// console.log(SPECIES_LIST)
// create pool of connections to the sql
const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql_host,
    user: config.mysql_user,
    password: config.mysql_pass,
    database: config.mysql_db,
    port: config.mysql_port,
    supportBigNumbers: true,
    bigNumberStrings: true
});

// Load all the pokemon ONCE before starting up
loadAllPokemon()

// Load all moves
let fs = require('fs');
let dataArray = [];
let movesList = []
//Load Moves file
fs.readFile('./data/Moves.txt', (err, data) => {
    if (err) {
        console.log('Error reading move file.\n' + err.toString());
    } else {
        //Split moves file into one String per line
        dataArray = data.toString().split(/\r?\n/);
        dataArray.forEach((move) => movesList.push(move.split(/\s+/)[1]));
    }
});

//import express
const app = express();
// set pug as template engine
app.set('view engine', 'pug');

// serve static files from the 'public' folder
app.use(express.static(__dirname + '/public'));

// create login stuff
app.use(session({
    name: 'chacha_db',
    secret: 'pepsi secret',
    resave: true,
    saveUninitialized: false
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/** ================= APP.GET STUFFS =================
 *  req = "request", the page that's requesting the get be run. Used to grab info such as form inputs
 *  res = "response", the page that's going to be loaded into after the code is run
 */

// This app.get request loads the index/home page, which is the first thing the user sees when they access the page
app.get('/', (req, res) => {
    /*  This is the home page. Any time you come here, something that's bringing you here (ie login or initial load) will
    *   take care of reloading the Pokemon database. This means all this fella has to worry about is making sure it sends
    *   the right information to the actual index.pug page. 
    *  */
    
    if (req.query.currentPage)
        currentPage = req.query.currentPage
    
    if (req.query.pageSize)
        pageSize = req.query.pageSize

    pool.query('SELECT * FROM pokemon WHERE private = 0', function (err, rows, fields) {
        pageCount = Math.floor(rows.length / pageSize)
    });

    // if there is a discord ID, assign it
    let currentDiscordID;
    if (req.session.discordID) currentDiscordID = req.session.discordID;
    else {
        return res.render('index', {
            "title": "ChaCha Database",
            "pokemonList": [],
            "loggedIn": req.session.loggedin,
            "username": req.session.username,
            "currentPage": currentPage,
            "pageCount": pageCount,
            "pageSize": pageSize
        });
    }

    try {
        loadPokemon(currentPage, pageCount, pageSize).then(function () {
            res.render('index', {
                "title": "ChaCha Database",
                "pokemonList": pokemonList,
                "loggedIn": req.session.loggedin,
                "username": req.session.username,
                "currentDiscordID": currentDiscordID,
                "currentPage": currentPage,
                "pageCount": pageCount,
                "pageSize": pageSize
            });
        })
        // loadPokemonForUser(currentDiscordID).then(function () {// will either hold 0 or yoink the current discord ID
        //     // grab filtered pokemon
        //     // let filteredPokes = filterPokemon(currentDiscordID);

        //     // attempt to render the page properly
        //     res.render('index', {
        //         "title": "ChaCha Database",
        //         "pokemonList": pokemonList,
        //         "loggedIn": req.session.loggedin,
        //         "username": req.session.username
        //     });
        // });
    } catch (err) {
        // if you're here, throw the appropriate error
        console.log("Index page did not load proper");
        res.status(80085).json({
            "status_code": 80085,
            "status_message": "Index page couldn't load the pokemon database"
        });
    }
})

// load page of pokemon the logged-in user created
app.get('/myPokemon', (req, res) => {
    if (!req.session.loggedin) {
        res.render("error", {
            "title": "Not Logged In",
            "message": "You must be logged in to view your Pokemon!"
        })
    } else {
        try {
             if (req.session.discordID) currentDiscordID = req.session.discordID;

            loadPokemonForUser(currentDiscordID).then(function () {// will either hold 0 or yoink the current discord ID
                // grab filtered pokemon
                let filteredPokes = filterPokemon(currentDiscordID);

                // attempt to render the page properly
                res.render('myPokemon', {
                    "title": "ChaCha Database",
                    "pokemonList": filteredPokes,
                    "loggedIn": req.session.loggedin,
                    "username": req.session.username,
                    "myPoke": true
                });
            });
        } catch (err) {
            // if you're here, throw the appropriate error
            console.log("Index page did not load proper " + err);
            res.status(80085).json({
                "status_code": 80085,
                "status_message": "Index page couldn't load the pokemon database"
            });
        }
    }
})

// This app.get request loads the index/home page, which is the first thing the user sees when they access the page
app.get('/damage', (req, res) => {

    /*  This is the home page. Any time you come here, something that's bringing you here (ie login or initial load) will
    *   take care of reloading the Pokemon database. This means all this fella has to worry about is making sure it sends
    *   the right information to the actual index.pug page. h
    *  */
    // if there is a discord ID, assign it
    if (req.session.discordID) currentDiscordID = req.session.discordID;
    else {
        res.render("error", {
            "title": "Not Logged In",
            "message": "You must be logged in to use the damage calculator!"
        })
    }
    try {
        res.render('damage', {
            "title": "ChaCha Damage Calculator",
            "pokemonList": allPokemonList,
            "loggedIn": req.session.loggedin,
            "username": req.session.username,
            "movesList": movesList
        });
        // loadPokemonForUser(currentDiscordID).then(function () {// will either hold 0 or yoink the current discord ID
        //     // let currentDiscordID = 0;

        //     // // if there is a discord ID, assign it
        //     // if (req.session.discordID) currentDiscordID = req.session.discordID;

        //     // grab filtered pokemon
        //     // let filteredPokes = filterPokemon(currentDiscordID);

        //     // attempt to render the page properly
        //     res.render('damage', {
        //         "title": "ChaCha Damage Calculator",
        //         "pokemonList": pokemonList,
        //         "loggedIn": req.session.loggedin,
        //         "username": req.session.username
        //     });
        // });
    } catch (err) {
        // if you're here, throw the appropriate error
        console.log("Index page did not load proper");
        res.status(80085).json({
            "status_code": 80085,
            "status_message": "Index page couldn't load the pokemon database"
        });
    }
})

app.post('/damage', (req, res) => {
    if (req.session.discordID) currentDiscordID = req.session.discordID;
    else {
        res.render("error", {
            "title": "Not Logged In",
            "message": "You must be logged in to use the damage calculator!"
        })
    }
    try {
        console.log(req.body.attackerName)
        console.log(req.body.defenderName)
        console.log(req.body.moveName)
        interaction = {
            client : {
                mysqlConnection: pool,
                pokedex: P,
                user: {
                    avatarURL: ""
                }
            },
            deferReply : function() {},
            options : {
                getSubcommand : function() {},
                getString : function(string) {
                    if(string === "attacker-name" )
                        return req.body.attackerName
                    if(string === "defender-name" )
                        return req.body.defenderName
                    if(string === "move-name" )
                        return req.body.moveName
                },
                getBoolean : function(critHit) {
                    return false
                },
                getInteger : function(stages) {
                    return null
                },
                getNumber : function(bonus) {
                    return null
                },
                "attacker-name" : req.body.attackerName,
                "defender-name" : req.body.defenderName,
                "move-name" : req.body.moveName
            },
            editReply : function() {},
            followUp : function(object) {
                console.log(object)
                function catch()
            },
            channel : {
                send : function() {}
            },
            catch : function(err) {
                console.log(err)
            },
            user : {
                username: "",
                avatarURL: ""
            }
            
        }
        
        let damage = require('./commands/damage')
        damage.run(interaction)
        
    } catch(err) {
        console.log(err);
        res.status(500).json({
            "status_code": 500,
            "status_message": "Page didn't load properly"
        });
    }
})

// Load individual pokemon view
app.get('/lookAtMe', (req, res) => {
    // testing
    console.log("Looking for Pokemon with Query ID: " + req.query.uniqueID);

    //pokemon object to hold the poke when we find it later
    var profilePoke = grabPoke(req);

    // load the pokemon info into the page
    res.render("lookAtMe", {
        "title": profilePoke.name + "'s Profile",
        "pokemon": profilePoke,
        "loggedIn": req.session.loggedin,
        "username": req.session.username
    });
})

app.get('/addPoke', (req, res) => {
    // check if there's someone logged in before you try to edit pokemon
    if (req.session.loggedin) {
        res.render("addPoke", {
            "title": "Adding pokemon",
            "typeList": TYPE_LIST,
            "maxLevel": LEVEL_MAX,
            "speciesList": SPECIES_LIST,
            "loggedIn": req.session.loggedin,
            "username": req.session.username
        })
    } else {
        // if you're not logged in,  you can't edit pokemon :(
        // res.send("You must be logged in to edit Pokemon!<br/><br/>" + TRY_AGAIN_LINKS);
        res.render("error", {
            "title": "Not Logged In",
            "message": "You must be logged in to add Pokemon!"
        })
    }
})

app.post('/submitAddPoke', (req, res) => {
    console.log("Attempting to add Pokemon to database");
    //console.log(req.body)

    try {
        if (req.body.species == '')
            throw new Error("Species must be defined!")

        if (req.body.level == '')
            throw new Error("Level must be defined!")

        if (req.body.name == '')
            throw new Error("Name must not be empty!")

		let genPokemon = new Pokemon(req.body.species, req.body.level, req.body.name);
        
        
		// assign hidden ability chance, if listed
		//if (args[3] !== null) genPokemon.haChance = args[3];
		// initialize the Pokemon
		/* istanbul ignore next */
        let P = new pokedex()
        let message = { 
            user: {
                id: req.session.discordID
            }
        }
		genPokemon.init(pool, P)
			.then(function (response) {
                if (req.body.statsCheckbox) {
                    genPokemon.statBlock.ivStats[0] = parseInt(req.body.hpIV);
                    genPokemon.statBlock.evStats[0] = parseInt(req.body.hpEV);
                    genPokemon.statBlock.ivStats[1] = parseInt(req.body.atkIV);
                    genPokemon.statBlock.evStats[1] = parseInt(req.body.atkEV);
                    genPokemon.statBlock.ivStats[2] = parseInt(req.body.defIV);
                    genPokemon.statBlock.evStats[2] = parseInt(req.body.defEV);
                    genPokemon.statBlock.ivStats[3] = parseInt(req.body.spaIV);
                    genPokemon.statBlock.evStats[3] = parseInt(req.body.spaEV);
                    genPokemon.statBlock.ivStats[4] = parseInt(req.body.spdIV);
                    genPokemon.statBlock.evStats[4] = parseInt(req.body.spdEV);
                    genPokemon.statBlock.ivStats[5] = parseInt(req.body.speIV);
                    genPokemon.statBlock.evStats[5] = parseInt(req.body.speEV);
                }
                // console.log(genPokemon.statBlock)
				// upload pokemon to database
				// logger.info(`[${serverName}][${channelName}][genpoke] Uploading pokemon to database.`);
				genPokemon.uploadPokemon(pool, message);

                // grab filtered pokemon
                let filteredPokes = filterPokemon(req.session.discordID);
                res.redirect('myPokemon');
                
			})
			.catch(function (error) {
                console.log("error")
                console.log(error)
			});

        
	}
	catch (error) {
		res.render("error", {
            "title": "Error adding pokemon",
            "message": "There was an error adding the Pokemon!\n" + error.toString()
        })
	}
    
    
})

//getting editPoke
app.get('/editPoke', (req, res) => {
    // testing
    console.log("Attempting to open editor for Pokemon with Query ID: " + req.query.uniqueID + "...");

    // check if there's someone logged in before you try to edit pokemon
    if (req.session.loggedin) {
        //pokemon object to hold the poke when we find it later
        let profilePoke = grabPoke(req);
        if (profilePoke.discordID == req.session.discordID) {
            res.render("editPoke", {
                "title": "Editing " + profilePoke.name,
                "pokemon": profilePoke,
                "typeList": TYPE_LIST,
                "maxLevel": LEVEL_MAX,
                "loggedIn": req.session.loggedin,
                "username": req.session.username
            });
        } else {
            // res.send("You aren't this Pokemon's owner!<br/><br/>" + TRY_AGAIN_LINKS);
            res.render("error", {
                "title": "Incorrect Owner",
                "message": "You aren't this Pokemon's owner!",
                "loggedIn": req.session.loggedin,
                "username": req.session.username
            })
        }
    } else {
        // if you're not logged in,  you can't edit pokemon :(
        // res.send("You must be logged in to edit Pokemon!<br/><br/>" + TRY_AGAIN_LINKS);
        res.render("error", {
            "title": "Not Logged In",
            "message": "You must be logged in to edit Pokemon!"
        })
    }
})

app.get('/deletePoke', (req, res) => {
    console.log(req.query)
    // testing
    console.log("Attempting to delete Pokemon with Query ID: " + req.query.uniqueID + "...");

    // check if there's someone logged in before you try to delete pokemon
    if (req.session.loggedin) {
        let deletePokeStatement = `DELETE FROM pokemon WHERE uniqueID = '${req.query.uniqueID}'`;
        pool.query(deletePokeStatement, function (err, rows, fields) {
            // if you're here, the name couldn't be found in the table
            if (err) {
                let cantAccessSQLMessage = "SQL error, please try again later or contact a maintainer if the issue persists.";
                console.log(cantAccessSQLMessage);
            } else {
                let filteredPokes = filterPokemon(req.session.discordID);
                res.redirect('myPokemon')
            }
        })
    } else {
        // if you're not logged in,  you can't edit pokemon :(
        // res.send("You must be logged in to edit Pokemon!<br/><br/>" + TRY_AGAIN_LINKS);
        res.render("error", {
            "title": "Not Logged In",
            "message": "You must be logged in to edit Pokemon!"
        })
    }
})
app.post('/updatePokemon', (req, res) => {
    console.log("Attempting to edit Pokemon");
    //console.log(req);

    // ================= SQL statements  =================
    // sql statement to check if the Pokemon exists
    let sqlFindPoke = `SELECT * FROM pokemon WHERE name = '${req.body.name}'`;
    pool.query(sqlFindPoke, function (err, rows, fields) {
        // if you're here, the name couldn't be found in the table
        if (err) {
            let cantAccessSQLMessage = "SQL error, please try again later or contact a maintainer if the issue persists.";
            console.log(cantAccessSQLMessage);
        } else if (rows.length === 0) {
            // the pokemon was not found
            console.log(req.body.name + " was not found.");
        } else {
            // sql statement to update the Pokemon
            let staticCheck = new Promise((resolve, reject) => {
                let sqlUpdateString = "";
                Object.keys(req.body).forEach(function (prop) {
                    sqlUpdateString = `UPDATE pokemon SET ${prop} = '${req.body[prop]}' WHERE name = '${req.body.name}'`;
                    pool.query(sqlUpdateString, function (err, results) {
                        if (err) {
                            let errorMessage = "Unable to update static field " + valName + " of " + req.body.name;
                            console.log(errorMessage);
                            console.log(err.toString());
                            reject();
                        } else {
                            let successMessage = "**" + req.body.name + "'s** " + prop + " has been changed to " + req.body[prop] + "!";
                            console.log(successMessage);
                            resolve();
                        }
                    })
                })
            });

            staticCheck.then(function () {
                loadPokemonForUser(currentDiscordID).then(function () {
                    res.redirect("/lookAtMe?uniqueID=" + req.body.uniqueID)
                });
            })
        }
    })
})

//Authenticate login
app.post('/auth', (req, res) => {
    console.log("Authenticating...");

    // grab the values provided by the sent form
    // grab the username
    let username = req.body.username;
    // grab the password
    let password = req.body.password;

    // check if the username and password were provided or null
    if (username && password) {
        // if you have a username and password, it's time to try and check the database to see if it's there
        try {
            // put this whole piece of garbage inside a promise
            pool.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (err, row, fields) {
                if (err) {
                    // if you're here, there was an error while attempting to query up
                    console.log("Error while attempting to find data in accounts.\nUsername: " + username + "\nPassword: " + password);
                    res.send("Error while attempting to access accounts database.\n\n" + TRY_AGAIN_LINKS);
                } else try {
                    // if you're in here, then the query didn't break when you tried to access it. Congrats!
                    // However, we still need to check if it actually found anything

                    // try to compare results to given username and password
                    if ((row[0].username === username) && (row[0].password === password)) {
                        // if you're here, then a match was found! time to actually log in
                        // set logged in user variables appropriately, reload the database, and return when done

                        // set logged in to true
                        req.session.loggedin = true;
                        // set logged in user's username
                        req.session.username = username;
                        // set logged in user's discord ID
                        req.session.discordID = row[0].discordID;

                        console.log("Logged in as user " + username + ", Discord ID: " + req.session.loggedInID);

                        // once everything's locked and loaded, redirect to the main page
                        console.log("Login info updated & Pokemon list reloaded. Redirecting home...");

                        // return home
                        res.redirect('/');
                    } else {
                        // if you're here, the query was made but the username/password didn't match.
                        console.log("Query successful, but no results found. Prompting user to try again.");
                        // let the page know
                        res.send("Incorrect username or password.\n\n" + TRY_AGAIN_LINKS);
                    }
                } catch (tryCatchErr) {
                    console.log("Unable to process login loading promise.");
                    console.log(tryCatchErr);
                }
            });
        } catch (err) {
            // if you're here, there was an issue while attempting to connect & verify
            console.log("Error while attempting to verify username & password");
            // load blank page with error notes + retry links
            res.send("Error while attempting to verify the username and passsword.\n\n" + TRY_AGAIN_LINKS);
        }
    } else {
        // if you're here, no username or pw was provided
        console.log("No username or password provided.");
        // alert the user by loading a blank page
        res.send('Please enter username and password!\n\n' + TRY_AGAIN_LINKS);
    }

})

/*
    Logs the user in using Discord API to obtain username and Discord ID.
*/
app.get('/discord_auth', (req, res) => {
    let discordId = 0
    const resp = oauth.tokenRequest({
        code: req.query.code,
        scope: 'identify',
        grantType: 'authorization_code'
    }).then(function(response) {
        const token = response.access_token;
        console.log(token)
        oauth.getUser(token).then(function(response) {
            discordId = response.id
            req.session.discordID = discordId;
            req.session.loggedin = true;
            req.session.username = response.username;
            res.redirect("/")
        }).catch(err => {
            console.log(err);
        })
    }).catch(err => {
        console.log(err)
    });

    
})
// show updates to pokemon and confirm changes
app.post('/confirmEdits', (req, res) => {
    console.log("Processing user-submitted updates...");

})

// log in page
app.get('/login', (req, res) => {
    console.log("Going to login screen.");
    res.render("login", {
        'title': "Log in to view private pokes"
    });
})

// log out
app.get('/logout', (req, res) => {
    // reset session variables
    req.session.loggedin = false;
    req.session.username = '';
    req.session.discordID = 0;

    // when the logout is complete, redirect to home
    res.redirect('/');

})

// set up a website to work on port 7000
const chachaweb_server = app.listen(7000, () => {
    // initial load of pokemonList
    // loadPokemon();
    // alert console that we're up n runnin
    console.log(`Express running → PORT ${chachaweb_server.address().port}`);

});

function getDiscordIDs() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT discordID from pokemon', function (err, rows, fields) {
            if (err) {
                // if an error is thrown here, the sql chachaweb_server could not be loaded into at all
                console.log("Cannot connect to the SQL chachaweb_server (pre-page loading)");
                reject("Couldn't connect to the SQL chachaweb_server :(");
            } else try {//collect items from the query
                rows.forEach(row => {
                    console.log(row)
                })
            } catch (err) {
                console.log("Can't connect to the chachaweb_server :(");
            }
        })
    })
}

/**
 * This function loads/refreshes the Pokemon database of the website. It does not allow the loading of Pokemon that are marked private if you are not logged in with the appropriate account!
 * @returns {Promise<unknown>} The promise that the pokemon are loaded up!
 */
function loadPokemon(currentPage, pageCount, pageSize) {
    return new Promise((resolve, reject) => {
        // variable to hold pokePromises
        const pokePromises = [];

        // clear out pokemonList if there's stuff stowed in it
        pokemonList = [];

        console.log(currentPage)
        if(!pageSize)
            offset = (currentPage - 1) * PAGE_SIZE;
        else
            offset = (currentPage - 1) * pageSize;
        // query the connection for a list of pokes to display
        pool.query('SELECT * FROM pokemon WHERE private = 0 LIMIT ' + offset + ',' + PAGE_SIZE, function (err, rows, fields) {
            if (err) {
                // if an error is thrown here, the sql chachaweb_server could not be loaded into at all
                console.log("Cannot connect to the SQL chachaweb_server (pre-page loading)");
                reject("Couldn't connect to the SQL chachaweb_server :(");
            } else try {//collect items from the query
                pageCount = Math.ceil(rows.length)
                

                // roll through all the pokemon and grab the ones that can be displayed properly
                for (let i = 0; i < rows.length; i++) {

                    // temp poke holds the pokemon object
                    let tempPoke = {
                        'uniqueID': rows[i].uniqueID,
                        'name': rows[i].name,
                        'species': rows[i].species,
                        'level': rows[i].level,
                        'nature': rows[i].nature,
                        'gender': rows[i].gender,
                        'ability': rows[i].ability,
                        'niceAbility': formatAbility(rows[i].ability),
                        'type1': rows[i].type1,
                        'type2': rows[i].type2,
                        'hp': rows[i].hp,
                        'atk': rows[i].atk,
                        'def': rows[i].def,
                        'spa': rows[i].spa,
                        'spd': rows[i].spd,
                        'spe': rows[i].spe,
                        'hpIV': rows[i].hpIV,
                        'atkIV': rows[i].atkIV,
                        'defIV': rows[i].defIV,
                        'spaIV': rows[i].spaIV,
                        'spdIV': rows[i].spdIV,
                        'speIV': rows[i].speIV,
                        'hpEV': rows[i].hpEV,
                        'atkEV': rows[i].atkEV,
                        'defEV': rows[i].defEV,
                        'spaEV': rows[i].spaEV,
                        'spdEV': rows[i].spdEV,
                        'speEV': rows[i].speEV,
                        'move1': rows[i].move1,
                        'move2': rows[i].move2,
                        'move3': rows[i].move3,
                        'move4': rows[i].move4,
                        'move5': rows[i].move5,
                        'moveProgress': rows[i].moveProgress,
                        'private': rows[i].private,
                        'originalTrainer': rows[i].originalTrainer,
                        'discordID': rows[i].discordID,
                        'dateCreated': rows[i].dateCreated,
                        'pokeObject': new Pokemon(rows[i].species, rows[i].level, rows[i].name)
                    };

                    // load pokeObject, then push to tempPoke
                    //tempPoke.pokeObject.loadFromSQL(P, rows[i]);
                    // load pokeObject, THEN push into pokemonList
                    /*tempPoke.pokeObject.loadFromSQL(P, rows[i]).then( function() {
                        pokemonList.push(tempPoke);
                    });*/

                    // load pokedex info from sql
                    pokePromises.push(tempPoke.pokeObject.loadFromSQL(pool, P, rows[i]));
                    // push into the pokemonList
                    pokemonList.push(tempPoke);
                    //console.log(tempPoke.name + ", Lv " + tempPoke.level + " " + tempPoke.species + " loaded!");

                }
                // once everything is done and loaded, render into index
                Promise.all(pokePromises).then(function (response) {
                    console.log("Pokemon have all been loaded into chachaweb_server. " + pokemonList.length + " pokes loaded!");
                    resolve();
                });
            } catch (err) {
                console.log("Can't connect to the chachaweb_server :(");
            }
        });
    })
}

function loadAllPokemon() {
    return new Promise((resolve, reject) => {
        // variable to hold pokePromises
        const pokePromises = [];

        // clear out pokemonList if there's stuff stowed in it
        pokemonList = [];
        // console.log(`SELECT * FROM pokemon WHERE discordID == ${discordID}`)
        // query the connection for a list of pokes to display
        pool.query(`SELECT * FROM pokemon WHERE private = 0`, function (err, rows, fields) {
            if (err) {
                // if an error is thrown here, the sql chachaweb_server could not be loaded into at all
                console.log("Cannot connect to the SQL chachaweb_server (pre-page loading)");
                reject("Couldn't connect to the SQL chachaweb_server :(");
            } else try {//collect items from the query

                // roll through all the pokemon and grab the ones that can be displayed properly
                for (let i = 0; i < rows.length; i++) {

                    // temp poke holds the pokemon object
                    let tempPoke = {
                        'uniqueID': rows[i].uniqueID,
                        'name': rows[i].name,
                        'species': rows[i].species,
                        'level': rows[i].level,
                        'nature': rows[i].nature,
                        'gender': rows[i].gender,
                        'ability': rows[i].ability,
                        'niceAbility': formatAbility(rows[i].ability),
                        'type1': rows[i].type1,
                        'type2': rows[i].type2,
                        'hp': rows[i].hp,
                        'atk': rows[i].atk,
                        'def': rows[i].def,
                        'spa': rows[i].spa,
                        'spd': rows[i].spd,
                        'spe': rows[i].spe,
                        'hpIV': rows[i].hpIV,
                        'atkIV': rows[i].atkIV,
                        'defIV': rows[i].defIV,
                        'spaIV': rows[i].spaIV,
                        'spdIV': rows[i].spdIV,
                        'speIV': rows[i].speIV,
                        'hpEV': rows[i].hpEV,
                        'atkEV': rows[i].atkEV,
                        'defEV': rows[i].defEV,
                        'spaEV': rows[i].spaEV,
                        'spdEV': rows[i].spdEV,
                        'speEV': rows[i].speEV,
                        'move1': rows[i].move1,
                        'move2': rows[i].move2,
                        'move3': rows[i].move3,
                        'move4': rows[i].move4,
                        'move5': rows[i].move5,
                        'moveProgress': rows[i].moveProgress,
                        'private': rows[i].private,
                        'originalTrainer': rows[i].originalTrainer,
                        'discordID': rows[i].discordID,
                        'dateCreated': rows[i].dateCreated,
                        'pokeObject': new Pokemon(rows[i].species, rows[i].level, rows[i].name)
                    };

                    // load pokeObject, then push to tempPoke
                    //tempPoke.pokeObject.loadFromSQL(P, rows[i]);
                    // load pokeObject, THEN push into pokemonList
                    /*tempPoke.pokeObject.loadFromSQL(P, rows[i]).then( function() {
                        pokemonList.push(tempPoke);
                    });*/

                    // load pokedex info from sql
                    pokePromises.push(tempPoke.pokeObject.loadFromSQL(pool, P, rows[i]));
                    // push into the pokemonList
                    allPokemonList.push(tempPoke);
                    // pokemonList.push(tempPoke)
                    //console.log(tempPoke.name + ", Lv " + tempPoke.level + " " + tempPoke.species + " loaded!");

                }
                // once everything is done and loaded, render into index
                Promise.all(pokePromises).then(function (response) {
                    console.log("Pokemon have all been loaded into chachaweb_server. " + allPokemonList.length + " pokes loaded!");
                    resolve();
                });
            } catch (err) {
                console.log("Can't connect to the chachaweb_server :(");
            }
        });
    })
}

function loadPokemonForUser(discordID) {
    return new Promise((resolve, reject) => {
        // variable to hold pokePromises
        const pokePromises = [];

        // clear out pokemonList if there's stuff stowed in it
        pokemonList = [];
        // console.log(`SELECT * FROM pokemon WHERE discordID == ${discordID}`)
        // query the connection for a list of pokes to display
        pool.query(`SELECT * FROM pokemon WHERE discordID = ${discordID}`, function (err, rows, fields) {
            if (err) {
                // if an error is thrown here, the sql chachaweb_server could not be loaded into at all
                console.log("Cannot connect to the SQL chachaweb_server (pre-page loading)");
                reject("Couldn't connect to the SQL chachaweb_server :(");
            } else try {//collect items from the query

                // roll through all the pokemon and grab the ones that can be displayed properly
                for (let i = 0; i < rows.length; i++) {

                    // temp poke holds the pokemon object
                    let tempPoke = {
                        'uniqueID': rows[i].uniqueID,
                        'name': rows[i].name,
                        'species': rows[i].species,
                        'level': rows[i].level,
                        'nature': rows[i].nature,
                        'gender': rows[i].gender,
                        'ability': rows[i].ability,
                        'niceAbility': formatAbility(rows[i].ability),
                        'type1': rows[i].type1,
                        'type2': rows[i].type2,
                        'hp': rows[i].hp,
                        'atk': rows[i].atk,
                        'def': rows[i].def,
                        'spa': rows[i].spa,
                        'spd': rows[i].spd,
                        'spe': rows[i].spe,
                        'hpIV': rows[i].hpIV,
                        'atkIV': rows[i].atkIV,
                        'defIV': rows[i].defIV,
                        'spaIV': rows[i].spaIV,
                        'spdIV': rows[i].spdIV,
                        'speIV': rows[i].speIV,
                        'hpEV': rows[i].hpEV,
                        'atkEV': rows[i].atkEV,
                        'defEV': rows[i].defEV,
                        'spaEV': rows[i].spaEV,
                        'spdEV': rows[i].spdEV,
                        'speEV': rows[i].speEV,
                        'move1': rows[i].move1,
                        'move2': rows[i].move2,
                        'move3': rows[i].move3,
                        'move4': rows[i].move4,
                        'move5': rows[i].move5,
                        'moveProgress': rows[i].moveProgress,
                        'private': rows[i].private,
                        'originalTrainer': rows[i].originalTrainer,
                        'discordID': rows[i].discordID,
                        'dateCreated': rows[i].dateCreated,
                        'pokeObject': new Pokemon(rows[i].species, rows[i].level, rows[i].name)
                    };

                    // load pokeObject, then push to tempPoke
                    //tempPoke.pokeObject.loadFromSQL(P, rows[i]);
                    // load pokeObject, THEN push into pokemonList
                    /*tempPoke.pokeObject.loadFromSQL(P, rows[i]).then( function() {
                        pokemonList.push(tempPoke);
                    });*/

                    // load pokedex info from sql
                    pokePromises.push(tempPoke.pokeObject.loadFromSQL(pool, P, rows[i]));
                    // push into the pokemonList
                    pokemonList.push(tempPoke);
                    //console.log(tempPoke.name + ", Lv " + tempPoke.level + " " + tempPoke.species + " loaded!");

                }
                // once everything is done and loaded, render into index
                Promise.all(pokePromises).then(function (response) {
                    console.log("Pokemon have all been loaded into chachaweb_server. " + pokemonList.length + " pokes loaded!");
                    resolve();
                });
            } catch (err) {
                console.log("Can't connect to the chachaweb_server :(");
            }
        });
    })
}

/**
 * This function takes the list of Pokemon currently loaded into the chachaweb_server and filters them according to the given discord ID, so only Pokemon the user is allowed to view can see appear on the page.
 * @param discordID The discord ID of the logged-in user
 * @returns {[]} An array of Pokemon filtered to be displayed to the user
 */
function filterPokemon(discordID) {
    // create new pokemon list to be shown to the user
    let tempPokeList = [];

    // create counters for loaded / non-loaded pokemon (for console print later)
    // loaded pokemon counter
    let loadedPokes = 0;
    // non-loaded/ filtered out pokemon counter
    let privatePokes = 0;

    // ================ v2 - ARRAY.FILTER METHOD ================
    // attempt to filter through the pokemon list owned by the chachaweb_server
    try {

        // use filter to yoink what's needed from pokemonList
        tempPokeList = pokemonList.filter(tempPoke => {
            //check if tempPoke is private
            if (tempPoke.private) {
                // if here, it's private, so check if the discord id matches
                if (tempPoke.discordID === discordID) {
                    // if you're here, it's private AND accessible by the user
                    loadedPokes++;
                    return true;
                } else {
                    // if you're here, it's private and can't be shown
                    privatePokes++;
                    return false;
                }
            } else {
                // if you're here, it's public so just go ahead and add
                loadedPokes++;
                return true;
            }
        });

    } catch (err) {
        // if you're here, something broke while attempting to filter through pokemonList
        console.log("Error while attempting to filter through the chachaweb_server's Pokemon list :(");
    }

    // return the new list
    return tempPokeList;
}

/**
 * This function grabs & returns a Pokemon based on it's unique ID
 * @param req The request sent by the page
 * @returns {*|string} The string of the requested Pokemon
 */
function grabPoke(req) {

    // temp item to hold & return the poke
    let yoinkedPoke = '';

    // search pokemonList for matching ID
    for (let i = 0; i < pokemonList.length; i++) {
        let checkPoke = pokemonList[i];
        // THIS IS OKAY!!! For some reason === doesn't work so it has to stay ==
        if (checkPoke.uniqueID == req.query.uniqueID || checkPoke.uniqueID == req.body.uniqueID) {
            yoinkedPoke = pokemonList[i];
            console.log(yoinkedPoke.name + " found and loaded!");
            return yoinkedPoke;
        }
    }
}

/**
 * Takes a word in and capitalizes the first letter
 * @param tempWord The word to format
 * @returns {string} The newly formatted word, with first letter capitalized
 */
function capitalize(tempWord) {
    return tempWord.charAt(0).toUpperCase() + tempWord.substr(1);
}

/**
 * Takes an ability string and formats it nicely for print
 * @param ability the raw ability string to translate
 * @returns {string} the formatted ability string
 */
function formatAbility(ability) {
    // if two word ability, break apart and format accordingly
    if (~ability.indexOf("-")) {
        // yoink both halves
        let tempA = ability.slice(0, ability.indexOf("-"));
        let tempB = ability.slice(ability.indexOf("-") + 1, ability.length);
        // capitalize them both
        return capitalize(tempA) + " " + capitalize(tempB);
    } else {
        // return the given ability, but capitalized properly
        return capitalize(ability);
    }
}