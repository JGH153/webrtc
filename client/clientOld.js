'use strict';

//checks if the browser supports WebRTC

function hasUserMedia() {
    return !!navigator.mediaDevices.getUserMedia;
}

if (hasUserMedia()) {

    //get both video and audio streams from user's camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        var video = document.querySelector('video');

        //insert stream into the video tag
        video.srcObject = stream;
        console.log(stream);

        var state = RTCPeerConnection.iceConnectionState;
        console.log(state);
        var pc = new RTCPeerConnection();
        console.log(pc);
    })


}else{
    console.log("Error. WebRTC is not supported!");
}