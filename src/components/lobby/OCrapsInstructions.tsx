import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OCrapsInstructions: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-amber-900/80 to-yellow-900/80 border-amber-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-200 text-lg flex items-center gap-2">
          <span className="text-2xl">🎲</span> O'CRAPS Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="text-amber-100 space-y-3 text-sm">
        <div>
          <h4 className="font-bold text-amber-300 mb-2">Starting Chips:</h4>
          <div className="flex gap-2 justify-center mb-2">
            <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300" title="White" />
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-700" title="Blue" />
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-purple-700" title="Purple" />
            <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-700" title="Black" />
          </div>
          <p className="text-xs text-center text-amber-200">Each player starts with 4 chips</p>
        </div>

        <div>
          <h4 className="font-bold text-amber-300 mb-2">The Dice Faces:</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-amber-800/50 rounded p-2">
              <span className="text-2xl">💩</span>
              <p className="text-xs mt-1 text-yellow-300">Roll Again</p>
            </div>
            <div className="bg-amber-800/50 rounded p-2">
              <span className="text-xl font-bold text-red-400">C</span>
              <p className="text-xs mt-1 text-red-300">Chip to Center</p>
            </div>
            <div className="bg-amber-800/50 rounded p-2">
              <span className="text-xl font-bold text-blue-400">R</span>
              <p className="text-xs mt-1 text-blue-300">Chip to Right</p>
            </div>
            <div className="bg-amber-800/50 rounded p-2">
              <span className="text-xl font-bold text-purple-400">A</span>
              <p className="text-xs mt-1 text-purple-300">Chip to Any</p>
            </div>
            <div className="bg-amber-800/50 rounded p-2">
              <span className="text-xl font-bold text-orange-400">P</span>
              <p className="text-xs mt-1 text-orange-300">Pass to Left</p>
            </div>
            <div className="bg-amber-800/50 rounded p-2">
              <span className="text-xl font-bold text-green-400">S</span>
              <p className="text-xs mt-1 text-green-300">Safe!</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-amber-300 mb-1">How Many Dice?</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><span className="text-green-400">3+ chips:</span> Roll 3 dice</li>
            <li><span className="text-yellow-400">2 chips:</span> Roll 2 dice</li>
            <li><span className="text-orange-400">1 chip:</span> Roll 1 die</li>
            <li><span className="text-red-400">0 chips:</span> Skip turn (not out!)</li>
          </ul>
        </div>

        <div className="bg-amber-950/50 rounded p-2 text-xs">
          <span className="font-bold text-amber-300">🏆 Shit Pot Winner:</span> Last player with chips wins the Shit Pot!
        </div>
      </CardContent>
    </Card>
  );
};

export default OCrapsInstructions;
