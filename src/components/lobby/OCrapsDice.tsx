import React, { useState, useEffect } from 'react';

interface OCrapsDiceProps {
  rolling: boolean;
  value: number; // 1-6: 1=💩, 2=C, 3=R, 4=A, 5=P, 6=S
  size?: number;
}

const FACES = ['💩', 'C', 'R', 'A', 'P', 'S'];
const FACE_COLORS: Record<number, string> = {
  1: 'from-yellow-200 to-yellow-300', // 💩 Poo - yellow
  2: 'from-red-200 to-red-300',       // C Center - red
  3: 'from-blue-200 to-blue-300',     // R Right - blue  
  4: 'from-purple-200 to-purple-300', // A Any - purple
  5: 'from-orange-200 to-orange-300', // P Pass Left - orange
  6: 'from-green-200 to-green-300',   // S Safe - green
};
const FACE_TEXT_COLORS: Record<number, string> = {
  1: '#854d0e', 2: '#991b1b', 3: '#1e40af', 4: '#6b21a8', 5: '#c2410c', 6: '#166534',
};

const faceRotations: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },      // 💩 front
  2: { x: 0, y: -90 },    // C right
  3: { x: 0, y: 180 },    // R back
  4: { x: 0, y: 90 },     // A left
  5: { x: -90, y: 0 },    // P top
  6: { x: 90, y: 0 },     // S bottom
};

export const OCrapsDice: React.FC<OCrapsDiceProps> = ({ rolling, value, size = 80 }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [spinRotation, setSpinRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (rolling) {
      const spins = Math.floor(Math.random() * 3) + 2;
      setSpinRotation({ x: 360 * spins, y: 360 * spins });
    } else {
      setSpinRotation({ x: 0, y: 0 });
      setRotation(faceRotations[value] || faceRotations[1]);
    }
  }, [rolling, value]);

  const half = size / 2;

  return (
    <div className="perspective-[600px]" style={{ width: size, height: size }}>
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x + (rolling ? spinRotation.x : 0)}deg) rotateY(${rotation.y + (rolling ? spinRotation.y : 0)}deg)`,
        }}
      >
        <DiceFace faceNum={1} size={size} transform={`translateZ(${half}px)`} />
        <DiceFace faceNum={3} size={size} transform={`rotateY(180deg) translateZ(${half}px)`} />
        <DiceFace faceNum={2} size={size} transform={`rotateY(90deg) translateZ(${half}px)`} />
        <DiceFace faceNum={4} size={size} transform={`rotateY(-90deg) translateZ(${half}px)`} />
        <DiceFace faceNum={5} size={size} transform={`rotateX(90deg) translateZ(${half}px)`} />
        <DiceFace faceNum={6} size={size} transform={`rotateX(-90deg) translateZ(${half}px)`} />
      </div>
    </div>
  );
};

interface DiceFaceProps {
  faceNum: number;
  size: number;
  transform: string;
}

const DiceFace: React.FC<DiceFaceProps> = ({ faceNum, size, transform }) => {
  const char = FACES[faceNum - 1];
  const isPoo = faceNum === 1;
  const bgColor = FACE_COLORS[faceNum];
  const textColor = FACE_TEXT_COLORS[faceNum];

  return (
    <div
      className={`absolute flex items-center justify-center bg-gradient-to-br ${bgColor} border-4 border-amber-800 rounded-lg shadow-lg font-bold`}
      style={{
        width: size,
        height: size,
        transform,
        backfaceVisibility: 'hidden',
        fontSize: isPoo ? size * 0.5 : size * 0.55,
        color: isPoo ? undefined : textColor,
      }}
    >
      {char}
    </div>
  );
};

export default OCrapsDice;
