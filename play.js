// =====================================
// GAME
// =====================================

const params = new URLSearchParams(
    window.location.search
);

const game =
    params.get("game") || "GTA Vice City";


// =====================================
// SERVER
// =====================================

const SERVER_URL = "http://localhost:3000";

const WS_URL = "ws://localhost:3000/ws";


// =====================================
// SHOW GAME
// =====================================

document.getElementById("playingGame")
    .textContent = game.toUpperCase();

document.getElementById("gameName")
    .textContent = game.toUpperCase();


// =====================================
// WEBRTC
// =====================================

let socket = null;
let peerConnection = null;
let pendingCandidates = [];


// =====================================
// CREATE SESSION
// =====================================

async function createSession() {

    try {

        updateStatus(
            "CONNECTING TO CLOUD SERVER..."
        );

        const response = await fetch(
            `${SERVER_URL}/api/session`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    game: game
                })
            }
        );


        if (!response.ok) {

            throw new Error(
                "Cloud server error"
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Session creation failed"
            );

        }


        console.log(
            "Session created:",
            data.sessionId
        );


        showSessionId(
            data.sessionId
        );


        updateStatus(
            "CLOUD SERVER CONNECTED"
        );


        document.querySelector(
            ".cloud-loading h1"
        ).textContent =
            "SERVER READY";


        document.querySelector(
            ".connection-text"
        ).textContent =
            "Connecting to WebRTC...";


        connectWebRTC();


    } catch (error) {

        console.error(error);

        updateStatus(
            "SERVER CONNECTION FAILED"
        );

        document.querySelector(
            ".cloud-loading h1"
        ).textContent =
            "CONNECTION FAILED";

        document.querySelector(
            ".connection-text"
        ).textContent =
            error.message;

    }

}


// =====================================
// WEBRTC CONNECTION
// =====================================

function connectWebRTC() {

    console.log(
        "Connecting to WebRTC server..."
    );


    socket = new WebSocket(WS_URL);


    socket.onopen = () => {

        console.log(
            "WebRTC signaling connected"
        );


        updateStatus(
            "WEBRTC SIGNALING CONNECTED"
        );


        document.querySelector(
            ".connection-text"
        ).textContent =
            "Waiting for cloud gaming stream...";


        createPeerConnection();

    };


    socket.onmessage = async (event) => {

        const data =
            JSON.parse(event.data);


        console.log(
            "Received WebRTC message:",
            data.type
        );


        if (
            data.type === "offer"
        ) {

            await handleOffer(data);

        }


        if (
            data.type === "answer"
        ) {

            await handleAnswer(data);

        }


        if (
            data.type === "candidate"
        ) {

            await handleCandidate(data);

        }

    };


    socket.onerror = (error) => {

        console.error(
            "WebSocket error:",
            error
        );

        updateStatus(
            "WEBRTC CONNECTION ERROR"
        );

    };


    socket.onclose = () => {

        console.log(
            "WebRTC disconnected"
        );

    };

}


// =====================================
// PEER CONNECTION
// =====================================

function createPeerConnection() {

    peerConnection =
        new RTCPeerConnection({

            iceServers: [

                {
                    urls:
                        "stun:stun.l.google.com:19302"
                }

            ]

        });


    peerConnection.onicecandidate =
        (event) => {

            if (
                event.candidate &&
                socket &&
                socket.readyState ===
                WebSocket.OPEN
            ) {

                socket.send(
                    JSON.stringify({

                        type: "candidate",

                        candidate:
                            event.candidate

                    })
                );

            }

        };


    peerConnection.onconnectionstatechange =
        () => {

            console.log(
                "WebRTC state:",
                peerConnection.connectionState
            );


            if (
                peerConnection.connectionState ===
                "connected"
            ) {

                updateStatus(
                    "CLOUD STREAM CONNECTED"
                );

                document.querySelector(
                    ".connection-text"
                ).textContent =
                    "Cloud gaming stream connected.";

            }

        };


    // Future video stream
    peerConnection.ontrack =
        (event) => {

            console.log(
                "Cloud video/audio received"
            );

            handleIncomingStream(
                event.streams[0]
            );

        };

}


// =====================================
// OFFER
// =====================================

async function handleOffer(data) {

    await peerConnection.setRemoteDescription(
        data.offer
    );


    for (
        const candidate of pendingCandidates
    ) {

        try {

            await peerConnection.addIceCandidate(
                candidate
            );

        } catch (error) {

            console.error(
                "Pending ICE error:",
                error
            );

        }

    }


    pendingCandidates = [];


    const answer =
        await peerConnection.createAnswer();


    await peerConnection.setLocalDescription(
        answer
    );


    socket.send(
        JSON.stringify({

            type: "answer",

            answer: answer

        })
    );

}

// =====================================
// ANSWER
// =====================================

async function handleAnswer(data) {

    await peerConnection.setRemoteDescription(
        data.answer
    );

}


// =====================================
// ICE CANDIDATE
// =====================================

async function handleCandidate(data) {

    if (!peerConnection) {
        return;
    }

    if (!peerConnection.remoteDescription) {

        pendingCandidates.push(
            data.candidate
        );

        return;
    }

    try {

        await peerConnection.addIceCandidate(
            data.candidate
        );

    } catch (error) {

        console.error(
            "ICE candidate error:",
            error
        );

    }

}


// =====================================
// INCOMING STREAM
// =====================================

function handleIncomingStream(stream) {

    console.log(
        "Incoming cloud stream:",
        stream
    );


    let video =
        document.getElementById(
            "cloudVideo"
        );


    if (!video) {

        video =
            document.createElement(
                "video"
            );

        video.id =
            "cloudVideo";

        video.autoplay = true;

        video.playsInline = true;

        video.controls = false;


        video.style.position =
            "absolute";

        video.style.inset = "0";

        video.style.width = "100%";

        video.style.height = "100%";

        video.style.objectFit =
            "contain";

        video.style.background =
            "#000000";


        document.querySelector(
            ".stream-screen"
        ).prepend(video);

    }


    video.srcObject = stream;


    document.querySelector(
        ".cloud-loading"
    ).style.display =
        "none";

}


// =====================================
// STATUS
// =====================================

function updateStatus(message) {

    const status =
        document.querySelector(
            ".connection-text"
        );

    if (status) {

        status.textContent =
            message;

    }

}


// =====================================
// SESSION ID
// =====================================

function showSessionId(sessionId) {

    const session =
        document.createElement("p");

    session.textContent =
        "SESSION: " + sessionId;

    session.style.marginTop =
        "12px";

    session.style.color =
        "#555555";

    session.style.fontSize =
        "10px";

    document.querySelector(
        ".cloud-loading"
    ).appendChild(session);

}


// =====================================
// FULLSCREEN
// =====================================

function toggleFullscreen() {

    const screen =
        document.querySelector(
            ".stream-screen"
        );


    if (!document.fullscreenElement) {

        screen.requestFullscreen();

    } else {

        document.exitFullscreen();

    }

}


// =====================================
// CONTROLS
// =====================================

function toggleControls() {

    alert(
        "Keyboard / Mouse / Gamepad input will be connected next."
    );

}


// =====================================
// SETTINGS
// =====================================

function showSettings() {

    alert(
        "Streaming settings will be added next."
    );

}


// =====================================
// EXIT
// =====================================

function exitGame() {

    if (socket) {

        socket.close();

    }


    if (peerConnection) {

        peerConnection.close();

    }


    window.location.href =
        "games.html";

}


// =====================================
// START
// =====================================

createSession();


// =====================================
// DEMO LATENCY
// =====================================

setInterval(() => {

    const latency =
        Math.floor(
            Math.random() * 12
        ) + 18;


    const element =
        document.getElementById(
            "latency"
        );


    if (element) {

        element.textContent =
            latency + " ms";

    }

}, 1000);