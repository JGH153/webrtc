//our username
var name;
var connectedUser;

//connecting to our signaling server
var conn = new WebSocket('ws://192.168.8.145:9095/');

conn.onopen = function () {
   console.log("Connected to the signaling server");
};

//when we got a message from a signaling server
conn.onmessage = function (msg) {
   console.log("Got message", msg.data);

   var data = JSON.parse(msg.data);

   switch(data.type) {
      case "login":
         handleLogin(data.success);
         break;
      //when somebody wants to call us
      case "offer":
         handleOffer(data.offer, data.name);
         break;
      case "answer":
         handleAnswer(data.answer);
         break;
      //when a remote peer sends an ice candidate to us
      case "candidate":
         handleCandidate(data.candidate);
         break;
      case "leave":
         handleLeave();
         break;
      default:
         break;
   }
};

conn.onerror = function (err) {
   console.log("Got error", err);
};

//alias for sending JSON encoded messages
function send(message) {
   //attach the other peer username to our messages
   if (connectedUser) {
      message.name = connectedUser;
   }

   conn.send(JSON.stringify(message));
};

//******
//UI selectors block
//******

var loginPage = document.querySelector('#loginPage');
var usernameInput = document.querySelector('#usernameInput');
var loginBtn = document.querySelector('#loginBtn');

var callPage = document.querySelector('#callPage');
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn');

var hangUpBtn = document.querySelector('#hangUpBtn');

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

var msgInput = document.querySelector('#msgInput');
var sendMsgBtn = document.querySelector('#sendMsgBtn');
var recivedMessagesBox = document.querySelector('#recivedMessagesBox');
var dataChannel;

var yourConn;
var stream;

callPage.style.display = "none";

// Login when the user clicks the button
loginBtn.addEventListener("click", function (event) {
   name = usernameInput.value;

   if (name.length > 0) {
      send({
         type: "login",
         name: name
      });
   }

});

function handleLogin(success) {
   if (success === false) {
      console.log("Ooops...try a different username");
   } else {
      loginPage.style.display = "none";
      callPage.style.display = "block";

      //**********************
      //Starting a peer connection
      //**********************

      //getting local video stream
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {

         //displaying local video stream on the page
         localVideo.src = window.URL.createObjectURL(stream);

         //using Google public stun server
         var configuration = {
            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
         };

         yourConn = new RTCPeerConnection(configuration);

         // setup stream listening
         yourConn.addStream(stream);

         //when a remote user adds stream to the peer connection, we display it
         yourConn.onaddstream = function (e) {
             console.log("setting stream");
            remoteVideo.src = window.URL.createObjectURL(e.stream);
         };

         // Setup ice handling
         yourConn.onicecandidate = function (event) {
            if (event.candidate) {
               send({
                  type: "candidate",
                  candidate: event.candidate
               });
            }
         };

         yourConn.ondatachannel = function(event) {
             var receiveChannel = event.channel;
             receiveChannel.onmessage = function(event) {
                console.log("ondatachannel message:", event.data);
                console.log(event);
                recivedMessagesBox.innerHTML = "Message: " + event.data;
             };
          };

         openDataChannel();

      });

   }
};

//initiating a call
callBtn.addEventListener("click", function () {
   var callToUsername = callToUsernameInput.value;

   if (callToUsername.length > 0) {

      connectedUser = callToUsername;

      // create an offer
      yourConn.createOffer(function (offer) {
         send({
            type: "offer",
            offer: offer
         });

         yourConn.setLocalDescription(offer);
      }, function (error) {
         alert("Error when creating an offer");
      });

   }
});

//when somebody sends us an offer
function handleOffer(offer, name) {
   connectedUser = name;
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));

   //create an answer to an offer
   yourConn.createAnswer(function (answer) {
      yourConn.setLocalDescription(answer);

      send({
         type: "answer",
         answer: answer
      });

   }, function (error) {
      alert("Error when creating an answer");
   });
};

//when we got an answer from a remote user
function handleAnswer(answer) {
   yourConn.setRemoteDescription(new RTCSessionDescription(answer));
};

//when we got an ice candidate from a remote user
function handleCandidate(candidate) {
   yourConn.addIceCandidate(new RTCIceCandidate(candidate));
};

//hang up
hangUpBtn.addEventListener("click", function () {

   send({
      type: "leave"
   });

   handleLeave();
});

function handleLeave() {
   connectedUser = null;
   remoteVideo.src = null;

   yourConn.close();
   yourConn.onicecandidate = null;
   yourConn.onaddstream = null;
};


//creating data channel
function openDataChannel() {

   var dataChannelOptions = {
      reliable:true
   };

   dataChannel = yourConn.createDataChannel("myDataChannel", dataChannelOptions);

   dataChannel.onerror = function (error) {
      console.log("Error:", error);
   };

   dataChannel.onmessage = function (event) {
      console.log("Got message:", event.data);
   };
}

//when a user clicks the send message button
sendMsgBtn.addEventListener("click", function (event) {
   console.log("send message");
   var val = msgInput.value;
   dataChannel.send(val);
});