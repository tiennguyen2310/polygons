import React, { useRef, useEffect, useState, useCallback } from 'react';

const Grid = ({ polygons, currentPolygon, onGridClick, mode }) => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  // pan represents the canvas coordinates of the grid's origin (0,0)
  const [pan, setPan] = useState({ x: 400, y: 300 }); // Start with origin in the center
  const [isPanning, setIsPanning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const gridSize = 50;

  // Converts grid coordinates {x: 1, y: 1} to canvas coordinates {x: 450, y: 250}
  const toCanvasCoords = useCallback((gridCoords, canvas) => {
    return {
      x: pan.x + gridCoords.x * gridSize * zoom,
      y: pan.y - gridCoords.y * gridSize * zoom, // Flipped Y-axis
    };
  }, [zoom, pan]);

  // Converts canvas coordinates {x: 450, y: 250} to grid coordinates {x: 1, y: 1}
  const toGridCoords = useCallback((canvasCoords, canvas) => {
    return {
      x: Math.round((canvasCoords.x - pan.x) / (gridSize * zoom)),
      y: Math.round((pan.y - canvasCoords.y) / (gridSize * zoom)), // Flipped Y-axis
    };
  }, [zoom, pan]);

  // Main drawing logic, runs whenever the view changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    context.clearRect(0, 0, width, height);
    
    // --- Draw Grid and Axes ---
    // Vertical lines
    for (let i = 0; ; i++) {
        const x = pan.x + i * gridSize * zoom;
        if(x > width) break;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.strokeStyle = '#ccc';
        context.stroke();
    }
     for (let i = -1; ; i--) {
        const x = pan.x + i * gridSize * zoom;
        if(x < 0) break;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.strokeStyle = '#ccc';
        context.stroke();
    }
    // Horizontal lines
    for (let i = 0; ; i++) {
        const y = pan.y + i * gridSize * zoom;
        if(y > height) break;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.strokeStyle = '#ccc';
        context.stroke();
    }
    for (let i = -1; ; i--) {
        const y = pan.y + i * gridSize * zoom;
        if(y < 0) break;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.strokeStyle = '#ccc';
        context.stroke();
    }

    // Axes
    context.beginPath();
    context.moveTo(0, pan.y);
    context.lineTo(width, pan.y);
    context.moveTo(pan.x, 0);
    context.lineTo(pan.x, height);
    context.strokeStyle = '#000';
    context.lineWidth = 1;
    context.stroke();

    // --- Draw Polygons ---
    const drawPolygon = (coordinates, color) => {
        if (coordinates.length === 0) return;

        context.beginPath();
        const startPoint = toCanvasCoords(coordinates[0], canvas);
        context.moveTo(startPoint.x, startPoint.y);
        coordinates.forEach(coord => {
            const point = toCanvasCoords(coord, canvas);
            context.lineTo(point.x, point.y);
        });

        if (coordinates.length > 2) {
            context.closePath();
            context.fillStyle = color; // Use the stored, semi-transparent color
            context.fill();
        }
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.stroke();

        // Draw coordinates on top, in black
        context.fillStyle = 'black';
        context.font = '12px Arial';
        coordinates.forEach(coord => {
            const point = toCanvasCoords(coord, canvas);
            if (zoom > 0.5) { // Only show coordinates when zoomed in enough
                context.fillText(`(${coord.x}, ${coord.y})`, point.x + 5, point.y - 5);
            }
        });
    };

    polygons.forEach(p => drawPolygon(p.coordinates, p.color));
    drawPolygon(currentPolygon, 'rgba(255, 0, 0, 0.3)');

    // Show a marker for the first point
    if (currentPolygon.length === 1) {
        context.beginPath();
        const firstPoint = toCanvasCoords(currentPolygon[0], canvas);
        context.arc(firstPoint.x, firstPoint.y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 0, 0, 0.8)';
        context.fill();
    }

    // --- Draw Cursor Helper ---
    if (mode === 'edit') {
        const gridMousePos = toGridCoords(mousePos, canvas);
        const snappedCanvasPos = toCanvasCoords(gridMousePos, canvas);
        context.beginPath();
        context.arc(snappedCanvasPos.x, snappedCanvasPos.y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 0, 0, 0.5)';
        context.fill();
        context.fillStyle = 'black';
        context.fillText(`(${gridMousePos.x}, ${gridMousePos.y})`, mousePos.x + 10, mousePos.y - 10);
    }
  }, [polygons, currentPolygon, zoom, pan, mousePos, toCanvasCoords, toGridCoords, mode]);

  const getCanvasMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    if (mode === 'move') {
      setIsPanning(true);
      setMousePos(getCanvasMousePos(e));
    }
  };

  const handleMouseUp = (e) => {
    setIsPanning(false);
  };

  const handleMouseMove = (e) => {
    const currentMousePos = getCanvasMousePos(e);
    if (isPanning) {
      const dx = currentMousePos.x - mousePos.x;
      const dy = currentMousePos.y - mousePos.y;
      setPan(prevPan => ({ x: prevPan.x + dx, y: prevPan.y + dy }));
    }
    setMousePos(currentMousePos);
  };
  
  const handleCanvasClick = (e) => {
    if (mode === 'edit') {
      const coords = getCanvasMousePos(e);
      onGridClick(toGridCoords(coords, canvasRef.current));
    }
  };

  const handleWheel = (e) => {
    e.preventDefault(); // This is CRITICAL to prevent the whole page from zooming
    const scaleAmount = 1.1;
    const canvas = canvasRef.current;
    const mouse = getCanvasMousePos(e);
    
    const mouseGridPosBeforeZoom = toGridCoords(mouse, canvas);

    let newZoom;
    if (e.deltaY < 0) {
      newZoom = zoom * scaleAmount;
    } else {
      newZoom = zoom / scaleAmount;
    }

    // This logic adjusts the pan to keep the point under the cursor stationary
    const panX = mouse.x - mouseGridPosBeforeZoom.x * gridSize * newZoom;
    const panY = mouse.y + mouseGridPosBeforeZoom.y * gridSize * newZoom;

    setZoom(newZoom);
    setPan({ x: panX, y: panY });
  };
  
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black', cursor: mode === 'move' ? 'grab' : 'crosshair' }}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <div>
        Zoom: {zoom.toFixed(2)}x
      </div>
    </div>
  );
};

export default Grid;