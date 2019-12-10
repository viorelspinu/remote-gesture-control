const pubSub = require("./pubsub");

const MAX_COUNTER = 1;
const IDLE_MAX_COUNTER = 5;
const IDLE_SEND_COUNT = 20;

let leftHighCounter = 0;
let rightHighCounter = 0;
let idleCounter = 0;

let idleSentCounter = 0;

function doProcessPoses(poses) {
    let pose = poses[0];
    const nose = pose.keypoints.find(e => e.part == 'nose');
    const leftWrist = pose.keypoints.find(e => e.part == 'leftWrist');
    const rightWrist = pose.keypoints.find(e => e.part == 'rightWrist');
    const leftShoulder = pose.keypoints.find(e => e.part == 'leftShoulder');
    const rightShoulder = pose.keypoints.find(e => e.part == 'rightShoulder');

    const shoulderDistance = Math.abs(leftShoulder.position.x - rightShoulder.position.x);

    let active = false;

    if (isHigh(nose, leftWrist, shoulderDistance)) {
        active = true;
        leftHighCounter++;
    }

    if (isHigh(nose, rightWrist, shoulderDistance)) {
        active = true;
        rightHighCounter++;
    }

    if (!active) {
        rightHighCounter = 0;
        leftHighCounter = 0;
        idleCounter++;
    }

    displayCounters();
    processState();
}

function processState() {

    if (rightHighCounter > MAX_COUNTER) {
        displayState("NEXT");
        pubSub.publish("SOCKET_SEND_EVENT", "__EVENT__RIGHT");
        document.getElementById('top_marker').style.visibility="";
        document.getElementById('top_marker').style.background="#0F0";
        resetCounters();
        idleSentCounter = 0;
    }
    if (leftHighCounter > MAX_COUNTER) {
        displayState("BACK");
        pubSub.publish("SOCKET_SEND_EVENT", "__EVENT__LEFT");
        document.getElementById('top_marker').style.visibility="";        
        document.getElementById('top_marker').style.background="#55F";
        resetCounters();
        idleSentCounter = 0;
    }

    if (idleCounter > IDLE_MAX_COUNTER) {
        if (idleSentCounter < IDLE_SEND_COUNT) {
            displayState("IDLE");
            pubSub.publish("SOCKET_SEND_EVENT", "__EVENT__IDLE");
            document.getElementById('top_marker').style.visibility="hidden";
            resetCounters();
            idleSentCounter++;
        }
    }
}


function resetCounters() {
    rightHighCounter = 0;
    leftHighCounter = 0;
    idleCounter = 0;
}

function isHigh(nose, part, shoulderDistance) {
    let noseVisible = nose.score > 0.5;
    let partVisible = part.score > 0.7;
    let high = (nose.position.y - part.position.y) > (shoulderDistance / 2);

    return partVisible && noseVisible && high;
}


function displayState(state) {
    document.getElementById("state").value = state;
}

function displayCounters() {
    document.getElementById("idleCounter").value = idleCounter;
    document.getElementById("rightHighCounter").value = rightHighCounter;
    document.getElementById("leftHighCounter").value = leftHighCounter;
}

$(function () {
    pubSub.subscribe("__POSES_EVENT", poses => {
        doProcessPoses(poses);
    });
});
