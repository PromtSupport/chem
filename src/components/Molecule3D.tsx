import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Atom {
  pos: [number, number, number];
  color: string;
  radius: number;
}

interface Bond {
  start: [number, number, number];
  end: [number, number, number];
  type?: number;
}

interface Molecule3DProps {
  formula?: string;
}

const UNIFIED_COLOR = '#e2e8f0';

const COLORS = {
  C: UNIFIED_COLOR,
  H: UNIFIED_COLOR,
  O: UNIFIED_COLOR,
  N: UNIFIED_COLOR,
  R: UNIFIED_COLOR
};

const RADIUS = {
  C: 0.45,
  H: 0.25,
  O: 0.4,
  N: 0.4,
  R: 0.5
};

function generateMolecule(formula?: string): { atoms: Atom[], bonds: Bond[] } {
  let atoms: Atom[] = [];
  let bonds: Bond[] = [];

  if (formula === 'CH₄') {
    atoms = [
      { pos: [0, 0, 0], color: COLORS.C, radius: RADIUS.C }, // C
      { pos: [0.63, 0.63, 0.63], color: COLORS.H, radius: RADIUS.H },
      { pos: [-0.63, -0.63, 0.63], color: COLORS.H, radius: RADIUS.H },
      { pos: [0.63, -0.63, -0.63], color: COLORS.H, radius: RADIUS.H },
      { pos: [-0.63, 0.63, -0.63], color: COLORS.H, radius: RADIUS.H },
    ];
    bonds = [
      { start: atoms[0].pos, end: atoms[1].pos },
      { start: atoms[0].pos, end: atoms[2].pos },
      { start: atoms[0].pos, end: atoms[3].pos },
      { start: atoms[0].pos, end: atoms[4].pos },
    ];
  } else if (formula === 'C₂H₄') {
    atoms = [
      { pos: [-0.67, 0, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [0.67, 0, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [-1.22, 0.95, 0], color: COLORS.H, radius: RADIUS.H },
      { pos: [-1.22, -0.95, 0], color: COLORS.H, radius: RADIUS.H },
      { pos: [1.22, 0.95, 0], color: COLORS.H, radius: RADIUS.H },
      { pos: [1.22, -0.95, 0], color: COLORS.H, radius: RADIUS.H },
    ];
    bonds = [
      { start: atoms[0].pos, end: atoms[1].pos, type: 2 },
      { start: atoms[0].pos, end: atoms[2].pos },
      { start: atoms[0].pos, end: atoms[3].pos },
      { start: atoms[1].pos, end: atoms[4].pos },
      { start: atoms[1].pos, end: atoms[5].pos },
    ];
  } else if (formula === 'C₆H₆') {
    const cRadius = 1.4;
    const hRadius = 2.49;
    for(let i=0; i<6; i++) {
        const angle = i * Math.PI / 3;
        atoms.push({
            pos: [cRadius * Math.cos(angle), cRadius * Math.sin(angle), 0],
            color: COLORS.C, radius: RADIUS.C
        });
        atoms.push({
            pos: [hRadius * Math.cos(angle), hRadius * Math.sin(angle), 0],
            color: COLORS.H, radius: RADIUS.H
        });
    }
    for(let i=0; i<6; i++) {
        bonds.push({ start: atoms[i*2].pos, end: atoms[i*2+1].pos });
        const nextC = ((i+1)%6)*2;
        bonds.push({ start: atoms[i*2].pos, end: atoms[nextC].pos, type: i % 2 === 0 ? 2 : 1 });
    }
  } else if (formula === 'CH₃COOH') {
    atoms = [
      { pos: [-0.7, -0.1, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [0.7, 0.2, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [1.2, 1.25, 0], color: COLORS.O, radius: RADIUS.O },
      { pos: [1.5, -0.85, 0], color: COLORS.O, radius: RADIUS.O },
      { pos: [2.4, -0.6, 0], color: COLORS.H, radius: RADIUS.H },
      { pos: [-1.06, -0.61, 0.89], color: COLORS.H, radius: RADIUS.H },
      { pos: [-1.06, -0.61, -0.89], color: COLORS.H, radius: RADIUS.H },
      { pos: [-1.06, 0.93, 0], color: COLORS.H, radius: RADIUS.H },
    ];
    bonds = [
      { start: atoms[0].pos, end: atoms[1].pos },
      { start: atoms[1].pos, end: atoms[2].pos, type: 2 },
      { start: atoms[1].pos, end: atoms[3].pos },
      { start: atoms[3].pos, end: atoms[4].pos },
      { start: atoms[0].pos, end: atoms[5].pos },
      { start: atoms[0].pos, end: atoms[6].pos },
      { start: atoms[0].pos, end: atoms[7].pos },
    ];
  } else if (formula === 'C₃H₅(OH)₃') {
    atoms = [
      { pos: [-1.26, 0.72, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [0, -0.5, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [1.26, 0.72, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [-2.4, -0.1, 0], color: COLORS.O, radius: RADIUS.O },
      { pos: [0, -1.1, 1.1], color: COLORS.O, radius: RADIUS.O },
      { pos: [2.4, -0.1, 0], color: COLORS.O, radius: RADIUS.O },
      { pos: [-3.1, 0.4, 0], color: COLORS.H, radius: RADIUS.H },
      { pos: [0, -2.0, 1.1], color: COLORS.H, radius: RADIUS.H },
      { pos: [3.1, 0.4, 0], color: COLORS.H, radius: RADIUS.H },
      { pos: [-1.26, 1.34, 0.89], color: COLORS.H, radius: RADIUS.H },
      { pos: [-1.26, 1.34, -0.89], color: COLORS.H, radius: RADIUS.H },
      { pos: [0, -1.1, -0.89], color: COLORS.H, radius: RADIUS.H },
      { pos: [1.26, 1.34, 0.89], color: COLORS.H, radius: RADIUS.H },
      { pos: [1.26, 1.34, -0.89], color: COLORS.H, radius: RADIUS.H },
    ];
    bonds = [
      { start: atoms[0].pos, end: atoms[1].pos },
      { start: atoms[1].pos, end: atoms[2].pos },
      { start: atoms[0].pos, end: atoms[3].pos },
      { start: atoms[1].pos, end: atoms[4].pos },
      { start: atoms[2].pos, end: atoms[5].pos },
      { start: atoms[3].pos, end: atoms[6].pos },
      { start: atoms[4].pos, end: atoms[7].pos },
      { start: atoms[5].pos, end: atoms[8].pos },
      { start: atoms[0].pos, end: atoms[9].pos },
      { start: atoms[0].pos, end: atoms[10].pos },
      { start: atoms[1].pos, end: atoms[11].pos },
      { start: atoms[2].pos, end: atoms[12].pos },
      { start: atoms[2].pos, end: atoms[13].pos },
    ];
  } else {
    // Белки / Биополимеры / Fallback
    atoms = [
      { pos: [-2, -0.5, 0], color: COLORS.N, radius: RADIUS.N },
      { pos: [-1, 0.5, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [0, -0.5, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [0, -1.5, 0], color: COLORS.O, radius: RADIUS.O },
      { pos: [1, 0.5, 0], color: COLORS.N, radius: RADIUS.N },
      { pos: [2, -0.5, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [3, 0.5, 0], color: COLORS.C, radius: RADIUS.C },
      { pos: [3, 1.5, 0], color: COLORS.O, radius: RADIUS.O },
      { pos: [-2.5, -1.2, 0], color: COLORS.H, radius: RADIUS.H },
      { pos: [1, 1.3, 0], color: COLORS.H, radius: RADIUS.H },
      { pos: [-1, 1.2, 0.8], color: COLORS.R, radius: RADIUS.R },
      { pos: [2, -1.2, -0.8], color: COLORS.R, radius: RADIUS.R },
      { pos: [-1, 1.2, -0.8], color: COLORS.H, radius: RADIUS.H },
      { pos: [2, -1.2, 0.8], color: COLORS.H, radius: RADIUS.H },
    ];
    bonds = [
      { start: atoms[0].pos, end: atoms[1].pos },
      { start: atoms[1].pos, end: atoms[2].pos },
      { start: atoms[2].pos, end: atoms[3].pos, type: 2 },
      { start: atoms[2].pos, end: atoms[4].pos },
      { start: atoms[4].pos, end: atoms[5].pos },
      { start: atoms[5].pos, end: atoms[6].pos },
      { start: atoms[6].pos, end: atoms[7].pos, type: 2 },
      { start: atoms[0].pos, end: atoms[8].pos },
      { start: atoms[4].pos, end: atoms[9].pos },
      { start: atoms[1].pos, end: atoms[10].pos },
      { start: atoms[5].pos, end: atoms[11].pos },
      { start: atoms[1].pos, end: atoms[12].pos },
      { start: atoms[5].pos, end: atoms[13].pos },
    ];
  }

  // Center Molecule
  if (atoms.length > 0) {
      const center = [0, 0, 0];
      atoms.forEach(a => {
        center[0] += a.pos[0];
        center[1] += a.pos[1];
        center[2] += a.pos[2];
      });
      center[0] /= atoms.length;
      center[1] /= atoms.length;
      center[2] /= atoms.length;

      atoms.forEach(a => {
        a.pos[0] -= center[0];
        a.pos[1] -= center[1];
        a.pos[2] -= center[2];
      });
      
      bonds.forEach(b => {
        b.start[0] -= center[0];
        b.start[1] -= center[1];
        b.start[2] -= center[2];
        b.end[0] -= center[0];
        b.end[1] -= center[1];
        b.end[2] -= center[2];
      });
  }

  return { atoms, bonds };
}

const Molecule = ({ data }: { data: { atoms: Atom[], bonds: Bond[] } }) => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {data.bonds.map((bond, i) => {
        const start = new THREE.Vector3(...bond.start);
        const end = new THREE.Vector3(...bond.end);
        const distance = start.distanceTo(end);
        const position = start.clone().lerp(end, 0.5);
        
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          end.clone().sub(start).normalize()
        );

        const isDouble = bond.type === 2;

        return (
          <group key={`bond-${i}`} position={position} quaternion={quaternion}>
             {isDouble ? (
                <>
                  <mesh position={[0.1, 0, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, distance, 12]} />
                    <meshPhysicalMaterial color="#dfdfdf" roughness={0.3} metalness={0.2} clearcoat={0.5} />
                  </mesh>
                  <mesh position={[-0.1, 0, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, distance, 12]} />
                    <meshPhysicalMaterial color="#dfdfdf" roughness={0.3} metalness={0.2} clearcoat={0.5} />
                  </mesh>
                </>
             ) : (
                <mesh>
                  <cylinderGeometry args={[0.06, 0.06, distance, 12]} />
                  <meshPhysicalMaterial color="#dfdfdf" roughness={0.3} metalness={0.2} clearcoat={0.5} />
                </mesh>
             )}
          </group>
        );
      })}

      {data.atoms.map((atom, i) => (
        <Sphere key={`atom-${i}`} args={[atom.radius, 32, 32]} position={atom.pos}>
          <meshPhysicalMaterial 
             color={atom.color} 
             roughness={0.15}
             metalness={0.2}
             clearcoat={1.0}
             clearcoatRoughness={0.1}
          />
        </Sphere>
      ))}
    </group>
  );
};

export default function Molecule3D({ formula }: Molecule3DProps) {
  const data = useMemo(() => generateMolecule(formula), [formula]);

  return (
    <div className="w-full h-[240px] cursor-grab active:cursor-grabbing bg-gradient-to-br from-[#121c2d]/60 via-black/60 to-[#0f241d]/60 relative transform transition-transform duration-500 ease-out group-hover:scale-105">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={1} />
        <Molecule data={data} />
        <OrbitControls enableZoom={true} enablePan={false} maxDistance={15} minDistance={2} enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}

