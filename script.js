import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCSBZmKfmXqM2_FdxMAvBFNF7rlk-lxf0U",
    authDomain: "pg-cloud-gaming.firebaseapp.com",
    projectId: "pg-cloud-gaming",
    storageBucket: "pg-cloud-gaming.firebasestorage.app",
    messagingSenderId: "168272624413",
    appId: "1:168272624413:web:834e1eaa982a36e0483ff4",
    measurementId: "G-LE0VJHPRWG"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase Authentication
const auth = getAuth(app);


// Google Provider
const provider = new GoogleAuthProvider();


// Google Login
window.googleLogin = async function () {

    try {

        console.log("Opening Google Login...");

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        console.log("Login successful!");
        console.log("Name:", user.displayName);
        console.log("Email:", user.email);

        // Dashboard
        window.location.href = "dashboard.html";

    } catch (error) {

        console.error("Firebase Login Error:", error);

        if (error.code === "auth/popup-closed-by-user") {

            alert("Google login popup was closed.");

        } else if (error.code === "auth/popup-blocked") {

            alert("Browser blocked the Google login popup. Please allow popups.");

        } else if (error.code === "auth/unauthorized-domain") {

            alert("This website domain is not authorized in Firebase.");

        } else {

            alert("Google Login Failed:\n" + error.message);
        }
    }
};


// Email Login - temporary
window.login = function () {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    if (email === "" || password === "") {

        alert("Please enter email and password.");
        return;
    }

    alert("Email login will be connected later.");
};

