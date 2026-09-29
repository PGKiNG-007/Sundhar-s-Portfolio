function goDashboard() {

    window.location.href = "dashboard.html";

}


function playGame(gameName) {

    window.location.href =
        "launch.html?game=" +
        encodeURIComponent(gameName);

}

function searchGames() {

    const search =
        document
            .getElementById("gameSearch")
            .value
            .toLowerCase();

    const games =
        document.querySelectorAll(".game-card");


    games.forEach((game) => {

        const name =
            game
                .getAttribute("data-name")
                .toLowerCase();


        if (name.includes(search)) {

            game.style.display = "block";

        } else {

            game.style.display = "none";

        }

    });

}