import React, { useState } from 'react';
import Grid from '../components/Grid';
import PolygonInfo from '../components/PolygonInfo';

const Playground = () => {
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [mode, setMode] = useState('edit'); // 'edit' or 'move'

  const getRandomColor = () => {
    const r = Math.floor((Math.random() * 127) + 128);
    const g = Math.floor((Math.random() * 127) + 128);
    const b = Math.floor((Math.random() * 127) + 128);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  const addPolygon = () => {
    if (currentPolygon.length < 3) {
      alert("A polygon must have at least 3 vertices.");
      return;
    }
    const newPolygon = {
      id: Date.now(),
      name: `Polygon ${polygons.length + 1}`,
      coordinates: currentPolygon,
      color: getRandomColor(),
      shape: getShapeName(currentPolygon.length),
    };
    setPolygons([...polygons, newPolygon]);
    setCurrentPolygon([]);
  };

  const deletePolygon = (id) => {
    setPolygons(polygons.filter(p => p.id !== id));
  };

  const handleGridClick = (coords) => {
    if (mode === 'edit') {
      setCurrentPolygon([...currentPolygon, coords]);
    }
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
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div>
          <button onClick={() => setMode('edit')} style={{ background: mode === 'edit' ? '#61dafb' : 'grey' }}>Edit Mode</button>
          <button onClick={() => setMode('move')} style={{ background: mode === 'move' ? '#61dafb' : 'grey' }}>Move Mode</button>
        </div>

        {/* === THIS WRAPPER IS THE ONLY CHANGE HERE === */}
        <div style={{ position: 'relative' }}>
          <Grid
            polygons={polygons}
            currentPolygon={currentPolygon}
            onGridClick={handleGridClick}
            mode={mode}
          />
        </div>

      </div>
      <div style={{
          marginLeft: '20px',
          width: '320px',
          display: 'flex',
          flexDirection: 'column'
      }}>
        <button
          onClick={addPolygon}
          disabled={currentPolygon.length < 3}
          style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          Finish Drawing Polygon
        </button>
        <PolygonInfo polygons={polygons} onDelete={deletePolygon} />
      </div>
    </div>
  );
};

export default Playground;