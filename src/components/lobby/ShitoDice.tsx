import React, { useState } from 'react';
import { Dice1 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onRoll: (result: string) => void;
  disabled?: boolean;
  lastRoll?: string | null;
}

const DICE_FACES = ['S', 'H', 'I', 'T', 'O', '💩'];

export default function ShitoDice({ onRoll, disabled, lastRoll }: Props) {
  const [isRolling, setIsRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState<string | null>(lastRoll || null);

  const rollDice = () => {
    if (disabled || isRolling) return;
    setIsRolling(true);
    
    let rollCount = 0;
    const maxRolls = 15;
    const interval = setInterval(() => {
      const randomFace = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
      setCurrentFace(randomFace);
      rollCount++;
      
      if (rollCount >= maxRolls) {
        clearInterval(interval);
        const finalResult = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
        setCurrentFace(finalResult);
        setIsRolling(false);
        onRoll(finalResult);
      }
    }, 80);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl border-4 border-amber-600 shadow-lg flex items-center justify-center ${isRolling ? 'animate-bounce' : ''}`}>
        {currentFace ? (
          <span className={`text-4xl font-black ${currentFace === '💩' ? '' : 'text-amber-800'}`}>
            {currentFace}
          </span>
        ) : (
          <Dice1 className="w-10 h-10 text-amber-600" />
        )}
      </div>
      
      <Button 
        onClick={rollDice} 
        disabled={disabled || isRolling}
        className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </Button>
      
      {currentFace && !isRolling && (
        <p className="text-sm text-amber-300">
          {currentFace === '💩' ? 'WILD! Any column!' : `Column: ${currentFace}`}
        </p>
      )}
    </div>
  );
}
