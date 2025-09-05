// Function to check orientation of ordered triplet (p, q, r)
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0; // Collinear
    return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
}

// Given three collinear points p, q, r, the function checks if point q lies on segment 'pr'
function onSegment(p, q, r) {
    return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
}

// The main function that returns true if line segment 'p1q1' and 'p2q2' intersect.
export function doIntersect(p1, q1, p2, q2) {
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
}

// Checks if a polygon is self-intersecting.
export function isSelfIntersecting(polygon) {
    const n = polygon.length;
    if (n <= 3) return false;
    for (let i = 0; i < n; i++) {
        for (let j = i + 2; j < n; j++) {
            const p1 = polygon[i];
            const q1 = polygon[(i + 1) % n];
            const p2 = polygon[j];
            const q2 = polygon[(j + 1) % n];
            // Don't check adjacent or same-vertex segments
            if (p1 === p2 || p1 === q2 || q1 === p2 || q1 === q2) continue;
            if (doIntersect(p1, q1, p2, q2)) return true;
        }
    }
    return false;
}

// Checks if two polygons intersect.
export function doPolygonsIntersect(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            if (doIntersect(poly1[i], poly1[(i + 1) % poly1.length], poly2[j], poly2[(j + 1) % poly2.length])) {
                return true;
            }
        }
    }
    return false;
}

// Ray-casting algorithm to check if a point is inside a polygon.
export function isPointInPolygon(point, polygon) {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
            (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
            isInside = !isInside;
        }
    }
    return isInside;
}

// Shoelace formula for polygon area.
export function polygonArea(coordinates) {
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
        const j = (i + 1) % coordinates.length;
        area += coordinates[i].x * coordinates[j].y;
        area -= coordinates[j].x * coordinates[i].y;
    }
    return Math.abs(area / 2);
};