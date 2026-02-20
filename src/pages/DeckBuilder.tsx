import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FolderOpen, Plus, Shuffle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardSelector } from '@/components/deckBuilder/CardSelector';
import { DeckCardList } from '@/components/deckBuilder/DeckCardList';
import { DeckBalanceAnalyzer } from '@/components/deckBuilder/DeckBalanceAnalyzer';
import { DeckSaveModal } from '@/components/deckBuilder/DeckSaveModal';
import { SavedDecksList } from '@/components/deckBuilder/SavedDecksList';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DeckCard, CardDeckConfig, GAME_MODES } from '@/types/deckBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DeckBuilder: React.FC = () => {
  const [availableCards, setAvailableCards] = useState<DeckCard[]>([]);
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [savedDecks, setSavedDecks] = useState<CardDeckConfig[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string>();
  const [filterType, setFilterType] = useState('all');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [gameMode, setGameMode] = useState(GAME_MODES[0]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => { fetchCards(); fetchSavedDecks(); }, []);

  const fetchCards = async () => {
    const { data } = await supabase.from('game_cards').select('*').order('file_name');
    if (data) setAvailableCards(data);
  };

  const fetchSavedDecks = async () => {
    const { data } = await supabase.from('card_decks').select('*').order('created_at', { ascending: false });
    if (data) setSavedDecks(data);
  };

  const handleAddCard = (card: DeckCard) => {
    if (deckCards.length >= gameMode.maxCards) {
      toast({ title: 'Deck Full', description: `Max ${gameMode.maxCards} cards for ${gameMode.name}`, variant: 'destructive' });
      return;
    }
    setDeckCards(prev => [...prev, card]);
  };

  const handleRemoveCard = (id: string) => {
    const idx = deckCards.findIndex(c => c.id === id);
    if (idx !== -1) setDeckCards(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveDeck = async (config: Partial<CardDeckConfig>) => {
    const deckData = {
      ...config,
      card_ids: deckCards.map(c => c.id),
      card_order: deckCards.map((_, i) => i),
      is_active: true,
      created_by: user?.id,
    };
    
    const { data, error } = currentDeckId
      ? await supabase.from('card_decks').update(deckData).eq('id', currentDeckId).select().single()
      : await supabase.from('card_decks').insert(deckData).select().single();
    
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    if (data) setCurrentDeckId(data.id);
    toast({ title: 'Deck Saved!' });
    fetchSavedDecks();
  };

  const handleLoadDeck = async (deck: CardDeckConfig) => {
    setCurrentDeckId(deck.id);
    const mode = GAME_MODES.find(m => m.id === deck.game_mode) || GAME_MODES[0];
    setGameMode(mode);
    const cards = deck.card_ids.map(id => availableCards.find(c => c.id === id)).filter(Boolean) as DeckCard[];
    setDeckCards(cards);
    toast({ title: `Loaded: ${deck.name}` });
  };

  const handleDeleteDeck = async (id: string) => {
    await supabase.from('card_decks').delete().eq('id', id);
    if (currentDeckId === id) { setCurrentDeckId(undefined); setDeckCards([]); }
    fetchSavedDecks();
    toast({ title: 'Deck Deleted' });
  };

  const shuffleDeck = () => {
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5);
    setDeckCards(shuffled);
  };

  const selectedIds = deckCards.map(c => c.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeckCards([])} disabled={deckCards.length === 0}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </Button>
            <Button variant="outline" onClick={shuffleDeck} disabled={deckCards.length < 2}>
              <Shuffle className="w-4 h-4 mr-2" /> Shuffle
            </Button>
            <Button onClick={() => setShowSaveModal(true)} disabled={deckCards.length === 0}>
              <Save className="w-4 h-4 mr-2" /> Save Deck
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <Tabs defaultValue="cards">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="cards" className="flex-1">Cards</TabsTrigger>
                <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
              </TabsList>
              <TabsContent value="cards">
                <CardSelector availableCards={availableCards} selectedIds={selectedIds} onAddCard={handleAddCard} filterType={filterType} onFilterChange={setFilterType} />
              </TabsContent>
              <TabsContent value="saved">
                <SavedDecksList decks={savedDecks} onLoad={handleLoadDeck} onDelete={handleDeleteDeck} currentDeckId={currentDeckId} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5" /> Deck Builder
            </h2>
            <DeckCardList cards={deckCards} onReorder={setDeckCards} onRemove={handleRemoveCard} maxCards={gameMode.maxCards} />
          </div>

          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="font-bold mb-4">Analysis</h3>
            <DeckBalanceAnalyzer cards={deckCards} />
          </div>
        </div>
      </div>

      <DeckSaveModal open={showSaveModal} onClose={() => setShowSaveModal(false)} onSave={handleSaveDeck} cardCount={deckCards.length} />
    </div>
  );
};

export default DeckBuilder;
