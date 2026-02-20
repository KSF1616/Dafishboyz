import React from 'react';
import { Eye, UserCircle, Loader2 } from 'lucide-react';
import { RoomSpectator } from '@/types/lobby';

interface Props {
  spectators?: RoomSpectator[] | null;
  isCollapsed?: boolean;
  isLoading?: boolean;
}

const SpectatorsList: React.FC<Props> = ({ spectators, isCollapsed = false, isLoading = false }) => {
  // Safety check for undefined, null, or non-array spectators
  const safeSpectators = Array.isArray(spectators) ? spectators : [];
  const connectedSpectators = safeSpectators.filter(s => s && s.is_connected);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Spectators</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Don't render if no spectators
  if (connectedSpectators.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Eye className="w-4 h-4" />
        <span>{connectedSpectators.length} watching</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-semibold">Spectators</h3>
        <span className="bg-blue-600/30 text-blue-300 text-xs px-2 py-0.5 rounded-full">
          {connectedSpectators.length}
        </span>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {connectedSpectators.map((spectator, index) => (
          <div 
            key={spectator?.id || `spectator-${index}`} 
            className="flex items-center gap-2 text-gray-300 text-sm"
          >
            <UserCircle className="w-4 h-4 text-gray-500" />
            <span>{spectator?.spectator_name || 'Unknown'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpectatorsList;
