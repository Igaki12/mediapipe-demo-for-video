// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

const demosSection = document.getElementById("demos");

let poseLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";

// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numPoses: 2
    });
    demosSection.classList.remove("invisible");
    document.getElementById("loadingMsg").style.display = "none";
};
createPoseLandmarker();

const videoSelector = document.getElementById("videoSelector");
// const video = document.getElementById("video");
const video = document.querySelector("video")
// Load the video when the user selects one
videoSelector.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    // video file の縦横比をfileから取得

    video.src = URL.createObjectURL(file);
    video.addEventListener("loadedmetadata", async () => {
        console.log("video.duration : ", video.duration);
        console.log("video.currentTime : ", video.currentTime);
        // 動画の再生を開始
        video.play();
        // 動画を0.5秒ごとにキャプチャして表示
        const frameInterval = 0.2;
        let frameNumber = 0;
        const frameIntervalCapture = setInterval(() => {
            frameNumber++;
            getFrame(frameNumber);
            if (video.currentTime + 2 * frameInterval > video.duration) {
                clearInterval(frameIntervalCapture);
                // ここに追加メモ
                console.log("frameNumber : ", frameNumber);
                if (!poseLandmarker) {
                    console.log("poseLandmarker is not ready yet.");
                    return;
                }
                if (runningMode == "VIDEO") {
                    runningMode = "IMAGE";
                    poseLandmarker.setOptions({ runningMode: "IMAGE" });
                }
                console.log("ready to process video");
                const frameLandmarksWrapper = document.getElementById("frameLandmarksWrapper");
                for (let f = 0; f < frameNumber; f++) {
                    const image = document.createElement("img");
                    image.style.width = "100px";
                    image.style.height = "100px";
                    image.style.margin = "2px";
                    image.src = document.getElementById("videoFrame" + f).src;
                    image.crossOrigin = "anonymous";
                    image.loading = "lazy";
                    image.id = "landmarksImage" + f;
                    frameLandmarksWrapper.appendChild(image);
                    const poseCanvas = document.createElement("canvas");
                    poseCanvas.setAttribute("class", "canvas");
                    poseCanvas.setAttribute("width", image.naturalWidth);
                    poseCanvas.setAttribute("height", image.naturalHeight);
                    poseCanvas.style.left = image.offsetLeft + "px";
                    poseCanvas.style.top = image.offsetTop + "px";
                    frameLandmarksWrapper.appendChild(poseCanvas);
                    console.log("created image and canvas : " + f);
                    poseLandmarker.detect(image, async (result) => {
                        // 
                        const poseCanvasCtx = poseCanvas.getContext("2d");
                        const drawingUtils = new DrawingUtils(poseCanvasCtx);
                        for (const landmark of result.landmarks) {
                            drawingUtils.drawLandmarks(landmark, {
                                radius: (data) => DrawingUtils.lerp(data.from?.z ?? 0, -0.15, 0.1, 5, 1)
                            });
                            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
                        }
                    })


                }
                console.log("finished processing video");
            }
        }, frameInterval * 1000);

        function getFrame(num) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = document.createElement("img")
            image.id = "videoFrame" + num;
            image.style.width = "50px";
            image.style.height = "50px";
            image.style.margin = "2px";
            image.crossOrigin = "anonymous"
            image.loading = "lazy"
            image.src = canvas.toDataURL();
            const videoFrameWrapper = document.getElementById("videoFrameWrapper");
            videoFrameWrapper.appendChild(image);
        }



    });

});



