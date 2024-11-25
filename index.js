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
    video.src = URL.createObjectURL(file);
    video.addEventListener("loadedmetadata", async () => {
        console.log("video.duration : ", video.duration);
        console.log("video.currentTime : ", video.currentTime);
        // 動画の再生を開始
        video.play();
        // 動画を0.5秒ごとにキャプチャして表示
        const frameInterval = 0.5;
        setInterval(() => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = document.createElement("img")
            image.id = "videoFrame" + video.currentTime;
            image.style.width = video.style.width * 0.2;
            image.style.height = video.style.height * 0.2;
            image.crossOrigin = "anonymous"
            image.loading = "lazy"
            image.src = canvas.toDataURL();
            const videoFrameWrapper = document.getElementById("videoFrameWrapper");
            videoFrameWrapper.appendChild(image);
            if(video.currentTime + frameInterval > video.duration || video.currentTime > 60 ){
                console.log("finish time : " + video.currentTime);
                clearInterval();
            }
        }, frameInterval * 1000);

        // for (let i = 0; i < 10; i++){
        //     video.currentTime = i * video.duration / 10;
        //     video.addEventListener("seeked", async () => { 
        //         console.log("video currentTime : ", video.currentTime);
        //         const canvas = document.createElement("canvas");
        //         canvas.style.width = videoWidth * 0.3;
        //         canvas.style.height = videoHeight * 0.3;
        //         const ctx = canvas.getContext("2d");
        //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        //         const image = document.getElementById("videoFrame" + i);
        //         image.style.width = videoWidth * 0.3;
        //         image.style.height = videoHeight * 0.3;
        //         image.src = canvas.toDataURL();

        //     });
        // }
    });

});



