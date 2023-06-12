let currentStream;
let appState = {
  cameraFrontActive: false,
};

document.body.style.backgroundColor = "#333333";

var videoStream; // Pour stocker le flux vidéo de la caméra
var isRecording = false;
const model = document.querySelector("#animated-model");
let savedModel = model;

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('start-button').addEventListener('click', function() {
    document.getElementById('splash-screen').style.display = 'none';
  });



  function init() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      videoStream = stream; // Sauvegardez le flux vidéo
    });
  initRecorderButton(); // add this line to call the function below
  console.log("Fonction init");
}

var mediaRecorder;
var recordedChunks = [];

function initRecorderButton() {
  var recorderImg = document.getElementById("Recorder");
  var captureFakeImg = document.getElementById("capture-button-fake");
  var recordingImg = document.getElementById("Recording");
  var cameraImg = document.getElementById("Camera");

  recorderImg.addEventListener("click", function () {
    this.classList.add("clicked-animation");
    setTimeout(() => this.classList.remove("clicked-animation"), 500);
    captureFakeImg.style.display = "none";
    recordingImg.style.display = "flex";
    console.log("Bouton recorder touché");
  });

  cameraImg.addEventListener("click", function () {
    this.classList.add("clicked-animation");
    setTimeout(() => this.classList.remove("clicked-animation"), 500);
    recordingImg.style.display = "none";
    captureFakeImg.style.display = "flex";
    console.log("Camera image touché");
  });

  captureFakeImg.addEventListener("click", function () {
    // Ajouter la classe d'animation
    captureFakeImg.classList.add("clicked-animation");

    // Enlever la classe d'animation après l'animation (500ms)
    setTimeout(function () {
      captureFakeImg.classList.remove("clicked-animation");
    }, 500);
  });

  recordingImg.addEventListener("click", function () {
    if (!isRecording) {
      startRecording();
      console.log("Recording");
    } else {
      stopRecording();
      console.log("End of recording");
    }
    isRecording = !isRecording;
  });

  document
    .querySelector("#capture-button-fake")
    .addEventListener("click", function () {
      if (appState.cameraFrontActive) {
        document.querySelector("#capture-button").click();
      } else {
        takeSnapshot();
      }
      console.log("Snapshot taken");
    });
}

document.getElementById('cameraRecorderToggle').addEventListener('change', function() {
  var recorderImg = document.getElementById("Recorder");
  var cameraImg = document.getElementById("Camera");
  if (this.checked) {
    // La case est cochée, simuler un clic sur cameraImg
    recorderImg.click();
  } else {
    // La case n'est pas cochée, simuler un clic sur recorderImg
    cameraImg.click();
  }
});

// Ajoutez cette fonction quelque part dans votre code.
function updateCameraRecorderToggle() {
  var toggle = document.querySelector("#cameraRecorderToggle");
  var recorderImg = document.getElementById("Recorder");
  // Si cameraFrontActive est vrai, désactivez l'input, sinon activez-le.
  if (appState.cameraFrontActive) {
    toggle.disabled = true;
    document.getElementById('camRec').style.marginRight = '35px';
    document.getElementById('Camera').style.opacity = '0.2';
    document.querySelector('.knob').style.opacity = '0.2';
} else {
    toggle.disabled = false;
    document.getElementById('camRec').style.marginRight = '0px';
    document.getElementById('Camera').style.opacity = '1';
    document.querySelector('.knob').style.opacity = '1';
    recorderImg.style.display = "flex";
}

}

//AR
document.addEventListener("DOMContentLoaded", function () {
  init();
});

window.addEventListener("DOMContentLoaded", (event) => {
  let model = document.querySelector("#animated-model a-gltf-model");
  let touchIcon = document.querySelector("#animated-model a-image");
  let touchCount = 0;

  let touchDiv = document.querySelector(".center-div"); // si 'center-div' est le nom de la classe

  function startAnimation() {
    console.log("Animation started!");
    model.setAttribute(
      "animation-mixer",
      "loop: once; clampWhenFinished: true; timeScale: 1"
    );
    console.log(
      "Current timeScale:",
      model.components["animation-mixer"].mixer.timeScale
    );

    if (model.components["animation-mixer"].mixer.timeScale == 1) {
      touchIcon.setAttribute("visible", "false");
      document.body.removeEventListener("touchstart", touchStartHandler);
    } else {
      touchIcon.setAttribute("visible", "true");
    }

    setTimeout(() => {
      let endButton = document.querySelector("#end-button");
      endButton.style.height = "7%";
      endButton.style.display = "flex";
      endButton.style.display = "block";
      console.log("Affichage du bouton");

      document
        .getElementById("Switch-button-fake")
        .addEventListener("click", function () {
          console.log("Switch camera button was clicked!");
          switchCamera();
        });

      endButton.addEventListener("click", function () {
        console.log("Switch camera button was clicked!");
        switchCamera();
      });
    }, 1000);
    
    const videoElement = document.querySelector('video:not([id])');
    videoElement.id = "Aframe-video";
  }

  function touchStartHandler() {
    touchCount += 1;
    console.log("touchstart event triggered");
    if (touchCount >= 2) {
      startAnimation();
      touchCount = 0;
    }
  }

  model.addEventListener("model-loaded", () => {
    touchDiv.addEventListener("touchstart", touchStartHandler);
  });
});

AFRAME.registerComponent("limit-rotation", {
  tick: function () {
    var rotation = this.el.getAttribute("rotation");
    if (rotation.x > 30) {
      rotation.x = 30;
    }
    if (rotation.x < -30) {
      rotation.x = -30;
    }
    if (rotation.y > 30) {
      rotation.y = 30;
    }
    if (rotation.y < -30) {
      rotation.y = -30;
    }
    if (rotation.z > 30) {
      rotation.z = 30;
    }
    if (rotation.z < -30) {
      rotation.z = -30;
    }
    this.el.setAttribute("rotation", rotation);
  },
});
//Fin AR


function takeSnapshot() {
  // Capturez la scène A-Frame en utilisant le composant screenshot
  var aScene = document.querySelector("a-scene");
  var screenshotCanvas = aScene.components.screenshot.getCanvas("perspective");
  var logoImg = document.getElementById("logoBoss");

  // Créez un canvas et un contexte pour dessiner les images
  var canvas = document.createElement("canvas");

  // Doublez la taille du canvas
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;
  var context = canvas.getContext("2d");

  // Créez un élément vidéo pour le flux vidéo
  var video = document.createElement("video");
  // Ajout des attributs
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");
  video.srcObject = videoStream;
  video.play();

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
    context.drawImage(screenshotCanvas, 0, 0, canvas.width, canvas.height); // Draw the A-Frame scene
    
    var logoX = 250; // Position x pour dessiner le logo
    var logoY = 100; // Position y pour dessiner le logo
    var logoWidth = 380; // Largeur du logo
    var logoHeight = 150; // Hauteur du logo
    context.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
    
    // Enregistrez le contenu du canvas en tant que nouvelle image
    var img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");

    // Créez un lien pour télécharger l'image
    var link = document.createElement("a");
    link.href = img.src;
    link.download = "snapshot.png";
    link.click();
  };
}

var recordingImg = document.getElementById("Recording");

function startRecording() {
  var aframeCanvas = document.querySelector("a-scene").canvas; // Obtenez le canvas de A-Frame
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  // Set the canvas dimensions to double the window's dimensions
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;

  var video = document.createElement("video");
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");
  video.srcObject = videoStream;

  video.addEventListener("loadedmetadata", function () {
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
      type: "video/mp4",
    });
    recordedChunks = [];
    var videoURL = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = videoURL;
    a.download = "recording.mp4";
    a.click();
    recordingImg.style.animation = ""; // Supprime l'animation
  };

  mediaRecorder.start();
  recordingImg.style.animation =
    "recordingAnim 2s ease 0s infinite normal forwards"; // Ajoute l'animation
}

function stopRecording() {
  mediaRecorder.stop();
  mediaRecorder.onstop = function () {
    var blob = new Blob(recordedChunks, {
      type: "video/mp4",
    });
    recordedChunks = [];
    var videoURL = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = videoURL;
    a.download = "recording.mp4";
    a.click();
    // Aussi libérez le flux de capture d'écran
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    recordingImg.style.animation = ""; // Supprime l'animation
  };
}

function stopMediaTracks(stream) {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

function switchCamera() {

  // If currentStream is defined, stop it.
  if (currentStream) {
    stopMediaTracks(currentStream);
    currentStream = null;
  }

  // Determine which camera to switch to based on current camera
  if (appState.cameraFrontActive) {
    appState.cameraFrontActive = false;

    location.reload();

  } else {
    appState.cameraFrontActive = true;

    let videoConstraints = {
      video: {
        facingMode: 'user', // Use front camera
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 }
      }
    };

    // Get video stream with the desired constraints
    navigator.mediaDevices.getUserMedia(videoConstraints)
      .then((stream) => {
        currentStream = stream;
        document.querySelector("video").srcObject = stream;
        setupFrontCamera();
      })
      .catch((error) => {
        console.error("Error in getUserMedia: ", error);
      });
  }
  document.querySelector("video").style.transform = "scaleX(-1)";
}

function setupFrontCamera() {
  let frontCameraImage = document.querySelector("#front-camera-image");
  let logoImage = document.querySelector('img[src="ui/Logo_Boss.png"]');
  let productionOutlineImage = document.querySelector(
    'img[src="ui/Production_Outline_complete.png"]'
  );
  let switchCameraButton = document.querySelector("#end-button");
  let fakeCapture = document.querySelector("#capture-button-fake");
  let recordingImg = document.getElementById("Recording");

  document.getElementById("userVideo").style.display = "block";
  recordingImg.style.display = "none";
  frontCameraImage.style.display = "block";
  logoImage.style.display = "none";
  productionOutlineImage.style.display = "none";
  switchCameraButton.style.display = "none";
  fakeCapture.style.display = "flex";
  document.querySelector(".center-div-container").style.display = "none";
  document.querySelector("#Recorder").style.display = "none";
  console.log("Camera front active");
  updateCameraRecorderToggle();

}
function setupBackCamera() {
  let frontCameraImage = document.querySelector("#front-camera-image");
  frontCameraImage.style.display = "none";
  // document.getElementById("Aframe-video").style.display = "block";
  updateCameraRecorderToggle();
}

window.onload = function () {
  var captureButton = document.querySelector("#capture-button");
  var shareButton = document.querySelector("#share-button");
  var downloadButton = document.querySelector("#download-button");
  var restartButton = document.querySelector("#restart-button");

  var videoElement = document.querySelector("video");
  var frameImg = document.querySelector("#front-camera-image");

  function restartCapture() {
    var photoCanvas = document.querySelector("#photo-canvas");
    var imgElement = document.querySelector("#captured-image");
    var captureFakeImg = document.getElementById("capture-button-fake");
    document.querySelector("#Switch-button-fake").style.display = "block";



    // Clear the captured photo
    photoCanvas.width = photoCanvas.width; // This will clear all the contents of the canvas
    document.body.style.backgroundColor = "#333333";

    // Show the Capture button again
    captureFakeImg.style.display = "block";


    // Hide the Share and Download buttons
    document.querySelector("#share-button").style.display = "none";
    document.querySelector("#download-button").style.display = "none";
    document.querySelector("#restart-button").style.display = "none";

    // Remove the displayed image
    if (imgElement) {
      imgElement.remove();
    }
    document.querySelector("#front-camera-image").style.display = "block";
    document.getElementById("userVideo").style.display = "block";

    // Redémarre le flux vidéo
    
    // var videoElement = document.getElementById('userVideo');
    // var constraints = { video: { facingMode: "user" } };
    // navigator.mediaDevices
    //   .getUserMedia(constraints)
    //   .then(function (stream) {
    //     videoElement.srcObject = stream;
    //   })
    //   .catch(function (err) {
    //     console.log("Une erreur s'est produite: " + err);
    //   });

  }

  document
    .querySelector("#restart-button")
    .addEventListener("click", restartCapture);

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

      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = outputWidth;
      outputCanvas.height = outputHeight;

      const ctx = outputCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        outputX,
        outputY,
        outputWidth,
        outputHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );
      resolve(outputCanvas);
    });
  }

  captureButton.addEventListener("click", async () => {
    console.log("Capture button was clicked!");
    var captureFakeImg = document.getElementById("capture-button-fake");
    // document.getElementById("Aframe-video").style.display = "none";


    // Cacher le bouton Capture
    captureFakeImg.style.display = "none";
    document.querySelector("#Switch-button-fake").style.display = "none";

    // Afficher les boutons Share et Download
    shareButton.style.display = "block";
    downloadButton.style.display = "block";
    restartButton.style.display = "flex";

    // Augmenter la taille des images/boutons Share et Download
    shareButton.style.width = "175px";
    shareButton.style.height = "auto";

    downloadButton.style.width = "175px";
    downloadButton.style.height = "auto";

    var videoElement = document.querySelector("video");
    var frameImg = document.querySelector("#front-camera-image");
    var frameRect = frameImg.getBoundingClientRect();

    let captureCanvas = capture(videoElement, 2, 2); // you can change the scale factors
    let captureCanvasUrl = captureCanvas.toDataURL("image/png");

    const canvas = await crop(captureCanvas, 414 / 717); // you can change the aspect ratio

    var capturedImageElement = document.querySelector("#captured-image");
    if (!capturedImageElement) {
      capturedImageElement = new Image();
      capturedImageElement.id = "captured-image";
      capturedImageElement.style.display = "block";
      capturedImageElement.style.position = "fixed";
      capturedImageElement.style.top = "0";
      capturedImageElement.style.left = "0"; // make sure the image starts from the left edge of the screen
      capturedImageElement.style.right = "0"; // make sure the image extends to the right edge of the screen
      capturedImageElement.style.maxWidth = "90%"; // make sure the image covers the whole width of the screen
      capturedImageElement.style.height = "auto"; // make sure the image covers the whole height of the screen
      capturedImageElement.style.margin = "auto"; // center the image on the screen
      capturedImageElement.style.objectFit = "cover";
      capturedImageElement.style.zIndex = "2";

      // Change the background color to black.
      document.body.style.backgroundColor = "#000000";

      // Add the image to the page.
      document.body.appendChild(capturedImageElement);
    }

    const captureCroppedUrl = canvas.toDataURL("image/png");

    // Create a new canvas and draw both the captured image and the frame image onto it.
    var displayCanvas = document.createElement("canvas");
    displayCanvas.width = canvas.width; // Use the original size of the image
    displayCanvas.height = canvas.height;
    var ctx = displayCanvas.getContext("2d");

    // Draw the captured image onto the canvas.
    ctx.drawImage(canvas, 0, 0, displayCanvas.width, displayCanvas.height);

    // Draw the frame image on top of the captured image, maintaining its aspect ratio.
    var frameImageElement = document.querySelector("#front-camera-image");
    var frameAspect =
      frameImageElement.naturalWidth / frameImageElement.naturalHeight;
    var frameWidth = displayCanvas.width;
    var frameHeight = frameWidth / frameAspect;
    var frameX = 0;
    var frameY = (displayCanvas.height - frameHeight) / 2;
    ctx.drawImage(frameImageElement, frameX, frameY, frameWidth, frameHeight);

    // Crop the canvas to the size of the frame.
    var imageData = ctx.getImageData(frameX, frameY, frameWidth, frameHeight);
    displayCanvas.width = frameWidth;
    displayCanvas.height = frameHeight;
    ctx.putImageData(imageData, 0, 0);

    // Use the new canvas for the display.
    capturedImageElement.src = displayCanvas.toDataURL("image/png");

    // Hide the frame filter
    frameImg.style.display = "none";

    // Arrête le flux vidéo
    var videoElement = document.getElementById('userVideo');
    videoElement.style.display = "none";
    // var stream = videoElement.srcObject;
    // var tracks = stream.getTracks();
    // tracks.forEach(function (track) {
    //   track.stop();
    // });
    // videoElement.srcObject = null;


    // Add the image to the page.
    document.body.appendChild(capturedImageElement);
  });

  document
    .querySelector("#download-button")
    .addEventListener("click", function () {
      var link = document.createElement("a");
      var capturedImageElement = document.querySelector("#captured-image");

      if (capturedImageElement) {
        // Create a new canvas and draw the captured image onto it.
        var downloadCanvas = document.createElement("canvas");
        downloadCanvas.width = capturedImageElement.naturalWidth; // Use the original size of the image
        downloadCanvas.height = capturedImageElement.naturalHeight;
        var ctx = downloadCanvas.getContext("2d");

        // Draw the captured image onto the canvas.
        ctx.drawImage(
          capturedImageElement,
          0,
          0,
          downloadCanvas.width,
          downloadCanvas.height
        );

        // Use the new canvas for the download.
        link.href = downloadCanvas.toDataURL("image/png");
        link.download = "JeSuisLeBOSS.png";
        link.click();
      } else {
        console.log("Image not captured yet");
      }
    });

    function dataUrlToFile(dataUrl, fileName) {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
    
      return new File([u8arr], fileName, { type: mime });
    }
    
    document.querySelector("#share-button").addEventListener("click", function () {
      var capturedImageElement = document.querySelector("#captured-image");
    
      if (capturedImageElement && navigator.canShare) {
        const file = dataUrlToFile(capturedImageElement.src, "myImage.png");
    
        if (navigator.canShare({ files: [file] })) {
          navigator
            .share({
              files: [file],
              title: 'My Photo',
              text: 'Check out my photo!',
            })
            .then(() => console.log("Successful share"))
            .catch((error) => console.log("Error sharing", error));
        } else {
          console.log("File sharing not supported on this platform.");
        }
      } else {
        console.log("Web Share API not supported.");
      }
    });    
};
