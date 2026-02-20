import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GAME_MODES, CardDeckConfig } from '@/types/deckBuilder';
import { Save, Loader2 } from 'lucide-react';

interface DeckSaveModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: Partial<CardDeckConfig>) => Promise<void>;
  initialConfig?: Partial<CardDeckConfig>;
  cardCount: number;
}

export const DeckSaveModal: React.FC<DeckSaveModalProps> = ({
  open, onClose, onSave, initialConfig, cardCount
}) => {
  const [name, setName] = useState(initialConfig?.name || '');
  const [description, setDescription] = useState(initialConfig?.description || '');
  const [gameMode, setGameMode] = useState(initialConfig?.game_mode || 'standard');
  const [saving, setSaving] = useState(false);

  const selectedMode = GAME_MODES.find(m => m.id === gameMode);
  const isValidSize = cardCount >= (selectedMode?.minCards || 0) && cardCount <= (selectedMode?.maxCards || 999);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        game_mode: gameMode,
        min_cards: selectedMode?.minCards || 20,
        max_cards: selectedMode?.maxCards || 60,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Deck Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Deck Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Custom Deck" className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this deck..." className="mt-1" rows={3} />
          </div>
          <div>
            <Label>Game Mode</Label>
            <Select value={gameMode} onValueChange={setGameMode}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GAME_MODES.map(mode => (
                  <SelectItem key={mode.id} value={mode.id}>{mode.name} ({mode.minCards}-{mode.maxCards} cards)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isValidSize && (
            <p className="text-sm text-amber-600">Deck has {cardCount} cards. {selectedMode?.name} requires {selectedMode?.minCards}-{selectedMode?.maxCards}.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Deck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
