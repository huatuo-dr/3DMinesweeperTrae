import { Vector3, IcosahedronGeometry, BufferAttribute } from 'three';
import { Cell, GameMode, CUBE_SIZES, SPHERE_SUBDIVISIONS } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

export const generateGame = (mode: GameMode, sizeIndex: number, density: number): Map<string, Cell> => {
  if (mode === 'cube') {
    return generateCube(sizeIndex, density);
  } else {
    return generateSphere(sizeIndex, density);
  }
};

const generateCube = (sizeIndex: number, density: number): Map<string, Cell> => {
  const size = CUBE_SIZES[sizeIndex];
  const cells = new Map<string, Cell>();
  const positions: { id: string; vec: Vector3 }[] = [];

  // Helper to add cell
  const addCell = (u: number, v: number, faceNormal: Vector3, faceCenter: Vector3, faceIndex: number) => {
    // Calculate 3D position
    const step = 2 / size;
    const offset = step / 2;
    // Local coordinates on the face plane (from -1 to 1)
    const localX = -1 + u * step + offset;
    const localY = -1 + v * step + offset;

    const pos = new Vector3();
    const normal = faceNormal.clone();

    // Determine position based on face normal
    switch (faceIndex) {
      case 0: // Front (+z)
        pos.set(localX, localY, 1);
        break;
      case 1: // Back (-z)
        pos.set(-localX, localY, -1);
        break;
      case 2: // Top (+y)
        pos.set(localX, 1, -localY);
        break;
      case 3: // Bottom (-y)
        pos.set(localX, -1, localY);
        break;
      case 4: // Right (+x)
        pos.set(1, localY, -localX);
        break;
      case 5: // Left (-x)
        pos.set(-1, localY, localX);
        break;
    }

    const id = uuidv4();
    const cell: Cell = {
      id,
      position: pos,
      normal: normal,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
      neighbors: [],
      geometryData: { faceIndex, u, v, size }
    };
    cells.set(id, cell);
    positions.push({ id, vec: pos });
  };

  // Generate faces
  const faces = [
    { normal: new Vector3(0, 0, 1), center: new Vector3(0, 0, 1) },
    { normal: new Vector3(0, 0, -1), center: new Vector3(0, 0, -1) },
    { normal: new Vector3(0, 1, 0), center: new Vector3(0, 1, 0) },
    { normal: new Vector3(0, -1, 0), center: new Vector3(0, -1, 0) },
    { normal: new Vector3(1, 0, 0), center: new Vector3(1, 0, 0) },
    { normal: new Vector3(-1, 0, 0), center: new Vector3(-1, 0, 0) },
  ];

  faces.forEach((face, index) => {
    for (let u = 0; u < size; u++) {
      for (let v = 0; v < size; v++) {
        addCell(u, v, face.normal, face.center, index);
      }
    }
  });

  // Calculate neighbors using distance
  const step = 2 / size;
  const threshold = step * 1.5; 
  const thresholdSq = threshold * threshold;
  
  for (let i = 0; i < positions.length; i++) {
    const p1 = positions[i];
    const c1 = cells.get(p1.id)!;
    
    for (let j = i + 1; j < positions.length; j++) {
      const p2 = positions[j];
      const distSq = p1.vec.distanceToSquared(p2.vec);
      
      if (distSq < thresholdSq) {
        c1.neighbors.push(p2.id);
        cells.get(p2.id)!.neighbors.push(p1.id);
      }
    }
  }

  const mineCount = Math.floor(cells.size * density);
  placeMines(cells, mineCount);
  
  return cells;
};

// --- Sphere Generation Logic (Goldberg Polyhedron) ---

const generateSphere = (sizeIndex: number, density: number): Map<string, Cell> => {
  const subdivisions = SPHERE_SUBDIVISIONS[sizeIndex];
  const cells = new Map<string, Cell>();
  
  // 1. Generate Geodesic Sphere (Icosahedron based)
  const geometry = new IcosahedronGeometry(1, subdivisions);
  const posAttribute = geometry.getAttribute('position') as BufferAttribute;
  const vertexCount = posAttribute.count;
  
  // 2. Merge Vertices (clean up duplicates)
  const uniquePositions: Vector3[] = [];
  const posMap = new Map<string, number>(); // "x,y,z" -> uniqueIndex
  const oldIndexToNewIndex: number[] = new Array(vertexCount);
  
  const getKey = (v: Vector3) => `${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)}`;

  const tempVec = new Vector3();
  for (let i = 0; i < vertexCount; i++) {
    tempVec.fromBufferAttribute(posAttribute, i);
    const key = getKey(tempVec);
    
    if (posMap.has(key)) {
      oldIndexToNewIndex[i] = posMap.get(key)!;
    } else {
      const newIndex = uniquePositions.length;
      uniquePositions.push(tempVec.clone());
      posMap.set(key, newIndex);
      oldIndexToNewIndex[i] = newIndex;
    }
  }

  // 3. Build Faces (using new indices)
  // IcosahedronGeometry is non-indexed usually, but let's handle both
  const faces: number[][] = []; // [a, b, c] indices
  
  if (geometry.index) {
    for (let i = 0; i < geometry.index.count; i += 3) {
      const a = oldIndexToNewIndex[geometry.index.getX(i)];
      const b = oldIndexToNewIndex[geometry.index.getX(i + 1)];
      const c = oldIndexToNewIndex[geometry.index.getX(i + 2)];
      if (a !== b && b !== c && c !== a) { // Valid triangle
        faces.push([a, b, c]);
      }
    }
  } else {
    for (let i = 0; i < vertexCount; i += 3) {
      const a = oldIndexToNewIndex[i];
      const b = oldIndexToNewIndex[i + 1];
      const c = oldIndexToNewIndex[i + 2];
      if (a !== b && b !== c && c !== a) {
        faces.push([a, b, c]);
      }
    }
  }

  // 4. Build Connectivity
  // nodeFaces: which faces is a node part of?
  const nodeFaces: number[][] = Array(uniquePositions.length).fill(null).map(() => []);
  // nodeNeighbors: which nodes are connected to a node?
  const nodeNeighbors: Set<number>[] = Array(uniquePositions.length).fill(null).map(() => new Set());

  faces.forEach((face, faceIndex) => {
    const [a, b, c] = face;
    
    nodeFaces[a].push(faceIndex);
    nodeFaces[b].push(faceIndex);
    nodeFaces[c].push(faceIndex);
    
    nodeNeighbors[a].add(b); nodeNeighbors[a].add(c);
    nodeNeighbors[b].add(a); nodeNeighbors[b].add(c);
    nodeNeighbors[c].add(a); nodeNeighbors[c].add(b);
  });

  // 5. Create Cells (Vertices of Geodesic Sphere -> Cells of Goldberg)
  const indexToCellId = new Map<number, string>();

  uniquePositions.forEach((pos, index) => {
    const id = uuidv4();
    indexToCellId.set(index, id);
    
    // Calculate Polygon Vertices (Centroids of adjacent faces)
    const adjacentFacesIndices = nodeFaces[index];
    const polygonVertices: Vector3[] = [];
    
    const faceCentroids = adjacentFacesIndices.map(fIdx => {
      const [a, b, c] = faces[fIdx];
      const va = uniquePositions[a];
      const vb = uniquePositions[b];
      const vc = uniquePositions[c];
      return new Vector3().add(va).add(vb).add(vc).divideScalar(3);
    });

    // Sort polygon vertices to form a proper shape
    // We sort them by angle around the cell's normal (which is the cell position for a sphere centered at 0)
    const normal = pos.clone().normalize();
    
    // Create a local coordinate system for sorting
    // Tangent vectors
    const tangent = new Vector3();
    if (Math.abs(normal.y) < 0.9) {
      tangent.set(0, 1, 0);
    } else {
      tangent.set(1, 0, 0);
    }
    tangent.cross(normal).normalize();
    const bitangent = new Vector3().crossVectors(normal, tangent).normalize();
    
    faceCentroids.sort((p1, p2) => {
      const v1 = p1.clone().sub(pos);
      const v2 = p2.clone().sub(pos);
      
      const angle1 = Math.atan2(v1.dot(bitangent), v1.dot(tangent));
      const angle2 = Math.atan2(v2.dot(bitangent), v2.dot(tangent));
      
      return angle1 - angle2;
    });
    
    polygonVertices.push(...faceCentroids);

    const cell: Cell = {
      id,
      position: pos.clone(), // We might want to project this to surface or keep as is.
                             // For Goldberg, the "center" is the vertex of the geodesic sphere.
      normal: normal,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
      neighbors: [], // Will fill later
      geometryData: { type: 'sphere', index },
      polygonVertices: polygonVertices
    };
    
    cells.set(id, cell);
  });

  // 6. Connect Neighbors
  uniquePositions.forEach((_, index) => {
    const id = indexToCellId.get(index)!;
    const cell = cells.get(id)!;
    const neighborIndices = Array.from(nodeNeighbors[index]);
    
    neighborIndices.forEach(nIndex => {
      const nId = indexToCellId.get(nIndex)!;
      cell.neighbors.push(nId);
    });
  });
  
  const mineCount = Math.floor(cells.size * density);
  placeMines(cells, mineCount);
  
  return cells;
};

const placeMines = (cells: Map<string, Cell>, count: number) => {
  const ids = Array.from(cells.keys());
  let placed = 0;
  
  // Safety check: Don't infinite loop if density is 100% or close
  if (count > ids.length) count = ids.length;

  while (placed < count) {
    const idx = Math.floor(Math.random() * ids.length);
    const id = ids[idx];
    const cell = cells.get(id)!;
    
    if (!cell.isMine) {
      cell.isMine = true;
      placed++;
    }
  }
  
  // Calculate neighbor counts
  cells.forEach(cell => {
    let mines = 0;
    cell.neighbors.forEach(nId => {
      if (cells.get(nId)?.isMine) {
        mines++;
      }
    });
    cell.neighborCount = mines;
  });
};
