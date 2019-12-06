const IDLE_STATE = 0;
const NEXT_SLIDE_STATE = 2;
const AFTER_NEXT_STATE = 3;
const BACK_SLIDE_STATE = 4;
const AFTER_BACK_STATE = 5;
const MAX_COUNTER = 20;

state = IDLE_STATE;

highAndFarCounter = 0;
nearNoseCouter = 0;
idleCounter = 0;


function doProcessPoses(poses) {
    let pose = poses[0];
    const nose = pose.keypoints.find(e => e.part == 'nose');
    const leftWrist = pose.keypoints.find(e => e.part == 'leftWrist');
    const rightWrist = pose.keypoints.find(e => e.part == 'rightWrist');

    let active = false;

    if (this.isHighAndFar(nose, leftWrist) || this.isHighAndFar(nose, rightWrist)) {
        active = true;
        this.nextEventCounter++;
    }

    if (this.isNear(nose, leftWrist) || this.isNear(nose, rightWrist)) {
        active = true;
        this.backEventCounter++;
    }
    if (!active) {
        this.idleCounter++;
    }
}

function processState() {
    if (IDLE_STATE == state) {
        if (nextEventCounter > MAX_COUNTER) {
            state = NEXT_SLIDE_STATE;
            resetCounters();
        }
        if (backEventCounter > MAX_COUNTER) {
            state = BACK_SLIDE_STATE;
            resetCounters();
        }
    } else if (NEXT_SLIDE_STATE == state) {
        console.log("NEXT !");
        state = AFTER_NEXT_STATE;
        resetCounters();
    } else if (AFTER_NEXT_STATE == state) {
        if (idleCounter > MAX_COUNTER) {
            state = IDLE_STATE;
            resetCounters();
        }
    } else if (BACK_SLIDE_STATE == state){
        console.log("BACK !");
        state = AFTER_BACK_STATE;
        resetCounters();
    } else if (AFTER_BACK_STATE == state){
        if (idleCounter > MAX_COUNTER){
            state = IDLE_STATE;
            resetCounters();
        }
    }
}


function resetCounters() {
    backEventCounter = 0;
    nextEventCounter = 0;
    idleCounter = 0;
}

function isHighAndFar(nose, part) {
    let noseVisible = nose.score > 0.5;
    let partVisible = part.score > 0.5;
    let high = (nose.position.y - part.position.y) > 100;
    let far = Math.abs(nose.position.x - part.position.x) > 100;

    return partVisible && noseVisible && high && far;
}

function isNear(nose, part) {
    let noseVisible = nose.score > 0.5;
    let partVisible = part.score > 0.5;
    const distance = Math.abs(nose.position.y - part.position.y) + (Math.abs(nose.position.x - part.position.x));
    let near = distance < 300;

    return noseVisible && partVisible && near;
}


