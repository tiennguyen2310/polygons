import React, { useState } from 'react';
import Grid from '../components/Grid'; // Reuse the main grid
import PolygonInfo from '../components/PolygonInfo'; // Reuse the info panel
import { isSelfIntersecting, doPolygonsIntersect, isPointInPolygon, polygonArea } from '../utils/geometry';

// A recursive component to display the tree visually
const TreeNode = ({ node, allPolygons, level = 0 }) => {
    // Find the polygon data that corresponds to this node's ID
    const polygon = allPolygons.find(p => p.id === node.id);

    // Style the tree node to show hierarchy
    const style = {
        marginLeft: `${level * 20}px`,
        padding: '5px',
        borderLeft: `3px solid ${polygon ? polygon.color : '#333'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '5px'
    };

    const colorSwatchStyle = {
        width: '15px',
        height: '15px',
        backgroundColor: polygon ? polygon.color : 'transparent',
        border: '1px solid #555'
    };

    return (
        <div style={style}>
            <div style={colorSwatchStyle}></div>
            <span>{polygon ? polygon.name : 'Grid (Root)'}</span>
            {node.children.length > 0 && (
                <div>
                    {node.children.map(child => <TreeNode key={child.id} node={child} allPolygons={allPolygons} level={level + 1} />)}
                </div>
            )}
        </div>
    );
};

const PolygonTree = () => {
    const [polygons, setPolygons] = useState([]);
    const [currentPolygon, setCurrentPolygon] = useState([]);
    const [mode, setMode] = useState('edit');
    const [tree, setTree] = useState(null);

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

        // --- VALIDATION ---
        if (isSelfIntersecting(currentPolygon)) {
            alert("Error: The new polygon intersects itself! Please delete it from the list and redraw.");
        }
        for (const poly of polygons) {
            if (doPolygonsIntersect(poly.coordinates, currentPolygon)) {
                alert(`Error: The new polygon intersects with/touches ${poly.name}! Please delete it and redraw.`);
            }
        }
        // --- END VALIDATION ---

        const newPolygon = {
            id: Date.now(),
            name: `Polygon ${polygons.length + 1}`,
            coordinates: currentPolygon,
            color: getRandomColor(),
            shape: `Polygon (${currentPolygon.length} sides)` // You can add the shape name logic here too
        };
        setPolygons([...polygons, newPolygon]);
        setCurrentPolygon([]);
        setTree(null); // Invalidate the old tree since we've added a new shape
    };
    
    const deletePolygon = (id) => {
        setPolygons(polygons.filter(p => p.id !== id));
        setTree(null); // Invalidate tree on deletion
    };

    const handleGridClick = (coords) => {
        if (mode === 'edit') {
            setCurrentPolygon([...currentPolygon, coords]);
        }
    };
    
    const buildTree = () => {
        const polysWithArea = polygons.map(p => ({ ...p, area: polygonArea(p.coordinates) }));
        const parentMap = {}; // Maps: childId -> parentId

        // For each polygon, find its smallest immediate container
        for (const p1 of polysWithArea) {
            let smallestParent = null;
            let smallestArea = Infinity;

            for (const p2 of polysWithArea) {
                if (p1.id === p2.id) continue;
                
                // If p1 is inside p2
                if (isPointInPolygon(p1.coordinates[0], p2.coordinates)) {
                    // And if p2 is smaller than the smallest container found so far
                    if (p2.area < smallestArea) {
                        smallestArea = p2.area;
                        smallestParent = p2;
                    }
                }
            }
            parentMap[p1.id] = smallestParent ? smallestParent.id : 0; // 0 is the root (the grid)
        }

        const nodes = { 0: { id: 0, children: [] } }; // The root node
        polysWithArea.forEach(p => nodes[p.id] = { id: p.id, children: [] });

        // Link children to their parents
        for (const p of polysWithArea) {
            const parentId = parentMap[p.id];
            if (nodes[parentId]) {
                nodes[parentId].children.push(nodes[p.id]);
            }
        }
        setTree(nodes[0]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            {/* Left side: Grid and controls */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div>
                    <button onClick={() => setMode('edit')} style={{ background: mode === 'edit' ? '#61dafb' : 'grey' }}>Edit Mode</button>
                    <button onClick={() => setMode('move')} style={{ background: mode === 'move' ? '#61dafb' : 'grey' }}>Move Mode</button>
                </div>
                <div style={{ position: 'relative' }}>
                    <Grid
                        polygons={polygons}
                        currentPolygon={currentPolygon}
                        onGridClick={handleGridClick}
                        mode={mode}
                    />
                </div>
            </div>

            {/* Right side: Info, controls, and tree display */}
            <div style={{ marginLeft: '20px', width: '320px', display: 'flex', flexDirection: 'column' }}>
                <button
                    onClick={addPolygon}
                    disabled={currentPolygon.length < 3}
                    style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', cursor: 'pointer' }}
                >
                    Finish Drawing Polygon
                </button>
                <PolygonInfo polygons={polygons} onDelete={deletePolygon} />

                <hr style={{width: '100%', margin: '20px 0'}} />
                
                <button
                    onClick={buildTree}
                    style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
                >
                    Build/Update Tree
                </button>
                <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px', minHeight: '100px' }}>
                    <h3>Containment Tree</h3>
                    {tree ? <TreeNode node={tree} allPolygons={polygons} /> : <p>Click "Build/Update Tree" to see the hierarchy.</p>}
                </div>
            </div>
        </div>
    );
};

export default PolygonTree;