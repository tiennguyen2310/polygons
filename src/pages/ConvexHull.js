import React, { useState } from 'react';
import ConvexHullGrid from '../components/ConvexHullGrid';
import ConvexHullInfo from '../components/ConvexHullInfo';
import { polygonArea } from '../utils/geometry';

const ConvexHull = () => {
  const [points, setPoints] = useState([]);
  const [hull, setHull] = useState([]);
  const [hullArea, setHullArea] = useState(0);
  const [mode, setMode] = useState('edit'); // State for edit/move mode

  const handleAddPoint = (coords) => {
    // Only allow adding points in edit mode
    if (mode !== 'edit') return;

    setPoints(prev => [...prev, { ...coords, id: Date.now() }]);
    setHull([]);
    setHullArea(0);
  };
  
  const calculateHull = () => {
    if (points.length < 3) {
      alert("Please add at least 3 points to calculate a convex hull.");
      return;
    }

    const cross_product = (p1, p2, p3) => (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    const sortedPoints = [...points].sort((a, b) => a.x - b.x || a.y - b.y);

    const lower = [];
    for (const p of sortedPoints) {
      while (lower.length >= 2 && cross_product(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }

    const upper = [];
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      const p = sortedPoints[i];
      while (upper.length >= 2 && cross_product(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }
    
    upper.pop();
    lower.pop();
    const finalHull = lower.concat(upper);
    
    setHull(finalHull);
    setHullArea(polygonArea(finalHull));
  };

  const reset = () => {
    setPoints([]);
    setHull([]);
    setHullArea(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Mode Toggle Buttons */}
        <div>
          <button onClick={() => setMode('edit')} style={{ background: mode === 'edit' ? '#61dafb' : 'grey' }}>Edit Mode</button>
          <button onClick={() => setMode('move')} style={{ background: mode === 'move' ? '#61dafb' : 'grey' }}>Move Mode</button>
        </div>

        <ConvexHullGrid 
          points={points} 
          hull={hull} 
          onAddPoint={handleAddPoint}
          mode={mode} // Pass the current mode to the grid
        />
      </div>

      <ConvexHullInfo 
        points={points} 
        hull={hull} 
        hullArea={hullArea} 
        onCalculate={calculateHull} 
        onReset={reset} 
      />
    </div>
  );
};

export default ConvexHull;