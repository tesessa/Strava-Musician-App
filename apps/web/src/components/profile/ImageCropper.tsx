import { useState, useRef, useEffect } from "react";
import "./imageCropper.css";

type ImageCropperProps = {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
};

const ImageCropper = ({ imageUrl, onCropComplete, onCancel }: ImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState(200);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const maxDimension = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      setImageSize({ width, height });
      setCropSize(Math.min(200, Math.min(width, height)));
      setCropPosition({
        x: (width - Math.min(200, Math.min(width, height))) / 2,
        y: (height - Math.min(200, Math.min(width, height))) / 2,
      });

      if (imageRef.current) {
        imageRef.current.src = imageUrl;
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [cropPosition, cropSize, imageSize]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !image.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageSize.width;
    canvas.height = imageSize.height;

    // Draw the image
    ctx.drawImage(image, 0, 0, imageSize.width, imageSize.height);

    // Draw overlay (darken everything)
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the circular crop area
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(
      cropPosition.x + cropSize / 2,
      cropPosition.y + cropSize / 2,
      cropSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw the circle border
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "#6c4ef6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      cropPosition.x + cropSize / 2,
      cropPosition.y + cropSize / 2,
      cropSize / 2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is inside the circle
    const dx = x - (cropPosition.x + cropSize / 2);
    const dy = y - (cropPosition.y + cropSize / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= cropSize / 2) {
      setIsDragging(true);
      setDragStart({ x: x - cropPosition.x, y: y - cropPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newX = x - dragStart.x;
    let newY = y - dragStart.y;

    // Constrain to canvas bounds
    newX = Math.max(0, Math.min(newX, imageSize.width - cropSize));
    newY = Math.max(0, Math.min(newY, imageSize.height - cropSize));

    setCropPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    const newSize = Math.max(
      50,
      Math.min(cropSize + delta, Math.min(imageSize.width, imageSize.height))
    );

    // Adjust position to keep circle centered
    const sizeDiff = newSize - cropSize;
    let newX = cropPosition.x - sizeDiff / 2;
    let newY = cropPosition.y - sizeDiff / 2;

    // Constrain to bounds
    newX = Math.max(0, Math.min(newX, imageSize.width - newSize));
    newY = Math.max(0, Math.min(newY, imageSize.height - newSize));

    setCropSize(newSize);
    setCropPosition({ x: newX, y: newY });
  };

  const handleCrop = () => {
    const image = imageRef.current;
    if (!image || !image.complete) return;

    // Calculate the scale factor between displayed size and original size
    const scaleX = image.naturalWidth / imageSize.width;
    const scaleY = image.naturalHeight / imageSize.height;

    // Create a canvas for the cropped image
    const cropCanvas = document.createElement("canvas");
    const size = 300; // Output size
    cropCanvas.width = size;
    cropCanvas.height = size;

    const ctx = cropCanvas.getContext("2d");
    if (!ctx) return;

    // Calculate source dimensions in original image coordinates
    const sourceX = cropPosition.x * scaleX;
    const sourceY = cropPosition.y * scaleY;
    const sourceSize = cropSize * scaleX;

    // Draw circular clip
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw the cropped portion
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      size,
      size
    );

    // Convert to blob
    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="image-cropper-overlay">
      <div className="image-cropper-modal">
        <h3 className="cropper-title">Adjust Your Profile Picture</h3>
        <p className="cropper-instructions">
          Drag the circle to position your photo, use the zoom buttons to resize
        </p>

        <div className="cropper-canvas-container">
          <canvas
            ref={canvasRef}
            className="cropper-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <img ref={imageRef} style={{ display: "none" }} alt="crop" />
        </div>

        <div className="cropper-zoom-controls">
          <button
            className="zoom-btn"
            onClick={() => handleZoom(-20)}
            type="button"
          >
            −
          </button>
          <span className="zoom-label">Zoom</span>
          <button
            className="zoom-btn"
            onClick={() => handleZoom(20)}
            type="button"
          >
            +
          </button>
        </div>

        <div className="cropper-actions">
          <button className="cropper-cancel-btn" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="cropper-apply-btn" onClick={handleCrop} type="button">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;