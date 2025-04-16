import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  // Function to handle mouse down event
  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateCoordinates(e);
  };

  // Function to handle mouse move event
  const handleMouseMove = (e) => {
    if (isDragging) {
      updateCoordinates(e);
    }
  };

  // Function to handle mouse up event
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Function to update coordinates based on mouse position
  const updateCoordinates = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate x and y relative to the center (0,0)
    // Values will range from -1 to 1
    const x = ((e.clientX - rect.left) - centerX) / centerX;
    const y = (centerY - (e.clientY - rect.top)) / centerY;
    
    setCoordinates({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
  };

  // Draw the coordinate system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = 0; x <= width; x += width / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= height; y += height / 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw x and y axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw current position point
    const pointX = centerX + (coordinates.x * centerX);
    const pointY = centerY - (coordinates.y * centerY);

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
    ctx.fill();
  }, [coordinates]);

  return (
    <div className="app-container">
      <h1>XY UI Coordinate Test</h1>
      
      <div className="coordinate-display">
        <p>X: {coordinates.x}</p>
        <p>Y: {coordinates.y}</p>
      </div>
      
      <canvas 
        ref={canvasRef}
        width={400}
        height={400}
        className="coordinate-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className="instructions">
        <p>Click and drag inside the canvas to see the coordinates change.</p>
        <p>The center point (0,0) represents the neutral position.</p>
      </div>
    </div>
  )
}

export default App