import React, { useState } from 'react';
import SweepLineGrid from '../components/SweepLineGrid';
import SweepLineInfo from '../components/SweepLineInfo';

const SweepLine = () => {
  const [rectangles, setRectangles] = useState([]);
  const [totalArea, setTotalArea] = useState(0);

  const calculateTotalArea = () => {
    // ... (This function is unchanged)
    if (rectangles.length === 0) {
      setTotalArea(0);
      return;
    }
    
    const events = [];
    let allY = new Set();
    
    for (const rect of rectangles) {
      events.push({ x: rect.x1, y1: rect.y1, y2: rect.y2, type: 1 });
      events.push({ x: rect.x2, y1: rect.y1, y2: rect.y2, type: -1 });
      allY.add(rect.y1);
      allY.add(rect.y2);
    }
    
    events.sort((a, b) => a.x - b.x);
    
    const sortedY = Array.from(allY).sort((a,b) => a - b);
    const yMap = new Map();
    sortedY.forEach((y, i) => yMap.set(y, i));
    
    const counts = new Array(sortedY.length).fill(0);
    let area = 0;
    let lastX = events[0].x;

    for (const event of events) {
      const dx = event.x - lastX;
      if (dx > 0) {
        let coveredY = 0;
        for (let i = 0; i < sortedY.length - 1; i++) {
          if (counts[i] > 0) {
            coveredY += sortedY[i+1] - sortedY[i];
          }
        }
        area += dx * coveredY;
      }
      
      const y1_idx = yMap.get(event.y1);
      const y2_idx = yMap.get(event.y2);
      
      for(let i = y1_idx; i < y2_idx; i++) {
          counts[i] += event.type;
      }

      lastX = event.x;
    }

    setTotalArea(area);
  };

  const handleAddRectangle = (rect) => {
    // Ensure x1 < x2 and y1 < y2 for consistency
    const orderedRect = {
      id: Date.now(),
      x1: Math.min(rect.x1, rect.x2),
      y1: Math.min(rect.y1, rect.y2),
      x2: Math.max(rect.x1, rect.x2),
      y2: Math.max(rect.y1, rect.y2),
    };
    setRectangles(prev => [...prev, orderedRect]);
    setTotalArea(0); // Invalidate old calculation
  };

  const deleteRectangle = (id) => {
    setRectangles(rectangles.filter(r => r.id !== id));
    setTotalArea(0); // Invalidate old calculation
  };
  
  const reset = () => {
    setRectangles([]);
    setTotalArea(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <SweepLineGrid rectangles={rectangles} onAddRectangle={handleAddRectangle} />
      <SweepLineInfo 
        rectangles={rectangles} 
        totalArea={totalArea} 
        onCalculate={calculateTotalArea} 
        onReset={reset}
        onDelete={deleteRectangle} 
      />
    </div>
  );
};

export default SweepLine;