// =====================================
// GET GAME FROM URL
// =====================================

const params =
    new URLSearchParams(window.location.search);

const game =
    params.get("game") || "GTA Vice City";


// =====================================
// GAME DATA
// =====================================

const games = {

    "GTA Vice City": {

        title: "GTA VICE CITY",

        category: "Action • Open World",

        image: "images/gta-vc.jpg"

    },


    "Need for Speed": {

        title: "NEED FOR SPEED",

        category: "Racing • Cars",

        image: "images/nfs.jpg"

    },


    "God of War": {

        title: "GOD OF WAR",

        category: "Action • Adventure",

        image: "images/god-of-war.jpg"

    }

};


// =====================================
// LOAD GAME
// =====================================

const selectedGame =
    games[game] || games["GTA Vice City"];


document.getElementById("gameTitle").textContent =
    selectedGame.title;


document.getElementById("gameCategory").textContent =
    selectedGame.category;


document.getElementById("gameImage").src =
    selectedGame.image;


// =====================================
// GAME LIBRARY
// =====================================

function goGames() {

    window.location.href = "games.html";

}


// =====================================
// START GAME
// =====================================

function startGame() {

    window.location.href =
        "play.html?game=" +
        encodeURIComponent(game);

}