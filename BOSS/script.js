let currentStream;
let appState = {
    cameraFrontActive: false,
};


function init() {
    // your existing code...
    initRecorderButton(); // add this line to call the function below
    console.log("Fonction init")
}

var videoStream; // Pour stocker le flux vidéo de la caméra
var isRecording = false;

function init() {
    // your existing code...
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (stream) {
        videoStream = stream; // Sauvegardez le flux vidéo
    });
    initRecorderButton(); // add this line to call the function below
    console.log("Fonction init")
}

var mediaRecorder;
var recordedChunks = [];

function initRecorderButton() {
    var recorderImg = document.getElementById('Recorder');
    var captureFakeImg = document.getElementById('capture-button-fake');
    var recordingImg = document.getElementById('Recording');
    var cameraImg = document.getElementById('Camera');

    recorderImg.addEventListener('click', function () {
        this.classList.add('clicked-animation');
        setTimeout(() => this.classList.remove('clicked-animation'), 500);
        captureFakeImg.style.display = 'none';
        recordingImg.style.display = 'flex';
        console.log("Bouton recorder touché");
    });

    cameraImg.addEventListener('click', function () {
        this.classList.add('clicked-animation');
        setTimeout(() => this.classList.remove('clicked-animation'), 500);
        recordingImg.style.display = 'none';
        captureFakeImg.style.display = 'flex';
        console.log("Camera image touché")
    });

    recordingImg.addEventListener('click', function () {
        if (!isRecording) {
            startRecording();
            console.log("Recording");
        } else {
            stopRecording();
            console.log("End of recording");
        }
        isRecording = !isRecording;
    });

    captureFakeImg.addEventListener('click', function () {
        this.classList.add('clicked-animation');
        setTimeout(() => this.classList.remove('clicked-animation'), 500);
        takeSnapshot();
        console.log("Snapshot taken");
    });
}


function takeSnapshot() {
    // Enregistrez la scène A-Frame en utilisant le composant screenshot
    var aScene = document.querySelector('a-scene');
    aScene.components.screenshot.capture('perspective');

    // Créez un canvas et un contexte pour dessiner les images
    var canvas = document.createElement('canvas');

    // Doublez la taille du canvas
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    var context = canvas.getContext('2d');

    // Créez un élément vidéo pour le flux vidéo
    var video = document.createElement('video');
    video.srcObject = videoStream;
    video.play();

    // Obtenez le logo
    var logo = document.getElementById('logoBoss');

    video.onplaying = function () {
        // Une fois que la vidéo est en cours de lecture, dessinez-la sur le canvas

        // Calculez les nouvelles dimensions de la vidéo en conservant son aspect ratio
        var videoAspectRatio = video.videoWidth / video.videoHeight;
        var newWidth = canvas.width;
        var newHeight = newWidth / videoAspectRatio;

        // Si la nouvelle hauteur est plus grande que la hauteur du canvas, réduisez la largeur à la place
        if (newHeight > canvas.height) {
            newHeight = canvas.height;
            newWidth = newHeight * videoAspectRatio;
        }

        // Calculez les décalages pour centrer la vidéo sur le canvas
        var offsetX = (canvas.width - newWidth) / 2;
        var offsetY = (canvas.height - newHeight) / 2;

        context.drawImage(video, offsetX, offsetY, newWidth, newHeight);

        // Chargez l'image de la scène A-Frame à partir du composant screenshot
        var aFrameImage = new Image();
        aFrameImage.src = aScene.components.screenshot.getCanvas('perspective').toDataURL();
        aFrameImage.onload = function () {
            // Une fois que l'image de la scène A-Frame est chargée, dessinez-la sur le canvas
            context.drawImage(aFrameImage, 0, 0, canvas.width, canvas.height);

            // Enregistrez le contenu du canvas en tant que nouvelle image
            var img = document.createElement('img');
            img.src = canvas.toDataURL("image/png");

            // Créez un lien pour télécharger l'image
            var link = document.createElement('a');
            link.href = img.src;
            link.download = 'snapshot.png';
            link.click();
        };
    };
}




var recordingImg = document.getElementById('Recording');

function startRecording() {
    var aframeCanvas = document.querySelector('a-scene').canvas; // Obtenez le canvas de A-Frame
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    // Set the canvas dimensions to double the window's dimensions
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;

    var video = document.createElement('video');
    video.srcObject = videoStream;

    video.addEventListener('loadedmetadata', function () {
        // Get the actual video dimensions
        var videoWidth = video.videoWidth;
        var videoHeight = video.videoHeight;

        // Calculate new dimensions that fit within the canvas while maintaining the aspect ratio
        var aspectRatio = videoWidth / videoHeight;
        var newWidth = canvas.width;
        var newHeight = newWidth / aspectRatio;

        // If the new height is greater than the canvas height, then reduce the width instead
        if (newHeight > canvas.height) {
            newHeight = canvas.height;
            newWidth = newHeight * aspectRatio;
        }

        video.play();

        var offsetX = (canvas.width - newWidth) / 2;
        var offsetY = (canvas.height - newHeight) / 2;

        requestAnimationFrame(function draw() {
            context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            context.drawImage(video, offsetX, offsetY, newWidth, newHeight); // Draw the video
            context.drawImage(aframeCanvas, 0, 0, canvas.width, canvas.height); // Draw the A-Frame scene
            if (isRecording) {
                requestAnimationFrame(draw);
            }
        });
    });

    var combinedStream = canvas.captureStream(60); // Capturez le contenu du nouveau canvas

    var options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorder = new MediaRecorder(combinedStream, options);

    mediaRecorder.ondataavailable = function (e) {
        recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = function () {
        var blob = new Blob(recordedChunks, {
            type: "video/mp4"
        });
        recordedChunks = [];
        var videoURL = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = videoURL;
        a.download = 'recording.mp4';
        a.click();
        recordingImg.style.animation = ""; // Supprime l'animation
    };

    mediaRecorder.start();
    recordingImg.style.animation = "recordingAnim 2s ease 0s infinite normal forwards"; // Ajoute l'animation
}




function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.onstop = function () {
        var blob = new Blob(recordedChunks, {
            type: "video/mp4"
        });
        recordedChunks = [];
        var videoURL = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = videoURL;
        a.download = 'recording.mp4';
        a.click();
        // Aussi libérez le flux de capture d'écran
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
        recordingImg.style.animation = ""; // Supprime l'animation
    };
}


function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
        track.stop();
    });
}

let isCameraStarted = false;

function switchCamera() {
    if (typeof currentStream !== 'undefined') {
        stopMediaTracks(currentStream);
    }

    let videoConstraints;
    let filtre = document.querySelector('#filtre');

    // Si la caméra n'a pas encore été démarrée, démarrez-la.
    if (!isCameraStarted) {
        // Switch between 'user' and 'environment' cameras
        if (appState.cameraFrontActive) {
            videoConstraints = {
                video: {
                    facingMode: 'environment',
                    width: { min: 640, ideal: 1920, max: 1920 },
                    height: { min: 400, ideal: 1080 },
                    frameRate: { ideal: 60 }
                }
            };
            appState.cameraFrontActive = false;
        } else {
            videoConstraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60 }
                }
            };

            appState.cameraFrontActive = true;
        }

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(videoConstraints)
                .then(function (stream) {
                    var userVideo = document.getElementById('userVideo');
                    userVideo.srcObject = stream;
                    userVideo.autoplay = true; // Ajout de l'attribut autoplay
                    userVideo.playsinline = true; // Ajout de l'attribut playsinline
                    currentStream = stream;
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!");
                });
        }

        isCameraStarted = true;
    } else {
        // Switch between 'user' and 'environment' cameras
        if (appState.cameraFrontActive) {
            videoConstraints = {
                video: {
                    facingMode: 'environment',
                    width: { min: 640, ideal: 1920, max: 1920 },
                    height: { min: 400, ideal: 1080 },
                    frameRate: { ideal: 60 }
                }
            };
            appState.cameraFrontActive = false;
        } else {
            videoConstraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60 }
                }
            };

            appState.cameraFrontActive = true;
        }

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(videoConstraints)
                .then(function (stream) {
                    var userVideo = document.getElementById('userVideo');
                    userVideo.srcObject = stream;
                    userVideo.autoplay = true; // Ajout de l'attribut autoplay
                    userVideo.playsinline = true; // Ajout de l'attribut playsinline
                    currentStream = stream;
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!");
                });
        }
    }



    document.querySelector('video').style.transform = "scaleX(-1)";

    // Show or hide image based on camera state
    let frontCameraImage = document.querySelector('#front-camera-image');
    let logoImage = document.querySelector('img[src="ui/Logo_Boss.png"]');
    let productionOutlineImage = document.querySelector('img[src="ui/Production_Outline_complete.png"]');
    let switchCameraButton = document.querySelector('#end-button');
    let fakeCapture = document.querySelector('#capture-button-fake');

    if (appState.cameraFrontActive) {
        frontCameraImage.style.display = 'block';
        logoImage.style.display = 'none';
        productionOutlineImage.style.display = 'none';
        switchCameraButton.style.display = 'none';
        document.querySelector('#capture-button').style.display = 'block';
        fakeCapture.style.display = 'none';
        document.querySelector('#Camera').style.display = 'none';
        document.querySelector('#Switch-button-fake').style.display = 'none';
        document.querySelector('#bottom-banner').style.display = 'none';
        document.querySelector('.center-div-container').style.display = 'none';



    } else {
        frontCameraImage.style.display = 'none';
        logoImage.style.display = 'block';
        productionOutlineImage.style.display = 'block';
        switchCameraButton.style.display = 'flex';
    }

    // Browser compatibility logic for getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(videoConstraints)
            .then(stream => {
                currentStream = stream;
                document.querySelector('video').srcObject = stream;
                let sceneEl = document.querySelector('a-scene');
                let arSystem = sceneEl.systems['mindar-image-system'];
                arSystem.stop();

                // get the 3D model entity
                const model = document.querySelector('#animated-model');

                // remove the 3D model from the scene
                model.parentNode.removeChild(model);
                console.log(arSystem)
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });
    } else if (navigator.getUserMedia) {
        navigator.getUserMedia(videoConstraints, function (stream) {
            currentStream = stream;
            document.querySelector('video').srcObject = stream;
            let sceneEl = document.querySelector('a-scene');
            let arSystem = sceneEl.systems['mindar-image-system'];
            arSystem.stop();

            // get the 3D model entity
            const model = document.querySelector('#animated-model');

            // remove the 3D model from the scene
            model.parentNode.removeChild(model);
            console.log(arSystem);
        }, function (err) {
            console.log("An error occurred: " + err);
        });
    } else {
        console.log("Your browser does not support getUserMedia API");
    }
}

// Browser compatibility logic for getUserMedia on page load
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            currentStream = stream;
            document.querySelector('video').srcObject = stream;
            appState.cameraFrontActive = false;
        })
        .catch(err => console.log("Error in accessing user media: ", err));
} else if (navigator.getUserMedia) {
    navigator.getUserMedia({ video: { facingMode: 'environment' } }, function (stream) {
        currentStream = stream;
        document.querySelector('video').srcObject = stream;
        appState.cameraFrontActive = false;
    }, function (err) {
        console.log("An error occurred: " + err);
    });
} else {
    console.log("Your browser does not support getUserMedia API");
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});

window.addEventListener('DOMContentLoaded', (event) => {
    let model = document.querySelector('#animated-model a-gltf-model');
    let touchIcon = document.querySelector('#animated-model a-image');
    let touchCount = 0;

    let touchDiv = document.querySelector('.center-div'); // si 'center-div' est le nom de la classe

    function startAnimation() {
        console.log('Animation started!');
        model.setAttribute('animation-mixer', 'loop: once; clampWhenFinished: true; timeScale: 1');
        console.log('Current timeScale:', model.components['animation-mixer'].mixer.timeScale);

        if (model.components['animation-mixer'].mixer.timeScale == 1) {
            touchIcon.setAttribute('visible', 'false');
            document.body.removeEventListener('touchstart', touchStartHandler);
        } else {
            touchIcon.setAttribute('visible', 'true');
        }

        setTimeout(() => {
            let endButton = document.querySelector('#end-button');
            endButton.style.height = '7%';
            endButton.style.display = 'flex';
            endButton.style.display = 'block';
            console.log('Affichage du bouton');

            document.getElementById('Switch-button-fake').addEventListener('click', function () {
                console.log('Switch camera button was clicked!');
                switchCamera();
            });

            endButton.addEventListener('click', function () {
                console.log('Switch camera button was clicked!');
                switchCamera(); // Utilisez la fonction switchCamera() que vous avez d�finie pr�c�demment
            });
        }, 1000);
    }

    function touchStartHandler() {
        touchCount += 1;
        console.log('touchstart event triggered');
        if (touchCount >= 2) {
            startAnimation();
            touchCount = 0;
        }
    }

    model.addEventListener('model-loaded', () => {
        touchDiv.addEventListener('touchstart', touchStartHandler);
    });
});

AFRAME.registerComponent('limit-rotation', {
    tick: function () {
        var rotation = this.el.getAttribute('rotation');
        if (rotation.x > 30) { rotation.x = 30; }
        if (rotation.x < -30) { rotation.x = -30; }
        if (rotation.y > 30) { rotation.y = 30; }
        if (rotation.y < -30) { rotation.y = -30; }
        if (rotation.z > 30) { rotation.z = 30; }
        if (rotation.z < -30) { rotation.z = -30; }
        this.el.setAttribute('rotation', rotation);
    }
});

window.onload = function () {
    var captureButton = document.querySelector('#capture-button');
    var shareButton = document.querySelector('#share-button');
    var downloadButton = document.querySelector('#download-button');
    var restartButton = document.querySelector('#restart-button');

    var videoElement = document.querySelector('video');
    var frameImg = document.querySelector('#front-camera-image');

    // Initialisation de variables pour les utiliser plus tard.
    var frameWidth, frameHeight, scaleFactor;

    // Met � jour les variables � chaque redimensionnement de la fen�tre.
    window.addEventListener('resize', function () {
        // R�cup�rer � nouveau les dimensions du cadre.
        var frameRect = frameImg.getBoundingClientRect();
        frameWidth = frameRect.width;
        frameHeight = frameRect.height;

        // Recalculer le facteur d'�chelle pour correspondre � la taille de la vid�o � la taille du cadre.
        var videoWidth = videoElement.videoWidth;
        var videoHeight = videoElement.videoHeight;
        scaleFactor = (frameWidth * 1.06) / videoWidth;
    });

    // Ex�cute la mise � jour une fois lors du chargement initial.
    window.dispatchEvent(new Event('resize'));

    function restartCapture() {
        var photoCanvas = document.querySelector('#photo-canvas');
        var imgElement = document.querySelector('#captured-image');

        // Clear the captured photo
        photoCanvas.width = photoCanvas.width; // This will clear all the contents of the canvas


        // Show the Capture button again
        document.querySelector('#capture-button').style.display = 'block';

        // Hide the Share and Download buttons
        document.querySelector('#share-button').style.display = 'none';
        document.querySelector('#download-button').style.display = 'none';
        document.querySelector('#restart-button').style.display = 'none';


        // Remove the displayed image
        if (imgElement) {
            imgElement.remove();
        }
        document.querySelector('#front-camera-image').style.display = 'block';

    }

    document.querySelector('#restart-button').addEventListener('click', restartCapture);

    function capture(video, scaleFactorW, scaleFactorH) {
        var w = video.videoWidth * scaleFactorW;
        var h = video.videoHeight * scaleFactorH;
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.scale(-1, 1);
        ctx.drawImage(video, -w, 0, w, h);
        return canvas;
    }

    function crop(canvas, aspectRatio) {
        return new Promise((resolve) => {
            const inputWidth = canvas.width;
            const inputHeight = canvas.height;
            const inputImageAspectRatio = inputWidth / inputHeight;

            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputImageAspectRatio > aspectRatio) {
                outputWidth = inputHeight * aspectRatio;
            } else if (inputImageAspectRatio < aspectRatio) {
                outputHeight = inputWidth / aspectRatio;
            }

            const outputX = (inputWidth - outputWidth) / 2;
            const outputY = (inputHeight - outputHeight) / 2;

            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = outputWidth;
            outputCanvas.height = outputHeight;

            const ctx = outputCanvas.getContext('2d');
            ctx.drawImage(canvas, outputX, outputY, outputWidth, outputHeight, 0, 0, outputWidth, outputHeight);
            resolve(outputCanvas);
        });
    }

    captureButton.addEventListener("click", async () => {
        console.log("Capture button was clicked!");

        // Cacher le bouton Capture
        captureButton.style.display = "none";

        // Afficher les boutons Share et Download
        shareButton.style.display = "block";
        downloadButton.style.display = "block";
        restartButton.style.display = "block";

        // Augmenter la taille des images/boutons Share et Download
        shareButton.style.width = "175px";
        shareButton.style.height = "auto";

        downloadButton.style.width = "175px";
        downloadButton.style.height = "auto";

        var videoElement = document.querySelector("video");
        var frameImg = document.querySelector("#front-camera-image");
        var frameRect = frameImg.getBoundingClientRect();

        let captureCanvas = capture(videoElement, 1, 1); // you can change the scale factors
        let captureCanvasUrl = captureCanvas.toDataURL("image/png");

        const canvas = await crop(captureCanvas, 414 / 717); // you can change the aspect ratio

        var capturedImageElement = document.querySelector("#captured-image");
        if (!capturedImageElement) {
            capturedImageElement = new Image();
            capturedImageElement.id = "captured-image";
            capturedImageElement.style.display = "block";
            capturedImageElement.style.position = "fixed";
            capturedImageElement.style.top = '0';
            capturedImageElement.style.left = '0';  // make sure the image starts from the left edge of the screen
            capturedImageElement.style.right = '0';  // make sure the image extends to the right edge of the screen
            capturedImageElement.style.width = '100%';  // make sure the image covers the whole width of the screen
            capturedImageElement.style.height = 'auto';  // make sure the image covers the whole height of the screen
            capturedImageElement.style.objectFit = 'cover';
            capturedImageElement.style.zIndex = '2';


            // Add the image to the page.
            document.body.appendChild(capturedImageElement);
        }

        const captureCroppedUrl = canvas.toDataURL("image/png");
        //capturedImageElement.src = captureCroppedUrl;
    });



    document.querySelector("#download-button").addEventListener("click", function () {
        var link = document.createElement("a");
        var capturedImageElement = document.querySelector("#captured-image");
        var frameImageElement = document.querySelector("#front-camera-image");

        if (capturedImageElement) {
            // Create a new canvas and draw both the captured image and the frame image onto it.
            var downloadCanvas = document.createElement("canvas");
            downloadCanvas.width = capturedImageElement.naturalWidth;  // Use the original size of the image
            downloadCanvas.height = capturedImageElement.naturalHeight;
            var ctx = downloadCanvas.getContext("2d");

            // Draw the captured image onto the canvas.
            ctx.drawImage(capturedImageElement, 0, 0, downloadCanvas.width, downloadCanvas.height);

            // Draw the frame image on top of the captured image, maintaining its aspect ratio.
            var frameAspect = frameImageElement.naturalWidth / frameImageElement.naturalHeight;
            var frameWidth = downloadCanvas.width;
            var frameHeight = frameWidth / frameAspect;
            var frameX = 0;
            var frameY = (downloadCanvas.height - frameHeight) / 2;
            ctx.drawImage(frameImageElement, frameX, frameY, frameWidth, frameHeight);

            // Crop the canvas to the size of the frame.
            var imageData = ctx.getImageData(frameX, frameY, frameWidth, frameHeight);
            downloadCanvas.width = frameWidth;
            downloadCanvas.height = frameHeight;
            ctx.putImageData(imageData, 0, 0);

            // Use the new canvas for the download.
            link.href = downloadCanvas.toDataURL("image/png");
            link.download = "JeSuisLeBOSS.png";
            link.click();
        } else {
            console.log("Image not captured yet");
        }
    });


    document.querySelector('#share-button').addEventListener('click', function () {
        if (navigator.share) {
            navigator.share({
                title: 'My Photo',
                text: 'Check out my photo!',
                url: document.querySelector('#photo-canvas').toDataURL(),
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
        } else {
            console.log('Web Share API not supported.');
        }
    });

};