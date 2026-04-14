import React, { useRef, useEffect } from 'react';

export default function WaveformCanvas(props) {
  const canvasRef = useRef(null);
  const propsRef = useRef(props);

  // Always keep the mutable ref pointer up to date with the latest React render closure
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const logicalWidth = parent.clientWidth;
    const logicalHeight = parent.clientHeight;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    
    // Normalize coordinate system to use CSS pixels
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    ctx.lineWidth = 1.8; // slightly thinner for crisp precision
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    let animationFrameId;
    let x = 0;
    let lastY = logicalHeight / 2;
    let time = 0;
    let isPeakActive = false;
    let isSpikeActive = false;
    
    const gapWidth = 15; // The "erase bar" ahead of the drawing point
    
    const draw = () => {
      // Evaluate instantly from mutable ref instead of static closure
      let { signalGenerator, color, speed = 2, amplitude = 1, drawSyncMarkers = false, pacerSpikeDetector = null } = propsRef.current;
      
      // Evaluate actual signal first
      const val = signalGenerator(time);
      const targetY = (logicalHeight / 2) - (val * amplitude * (logicalHeight / 2));
      
      // Erase ahead
      ctx.clearRect(x, 0, gapWidth, logicalHeight);
      
      // Draw standard ECG segment
      ctx.beginPath();
      
      if (x === 0) {
        ctx.moveTo(x, targetY);
      } else {
        ctx.moveTo(x - speed, lastY);
        ctx.lineTo(x, targetY);
      }
      
      let computedColor = color;
      if (color && color.startsWith('var(')) {
        const varName = color.match(/var\(([^)]+)\)/)[1];
        computedColor = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      }

      // Apply neon glow effect normally
      ctx.strokeStyle = computedColor;
      ctx.shadowBlur = 4;
      ctx.shadowColor = computedColor;
      ctx.stroke();

      // Render Sync Marker if toggled and at R-wave peak
      if (drawSyncMarkers) {
         if (Math.abs(val) > 0.65 && !isPeakActive) {
            ctx.save();
            ctx.fillStyle = '#ffcc00';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ffaa00';
            ctx.beginPath();
            const yPos = 8; // Top of canvas
            ctx.moveTo(x - 6, yPos);
            ctx.lineTo(x + 6, yPos);
            ctx.lineTo(x, yPos + 10);
            ctx.fill();
            ctx.restore();
            isPeakActive = true;
         } else if (Math.abs(val) < 0.2) {
            isPeakActive = false;
         }
      }
      
      // Render pure white graphic overlay for Pacer Spike
      if (pacerSpikeDetector) {
         if (pacerSpikeDetector()) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ffffff';
            ctx.moveTo(x, targetY - 40);
            ctx.lineTo(x, targetY + 40);
            ctx.stroke();
            ctx.restore();
         }
      }
      
      lastY = targetY;
      x += speed;
      time += speed;
      
      // Wrap around
      if (x >= logicalWidth) {
        x = 0;
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    // Initial clear
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    
    animationFrameId = requestAnimationFrame(draw);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []); // Empty dependency array prevents canvas tear-down entirely!

  return (
    <div className="waveform-canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
}
