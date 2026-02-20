import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShitoRoom,
  ShitoPlayer,
  ShitoMessage,
  MultiplayerState,
  BoardGrid,
  BingoCard,
  CallingCard,
  ShitoColumn,
  SHITO_COLUMNS,
  generateRoomCode,
  generatePlayerId,
} from '@/types/shitoMultiplayer';

interface UseShitoMultiplayerProps {
  bingoIcons: BingoCard[];
  callingCards: CallingCard[];
}

export const useShitoMultiplayer = ({ bingoIcons, callingCards }: UseShitoMultiplayerProps) => {
  const [state, setState] = useState<MultiplayerState>({
    mode: 'menu',
    room: null,
    players: [],
    messages: [],
    currentPlayer: null,
    playerId: '',
    playerName: '',
    isHost: false,
    error: null,
  });

  const subscriptionsRef = useRef<any[]>([]);

  // Initialize player ID from localStorage
  useEffect(() => {
    let storedPlayerId = localStorage.getItem('shito_player_id');
    if (!storedPlayerId) {
      storedPlayerId = generatePlayerId();
      localStorage.setItem('shito_player_id', storedPlayerId);
    }
    
    const storedName = localStorage.getItem('shito_player_name') || '';
    
    setState(prev => ({
      ...prev,
      playerId: storedPlayerId!,
      playerName: storedName,
    }));
  }, []);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(sub => {
        supabase.removeChannel(sub);
      });
    };
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateBoard = (): BoardGrid => {
    const grid: BoardGrid = {
      S: [],
      H: [],
      I: [],
      T: [],
      O: [],
    };

    SHITO_COLUMNS.forEach((column) => {
      const columnPool = shuffleArray(bingoIcons);
      grid[column] = columnPool.slice(0, 5);
    });

    // Make center space FREE
    grid['I'][2] = { id: 'free', name: 'FREE', url: '' };

    return grid;
  };

  const setPlayerName = (name: string) => {
    localStorage.setItem('shito_player_name', name);
    setState(prev => ({ ...prev, playerName: name }));
  };

  const setupRealtimeSubscriptions = useCallback((roomId: string) => {
    // Clean up existing subscriptions
    subscriptionsRef.current.forEach(sub => {
      supabase.removeChannel(sub);
    });
    subscriptionsRef.current = [];

    // Subscribe to room changes
    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shito_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedRoom = payload.new as ShitoRoom;
            setState(prev => ({
              ...prev,
              room: updatedRoom,
              mode: updatedRoom.status === 'playing' ? 'playing' : 
                    updatedRoom.status === 'finished' ? 'playing' : 'lobby',
            }));
          } else if (payload.eventType === 'DELETE') {
            setState(prev => ({
              ...prev,
              mode: 'menu',
              room: null,
              players: [],
              messages: [],
              error: 'Room was closed by the host',
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to player changes
    const playersChannel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shito_players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPlayer = payload.new as ShitoPlayer;
            setState(prev => ({
              ...prev,
              players: [...prev.players.filter(p => p.id !== newPlayer.id), newPlayer],
            }));
          } else if (payload.eventType === 'UPDATE') {
            const updatedPlayer = payload.new as ShitoPlayer;
            setState(prev => ({
              ...prev,
              players: prev.players.map(p => 
                p.id === updatedPlayer.id ? updatedPlayer : p
              ),
              currentPlayer: prev.currentPlayer?.id === updatedPlayer.id 
                ? updatedPlayer 
                : prev.currentPlayer,
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedPlayer = payload.old as ShitoPlayer;
            setState(prev => ({
              ...prev,
              players: prev.players.filter(p => p.id !== deletedPlayer.id),
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to messages
    const messagesChannel = supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shito_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as ShitoMessage;
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage].slice(-100), // Keep last 100 messages
          }));
        }
      )
      .subscribe();

    subscriptionsRef.current = [roomChannel, playersChannel, messagesChannel];
  }, []);

  const createRoom = async (playerName: string): Promise<boolean> => {
    if (!playerName.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter your name' }));
      return false;
    }

    setState(prev => ({ ...prev, mode: 'creating', error: null }));

    try {
      const roomCode = generateRoomCode();
      const board = generateBoard();

      // Create the room
      const { data: roomData, error: roomError } = await supabase
        .from('shito_rooms')
        .insert({
          room_code: roomCode,
          host_id: state.playerId,
          host_name: playerName,
          status: 'waiting',
          current_card: null,
          current_column: null,
          called_cards: [],
          drawn_card_ids: [],
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add host as first player
      const { data: playerData, error: playerError } = await supabase
        .from('shito_players')
        .insert({
          room_id: roomData.id,
          player_id: state.playerId,
          player_name: playerName,
          board_grid: board,
          marked_cells: ['I-2'],
          is_host: true,
          is_connected: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // Add system message
      await supabase.from('shito_messages').insert({
        room_id: roomData.id,
        player_id: 'system',
        player_name: 'System',
        message: `${playerName} created the room. Share code: ${roomCode}`,
        message_type: 'system',
      });

      setPlayerName(playerName);
      setupRealtimeSubscriptions(roomData.id);

      setState(prev => ({
        ...prev,
        mode: 'lobby',
        room: roomData,
        players: [playerData],
        currentPlayer: playerData,
        isHost: true,
        error: null,
      }));

      return true;
    } catch (error: any) {
      console.error('Error creating room:', error);
      setState(prev => ({
        ...prev,
        mode: 'menu',
        error: error.message || 'Failed to create room',
      }));
      return false;
    }
  };

  const joinRoom = async (roomCode: string, playerName: string): Promise<boolean> => {
    if (!playerName.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter your name' }));
      return false;
    }

    if (!roomCode.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a room code' }));
      return false;
    }

    setState(prev => ({ ...prev, mode: 'joining', error: null }));

    try {
      // Find the room
      const { data: roomData, error: roomError } = await supabase
        .from('shito_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (roomError || !roomData) {
        setState(prev => ({
          ...prev,
          mode: 'menu',
          error: 'Room not found. Check the code and try again.',
        }));
        return false;
      }

      if (roomData.status === 'finished') {
        setState(prev => ({
          ...prev,
          mode: 'menu',
          error: 'This game has already ended.',
        }));
        return false;
      }

      // Check if player already in room
      const { data: existingPlayer } = await supabase
        .from('shito_players')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('player_id', state.playerId)
        .single();

      let playerData;

      if (existingPlayer) {
        // Reconnect existing player
        const { data: updatedPlayer, error: updateError } = await supabase
          .from('shito_players')
          .update({ is_connected: true, player_name: playerName })
          .eq('id', existingPlayer.id)
          .select()
          .single();

        if (updateError) throw updateError;
        playerData = updatedPlayer;

        await supabase.from('shito_messages').insert({
          room_id: roomData.id,
          player_id: 'system',
          player_name: 'System',
          message: `${playerName} reconnected`,
          message_type: 'system',
        });
      } else {
        // Add new player
        const board = generateBoard();

        const { data: newPlayer, error: playerError } = await supabase
          .from('shito_players')
          .insert({
            room_id: roomData.id,
            player_id: state.playerId,
            player_name: playerName,
            board_grid: board,
            marked_cells: ['I-2'],
            is_host: false,
            is_connected: true,
          })
          .select()
          .single();

        if (playerError) throw playerError;
        playerData = newPlayer;

        await supabase.from('shito_messages').insert({
          room_id: roomData.id,
          player_id: 'system',
          player_name: 'System',
          message: `${playerName} joined the game`,
          message_type: 'system',
        });
      }

      // Fetch all players
      const { data: allPlayers } = await supabase
        .from('shito_players')
        .select('*')
        .eq('room_id', roomData.id);

      // Fetch messages
      const { data: messages } = await supabase
        .from('shito_messages')
        .select('*')
        .eq('room_id', roomData.id)
        .order('created_at', { ascending: true })
        .limit(100);

      setPlayerName(playerName);
      setupRealtimeSubscriptions(roomData.id);

      setState(prev => ({
        ...prev,
        mode: roomData.status === 'playing' ? 'playing' : 'lobby',
        room: roomData,
        players: allPlayers || [],
        messages: messages || [],
        currentPlayer: playerData,
        isHost: roomData.host_id === state.playerId,
        error: null,
      }));

      return true;
    } catch (error: any) {
      console.error('Error joining room:', error);
      setState(prev => ({
        ...prev,
        mode: 'menu',
        error: error.message || 'Failed to join room',
      }));
      return false;
    }
  };

  const startGame = async (): Promise<boolean> => {
    if (!state.room || !state.isHost) return false;

    try {
      const { error } = await supabase
        .from('shito_rooms')
        .update({ status: 'playing' })
        .eq('id', state.room.id);

      if (error) throw error;

      await supabase.from('shito_messages').insert({
        room_id: state.room.id,
        player_id: 'system',
        player_name: 'System',
        message: 'Game started! Good luck everyone!',
        message_type: 'game',
      });

      return true;
    } catch (error: any) {
      console.error('Error starting game:', error);
      setState(prev => ({ ...prev, error: error.message }));
      return false;
    }
  };

  const rollAndDraw = async (): Promise<{ column: ShitoColumn; card: CallingCard } | null> => {
    if (!state.room || !state.isHost || callingCards.length === 0) return null;

    try {
      // Select random column
      const column = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];

      // Get available cards
      let availableIds = callingCards
        .map(c => c.id)
        .filter(id => !state.room!.drawn_card_ids.includes(id));

      // Reshuffle if empty
      if (availableIds.length === 0) {
        availableIds = callingCards.map(c => c.id);
      }

      // Pick random card
      const cardId = availableIds[Math.floor(Math.random() * availableIds.length)];
      const card = callingCards.find(c => c.id === cardId)!;

      // Update room state
      const newDrawnIds = state.room.drawn_card_ids.includes(cardId)
        ? [cardId]
        : [...state.room.drawn_card_ids, cardId];

      const newCalledCards = [...state.room.called_cards, { card, column }];

      const { error } = await supabase
        .from('shito_rooms')
        .update({
          current_card: card,
          current_column: column,
          drawn_card_ids: newDrawnIds,
          called_cards: newCalledCards,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.room.id);

      if (error) throw error;

      await supabase.from('shito_messages').insert({
        room_id: state.room.id,
        player_id: 'system',
        player_name: 'System',
        message: `Called: ${column} - ${card.name}`,
        message_type: 'game',
      });

      return { column, card };
    } catch (error: any) {
      console.error('Error rolling:', error);
      setState(prev => ({ ...prev, error: error.message }));
      return null;
    }
  };

  const markCell = async (column: ShitoColumn, rowIndex: number): Promise<boolean> => {
    if (!state.room || !state.currentPlayer) return false;

    const cellKey = `${column}-${rowIndex}`;
    
    // Check if already marked
    if (state.currentPlayer.marked_cells.includes(cellKey)) return false;

    // Check if column matches current call
    if (column !== state.room.current_column) return false;

    // Check if icon matches
    const cellIcon = state.currentPlayer.board_grid[column][rowIndex];
    if (
      cellIcon.id !== 'free' &&
      state.room.current_card &&
      cellIcon.name.toLowerCase() !== state.room.current_card.name.toLowerCase()
    ) {
      return false;
    }

    try {
      const newMarkedCells = [...state.currentPlayer.marked_cells, cellKey];

      const { error } = await supabase
        .from('shito_players')
        .update({
          marked_cells: newMarkedCells,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.currentPlayer.id);

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error('Error marking cell:', error);
      return false;
    }
  };

  const claimWin = async (): Promise<boolean> => {
    if (!state.room || !state.currentPlayer) return false;

    const marked = state.currentPlayer.marked_cells;

    // Check rows
    for (let row = 0; row < 5; row++) {
      if (SHITO_COLUMNS.every(col => marked.includes(`${col}-${row}`))) {
        return await announceWinner();
      }
    }

    // Check columns
    for (const col of SHITO_COLUMNS) {
      if ([0, 1, 2, 3, 4].every(row => marked.includes(`${col}-${row}`))) {
        return await announceWinner();
      }
    }

    // Check diagonals
    if (SHITO_COLUMNS.every((col, i) => marked.includes(`${col}-${i}`))) {
      return await announceWinner();
    }

    if (SHITO_COLUMNS.every((col, i) => marked.includes(`${col}-${4 - i}`))) {
      return await announceWinner();
    }

    return false;
  };

  const announceWinner = async (): Promise<boolean> => {
    if (!state.room || !state.currentPlayer) return false;

    try {
      const { error } = await supabase
        .from('shito_rooms')
        .update({
          status: 'finished',
          winner_id: state.currentPlayer.player_id,
          winner_name: state.currentPlayer.player_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.room.id);

      if (error) throw error;

      await supabase.from('shito_messages').insert({
        room_id: state.room.id,
        player_id: 'system',
        player_name: 'System',
        message: `🎉 ${state.currentPlayer.player_name} won! SHITO! 🎉`,
        message_type: 'game',
      });

      return true;
    } catch (error: any) {
      console.error('Error announcing winner:', error);
      return false;
    }
  };

  const sendMessage = async (message: string): Promise<boolean> => {
    if (!state.room || !message.trim()) return false;

    try {
      const { error } = await supabase.from('shito_messages').insert({
        room_id: state.room.id,
        player_id: state.playerId,
        player_name: state.playerName,
        message: message.trim(),
        message_type: 'chat',
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const resetGame = async (): Promise<boolean> => {
    if (!state.room || !state.isHost) return false;

    try {
      // Reset room state
      const { error: roomError } = await supabase
        .from('shito_rooms')
        .update({
          status: 'playing',
          current_card: null,
          current_column: null,
          called_cards: [],
          drawn_card_ids: [],
          winner_id: null,
          winner_name: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.room.id);

      if (roomError) throw roomError;

      // Reset all player boards
      for (const player of state.players) {
        const newBoard = generateBoard();
        await supabase
          .from('shito_players')
          .update({
            board_grid: newBoard,
            marked_cells: ['I-2'],
            updated_at: new Date().toISOString(),
          })
          .eq('id', player.id);
      }

      await supabase.from('shito_messages').insert({
        room_id: state.room.id,
        player_id: 'system',
        player_name: 'System',
        message: 'New game started! Boards have been shuffled.',
        message_type: 'game',
      });

      return true;
    } catch (error: any) {
      console.error('Error resetting game:', error);
      setState(prev => ({ ...prev, error: error.message }));
      return false;
    }
  };

  const leaveRoom = async (): Promise<void> => {
    if (state.room && state.currentPlayer) {
      try {
        if (state.isHost) {
          // Delete the room if host leaves
          await supabase.from('shito_rooms').delete().eq('id', state.room.id);
        } else {
          // Mark player as disconnected
          await supabase
            .from('shito_players')
            .update({ is_connected: false })
            .eq('id', state.currentPlayer.id);

          await supabase.from('shito_messages').insert({
            room_id: state.room.id,
            player_id: 'system',
            player_name: 'System',
            message: `${state.playerName} left the game`,
            message_type: 'system',
          });
        }
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }

    // Clean up subscriptions
    subscriptionsRef.current.forEach(sub => {
      supabase.removeChannel(sub);
    });
    subscriptionsRef.current = [];

    setState(prev => ({
      ...prev,
      mode: 'menu',
      room: null,
      players: [],
      messages: [],
      currentPlayer: null,
      isHost: false,
      error: null,
    }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    state,
    setPlayerName,
    createRoom,
    joinRoom,
    startGame,
    rollAndDraw,
    markCell,
    claimWin,
    sendMessage,
    resetGame,
    leaveRoom,
    clearError,
  };
};
