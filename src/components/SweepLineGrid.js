import React, { useRef, useEffect, useState } from 'react';
import { useGrid } from '../hooks/useGrid';

const SweepLineGrid = ({ rectangles, onAddRectangle }) => {
  const canvasRef = useRef(null);
  const { zoom, pan, toCanvasCoords, toGridCoords, getCanvasMousePos, applyZoom, resetView } = useGrid(canvasRef);

  const [startPoint, setStartPoint] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [mode, setMode] = useState('edit'); // 'edit' or 'move'

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);

    // --- GRID & AXIS DRAWING LOGIC ---
    // (This part is unchanged)
    const getLabelStep = () => {
        const minPixelStep = 60;
        const gridStepInPixels = 50 * zoom;
        if (gridStepInPixels < minPixelStep / 4) return 10;
        if (gridStepInPixels < minPixelStep / 2) return 5;
        if (gridStepInPixels < minPixelStep) return 2;
        return 1;
    };
    const labelStep = getLabelStep();
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (let i = 0; pan.x + i * 50 * zoom < width; i++) {
        const x = pan.x + i * 50 * zoom;
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height);
        context.strokeStyle = (i === 0) ? '#000' : '#ccc'; context.stroke();
        if (i > 0 && i % labelStep === 0) { context.fillStyle = 'black'; context.fillText(i, x, pan.y + 15); }
    }
    for (let i = -1; pan.x + i * 50 * zoom > 0; i--) {
        const x = pan.x + i * 50 * zoom;
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height);
        context.strokeStyle = '#ccc'; context.stroke();
        if (i % labelStep === 0) { context.fillStyle = 'black'; context.fillText(i, x, pan.y + 15); }
    }
    for (let i = 0; pan.y + i * 50 * zoom < height; i++) {
        const y = pan.y + i * 50 * zoom;
        context.beginPath(); context.moveTo(0, y); context.lineTo(width, y);
        context.strokeStyle = (i === 0) ? '#000' : '#ccc'; context.stroke();
        if (i > 0 && i % labelStep === 0) { context.fillStyle = 'black'; context.fillText(-i, pan.x - 15, y); }
    }
    for (let i = -1; pan.y + i * 50 * zoom > 0; i--) {
        const y = pan.y + i * 50 * zoom;
        context.beginPath(); context.moveTo(0, y); context.lineTo(width, y);
        context.strokeStyle = '#ccc'; context.stroke();
        if (i % labelStep === 0) { context.fillStyle = 'black'; context.fillText(-i, pan.x - 15, y); }
    }
    context.fillStyle = 'black'; context.fillText('0', pan.x - 10, pan.y + 10);
    // --- END GRID DRAWING ---

    // Draw existing rectangles
    rectangles.forEach(rect => {
      const p1 = toCanvasCoords({ x: rect.x1, y: rect.y1 });
      const p2 = toCanvasCoords({ x: rect.x2, y: rect.y2 });
      context.fillStyle = 'rgba(0, 0, 255, 0.3)';
      context.fillRect(p1.x, p2.y, p2.x - p1.x, p1.y - p2.y);
      context.strokeStyle = 'blue';
      context.strokeRect(p1.x, p2.y, p2.x - p1.x, p1.y - p2.y);
    });

    // Draw rectangle being created
    if (startPoint && mode === 'edit') {
      const startCanvas = toCanvasCoords(startPoint);
      const mouseGrid = toGridCoords(mousePos);
      const mouseCanvas = toCanvasCoords(mouseGrid);
      context.setLineDash([5, 5]);
      context.strokeStyle = 'red';
      context.strokeRect(startCanvas.x, startCanvas.y, mouseCanvas.x - startCanvas.x, mouseCanvas.y - startCanvas.y);
      context.setLineDash([]);
      context.fillStyle = 'black';
      context.fillText(`(${startPoint.x}, ${startPoint.y})`, startCanvas.x, startCanvas.y - 5);
      context.fillText(`(${mouseGrid.x}, ${mouseGrid.y})`, mouseCanvas.x, mouseCanvas.y - 5);
    }

    // --- NEW: Draw Cursor Helper ---
    if (mode === 'edit') {
        const gridMousePos = toGridCoords(mousePos);
        const snappedCanvasPos = toCanvasCoords(gridMousePos);
        
        // Draw the snapped circle indicator
        context.beginPath();
        context.arc(snappedCanvasPos.x, snappedCanvasPos.y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 0, 0, 0.5)';
        context.fill();

        // Draw the coordinate text next to the actual cursor
        context.fillStyle = 'black';
        context.fillText(`(${gridMousePos.x}, ${gridMousePos.y})`, mousePos.x + 15, mousePos.y);
    }
    // --- END NEW ---

  }, [rectangles, startPoint, mousePos, pan, zoom, toCanvasCoords, toGridCoords, mode]);

  // (The rest of the component is unchanged)
  const handleMouseDown = (e) => { if (mode === 'move') setIsPanning(true); };
  const handleMouseUp = () => setIsPanning(false);
  const handleMouseMove = (e) => {
    const currentMousePos = getCanvasMousePos(e);
    if (isPanning) {
      const dx = currentMousePos.x - mousePos.x;
      const dy = currentMousePos.y - mousePos.y;
      pan.x += dx;
      pan.y += dy;
    }
    setMousePos(currentMousePos);
  };

  const handleCanvasClick = (e) => {
    if (mode !== 'edit') return;
    const gridPos = toGridCoords(getCanvasMousePos(e));
    if (!startPoint) {
      setStartPoint(gridPos);
    } else {
      onAddRectangle({ x1: startPoint.x, y1: startPoint.y, x2: gridPos.x, y2: gridPos.y });
      setStartPoint(null);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    applyZoom(scaleAmount, getCanvasMousePos(e));
  };
  
  const buttonStyle = { width: '30px', height: '30px', border: '1px solid #ccc', backgroundColor: 'white', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(0,0,0,0.2)' };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black', cursor: mode === 'edit' ? 'crosshair' : 'grab', touchAction: 'none' }}
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
       <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <button onClick={() => setMode('edit')} style={{ background: mode === 'edit' ? '#61dafb' : 'grey' }}>Edit Mode</button>
          <button onClick={() => setMode('move')} style={{ background: mode === 'move' ? '#61dafb' : 'grey' }}>Move Mode</button>
        </div>
    </div>
  );
};

export default SweepLineGrid;