import React, { useRef, useEffect, useState, useCallback } from 'react';

const Grid = ({ polygons, currentPolygon, onGridClick, mode }) => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 400, y: 300 });
  const [isPanning, setIsPanning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const gridSize = 50;

  const toCanvasCoords = useCallback((gridCoords) => {
    return {
      x: pan.x + gridCoords.x * gridSize * zoom,
      y: pan.y - gridCoords.y * gridSize * zoom,
    };
  }, [zoom, pan]);

  const toGridCoords = useCallback((canvasCoords) => {
    return {
      x: Math.round((canvasCoords.x - pan.x) / (gridSize * zoom)),
      y: Math.round((pan.y - canvasCoords.y) / (gridSize * zoom)),
    };
  }, [zoom, pan]);

  const applyZoom = (scale, center) => {
    const gridPosAtCenter = toGridCoords(center);
    const newZoom = zoom * scale;
    
    const panX = center.x - gridPosAtCenter.x * gridSize * newZoom;
    const panY = center.y + gridPosAtCenter.y * gridSize * newZoom;

    setZoom(newZoom);
    setPan({ x: panX, y: panY });
  };

  const getLabelStep = () => {
    const minPixelStep = 60;
    const gridStepInPixels = gridSize * zoom;
    if (gridStepInPixels < minPixelStep / 4) return 10;
    if (gridStepInPixels < minPixelStep / 2) return 5;
    if (gridStepInPixels < minPixelStep) return 2;
    return 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);

    const labelStep = getLabelStep();
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Draw vertical lines and X-axis labels
    for (let i = 0; pan.x + i * gridSize * zoom < width; i++) {
        const x = pan.x + i * gridSize * zoom;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.strokeStyle = (i === 0) ? '#000' : '#ccc';
        context.lineWidth = 1;
        context.stroke();
        if (i > 0 && i % labelStep === 0) {
            context.fillStyle = 'black';
            context.fillText(i, x, pan.y + 15);
        }
    }
    for (let i = -1; pan.x + i * gridSize * zoom > 0; i--) {
        const x = pan.x + i * gridSize * zoom;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.strokeStyle = '#ccc';
        context.lineWidth = 1;
        context.stroke();
        if (i % labelStep === 0) {
            context.fillStyle = 'black';
            context.fillText(i, x, pan.y + 15);
        }
    }

    // Draw horizontal lines and Y-axis labels
    for (let i = 0; pan.y + i * gridSize * zoom < height; i++) {
        const y = pan.y + i * gridSize * zoom;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.strokeStyle = (i === 0) ? '#000' : '#ccc';
        context.lineWidth = 1;
        context.stroke();
        if (i > 0 && i % labelStep === 0) {
            context.fillStyle = 'black';
            context.fillText(-i, pan.x - 15, y);
        }
    }
    for (let i = -1; pan.y + i * gridSize * zoom > 0; i--) {
        const y = pan.y + i * gridSize * zoom;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.strokeStyle = '#ccc';
        context.lineWidth = 1;
        context.stroke();
        if (i % labelStep === 0) {
            context.fillStyle = 'black';
            context.fillText(-i, pan.x - 15, y);
        }
    }

    context.fillStyle = 'black';
    context.fillText('0', pan.x - 10, pan.y + 10);
    
    const drawPolygon = (coordinates, color) => {
        if (coordinates.length === 0) return;
        context.beginPath();
        const startPoint = toCanvasCoords(coordinates[0]);
        context.moveTo(startPoint.x, startPoint.y);
        coordinates.forEach(coord => {
            const point = toCanvasCoords(coord);
            context.lineTo(point.x, point.y);
        });

        if (coordinates.length > 2) {
            context.closePath();
            context.fillStyle = color;
            context.fill();
        }
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.stroke();

        context.fillStyle = 'black';
        context.font = 'bold 12px Arial';
        coordinates.forEach(coord => {
            const point = toCanvasCoords(coord);
            if (zoom > 0.5) {
                context.fillText(`(${coord.x}, ${coord.y})`, point.x, point.y - 10);
            }
        });
    };

    polygons.forEach(p => drawPolygon(p.coordinates, p.color));
    drawPolygon(currentPolygon, 'rgba(255, 0, 0, 0.3)');

    if (currentPolygon.length === 1) {
        context.beginPath();
        const firstPoint = toCanvasCoords(currentPolygon[0]);
        context.arc(firstPoint.x, firstPoint.y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 0, 0, 0.8)';
        context.fill();
    }

    if (mode === 'edit') {
        const gridMousePos = toGridCoords(mousePos);
        const snappedCanvasPos = toCanvasCoords(gridMousePos);
        context.beginPath();
        context.arc(snappedCanvasPos.x, snappedCanvasPos.y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 0, 0, 0.5)';
        context.fill();
        context.fillStyle = 'black';
        context.fillText(`(${gridMousePos.x}, ${gridMousePos.y})`, mousePos.x + 15, mousePos.y);
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
      onGridClick(toGridCoords(coords));
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    applyZoom(scaleAmount, getCanvasMousePos(e));
  };
  
  const handleZoomIn = () => {
    const canvas = canvasRef.current;
    applyZoom(1.2, { x: canvas.width / 2, y: canvas.height / 2 });
  };
  
  const handleZoomOut = () => {
    const canvas = canvasRef.current;
    applyZoom(1 / 1.2, { x: canvas.width / 2, y: canvas.height / 2 });
  };

  const handleHome = () => {
    setZoom(1);
    const canvas = canvasRef.current;
    setPan({ x: canvas.width / 2, y: canvas.height / 2 });
  };

  const buttonStyle = {
    width: '30px',
    height: '30px',
    border: '1px solid #ccc',
    backgroundColor: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
    borderRadius: '4px'
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: '1px solid black',
          cursor: mode === 'move' ? 'grab' : 'crosshair',
          touchAction: 'none'
        }}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      />

      <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
      }}>
        <button style={buttonStyle} onClick={handleZoomIn} title="Zoom In">+</button>
        <button style={buttonStyle} onClick={handleZoomOut} title="Zoom Out">-</button>
        <button style={buttonStyle} onClick={handleHome} title="Center Origin">⌂</button>
      </div>

      <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.7)', padding: '2px 5px', borderRadius: '3px' }}>
        Zoom: {zoom.toFixed(2)}x
      </div>
    </>
  );
};

export default Grid;