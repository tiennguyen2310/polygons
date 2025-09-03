import React, { useRef, useEffect, useState, useCallback } from 'react';

const Grid = ({ polygons, currentPolygon, onGridClick }) => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // We will use setPan later, so let's keep it.
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const gridSize = 50;

  const toCanvasCoords = useCallback((gridCoords) => {
    return {
      x: gridCoords.x * gridSize * zoom + pan.x,
      y: gridCoords.y * gridSize * zoom + pan.y,
    };
  }, [zoom, pan]);

  const toGridCoords = useCallback((canvasCoords) => {
    return {
      x: Math.round((canvasCoords.x - pan.x) / (gridSize * zoom)),
      y: Math.round((canvasCoords.y - pan.y) / (gridSize * zoom)),
    };
  }, [zoom, pan]);


  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = context.canvas.width;
    const height = context.canvas.height;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // --- Draw Grid and Axes ---
    context.strokeStyle = '#ccc';
    context.lineWidth = 1;
    // Vertical lines
    for (let x = pan.x % (gridSize * zoom); x < width; x += gridSize * zoom) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    // Horizontal lines
    for (let y = pan.y % (gridSize * zoom); y < height; y += gridSize * zoom) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    // Axes
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    // X-Axis
    context.beginPath();
    context.moveTo(0, pan.y);
    context.lineTo(width, pan.y);
    context.stroke();
    // Y-Axis
    context.beginPath();
    context.moveTo(pan.x, 0);
    context.lineTo(pan.x, height);
    context.stroke();

    // Axis Numbers
    context.fillStyle = 'black';
    context.font = '12px Arial';
    for (let x = pan.x % (gridSize * zoom); x < width; x += gridSize * zoom) {
        const gridX = toGridCoords({x, y: 0}).x;
        if (gridX !== 0) context.fillText(gridX, x - 5, pan.y + 15);
    }
    for (let y = pan.y % (gridSize * zoom); y < height; y += gridSize * zoom) {
        const gridY = toGridCoords({x: 0, y}).y;
        if (gridY !== 0) context.fillText(gridY, pan.x + 5, y + 4);
    }


    // --- Draw Polygons ---
    const drawPolygon = (coordinates, color) => {
        if (coordinates.length === 0) return;
        context.beginPath();
        context.strokeStyle = color;
        context.fillStyle = color.replace(')', ', 0.2)').replace('rgb', 'rgba');

        const startPoint = toCanvasCoords(coordinates[0]);
        context.moveTo(startPoint.x, startPoint.y);

        coordinates.forEach((coord) => {
            const point = toCanvasCoords(coord);
            context.lineTo(point.x, point.y);
            if (zoom > 0.8) {
                context.fillStyle = 'black';
                context.fillText(`(${coord.x}, ${coord.y})`, point.x + 5, point.y - 5);
            }
        });

        if (coordinates.length > 2) {
            context.closePath();
            context.fill();
        }
        context.stroke();
    };

    polygons.forEach(polygon => drawPolygon(polygon.coordinates, 'blue'));
    if (currentPolygon.length > 0) {
        drawPolygon(currentPolygon, 'red');
    }

    // --- Draw Cursor Helper ---
    const gridMousePos = toGridCoords(mousePos);
    const canvasMousePos = toCanvasCoords(gridMousePos);
    context.beginPath();
    context.arc(canvasMousePos.x, canvasMousePos.y, 5, 0, 2 * Math.PI);
    context.fillStyle = 'rgba(255, 0, 0, 0.5)';
    context.fill();
    context.fillStyle = 'black';
    context.fillText(`(${gridMousePos.x}, ${gridMousePos.y})`, mousePos.x + 10, mousePos.y - 10);


  }, [polygons, currentPolygon, zoom, pan, toCanvasCoords, toGridCoords, mousePos]);

  const getCanvasMousePos = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleCanvasClick = (event) => {
    const coords = getCanvasMousePos(event);
    onGridClick(toGridCoords(coords));
  };

  const handleMouseMove = (event) => {
    setMousePos(getCanvasMousePos(event));
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const scaleAmount = 1.1;
    setZoom(prevZoom => (event.deltaY < 0 ? prevZoom * scaleAmount : prevZoom / scaleAmount));
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black', cursor: 'crosshair' }}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
      />
       <div>
        Zoom: {zoom.toFixed(2)}x
      </div>
    </div>
  );
};

export default Grid;