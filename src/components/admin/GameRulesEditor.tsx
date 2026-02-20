import React, { useState, useEffect } from 'react';
import { BookOpen, Save, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from './MarkdownEditor';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { games } from '@/data/gamesData';
import { GAME_RULES, GameRules } from '@/types/lobby';

export const GameRulesEditor: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState(games[0].id);
  const [rules, setRules] = useState<Record<string, GameRules>>(GAME_RULES);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => { fetchRules(); }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase.from('game_settings').select('setting_value').eq('setting_key', 'game_rules').single();
      if (fetchError) {
        console.log('Using default rules:', fetchError.message);
        setRules(GAME_RULES);
        if (fetchError.code === 'PGRST116') setError('No saved rules found. Using defaults.');
        else setError(fetchError.message);
      } else if (data?.setting_value) {
        setRules(data.setting_value as Record<string, GameRules>);
        setError(null);
      }
    } catch (err: any) {
      setRules(GAME_RULES);
      setError(err.message);
    }
    setLoading(false);
  };

  const currentRules = rules[selectedGame] || GAME_RULES[selectedGame];
  const updateRules = (field: keyof GameRules, value: string | string[]) => {
    setRules(prev => ({ ...prev, [selectedGame]: { ...currentRules, [field]: value } }));
  };

  const saveRules = async () => {
    setSaving(true);
    setError(null);
    try {
      const { error: saveError } = await supabase.from('game_settings').upsert({ setting_key: 'game_rules', setting_value: rules, updated_at: new Date().toISOString(), updated_by: user?.id }, { onConflict: 'setting_key' });
      if (saveError) throw saveError;
      toast({ title: "Rules Saved!", description: `${currentRules.title} rules updated successfully.` });
    } catch (err: any) {
      setError(`Save failed: ${err.message}`);
      toast({ title: "Error Saving", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const parseArray = (text: string) => text.split('\n').filter(l => l.trim());
  const arrayToText = (arr: string[]) => arr.join('\n');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl"><BookOpen className="w-8 h-8 text-green-600" /></div>
          <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Game Rules Editor</h2><p className="text-gray-500">Edit rules for each game</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); fetchRules(); }}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
          {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {expanded && (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {games.map(g => (<Button key={g.id} variant={selectedGame === g.id ? 'default' : 'outline'} onClick={() => setSelectedGame(g.id)} size="sm">{g.name}</Button>))}
          </div>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={currentRules.title} onChange={e => updateRules('title', e.target.value)} className="mt-1" /></div>
            <div><Label>Objective</Label><MarkdownEditor value={currentRules.objective} onChange={v => updateRules('objective', v)} rows={3} /></div>
            <div><Label>Setup (one step per line)</Label><MarkdownEditor value={arrayToText(currentRules.setup)} onChange={v => updateRules('setup', parseArray(v))} rows={4} /></div>
            <div><Label>How to Play (one step per line)</Label><MarkdownEditor value={arrayToText(currentRules.howToPlay)} onChange={v => updateRules('howToPlay', parseArray(v))} rows={6} /></div>
            <div><Label>Winning Condition</Label><MarkdownEditor value={currentRules.winning} onChange={v => updateRules('winning', v)} rows={2} /></div>
          </div>
          <Button onClick={saveRules} disabled={saving} className="mt-6 bg-green-500 hover:bg-green-600"><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Rules'}</Button>
        </>
      )}
    </div>
  );
};
