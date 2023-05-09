let markerFound = false;

function onOpenCvReady() {
    if (typeof cv === 'undefined') {
        setTimeout(onOpenCvReady, 50);
        return;
    }

    // Load the marker image
    const markerImage = document.getElementById("marker-img");
    const img = cv.imread(markerImage);

    // Start the video stream from the camera
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "environment"
        }
    })
    .then((stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', '');

        video.addEventListener('loadedmetadata', () => {
            video.play();
            tick(video, img);
        });
    })
    .catch((error) => {
        console.error('Error accessing camera:', error);
    });
}

function tick(video, img) {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Récupérer le contexte 2D du canvas
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        // Dessiner la vidéo du flux de la caméra sur le canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir l'image du canvas en image utilisable par OpenCV.js
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = cv.matFromImageData(imageData);

        // Convertir l'image en niveaux de gris
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Charger le marqueur
        const marker = img;

        // Trouver la correspondance entre le marqueur et l'image actuelle
        const keypoints1 = new cv.KeyPointVector();
        const keypoints2 = new cv.KeyPointVector();
        const descriptors1 = new cv.Mat();
        const descriptors2 = new cv.Mat();
        const detector = cv.ORB.create();
        const matcher = new cv.BFMatcher(cv.NORM_HAMMING);

        detector.detect(gray, keypoints1);
        detector.detect(marker, keypoints2);
        detector.compute(gray, keypoints1, descriptors1);
        detector.compute(marker, keypoints2, descriptors2);

        const matches = new cv.DMatchVectorVector();
        matcher.knnMatch(descriptors1, descriptors2, matches, 2);

        // Filtrer les bonnes correspondances en utilisant le ratio test de Lowe
        const goodMatches = [];
        for (let i = 0; i < matches.size(); ++i) {
            const match = matches.get(i);
            if (match.size() >= 2 && match.get(0).distance < 0.75 * match.get(1).distance) {
                goodMatches.push(match.get(0));
            }
        }

        // Afficher l'image correspondante si un nombre suffisant de correspondances ont été trouvées
        if (goodMatches.length > 10) {
            console.log("Marker found!");
            const model = document.getElementById("model");
            model.setAttribute("visible", true);
        } else {
            console.log("Marker lost!");
            const model = document.getElementById("model");
            model.setAttribute("visible", false);
        }

        // Afficher l'image traitée sur le canvas
        cv.imshow("canvas", gray);

        // Libérer la mémoire des objets OpenCV.js
        src.delete();
        gray.delete();
        keypoints1.delete();
        keypoints2.delete();
        descriptors1.delete();
        descriptors2.delete();
        matches.delete();

        // Rappeler la fonction "tick" pour rafraîchir l'affichage
        requestAnimationFrame(() => tick(video, img));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const markerImage = document.getElementById("marker-img");
    if (markerImage.complete) {
        onOpenCvReady();
    } else {
        markerImage.addEventListener('load', onOpenCvReady);
    }
});