import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  // Calculate filter and LFO parameters based on x and y coordinates
  const calculateGroupParameters = (x, y) => {
    // Clamp input values to ensure they are within the expected range
    const clampedX = Math.max(-1.0, Math.min(1.0, x));
    const clampedY = Math.max(-1.0, Math.min(1.0, y));

    // --- 1. Calculate Filter Balance (from X-axis) ---
    // Linear crossfade. As x goes from -1 to +1:
    // lp_volume goes from 1.0 to 0.0
    // hp_volume goes from 0.0 to 1.0
    const lpVolume = (1.0 - clampedX) / 2.0;
    const hpVolume = (1.0 + clampedX) / 2.0;

    // --- 2. Calculate Base LFO Intensity (from Y-axis) ---
    // Map y from [-1.0, 1.0] to an intensity value [0.0, 1.0]
    const lfoIntensity = (clampedY + 1.0) / 2.0;

    // Base LFO parameters
    const baseLfoSpeed = lfoIntensity;
    const baseLfoModulation = lfoIntensity;

    // --- 3. Apply Weighted Linking ---
    // Scale the base LFO parameters based on the filter volumes
    const lpLfoSpeed = baseLfoSpeed * lpVolume;
    const lpLfoModulation = baseLfoModulation * lpVolume;

    const hpLfoSpeed = baseLfoSpeed * hpVolume;
    const hpLfoModulation = baseLfoModulation * hpVolume;

    return {
      high: {
        volume: parseFloat((hpVolume * 100).toFixed(1)),
        lfoSpeed: parseFloat((hpLfoSpeed * 100).toFixed(1)),
        lfoModulation: parseFloat((hpLfoModulation * 100).toFixed(1))
      },
      low: {
        volume: parseFloat((lpVolume * 100).toFixed(1)),
        lfoSpeed: parseFloat((lpLfoSpeed * 100).toFixed(1)),
        lfoModulation: parseFloat((lpLfoModulation * 100).toFixed(1))
      }
    };
  };

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

  // Calculate current group parameters
  const groupParameters = calculateGroupParameters(coordinates.x, coordinates.y);

  return (
    <div className="app-container">
      <h1>XY UI Coordinate Test</h1>
      
      <div className="coordinate-display">
        <div className="coordinate-item">
          <span className="coordinate-label">X:</span>
          <span className="coordinate-value">{coordinates.x}</span>
        </div>
        <div className="coordinate-item">
          <span className="coordinate-label">Y:</span>
          <span className="coordinate-value">{coordinates.y}</span>
        </div>
      </div>
      
      <div className="main-content">
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
        
        <div className="groups-container">
          <div className="group-panel">
            <h2>High Pass</h2>
            <div className="parameter">
              <span className="parameter-label">Volume:</span>
              <span className="parameter-value">{groupParameters.high.volume}%</span>
            </div>
            <div className="parameter">
              <span className="parameter-label">LFO Speed:</span>
              <span className="parameter-value">{groupParameters.high.lfoSpeed}%</span>
            </div>
            <div className="parameter">
              <span className="parameter-label">LFO Modulation:</span>
              <span className="parameter-value">{groupParameters.high.lfoModulation}%</span>
            </div>
          </div>
          
          <div className="group-panel">
            <h2>Low Pass</h2>
            <div className="parameter">
              <span className="parameter-label">Volume:</span>
              <span className="parameter-value">{groupParameters.low.volume}%</span>
            </div>
            <div className="parameter">
              <span className="parameter-label">LFO Speed:</span>
              <span className="parameter-value">{groupParameters.low.lfoSpeed}%</span>
            </div>
            <div className="parameter">
              <span className="parameter-label">LFO Modulation:</span>
              <span className="parameter-value">{groupParameters.low.lfoModulation}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="instructions">
        <p>Click and drag inside the canvas to see parameters change.</p>
        <p>The center point (0,0) represents the neutral position.</p>
        <p>Move left: Low Pass volume increases, High Pass decreases</p>
        <p>Move right: High Pass volume increases, Low Pass decreases</p>
        <p>Move up (positive Y): Increases LFO intensity (speed and modulation)</p>
      </div>
    </div>
  )
}

export default App