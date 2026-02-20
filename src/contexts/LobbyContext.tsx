import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { GameRoom, RoomPlayer, ChatMessage, CardGameState, CardAction, RoomSpectator } from '@/types/lobby';

interface DrinkingModeSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  drinksThisGame: number;
}

interface LobbyContextType {
  playerId: string;
  playerName: string;
  setPlayerName: (name: string) => void;
  currentRoom: GameRoom | null;
  players: RoomPlayer[];
  spectators: RoomSpectator[];
  messages: ChatMessage[];
  cardGameState: CardGameState | null;
  isSpectator: boolean;
  isLoading: boolean;
  drinkingMode: DrinkingModeSettings;
  createRoom: (gameType: string, playerName: string, isPrivate?: boolean, drinkingMode?: boolean) => Promise<string>;
  joinRoom: (roomCode: string, playerName: string) => Promise<boolean>;
  joinAsSpectator: (roomCode: string, spectatorName: string) => Promise<boolean>;
  joinByInvite: (inviteCode: string, playerName: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  sendMessage: (message: string, type?: 'chat' | 'system' | 'emote' | 'sticker' | 'drink') => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  updateGameState: (data: Record<string, any>) => Promise<void>;
  updateCardGameState: (state: CardGameState, action: CardAction) => Promise<void>;
  nextTurn: () => Promise<void>;
  endGame: (winnerId?: string, scores?: Record<string, number>) => Promise<void>;
  updatePlayerScore: (playerId: string, score: number) => Promise<void>;
  createInviteLink: () => Promise<string | null>;
  kickPlayer: (playerId: string) => Promise<void>;
  toggleDrinkingMode: () => Promise<void>;
  setDrinkingIntensity: (intensity: 'light' | 'medium' | 'heavy') => Promise<void>;
  triggerDrinkEvent: (rule: string, targetPlayer?: string) => Promise<void>;
  addDrink: () => void;
}

const LobbyContext = createContext<LobbyContextType | null>(null);
export const useLobby = () => {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error('useLobby must be used within LobbyProvider');
  return ctx;
};

const generatePlayerId = () => {
  const stored = localStorage.getItem('playerId');
  if (stored) return stored;
  const id = 'player_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('playerId', id);
  return id;
};
const generateRoomCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();
const generateInviteCode = () => Math.random().toString(36).substr(2, 12).toUpperCase();

// Child games that should not have drinking mode
const CHILD_GAMES = ['drop-deuce', 'drop-a-deuce'];

export const LobbyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playerId] = useState(generatePlayerId);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [spectators, setSpectators] = useState<RoomSpectator[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cardGameState, setCardGameState] = useState<CardGameState | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [drinkingMode, setDrinkingMode] = useState<DrinkingModeSettings>({
    enabled: false,
    intensity: 'medium',
    drinksThisGame: 0
  });
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  useEffect(() => { if (playerName) localStorage.setItem('playerName', playerName); }, [playerName]);

  // Update drinking mode from room settings
  useEffect(() => {
    if (currentRoom?.settings) {
      setDrinkingMode(prev => ({
        enabled: currentRoom.settings.drinking_mode || false,
        intensity: currentRoom.settings.drinking_intensity || 'medium',
        drinksThisGame: prev.drinksThisGame
      }));
    }
  }, [currentRoom?.settings]);

  // Track game start time
  useEffect(() => {
    if (currentRoom?.status === 'playing' && !gameStartTime) {
      setGameStartTime(new Date());
    } else if (currentRoom?.status !== 'playing') {
      setGameStartTime(null);
    }
  }, [currentRoom?.status]);

  const fetchPlayers = async (roomId: string): Promise<RoomPlayer[]> => {
    try {
      const { data } = await supabase.from('room_players').select('*').eq('room_id', roomId).order('player_order');
      const playerData = data || [];
      setPlayers(playerData);
      return playerData;
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers([]);
      return [];
    }
  };

  const fetchSpectators = async (roomId: string): Promise<RoomSpectator[]> => {
    try {
      const { data } = await supabase.from('room_spectators').select('*').eq('room_id', roomId);
      const spectatorData = data || [];
      setSpectators(spectatorData);
      return spectatorData;
    } catch (error) {
      console.error('Error fetching spectators:', error);
      setSpectators([]);
      return [];
    }
  };

  const fetchMessages = async (roomId: string): Promise<ChatMessage[]> => {
    try {
      const { data } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at');
      const messageData = data || [];
      setMessages(messageData);
      return messageData;
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      return [];
    }
  };

  // Record game stats to database
  const recordGameStats = async (
    result: 'win' | 'loss' | 'draw',
    score: number,
    opponents: { name: string; id?: string }[]
  ) => {
    // Get user ID from auth if available
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Only record stats for authenticated users

    const durationMinutes = gameStartTime 
      ? Math.round((new Date().getTime() - gameStartTime.getTime()) / 60000)
      : null;

    try {
      await supabase.functions.invoke('game-stats-tracker', {
        body: {
          action: 'record_game',
          user_id: user.id,
          game_type: currentRoom?.game_type,
          score,
          result,
          duration_minutes: durationMinutes,
          players_count: players.length,
          drinking_mode: drinkingMode.enabled,
          drinks_taken: drinkingMode.drinksThisGame,
          drinking_intensity: drinkingMode.enabled ? drinkingMode.intensity : null,
          opponents,
          room_code: currentRoom?.room_code
        }
      });
    } catch {
      // Silently fail - stats recording is optional and shouldn't break gameplay
    }
  };


  useEffect(() => {
    if (!currentRoom) return;
    const channel = supabase.channel(`room:${currentRoom.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${currentRoom.id}` },
        (payload) => { if (payload.new) { setCurrentRoom(payload.new as GameRoom); if ((payload.new as GameRoom).game_data?.cardState) setCardGameState((payload.new as GameRoom).game_data.cardState); }})
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${currentRoom.id}` }, () => fetchPlayers(currentRoom.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_spectators', filter: `room_id=eq.${currentRoom.id}` }, () => fetchSpectators(currentRoom.id))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${currentRoom.id}` },
        (payload) => { if (payload.new) setMessages(prev => [...prev, payload.new as ChatMessage]); })
      .on('broadcast', { event: 'card_action' }, ({ payload }) => { if (payload?.state) setCardGameState(payload.state); })
      .on('broadcast', { event: 'drink_event' }, ({ payload }) => {
        // Handle drink events for spectators and players
        if (payload?.rule) {
          setMessages(prev => [...prev, {
            id: `drink-${Date.now()}`,
            room_id: currentRoom.id,
            player_id: 'system',
            player_name: 'Drinking Game',
            message: payload.targetPlayer 
              ? `${payload.targetPlayer}: ${payload.rule}` 
              : payload.rule,
            message_type: 'drink',
            created_at: new Date().toISOString()
          } as ChatMessage]);
        }
      })
      .subscribe();
    
    const table = isSpectator ? 'room_spectators' : 'room_players';
    const idField = isSpectator ? 'spectator_id' : 'player_id';
    const heartbeat = setInterval(() => {
      supabase.from(table).update({ last_seen_at: new Date().toISOString(), is_connected: true }).eq('room_id', currentRoom.id).eq(idField, playerId).then(() => {});
    }, 10000);
    
    return () => { supabase.removeChannel(channel); clearInterval(heartbeat); };
  }, [currentRoom?.id, isSpectator]);

  const updateCardGameState = async (state: CardGameState, action: CardAction) => {
    if (!currentRoom || isSpectator) return;
    setCardGameState(state);
    supabase.channel(`room:${currentRoom.id}`).send({ type: 'broadcast', event: 'card_action', payload: { action, state } });
    await supabase.from('game_rooms').update({ game_data: { ...currentRoom.game_data, cardState: state }, updated_at: new Date().toISOString() }).eq('id', currentRoom.id);
  };

  // Use a ref to always have the latest room data for async operations
  const currentRoomRef = React.useRef<GameRoom | null>(null);
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  const addDrink = () => {
    setDrinkingMode(prev => ({
      ...prev,
      drinksThisGame: prev.drinksThisGame + 1
    }));
  };



  const value: LobbyContextType = {
    playerId, playerName, setPlayerName, currentRoom, players, spectators, messages, cardGameState, isSpectator, isLoading, drinkingMode,
    
    createRoom: async (gameType, name, isPrivate = false, enableDrinking = false) => {
      setIsLoading(true);
      try {
        const code = generateRoomCode();
        const isChildGame = CHILD_GAMES.includes(gameType);
        const settings = {
          drinking_mode: isChildGame ? false : enableDrinking,
          drinking_intensity: 'medium'
        };
        const { data: room } = await supabase.from('game_rooms').insert({ 
          room_code: code, 
          game_type: gameType, 
          host_id: playerId, 
          host_name: name, 
          game_data: {}, 
          is_private: isPrivate, 
          settings,
          allow_spectators: true 
        }).select().single();
        if (room) {
          await supabase.from('room_players').insert({ room_id: room.id, player_id: playerId, player_name: name, is_host: true, player_order: 0 });
          await supabase.from('chat_messages').insert({ room_id: room.id, player_id: 'system', player_name: 'System', message: `${name} created the room` });
          setCurrentRoom(room); 
          setIsSpectator(false); 
          await Promise.all([fetchPlayers(room.id), fetchSpectators(room.id), fetchMessages(room.id)]);
          // Reset drinks counter for new game
          setDrinkingMode(prev => ({ ...prev, drinksThisGame: 0 }));
        }
        return code;
      } finally {
        setIsLoading(false);
      }
    },

    joinRoom: async (code, name) => {
      setIsLoading(true);
      try {
        const { data: room } = await supabase.from('game_rooms').select('*').eq('room_code', code.toUpperCase()).single();
        if (!room || room.status === 'finished') return false;
        const { data: existing } = await supabase.from('room_players').select('*').eq('room_id', room.id);
        if (existing && existing.length >= room.max_players) return false;
        if (!existing?.find(p => p.player_id === playerId)) {
          await supabase.from('room_players').insert({ room_id: room.id, player_id: playerId, player_name: name, player_order: existing?.length || 0 });
          await supabase.from('chat_messages').insert({ room_id: room.id, player_id: 'system', player_name: 'System', message: `${name} joined`, message_type: 'system' });
        }
        setCurrentRoom(room); 
        setIsSpectator(false);
        // Fetch all data in parallel and wait for completion
        await Promise.all([fetchPlayers(room.id), fetchSpectators(room.id), fetchMessages(room.id)]);
        if (room.game_data?.cardState) setCardGameState(room.game_data.cardState);
        // Reset drinks counter
        setDrinkingMode(prev => ({ ...prev, drinksThisGame: 0 }));
        return true;
      } finally {
        setIsLoading(false);
      }
    },

    joinAsSpectator: async (code, name) => {
      setIsLoading(true);
      try {
        const { data: room } = await supabase.from('game_rooms').select('*').eq('room_code', code.toUpperCase()).single();
        if (!room) return false;
        const { data: existing } = await supabase.from('room_spectators').select('*').eq('room_id', room.id).eq('spectator_id', playerId);
        if (!existing?.length) {
          await supabase.from('room_spectators').insert({ room_id: room.id, spectator_id: playerId, spectator_name: name });
          await supabase.from('chat_messages').insert({ room_id: room.id, player_id: 'system', player_name: 'System', message: `${name} is now spectating`, message_type: 'system' });
        }
        setCurrentRoom(room); 
        setIsSpectator(true);
        // Fetch all data in parallel and wait for completion before rendering
        await Promise.all([fetchPlayers(room.id), fetchSpectators(room.id), fetchMessages(room.id)]);
        if (room.game_data?.cardState) setCardGameState(room.game_data.cardState);
        return true;
      } finally {
        setIsLoading(false);
      }
    },

    joinByInvite: async (inviteCode, name) => {
      const { data: invite } = await supabase.from('game_invites').select('*, game_rooms(*)').eq('invite_code', inviteCode).eq('is_active', true).single();
      if (!invite?.game_rooms) return false;
      await supabase.from('game_invites').update({ uses_count: invite.uses_count + 1 }).eq('id', invite.id);
      return value.joinRoom(invite.game_rooms.room_code, name);
    },
    
    leaveRoom: async () => {
      if (!currentRoom) return;
      const table = isSpectator ? 'room_spectators' : 'room_players';
      const idField = isSpectator ? 'spectator_id' : 'player_id';
      await supabase.from(table).delete().eq('room_id', currentRoom.id).eq(idField, playerId);
      await supabase.from('chat_messages').insert({ room_id: currentRoom.id, player_id: 'system', player_name: 'System', message: `${playerName} left`, message_type: 'system' });
      setCurrentRoom(null); setPlayers([]); setSpectators([]); setMessages([]); setCardGameState(null); setIsSpectator(false);
      setDrinkingMode(prev => ({ ...prev, drinksThisGame: 0 }));
    },
    
    sendMessage: async (message, type = 'chat') => {
      if (!currentRoom) return;
      await supabase.from('chat_messages').insert({ room_id: currentRoom.id, player_id: playerId, player_name: playerName, message, message_type: type });
    },
    toggleReady: async () => { if (!currentRoom || isSpectator) return; const me = players.find(p => p.player_id === playerId); if (me) await supabase.from('room_players').update({ is_ready: !me.is_ready }).eq('id', me.id); },
    startGame: async () => { 
      if (!currentRoom || isSpectator) return; 
      await supabase.from('game_rooms').update({ status: 'playing', current_turn: 0, started_at: new Date().toISOString() }).eq('id', currentRoom.id);
      setGameStartTime(new Date());
      setDrinkingMode(prev => ({ ...prev, drinksThisGame: 0 }));
    },
    
    // FIXED: Use ref to get the latest room data to avoid stale closure issues
    updateGameState: async (data) => { 
      const room = currentRoomRef.current;
      if (!room || isSpectator) return; 
      
      // Fetch the latest game_data from the database to avoid overwriting concurrent updates
      const { data: latestRoom } = await supabase
        .from('game_rooms')
        .select('game_data')
        .eq('id', room.id)
        .single();
      
      const latestGameData = latestRoom?.game_data || {};
      const mergedData = { ...latestGameData, ...data };
      
      await supabase.from('game_rooms').update({ 
        game_data: mergedData, 
        updated_at: new Date().toISOString() 
      }).eq('id', room.id); 
    },
    
    nextTurn: async () => { 
      const room = currentRoomRef.current;
      if (!room || isSpectator) return; 
      await supabase.from('game_rooms').update({ 
        current_turn: (room.current_turn + 1) % players.length 
      }).eq('id', room.id); 
    },

    
    endGame: async (winnerId?: string, scores?: Record<string, number>) => { 
      if (!currentRoom || isSpectator) return; 
      
      // Update game room status
      await supabase.from('game_rooms').update({ 
        status: 'finished', 
        game_data: { ...currentRoom.game_data, winner: winnerId, finalScores: scores }, 
        finished_at: new Date().toISOString() 
      }).eq('id', currentRoom.id);

      // Record stats for the current player
      const myScore = scores?.[playerId] || 0;
      const isWinner = winnerId === playerId;
      const opponents = players
        .filter(p => p.player_id !== playerId)
        .map(p => ({ name: p.player_name, id: p.player_id }));

      await recordGameStats(
        isWinner ? 'win' : 'loss',
        myScore,
        opponents
      );
    },
    
    updatePlayerScore: async (pid, score) => { if (!currentRoom || isSpectator) return; await supabase.from('room_players').update({ score }).eq('room_id', currentRoom.id).eq('player_id', pid); },
    createInviteLink: async () => { if (!currentRoom) return null; const code = generateInviteCode(); const { data } = await supabase.from('game_invites').insert({ room_id: currentRoom.id, invite_code: code, created_by: playerId, max_uses: 10 }).select().single(); return data ? `${window.location.origin}/lobby?invite=${code}` : null; },
    kickPlayer: async (pid) => { if (!currentRoom || currentRoom.host_id !== playerId) return; await supabase.from('room_players').delete().eq('room_id', currentRoom.id).eq('player_id', pid); },
    
    toggleDrinkingMode: async () => {
      if (!currentRoom || currentRoom.host_id !== playerId) return;
      const isChildGame = CHILD_GAMES.includes(currentRoom.game_type);
      if (isChildGame) return; // Can't enable drinking mode for child games
      
      const newSettings = {
        ...currentRoom.settings,
        drinking_mode: !currentRoom.settings?.drinking_mode
      };
      await supabase.from('game_rooms').update({ settings: newSettings }).eq('id', currentRoom.id);
      
      // Announce in chat
      const message = newSettings.drinking_mode 
        ? 'Drinking Game Mode enabled! Drink responsibly!' 
        : 'Drinking Game Mode disabled';
      await supabase.from('chat_messages').insert({ 
        room_id: currentRoom.id, 
        player_id: 'system', 
        player_name: 'System', 
        message, 
        message_type: 'system' 
      });
    },
    
    setDrinkingIntensity: async (intensity) => {
      if (!currentRoom || currentRoom.host_id !== playerId) return;
      const newSettings = {
        ...currentRoom.settings,
        drinking_intensity: intensity
      };
      await supabase.from('game_rooms').update({ settings: newSettings }).eq('id', currentRoom.id);
    },
    
    triggerDrinkEvent: async (rule, targetPlayer) => {
      if (!currentRoom || !drinkingMode.enabled) return;
      
      // Broadcast drink event to all players
      supabase.channel(`room:${currentRoom.id}`).send({ 
        type: 'broadcast', 
        event: 'drink_event', 
        payload: { rule, targetPlayer } 
      });
      
      // Also add to chat
      await supabase.from('chat_messages').insert({ 
        room_id: currentRoom.id, 
        player_id: 'system', 
        player_name: 'Drinking Game', 
        message: targetPlayer ? `${targetPlayer}: ${rule}` : rule, 
        message_type: 'drink' 
      });
    },
    
    addDrink,
    updateCardGameState
  };

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>;
};
