import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const EyeTracker = ({ onAttentionChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [attentionScore, setAttentionScore] = useState(100);
  const [absentSeconds, setAbsentSeconds] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setModelLoaded(true);
        startVideo();
      } catch (err) {
        console.error("FaceAPI models error:", err);
      }
    };
    loadModels();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const handleVideoPlay = () => {
    if (!modelLoaded) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (detections) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          // Draw bounding box with markers
          const box = resizedDetections.detection.box;
          const color = attentionScore > 75 ? '#2daa6d' : attentionScore > 40 ? '#e5930a' : '#d94040';
          
          context.strokeStyle = color;
          context.lineWidth = 2;
          context.strokeRect(box.x, box.y, box.width, box.height);
          
          // Draw corner markers (simplified)
          context.fillStyle = color;
          context.fillRect(box.x, box.y, 20, 4);
          context.fillRect(box.x, box.y, 4, 20);
          
          // Draw landmarks (eyes)
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          setAttentionScore(prev => Math.min(100, prev + 1));
          setAbsentSeconds(0);
        } else {
          setAttentionScore(prev => Math.max(0, prev - 5));
          setAbsentSeconds(prev => prev + 1);
        }
        onAttentionChange(attentionScore);
      }
    }, 1000);
  };

  return (
    <div className="camera-box" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
      {!isActive ? (
        <div className="camera-placeholder">
           <div className="cam-icon">📹</div>
           <p>Camera required for test</p>
           <button className="btn btn-blue btn-sm mt-4" onClick={startVideo}>Enable Camera</button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            width="100%" 
            height="auto" 
            style={{ borderRadius: '12px', display: 'block' }}
            onPlay={handleVideoPlay} 
          />
          <canvas 
            ref={canvasRef} 
            style={{ position: 'absolute', top: 0, left: 0 }} 
          />
          <div className="eye-stats-overlay">
             <div className="stat-item">
               <span>Attention:</span>
               <span style={{ color: attentionScore > 75 ? 'var(--green)' : attentionScore > 40 ? 'var(--amber)' : 'var(--red)' }}>
                 {attentionScore}%
               </span>
             </div>
             {absentSeconds > 0 && <div className="stat-item red">Face Absent: {absentSeconds}s</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default EyeTracker;
