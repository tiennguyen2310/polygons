import React, { useState } from 'react';
import './App.css';
import Playground from './pages/Playground';
import SweepLine from './pages/SweepLine';
import PolygonTree from './pages/PolygonTree';
import ConvexHull from './pages/ConvexHull';

function App() {
  const [activeTab, setActiveTab] = useState('playground');

  const renderTab = () => {
    switch (activeTab) {
      case 'playground': return <Playground />;
      case 'sweep-line': return <SweepLine />;
      case 'polygon-tree': return <PolygonTree />;
      case 'convex-hull': return <ConvexHull />;
      default: return <Playground />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Polygons Project</h1>
        <nav>
          <button onClick={() => setActiveTab('playground')}>Playground</button>
          <button onClick={() => setActiveTab('sweep-line')}>Sweep Line</button>
          <button onClick={() => setActiveTab('polygon-tree')}>Polygon Tree</button>
          <button onClick={() => setActiveTab('convex-hull')}>Convex Hull</button>
        </nav>
      </header>
      <main>
        {renderTab()}
      </main>
    </div>
  );
}

export default App;