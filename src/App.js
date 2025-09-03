import React, { useState } from 'react';
import './App.css';
import Playground from './pages/Playground';

function App() {
  const [activeTab, setActiveTab] = useState('playground');

// src/App.js

  const renderTab = () => {
    switch (activeTab) {
      case 'playground':
        return <Playground />;
      case 'sweep-line':
        return <div>This "Sweep Line" feature is under construction.</div>;
      case 'polygon-tree':
        return <div>This "Polygon Tree" feature is under construction.</div>;
      case 'convex-hull':
        return <div>This "Convex Hull" feature is under construction.</div>;
      default:
        return <Playground />;
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