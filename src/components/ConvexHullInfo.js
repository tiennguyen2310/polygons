import React from 'react';

const ConvexHullInfo = ({ points, hull, hullArea, onCalculate, onReset }) => {
  const hullPointSet = new Set(hull.map(p => `${p.x},${p.y}`));

  return (
    <div style={{ marginLeft: '20px', width: '300px', display: 'flex', flexDirection: 'column' }}>
      <button onClick={onCalculate} style={{ width: '100%', padding: '10px', marginBottom: '5px' }}>Calculate Hull</button>
      <button onClick={onReset} style={{ width: '100%', padding: '10px' }}>Reset</button>

      <h2 style={{ marginTop: '20px' }}>Hull Area: {hullArea.toFixed(2)}</h2>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', height: '450px' }}>
        {/* All Points List */}
        <div style={{ flex: 1 }}>
          <h3>All Points ({points.length})</h3>
          <div style={{ height: '100%', overflowY: 'auto', border: '1px solid #ccc', padding: '5px' }}>
            {points.map(p => (
              <div key={p.id} style={{
                padding: '3px',
                // Highlight the point if it's in the hull
                color: hullPointSet.has(`${p.x},${p.y}`) ? '#007bff' : 'black',
                fontWeight: hullPointSet.has(`${p.x},${p.y}`) ? 'bold' : 'normal',
              }}>
                ({p.x}, {p.y})
              </div>
            ))}
          </div>
        </div>

        {/* Hull Points List */}
        <div style={{ flex: 1 }}>
          <h3>Hull Points ({hull.length})</h3>
          <div style={{ height: '100%', overflowY: 'auto', border: '1px solid #ccc', padding: '5px' }}>
            {hull.map((p, i) => (
              <div key={i} style={{ padding: '3px', fontWeight: 'bold' }}>
                ({p.x}, {p.y})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvexHullInfo;