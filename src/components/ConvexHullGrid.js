import React, { useRef, useEffect, useState } from 'react';
import { useGrid } from '../hooks/useGrid';

const ConvexHullGrid = ({ points, hull, onAddPoint, mode }) => {
  const canvasRef = useRef(null);
  const { zoom, pan, toCanvasCoords, toGridCoords, getCanvasMousePos, applyZoom, resetView } = useGrid(canvasRef);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const hullPointSet = new Set(hull.map(p => `${p.x},${p.y}`));

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);
    
    // --- Grid and Axis Drawing (Omitted for brevity, but it's the same as before) ---
    const getLabelStep = () => { const minPixelStep = 60, gridStepInPixels = 50 * zoom; if (gridStepInPixels < minPixelStep / 4) return 10; if (gridStepInPixels < minPixelStep / 2) return 5; if (gridStepInPixels < minPixelStep) return 2; return 1; };
    const labelStep = getLabelStep();
    context.font = '12px Arial'; context.textAlign = 'center'; context.textBaseline = 'middle';
    for (let i = 0; pan.x + i * 50 * zoom < width; i++) { const x = pan.x + i * 50 * zoom; context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.strokeStyle = (i === 0) ? '#000' : '#ccc'; context.stroke(); if (i > 0 && i % labelStep === 0) { context.fillStyle = 'black'; context.fillText(i, x, pan.y + 15); } }
    for (let i = -1; pan.x + i * 50 * zoom > 0; i--) { const x = pan.x + i * 50 * zoom; context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.strokeStyle = '#ccc'; context.stroke(); if (i % labelStep === 0) { context.fillStyle = 'black'; context.fillText(i, x, pan.y + 15); } }
    for (let i = 0; pan.y + i * 50 * zoom < height; i++) { const y = pan.y + i * 50 * zoom; context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.strokeStyle = (i === 0) ? '#000' : '#ccc'; context.stroke(); if (i > 0 && i % labelStep === 0) { context.fillStyle = 'black'; context.fillText(-i, pan.x - 15, y); } }
    for (let i = -1; pan.y + i * 50 * zoom > 0; i--) { const y = pan.y + i * 50 * zoom; context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.strokeStyle = '#ccc'; context.stroke(); if (i % labelStep === 0) { context.fillStyle = 'black'; context.fillText(-i, pan.x - 15, y); } }
    context.fillStyle = 'black'; context.fillText('0', pan.x - 10, pan.y + 10);
    // --- End Grid Drawing ---

    // --- DRAW ALL POINTS & COORDINATES ---
    points.forEach(p => {
        const canvasP = toCanvasCoords(p);
        context.beginPath();
        context.arc(canvasP.x, canvasP.y, 4, 0, 2 * Math.PI);
        context.fillStyle = hullPointSet.has(`${p.x},${p.y}`) ? '#007bff' : '#888';
        context.fill();

        // NEW: Draw coordinate labels if zoomed in enough
        if (zoom > 0.8) {
            context.fillStyle = 'black';
            context.font = '12px Arial';
            // Adjust text position to be slightly above and to the right of the point
            context.fillText(`(${p.x}, ${p.y})`, canvasP.x + 5, canvasP.y - 8);
        }
    });

    // --- DRAW HULL LINES ---
    if (hull.length > 1) {
        context.beginPath();
        const startPoint = toCanvasCoords(hull[0]);
        context.moveTo(startPoint.x, startPoint.y);
        for (let i = 1; i < hull.length; i++) { context.lineTo(toCanvasCoords(hull[i]).x, toCanvasCoords(hull[i]).y); }
        context.closePath();
        context.strokeStyle = 'rgba(0, 123, 255, 0.8)';
        context.lineWidth = 2;
        context.stroke();
    }
    
    // --- DRAW CURSOR HELPER (Only in Edit Mode) ---
    if (mode === 'edit') {
        const gridMousePos = toGridCoords(mousePos);
        const snappedCanvasPos = toCanvasCoords(gridMousePos);
        context.beginPath(); context.arc(snappedCanvasPos.x, snappedCanvasPos.y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 0, 0, 0.5)'; context.fill();
        context.fillStyle = 'black'; context.fillText(`(${gridMousePos.x}, ${gridMousePos.y})`, mousePos.x + 15, mousePos.y);
    }

  }, [points, hull, pan, zoom, toCanvasCoords, toGridCoords, mousePos, hullPointSet, mode]);

  const handleMouseDown = (e) => {
    // Only start panning in move mode
    if (mode === 'move') {
      setIsPanning(true);
      setMousePos(getCanvasMousePos(e));
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
  };

  const handleMouseMove = (e) => {
    const currentMousePos = getCanvasMousePos(e);
    if (isPanning) {
      const dx = currentMousePos.x - mousePos.x;
      const dy = currentMousePos.y - mousePos.y;
      pan.x += dx; pan.y += dy;
    }
    setMousePos(currentMousePos);
  };

  const handleCanvasClick = (e) => {
    // onAddPoint is already guarded by the mode in the parent component
    onAddPoint(toGridCoords(getCanvasMousePos(e)));
  };
  
  const handleWheel = (e) => { e.preventDefault(); applyZoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, getCanvasMousePos(e)); };
  const buttonStyle = { width: '30px', height: '30px', border: '1px solid #ccc', backgroundColor: 'white', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(0,0,0,0.2)' };

  return (
    <div style={{ position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        style={{ 
          border: '1px solid black', 
          cursor: mode === 'edit' ? 'crosshair' : 'grab', // Dynamic cursor
          touchAction: 'none' 
        }} 
        onClick={handleCanvasClick} 
        onMouseMove={handleMouseMove} 
        onMouseDown={handleMouseDown} 
        onMouseUp={handleMouseUp} 
        onMouseLeave={handleMouseUp} 
        onWheel={handleWheel}
      />
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button style={buttonStyle} onClick={() => applyZoom(1.2, { x: 400, y: 300 })} title="Zoom In">+</button>
        <button style={buttonStyle} onClick={() => applyZoom(1 / 1.2, { x: 400, y: 300 })} title="Zoom Out">-</button>
        <button style={buttonStyle} onClick={resetView} title="Center Origin">⌂</button>
      </div>
    </div>
  );
};
export default ConvexHullGrid;