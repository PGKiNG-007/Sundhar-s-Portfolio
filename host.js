let socket = null;

let peerConnection = null;

let gameStream = null;


// =====================================
// CONNECT TO SIGNALING SERVER
// =====================================

function connectServer() {

    socket =
        new WebSocket(
            "ws://localhost:3000/ws"
        );


    socket.onopen = () => {

        console.log(
            "Host connected to signaling server"
        );

        setStatus(
            "🟢 HOST SERVER CONNECTED"
        );

    };


    socket.onmessage = async (event) => {

        const data =
            JSON.parse(event.data);


        console.log(
            "Host received:",
            data.type
        );


        if (data.type === "viewer-ready") {

            await createOffer();

        }


        if (data.type === "answer") {

            await peerConnection
                .setRemoteDescription(
                    data.answer
                );

        }


        if (data.type === "candidate") {

            try {

                await peerConnection
                    .addIceCandidate(
                        data.candidate
                    );

            } catch (error) {

                console.error(
                    "ICE error:",
                    error
                );

            }

        }

    };


    socket.onerror = () => {

        setStatus(
            "🔴 SIGNALING SERVER ERROR"
        );

    };

}


// =====================================
// START SCREEN CAPTURE
// =====================================

async function startHost() {

    try {

        setStatus(
            "📺 SELECT YOUR GAME WINDOW..."
        );


        gameStream =
            await navigator.mediaDevices
                .getDisplayMedia({

                    video: {
                        frameRate: 60
                    },

                    audio: true

                });


        document.getElementById(
            "preview"
        ).srcObject = gameStream;


        document.getElementById(
            "preview"
        ).style.display = "block";


        setStatus(
            "🟢 GAME CAPTURE READY — WAITING FOR PLAYER"
        );


        gameStream
            .getVideoTracks()[0]
            .addEventListener(
                "ended",
                () => {

                    setStatus(
                        "🔴 GAME CAPTURE STOPPED"
                    );

                }
            );


    } catch (error) {

        console.error(error);

        setStatus(
            "🔴 SCREEN CAPTURE CANCELLED"
        );

    }

}


// =====================================
// CREATE WEBRTC PEER
// =====================================

function createPeer() {

    peerConnection =
        new RTCPeerConnection({

            iceServers: [

                {
                    urls:
                        "stun:stun.l.google.com:19302"
                }

            ]

        });


    // Add game video/audio

    gameStream
        .getTracks()
        .forEach(track => {

            peerConnection.addTrack(
                track,
                gameStream
            );

        });


    // ICE candidates

    peerConnection.onicecandidate =
        event => {

            if (
                event.candidate &&
                socket.readyState ===
                WebSocket.OPEN
            ) {

                socket.onopen = () => {

    console.log(
        "WebRTC signaling connected"
    );

    updateStatus(
        "WEBRTC SIGNALING CONNECTED"
    );

    socket.send(
        JSON.stringify({
            type: "viewer-ready"
        })
    );

    createPeerConnection();

};
            }

        };


    peerConnection.onconnectionstatechange =
        () => {

            console.log(
                "Connection:",
                peerConnection
                    .connectionState
            );


            if (
                peerConnection
                    .connectionState ===
                "connected"
            ) {

                setStatus(
                    "🟢 GAME STREAM CONNECTED"
                );

            }

        };

}


// =====================================
// CREATE OFFER
// =====================================

async function createOffer() {

    if (!gameStream) {

        setStatus(
            "⚠️ Start Game Stream first"
        );

        return;

    }


    createPeer();


    const offer =
        await peerConnection
            .createOffer();


    await peerConnection
        .setLocalDescription(
            offer
        );


    socket.send(
        JSON.stringify({

            type: "offer",

            offer: offer

        })
    );


    setStatus(
        "🚀 STREAM OFFER SENT — CONNECTING..."
    );

}


// =====================================
// STATUS
// =====================================

function setStatus(message) {

    document.getElementById(
        "status"
    ).textContent = message;

}


// =====================================
// CONNECT
// =====================================

connectServer();