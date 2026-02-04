import React, { useRef, useState } from 'react';
import { Modal, Button, Row, Col, Card, Image } from 'react-bootstrap';
import { FaCamera, FaUpload, FaTimes, FaCheck } from 'react-icons/fa';

const CameraCapture = ({ show, onHide, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [mode, setMode] = useState('camera'); // 'camera' or 'upload'

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Cannot access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Use captured/uploaded image
  const useImage = () => {
    const imageData = mode === 'camera' ? capturedImage : uploadedImage;
    if (imageData && onCapture) {
      onCapture(imageData);
      reset();
      onHide();
    }
  };

  // Reset everything
  const reset = () => {
    stopCamera();
    setCapturedImage(null);
    setUploadedImage(null);
    setMode('camera');
  };

  // Handle modal close
  const handleClose = () => {
    reset();
    onHide();
  };

  // Initialize camera when modal opens
  React.useEffect(() => {
    if (show && mode === 'camera') {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [show, mode]);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera /> Add Item Image
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Mode Selection */}
        <div className="text-center mb-4">
          <div className="btn-group" role="group">
            <Button
              variant={mode === 'camera' ? 'primary' : 'outline-primary'}
              onClick={() => {
                setMode('camera');
                setUploadedImage(null);
                startCamera();
              }}
            >
              <FaCamera /> Take Photo
            </Button>
            <Button
              variant={mode === 'upload' ? 'primary' : 'outline-primary'}
              onClick={() => {
                setMode('upload');
                setCapturedImage(null);
                stopCamera();
                fileInputRef.current?.click();
              }}
            >
              <FaUpload /> Upload Image
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Camera Mode */}
        {mode === 'camera' && (
          <div>
            {!capturedImage ? (
              <div className="text-center">
                <div className="position-relative mb-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
                <Button
                  variant="success"
                  size="lg"
                  onClick={capturePhoto}
                  disabled={!stream}
                >
                  <FaCamera /> Capture Photo
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Image
                  src={capturedImage}
                  alt="Captured"
                  fluid
                  style={{
                    maxHeight: '400px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px'
                  }}
                  className="mb-3"
                />
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setCapturedImage(null)}
                  >
                    <FaTimes /> Retake
                  </Button>
                  <Button
                    variant="primary"
                    onClick={useImage}
                  >
                    <FaCheck /> Use This Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div className="text-center">
            {uploadedImage ? (
              <div>
                <Image
                  src={uploadedImage}
                  alt="Uploaded"
                  fluid
                  style={{
                    maxHeight: '400px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px'
                  }}
                  className="mb-3"
                />
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setUploadedImage(null);
                      fileInputRef.current?.click();
                    }}
                  >
                    <FaTimes /> Choose Another
                  </Button>
                  <Button
                    variant="primary"
                    onClick={useImage}
                  >
                    <FaCheck /> Use This Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded p-5 text-center">
                <FaUpload size={48} className="text-muted mb-3" />
                <h5>No image selected</h5>
                <p className="text-muted">
                  Click "Upload Image" button above or drop an image here
                </p>
                <Button
                  variant="outline-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Image
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CameraCapture;