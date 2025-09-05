import React from 'react';

const SweepLineInfo = ({ rectangles, totalArea, onCalculate, onReset, onDelete }) => {
  return (
    <div style={{ marginLeft: '20px', width: '300px', display: 'flex', flexDirection: 'column' }}>
      <button onClick={onCalculate} style={{ width: '100%', padding: '10px', marginBottom: '5px' }}>Calculate Total Area</button>
      <button onClick={onReset} style={{ width: '100%', padding: '10px' }}>Reset All</button>
      
      <h2 style={{marginTop: '20px'}}>Total Area: {totalArea}</h2>

      <h3 style={{marginTop: '10px'}}>Rectangles</h3>
      <div style={{ height: '450px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px' }}>
        {rectangles.map(r => (
          <div key={r.id} style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              ({r.x1}, {r.y1}) to ({r.x2}, {r.y2})
            </span>
            <button onClick={() => onDelete(r.id)} style={{backgroundColor: '#ffdddd', border: '1px solid red', cursor: 'pointer'}}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SweepLineInfo;