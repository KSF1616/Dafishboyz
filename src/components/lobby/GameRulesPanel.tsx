import React, { useState, useEffect } from 'react';
import { GameRules, GAME_RULES } from '@/types/lobby';
import { BookOpen, Target, Settings, Play, Trophy, Loader2, AlertCircle, Download, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface Props {
  gameType: string;
}

interface GameInstructionPDF {
  name: string;
  url: string;
  size: number;
}

const GameRulesPanel: React.FC<Props> = ({ gameType }) => {
  const [rules, setRules] = useState<GameRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructionPDFs, setInstructionPDFs] = useState<GameInstructionPDF[]>([]);
  const [loadingPDFs, setLoadingPDFs] = useState(false);

  // Fetch game rules
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase.from('game_settings').select('setting_value').eq('setting_key', 'game_rules').single();
        if (fetchError) {
          console.log('Using default rules:', fetchError.message);
          setRules(GAME_RULES[gameType] || null);
        } else if (data?.setting_value && data.setting_value[gameType]) {
          setRules(data.setting_value[gameType] as GameRules);
        } else {
          setRules(GAME_RULES[gameType] || null);
        }
      } catch (err: any) {
        console.error('Error fetching rules:', err);
        setRules(GAME_RULES[gameType] || null);
        setError(err.message);
      }
      setLoading(false);
    };
    fetchRules();
  }, [gameType]);

  // Fetch instruction PDFs from game-instructions bucket
  useEffect(() => {
    const fetchInstructionPDFs = async () => {
      setLoadingPDFs(true);
      try {
        // Try to list files from game-instructions bucket
        const { data, error: listError } = await supabase.storage
          .from('game-instructions')
          .list('', { limit: 100 });

        if (listError) {
          console.log('Could not fetch instruction PDFs:', listError.message);
          setInstructionPDFs([]);
          setLoadingPDFs(false);
          return;
        }

        if (data && data.length > 0) {
          // Filter PDFs that match the current game type
          const gameSlugVariants = [
            gameType,
            gameType.replace(/-/g, '_'),
            gameType.replace(/-/g, ''),
            gameType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
            gameType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            gameType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_'),
          ];

          const matchingPDFs = data
            .filter(f => {
              if (!f.name.toLowerCase().endsWith('.pdf')) return false;
              const fileName = f.name.toLowerCase();
              return gameSlugVariants.some(variant => 
                fileName.includes(variant.toLowerCase())
              );
            })
            .map(f => {
              const { data: urlData } = supabase.storage
                .from('game-instructions')
                .getPublicUrl(f.name);
              return {
                name: f.name,
                url: urlData.publicUrl,
                size: f.metadata?.size || 0
              };
            });

          // Also check for generic/all game instruction files
          const genericPDFs = data
            .filter(f => {
              if (!f.name.toLowerCase().endsWith('.pdf')) return false;
              const fileName = f.name.toLowerCase();
              return fileName.includes('all') || 
                     fileName.includes('complete') || 
                     fileName.includes('full') ||
                     fileName.includes('rules');
            })
            .map(f => {
              const { data: urlData } = supabase.storage
                .from('game-instructions')
                .getPublicUrl(f.name);
              return {
                name: f.name,
                url: urlData.publicUrl,
                size: f.metadata?.size || 0
              };
            });

          // Combine and deduplicate
          const allPDFs = [...matchingPDFs];
          genericPDFs.forEach(pdf => {
            if (!allPDFs.find(p => p.name === pdf.name)) {
              allPDFs.push(pdf);
            }
          });

          setInstructionPDFs(allPDFs);
        }
      } catch (err) {
        console.error('Error fetching instruction PDFs:', err);
      }
      setLoadingPDFs(false);
    };

    fetchInstructionPDFs();
  }, [gameType]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `(${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]})`;
  };

  const handleDownload = (pdf: GameInstructionPDF) => {
    window.open(pdf.url, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!rules) {
    return (
      <div className="bg-gray-800 rounded-xl p-4">
        <p className="text-gray-400">Rules not available for this game.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-purple-400" />
        {rules.title} - Rules
      </h3>
      
      {error && (
        <div className="mb-3 p-2 bg-yellow-900/30 text-yellow-400 rounded text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />Using default rules
        </div>
      )}

      {/* PDF Download Section */}
      {(instructionPDFs.length > 0 || loadingPDFs) && (
        <div className="mb-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center gap-2 text-purple-300 font-medium mb-2">
            <FileText className="w-4 h-4" />
            Physical Game Instructions
          </div>
          {loadingPDFs ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading instruction files...
            </div>
          ) : (
            <div className="space-y-2">
              {instructionPDFs.map((pdf, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleDownload(pdf)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-between bg-gray-700/50 border-purple-500/30 hover:bg-purple-600/30 text-white"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Download className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{pdf.name.replace('.pdf', '')}</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    {formatFileSize(pdf.size)}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </Button>
              ))}
              <p className="text-xs text-gray-400 mt-2">
                Download the PDF for complete physical game rules and setup instructions.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
            <Target className="w-4 h-4" />Objective
          </div>
          <p className="text-gray-300 text-sm">{rules.objective}</p>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
            <Settings className="w-4 h-4" />Setup
          </div>
          <ul className="text-gray-300 text-sm space-y-1">
            {rules.setup.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400">{idx + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
            <Play className="w-4 h-4" />How to Play
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            {rules.howToPlay.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-purple-400 font-medium mb-2">
            <Trophy className="w-4 h-4" />Winning
          </div>
          <p className="text-gray-300 text-sm">{rules.winning}</p>
        </div>
      </div>
    </div>
  );
};

export default GameRulesPanel;
