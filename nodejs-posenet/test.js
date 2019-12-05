const tf = require('@tensorflow/tfjs-node');
const posenet = require('@tensorflow-models/posenet');
const {
    createCanvas, Image
} = require('canvas')


let net = null;

async function loadNetwork() {
    net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
    });
}

let webcam = null;

async function loadCam() {
    const NodeWebcam = require("node-webcam");
    const opts = {
        width: 640,
        height: 480,
        quality: 100,
        delay: 0,
        saveShots: true,
        output: "jpeg",
        device: false,
        callbackReturn: "location",
        verbose: false

    };
    webcam = NodeWebcam.create(opts);
}

async function photo() {
    await webcam.capture("./test.jpg");
}

async function runOnce() {

    const img = new Image();
    img.src = './test.jpg';

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const input = tf.browser.fromPixels(canvas);
    const pose = await net.estimateSinglePose(input);
    // console.log(pose);

    for (const keypoint of pose.keypoints) {
        if (keypoint.score > 0.5) {
            // console.log(keypoint);
            //console.log(`${keypoint.score} - ${keypoint.part}: (${Math.round(keypoint.position.x)},${Math.round(keypoint.position.y)})`);
        }
    }

    const nose = pose.keypoints.find(e => e.part == 'nose');
    const leftWrist = pose.keypoints.find(e => e.part == 'leftWrist');
    const rightWrist = pose.keypoints.find(e => e.part == 'rightWrist');

    // console.log(nose);
    // console.log(leftWrist);
    //     console.log(rightWrist);

    if (isHighAndFar(nose, leftWrist)) {
        console.log("NEXT !");
    }

    if (isHighAndFar(nose, rightWrist)) {
        console.log("NEXT !");
    }

    if (isNear(nose, leftWrist)) {
        console.log("BACK !");
    }

    if (isNear(nose, rightWrist)) {
        console.log("BACK !");
    }
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


    //console.log(leftWrist.position.y + "," + leftWrist.score);
}


async function main() {
    await loadCam();
    await loadNetwork();
    while (true) {
        await photo();
        await runOnce();
        console.log("----------");
    }
}

main();



