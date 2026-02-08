import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Vector3, Color } from 'three';
import { Cell } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface Cell3DProps {
  cell: Cell;
  size?: number; // Size of the cell (side length)
}

export default function Cell3D({ cell, size = 1 }: Cell3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const { revealCell, toggleFlag } = useGameStore();
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<number | null>(null);
  const lastPointerUpRef = useRef<number>(0);
  const mouseDownAtRef = useRef<number>(0);
  const mouseLastUpRef = useRef<number>(0);
  const mouseRevealTimerRef = useRef<number | null>(null);

  const handleContextMenu = (e: any) => {
    e.stopPropagation();
    if (e.nativeEvent && typeof e.nativeEvent.preventDefault === 'function') {
      e.nativeEvent.preventDefault();
    }
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.pointerType === 'touch') {
      if (e.nativeEvent && typeof e.nativeEvent.preventDefault === 'function') {
        e.nativeEvent.preventDefault();
      }
      // start a tentative single-tap reveal timer; will be canceled if double-tap detected on pointerup
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      tapTimeoutRef.current = window.setTimeout(() => {
        revealCell(cell.id);
        tapTimeoutRef.current = null;
      }, 380);
    } else {
      if (e.button === 2) {
        toggleFlag(cell.id);
      } else if (e.button === 0) {
        mouseDownAtRef.current = performance.now();
      }
    }
  };
  
  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (e.pointerType === 'touch') {
      const now = performance.now();
      if (now - lastPointerUpRef.current < 400) {
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
          tapTimeoutRef.current = null;
        }
        toggleFlag(cell.id);
        lastPointerUpRef.current = 0;
      } else {
        lastPointerUpRef.current = now;
        // keep the reveal timer set in pointerdown
      }
    } else {
      const now = performance.now();
      const duration = now - mouseDownAtRef.current;
      if (e.button === 0) {
        if (duration > 500) {
          if (mouseRevealTimerRef.current) {
            clearTimeout(mouseRevealTimerRef.current);
            mouseRevealTimerRef.current = null;
          }
          mouseLastUpRef.current = now;
          return;
        }
        if (now - mouseLastUpRef.current < 300) {
          if (mouseRevealTimerRef.current) {
            clearTimeout(mouseRevealTimerRef.current);
            mouseRevealTimerRef.current = null;
          }
          toggleFlag(cell.id);
          mouseLastUpRef.current = 0;
        } else {
          mouseLastUpRef.current = now;
          if (mouseRevealTimerRef.current) {
            clearTimeout(mouseRevealTimerRef.current);
            mouseRevealTimerRef.current = null;
          }
          mouseRevealTimerRef.current = window.setTimeout(() => {
            revealCell(cell.id);
            mouseRevealTimerRef.current = null;
          }, 280);
        }
      }
    }
  };

  // Orientation
  // Align Z axis with normal
  const position = cell.position;
  const normal = cell.normal;
  
  const quaternion = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.position.copy(position);
    dummy.lookAt(position.clone().add(normal));
    return dummy.quaternion;
  }, [position, normal]);

  // Colors
  const isDark = useMemo(() => {
    if (!cell.geometryData) return false;
    if (cell.geometryData?.type === 'sphere') {
      // Simple spatial hashing for sphere pattern
      // Use index if available for consistent pattern? 
      // cell.geometryData.index is available
      return cell.geometryData.index % 2 === 0;
    }
    return (cell.geometryData.u + cell.geometryData.v) % 2 === 0;
  }, [cell.geometryData]);

  const hiddenColor = isDark ? '#e2e8f0' : '#cbd5e0';
  const revealedColor = isDark ? '#2d3748' : '#4a5568';
  const hoverColor = '#63b3ed';

  const color = hovered ? hoverColor : (cell.isRevealed ? revealedColor : hiddenColor);

  // Polygon Shape for Sphere Mode
  const polygonShape = useMemo(() => {
    if (cell.polygonVertices && cell.polygonVertices.length > 0) {
      const shape = new THREE.Shape();
      const invQuat = quaternion.clone().invert();
      
      cell.polygonVertices.forEach((v, i) => {
        // Transform world vertex to local space relative to cell position
        const local = v.clone().sub(position).applyQuaternion(invQuat);
        // Scale down slightly for gap (0.95 factor)
        // Since local origin is (0,0), this scales towards center
        local.multiplyScalar(0.92); 
        
        if (i === 0) shape.moveTo(local.x, local.y);
        else shape.lineTo(local.x, local.y);
      });
      shape.closePath();
      return shape;
    }
    return null;
  }, [cell.polygonVertices, position, quaternion]);

  // Content Z-offset
  // Both geometries now extend from Z=-0.05 to Z=0.05 (centered at position)
  const contentZ = 0.06;

  // Geometry Offset
  // BoxGeometry is centered by default (-0.05 to 0.05), so offset is 0.
  // ExtrudeGeometry extends from 0 to 0.1, so we shift it down by 0.05 to center it (-0.05 to 0.05).
  const meshZ = polygonShape ? -0.05 : 0;

  return (
    <group position={position} quaternion={quaternion}>
      {/* The Cell Mesh */}
      <mesh
        ref={meshRef}
        position={[0, 0, meshZ]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
        castShadow
        receiveShadow
      >
        {polygonShape ? (
          <extrudeGeometry args={[polygonShape, { depth: 0.1, bevelEnabled: false }]} />
        ) : (
          <boxGeometry args={[size * 0.95, size * 0.95, 0.1]} />
        )}
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Content */}
      {cell.isRevealed && !cell.isMine && cell.neighborCount > 0 && (
        <Text
          position={[0, 0, contentZ]}
          fontSize={size * 0.5}
          color={getNumberColor(cell.neighborCount)}
          anchorX="center"
          anchorY="middle"
        >
          {cell.neighborCount}
        </Text>
      )}

      {cell.isRevealed && cell.isMine && (
        <mesh position={[0, 0, contentZ]}>
          <dodecahedronGeometry args={[size * 0.3, 0]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}

      {cell.isFlagged && !cell.isRevealed && (
        <group position={[0, 0, contentZ]}>
          <mesh position={[0, 0.1 * size, 0]}>
            <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.4, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0, 0.25 * size, 0]} rotation={[0, 0, -Math.PI / 2]}>
             <coneGeometry args={[size * 0.15, size * 0.3, 4]} />
             <meshStandardMaterial color="orange" />
          </mesh>
        </group>
      )}
    </group>
  );
}

const getNumberColor = (count: number) => {
  const colors = [
    '', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'
  ];
  return colors[count] || 'black';
};
