let currentStream;
var appState = {
  cameraFrontActive: false,
};

let windowHeihgt = window.innerHeight;
let windowWidth = window.innerWidth;

/**
 * Captures a image frame from the provided video element.
 *
 * @param {Video} video HTML5 video element from where the image frame will be captured.
 * @param {Number} scaleFactor Factor to scale the canvas element that will be return. This is an optional parameter.
 *
 * @return {Canvas}
 */
function capture(video, scaleFactorW,scaleFactorH, reverse) {
    var w = video.videoWidth * scaleFactorW;
    var h = video.videoHeight * scaleFactorH;
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    // if (reverse){
    //     ctx.translate(w, 0); 
    //     ctx.scale(-1, 1);
    //     ctx.drawImage(video, -w / 2, h, w, h);
    // }else {

    ctx.scale(-1, 1);

    ctx.drawImage(video, -w, 0, w, h);
    // }
    return canvas;
}

function flipHorizontally(img, x, y) {
  // move to x + img's width
  ctx.translate(x + img.width, y);

  // scaleX by -1; this "trick" flips horizontally

  // draw the img
  // no need for x,y since we've already translated
  ctx.drawImage(img, 0, 0);

  // always clean up -- reset transformations to default
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}


/**
 * @param {string} url - The source image
 * @param {number} aspectRatio - The aspect ratio
 * @return {Promise<HTMLCanvasElement>} A Promise that resolves with the resulting image as a canvas element
 */
function crop(url, aspectRatio) {
    // we return a Promise that gets resolved with our canvas element
    return new Promise((resolve) => {
        // this image will hold our source image data
        const inputImage = new Image();

        // we want to wait for our image to load
        inputImage.onload = () => {
            // let's store the width and height of our image
            const inputWidth = inputImage.naturalWidth;
            const inputHeight = inputImage.naturalHeight;

            // get the aspect ratio of the input image
            const inputImageAspectRatio = inputWidth / inputHeight;

            // if it's bigger than our target aspect ratio
            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputImageAspectRatio > aspectRatio) {
                outputWidth = inputHeight * aspectRatio;
            } else if (inputImageAspectRatio < aspectRatio) {
                outputHeight = inputWidth / aspectRatio;
            }

            // calculate the position to draw the image at
            const outputX = (outputWidth - inputWidth) * 0.5;
            const outputY = (outputHeight - inputHeight) * 0.5;

            // create a canvas that will present the output image
            const outputImage = document.createElement('canvas');

            // set it to the same size as the image
            outputImage.width = outputWidth;
            outputImage.height = outputHeight;

            // draw our image at position 0, 0 on the canvas
            const ctx = outputImage.getContext('2d');
            ctx.drawImage(inputImage, outputX, outputY);
            resolve(outputImage);
        };

        // start loading our image
        inputImage.src = url;
    });
}





function stopMediaTracks(stream) {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

function switchCamera() {
  if (typeof currentStream !== "undefined") {
    stopMediaTracks(currentStream);
  }

  let videoConstraints;
  let filtre = document.querySelector("#filtre");

  // Switch between 'user' and 'environment' cameras
  if (appState.cameraFrontActive) {
    videoConstraints = {
      video: {
        facingMode: "environment",
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 400, ideal: 720, max: 1080 },
        frameRate: { ideal: 60 },
      },
    };
   // appState.cameraFrontActive = false;
  } else {
    videoConstraints = {
      video: {
        facingMode: "user",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 },
      },
    };

    appState.cameraFrontActive = true;
  }

  document.querySelector("video").style.transform = "scaleX(-1)";

  // Show or hide image based on camera state
  let frontCameraImage = document.querySelector("#front-camera-image");
  let logoImage = document.querySelector('img[src="ui/Logo_Boss.png"]');
  let productionOutlineImage = document.querySelector(
    'img[src="ui/Production_Outline.png"]'
  );
  let switchCameraButton = document.querySelector("#end-button");

  if (appState.cameraFrontActive) {
    frontCameraImage.style.display = "flex";
    logoImage.style.display = "none";
    productionOutlineImage.style.display = "none";
    switchCameraButton.style.display = "none";
    document.querySelector("#capture-button").style.display = "block";
  } else {
    frontCameraImage.style.display = "none";
    logoImage.style.display = "block";
    productionOutlineImage.style.display = "block";
    switchCameraButton.style.display = "flex";
  }

  // Browser compatibility logic for getUserMedia
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(videoConstraints)
      .then((stream) => {
        currentStream = stream;
        document.querySelector("video").srcObject = stream;
        let sceneEl = document.querySelector("a-scene");
        let arSystem = sceneEl.systems["mindar-image-system"];
        arSystem.stop();

        // get the 3D model entity
        const model = document.querySelector("#animated-model");

        // remove the 3D model from the scene
        model.parentNode.removeChild(model);
        console.log(arSystem);
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  } else if (navigator.getUserMedia) {
    navigator.getUserMedia(
      videoConstraints,
      function (stream) {
        currentStream = stream;
        document.querySelector("video").srcObject = stream;
        let sceneEl = document.querySelector("a-scene");
        let arSystem = sceneEl.systems["mindar-image-system"];
        arSystem.stop();

        // get the 3D model entity
        const model = document.querySelector("#animated-model");

        // remove the 3D model from the scene
        model.parentNode.removeChild(model);
        console.log(arSystem);
      },
      function (err) {
        console.log("An error occurred: " + err);
      }
    );
  } else {
    console.log("Your browser does not support getUserMedia API");
  }
}

// Browser compatibility logic for getUserMedia on page load
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      currentStream = stream;
      document.querySelector("video").srcObject = stream;
      appState.cameraFrontActive = false;
    })
    .catch((err) => console.log("Error in accessing user media: ", err));
} else if (navigator.getUserMedia) {
  navigator.getUserMedia(
    { video: { facingMode: "environment" } },
    function (stream) {
      currentStream = stream;
      document.querySelector("video").srcObject = stream;
      appState.cameraFrontActive = false;
    },
    function (err) {
      console.log("An error occurred: " + err);
    }
  );
} else {
  console.log("Your browser does not support getUserMedia API");
}

window.addEventListener("DOMContentLoaded", (event) => {
  let model = document.querySelector("#animated-model a-gltf-model");
  let touchIcon = document.querySelector("#animated-model a-image");
  let touchCount = 0;

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

      endButton.addEventListener("click", function () {
        console.log("Switch camera button was clicked!");
        switchCamera(); // Utilisez la fonction switchCamera() que vous avez d�finie pr�c�demment
      });
    }, 1000);
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
    document.body.addEventListener("touchstart", touchStartHandler);
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

window.onload =  () => {
  var captureButton = document.querySelector("#capture-button");
  var shareButton = document.querySelector("#share-button");
  var downloadButton = document.querySelector("#download-button");
  var restartButton = document.querySelector("#restart-button");
  var buttonBackground = document.querySelector("#button-background");

  var videoElement = document.querySelector("video");
  var frameImg = document.querySelector("#front-camera-image");

  // Initialisation de variables pour les utiliser plus tard.
  var frameWidth, frameHeight, scaleFactor;

  // Met � jour les variables � chaque redimensionnement de la fen�tre.
  window.addEventListener("resize", function () {
    // R�cup�rer � nouveau les dimensions du cadre.
    var frameRect = frameImg.getBoundingClientRect();
    frameWidth = frameRect.width;
    frameHeight = frameRect.height;

    // Recalculer le facteur d'�chelle pour correspondre � la taille de la vid�o � la taille du cadre.
    var videoWidth = videoElement.videoWidth;
    var videoHeight = videoElement.videoHeight;
    scaleFactor = frameWidth / videoWidth;
  });

  // Ex�cute la mise � jour une fois lors du chargement initial.
  window.dispatchEvent(new Event("resize"));

  function restartCapture() {
    var photoCanvas = document.querySelector("#photo-canvas");
    var imgElement = document.querySelector("#captured-image");

    // Clear the captured photo
    photoCanvas.width = photoCanvas.width; // This will clear all the contents of the canvas

    // Show the Capture button again
    document.querySelector("#capture-button").style.display = "block";

    // Hide the Share and Download buttons
    document.querySelector("#share-button").style.display = "none";
    document.querySelector("#download-button").style.display = "none";
    document.querySelector("#button-background").style.display = "none";

    // Remove the displayed image
    if (imgElement) {
      imgElement.remove();
    }
    document.querySelector("#front-camera-image").style.display = "block";
  }

  document
    .querySelector("#restart-button")
    .addEventListener("click", restartCapture);

  captureButton.addEventListener("click", async () => {
    console.log("Capture button was clicked!");

    // Cacher le bouton Capture
    captureButton.style.display = "none";

    // Afficher les boutons Share et Download
    shareButton.style.display = "block";
    downloadButton.style.display = "block";
    restartButton.style.display = "block";
    buttonBackground.style.display = "block";

    // Augmenter la taille des images/boutons Share et Download
    shareButton.style.width = "175px";
    shareButton.style.height = "auto";

    downloadButton.style.width = "175px";
    downloadButton.style.height = "auto";

    var videoElement = document.querySelector("video");
    var frameImg = document.querySelector("#front-camera-image");
    var frameRect = frameImg.getBoundingClientRect();

    let captureCanvas = capture(videoElement, 1, 1, true);
    let captureCanvasUrl = captureCanvas.toDataURL("image/png");
    console.log("captureCanvasUrl : ", captureCanvasUrl);

    const canvas = await crop(captureCanvasUrl, 414 / 717);


    var capturedImageElement = document.querySelector("#captured-image");
    if (!capturedImageElement) {
      capturedImageElement = new Image();
      capturedImageElement.id = "captured-image";
      capturedImageElement.style.display = "block";
      capturedImageElement.style.position = "fixed";
      capturedImageElement.style.top = "0";
      capturedImageElement.style.zIndex = "2";
      capturedImageElement.style.maxWidth = "130%";
      capturedImageElement.style.maxHeight = "100%";

      console.log("capturedImageElement : ", capturedImageElement);
      // Add the image to the page.
      document.body.appendChild(capturedImageElement);
    }

    // Set the src of the image to the data URL of the canvas.
    // capturedImageElement.src = dataUrl;
    // capturedImageElement.style.maxWidth = frameRect.width;
    // capturedImageElement.style.maxHeight = frameRect.height;
    // capturedImageElement.src = dataUrl;
    const captureCroppedUrl = canvas.toDataURL("image/png");
    console.log("captureCroppedUrl : ", captureCroppedUrl);
    capturedImageElement.src = captureCroppedUrl;
  });

  document
    .querySelector("#download-button")
    .addEventListener("click", function () {
      var link = document.createElement("a");
      link.href = document.querySelector("#photo-canvas").toDataURL();
      link.download = "JeSuisLeBOSS.png";
      link.click();
    });

  document
    .querySelector("#share-button")
    .addEventListener("click", function () {
      if (navigator.share) {
        navigator
          .share({
            title: "My Photo",
            text: "Check out my photo!",
            url: document.querySelector("#photo-canvas").toDataURL(),
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing", error));
      } else {
        console.log("Web Share API not supported.");
      }
    });
};
