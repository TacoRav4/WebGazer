import * as faceapi from 'face-api.js';
// blink detection set up 
class BlinkDetector {
  constructor() {
    this.blinkCount = 0; // Initialize blink count
    this.blinkTimestamps = []; // Initialize array to store blink timestamps
  }
   // Load the necessary face detection and landmark models
  async loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  }
  // Detect blinks in the video stream
  async detectBlinks(video) {
    // Detect faces and landmarks in the video frame
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    // Iterate over each detected face
    detections.forEach(detection => {
      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye(); // Get landmarks for the left eye
      const rightEye = landmarks.getRightEye(); // Get landmarks for the right eye
      const leftEAR = this.calculateEAR(leftEye); // Calculate EAR for the left eye
      const rightEAR = this.calculateEAR(rightEye); // Calculate EAR for the right eye
      
      // Check if both eyes have EAR below the threshold, indicating a blink
      if (leftEAR < 0.2 && rightEAR < 0.2) {
        this.blinkCount++; // Increment blink count
        this.blinkTimestamps.push(Date.now()); // Record the timestamp of the blink
      }
    });
  }

  // Calculate the Eye Aspect Ratio (EAR) for a given eye
  calculateEAR(eye) {
    const A = faceapi.euclideanDistance(eye[1], eye[5]); // Distance between vertical eye landmarks (1, 5)
    const B = faceapi.euclideanDistance(eye[2], eye[4]); // Distance between vertical eye landmarks (2, 4)
    const C = faceapi.euclideanDistance(eye[0], eye[3]); // Distance between horizontal eye landmarks (0, 3)
    return (A + B) / (2.0 * C); // Calculate EAR
  }
}

export default BlinkDetector;