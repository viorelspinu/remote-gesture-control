function doProcessPoses(poses) {
    let pose = poses[0];
    const nose = pose.keypoints.find(e => e.part == 'nose');
    const leftWrist = pose.keypoints.find(e => e.part == 'leftWrist');
    const rightWrist = pose.keypoints.find(e => e.part == 'rightWrist');

    // console.log(nose);
    // console.log(leftWrist);
    // console.log(rightWrist);

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
