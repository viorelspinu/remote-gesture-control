import { setPoseListener } from "./camera";

const IDLE_STATE = 0;
const NEXT_SLIDE_STATE = 2;
const AFTER_NEXT_STATE = 3;
const BACK_SLIDE_STATE = 4;
const AFTER_BACK_STATE = 5;
const MAX_COUNTER = 5;

let state = IDLE_STATE;

let leftHighCounter = 0;
let rightHighCounter = 0;
let idleCounter = 0;


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
    if (IDLE_STATE == state) {
        if (rightHighCounter > MAX_COUNTER) {
            state = NEXT_SLIDE_STATE;
            displayState("NEXT");
            resetCounters();
        }
        if (leftHighCounter > MAX_COUNTER) {
            state = BACK_SLIDE_STATE;
            displayState("BACK");
            resetCounters();
        }
    } else if (NEXT_SLIDE_STATE == state) {
        console.log("NEXT !");
        state = AFTER_NEXT_STATE;
        displayState("AFTER_NEXT");
        resetCounters();
    } else if (AFTER_NEXT_STATE == state) {
        if (idleCounter > MAX_COUNTER) {
            state = IDLE_STATE;
            displayState("IDLE");
            resetCounters();
        }
    } else if (BACK_SLIDE_STATE == state) {
        console.log("BACK !");
        state = AFTER_BACK_STATE;
        displayState("AFTER_BACK");
        resetCounters();
    } else if (AFTER_BACK_STATE == state) {
        if (idleCounter > MAX_COUNTER) {
            state = IDLE_STATE;
            displayState("IDLE");
            resetCounters();
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

setPoseListener(doProcessPoses);

