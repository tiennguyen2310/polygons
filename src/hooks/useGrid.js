import { useState, useCallback } from 'react';

// This hook contains all the logic for panning, zooming, and coordinate conversion.
export const useGrid = (canvasRef) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 400, y: 300 });
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
  
  const getCanvasMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, [canvasRef]);

  const applyZoom = useCallback((scale, center) => {
    const gridPosAtCenter = toGridCoords(center);
    const newZoom = zoom * scale;
    
    const panX = center.x - gridPosAtCenter.x * gridSize * newZoom;
    const panY = center.y + gridPosAtCenter.y * gridSize * newZoom;

    setZoom(newZoom);
    setPan({ x: panX, y: panY });
  }, [zoom, gridSize, toGridCoords]);

  const resetView = useCallback(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     setZoom(1);
     setPan({ x: canvas.width / 2, y: canvas.height / 2 });
  }, [canvasRef]);

  return { zoom, pan, setPan, gridSize, toCanvasCoords, toGridCoords, getCanvasMousePos, applyZoom, resetView };
};