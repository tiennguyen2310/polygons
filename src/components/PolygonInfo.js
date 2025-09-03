import React from 'react';

const PolygonInfo = ({ polygons, onDelete }) => {

  const calculateArea = (coordinates) => {
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i].x * coordinates[j].y;
      area -= coordinates[j].x * coordinates[i].y;
    }
    return Math.abs(area / 2);
  };

  const calculatePerimeter = (coordinates) => {
    let perimeter = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const p1 = coordinates[i];
      const p2 = coordinates[(i + 1) % coordinates.length];
      perimeter += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    return perimeter.toFixed(2);
  };

  return (
    <div style={{
      height: '600px',
      overflowY: 'auto',
      border: '1px solid #ccc',
      padding: '10px',
      width: '300px'
    }}>
      <h2>Polygons</h2>
      {polygons.map(polygon => (
        <div key={polygon.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
          <h3 style={{display: 'flex', alignItems: 'center'}}>
             <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: polygon.color,
                border: '1px solid black',
                marginRight: '10px'
             }}></div>
            {polygon.name}
          </h3>
          <p><strong>Shape:</strong> {polygon.shape}</p>
          <p><strong>Coordinates:</strong> {polygon.coordinates.map(c => `(${c.x}, ${c.y})`).join(', ')}</p>
          <p><strong>Area:</strong> {calculateArea(polygon.coordinates)}</p>
          <p><strong>Perimeter:</strong> {calculatePerimeter(polygon.coordinates)}</p>
          <button onClick={() => onDelete(polygon.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default PolygonInfo;