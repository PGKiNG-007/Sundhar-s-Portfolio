import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";


const firebaseConfig = {
    apiKey: "AIzaSyCSBZmKfmXqM2_FdxMAvBFNF7rlk-lxf0U",
    authDomain: "pg-cloud-gaming.firebaseapp.com",
    projectId: "pg-cloud-gaming",
    storageBucket: "pg-cloud-gaming.firebasestorage.app",
    messagingSenderId: "168272624413",
    appId: "1:168272624413:web:834e1eaa982a36e0483ff4",
    measurementId: "G-LE0VJHPRWG"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// ===============================
// LOGIN CHECK
// ===============================

onAuthStateChanged(auth, (user) => {

    if (user) {

        const userName =
            user.displayName || "Gamer";


        // PROFILE NAME
        document.getElementById("userName").textContent =
            userName;


        // WELCOME MESSAGE
        document.getElementById("welcomeUser").textContent =
            `WELCOME, ${userName}!`;


        // PROFILE IMAGE
        const profilePhoto =
            document.getElementById("profilePhoto");

        if (user.photoURL) {

            profilePhoto.src = user.photoURL;
            profilePhoto.referrerPolicy = "no-referrer";

        } else {

            profilePhoto.src =
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(userName) +
                "&size=200&background=000000&color=ffffff";

        }


        // FLOWER ANIMATION
        createFlowers();

    } else {

        window.location.href = "index.html";

    }

});


// ===============================
// LOGOUT
// ===============================

window.logout = async function () {

    try {

        await signOut(auth);

        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

        alert("Logout failed!");

    }

};


// ===============================
// GAME LIBRARY
// ===============================

window.openGameLibrary = function () {

    window.location.href = "games.html";

};


// ===============================
// ONE-TIME FLOWER ANIMATION
// ===============================

function createFlowers() {

    const flowers = [
        "🌸",
        "🌺",
        "🌼",
        "🌷",
        "💮"
    ];


    // Around 35 flowers
    for (let i = 0; i < 35; i++) {

        const flower =
            document.createElement("div");

        flower.className = "falling-flower";

        flower.textContent =
            flowers[Math.floor(Math.random() * flowers.length)];


        // Random position
        flower.style.left =
            Math.random() * 100 + "vw";


        // Random size
        flower.style.fontSize =
            (18 + Math.random() * 18) + "px";


        // Random falling duration
        flower.style.animationDuration =
            (3 + Math.random() * 3) + "s";


        // Random delay
        flower.style.animationDelay =
            Math.random() * 0.8 + "s";


        // Random horizontal movement
        flower.style.setProperty(
            "--random-x",
            (Math.random() * 200 - 100) + "px"
        );


        document.body.appendChild(flower);


        // Remove after animation
        setTimeout(() => {

            flower.remove();

        }, 7000);

    }

}