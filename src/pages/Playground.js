import React, { useState, useRef, useEffect } from 'react';
import Grid from '../components/Grid';
import PolygonInfo from '../components/PolygonInfo';

const Playground = () => {
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);

  const addPolygon = () => {
    if (currentPolygon.length < 3) {
      alert("A polygon must have at least 3 vertices.");
      return;
    }
    const newPolygon = {
      id: Date.now(),
      name: `Polygon ${polygons.length + 1}`,
      coordinates: currentPolygon,
      // We will calculate these later
      area: 0,
      perimeter: 0,
      shape: getShapeName(currentPolygon.length),
    };
    setPolygons([...polygons, newPolygon]);
    setCurrentPolygon([]);
  };

  const deletePolygon = (id) => {
    setPolygons(polygons.filter(p => p.id !== id));
  };

  const handleGridClick = (coords) => {
    setCurrentPolygon([...currentPolygon, coords]);
  };

  const getShapeName = (sides) => {
    switch (sides) {
      case 3: return 'Triangle';
      case 4: return 'Quadrilateral';
      case 5: return 'Pentagon';
      case 6: return 'Hexagon';
      default: return `Polygon (${sides} sides)`;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Grid
        polygons={polygons}
        currentPolygon={currentPolygon}
        onGridClick={handleGridClick}
      />
      <div style={{ marginLeft: '20px' }}>
        <button onClick={addPolygon} disabled={currentPolygon.length < 3}>
          Finish Drawing Polygon
        </button>
        <PolygonInfo polygons={polygons} onDelete={deletePolygon} />
      </div>
    </div>
  );
};

export default Playground;