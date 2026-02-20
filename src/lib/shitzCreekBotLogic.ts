/**
 * Bot turn execution logic for Up Shitz Creek.
 *
 * When a bot lands on a shit-pile (draw_card) space it now:
 *  1. Draws a real card from the persistent deck (not random with replacement)
 *  2. Parses the card with parseCardEffect()
 *  3. Auto-selects a target player for needsPlayerSelect cards:
 *     • steal / send / attack → furthest-ahead player
 *     • gift / bring         → closest-behind player
 *  4. Applies the full card effect to the game state
 *  5. Returns the updated deckState so it persists across turns
 */

import {
  getSpaceEffect,
  parseCardEffect,
  ParsedCardAction,
  findNextSpaceOfType,
  findClosestSpaceOfType,
  SPACE_EFFECTS,
} from '@/data/shitzCreekSpaceEffects';

import {
  DeckState,
  initializeDeck,
  drawFromDeck,
} from '@/lib/shitzCreekDeck';

// ─── Types ────────────────────────────────────────────────────────────

/** Minimal shape of a DB card (matches parsed_game_cards rows). */
export interface ShitzCreekDbCard {
  id: string;
  game_id: string;
  card_type: string;
  card_name: string;
  card_text: string | null;
  card_effect: string;
  card_category: string;
  card_number: number;
  drink_count: number;
  metadata: Record<string, any>;
  source_file: string;
}

export interface BotTurnResult {
  /** The complete new gameData to set via onAction / handleGameAction. */
  newGameData: Record<string, any>;
  /** Human-readable messages describing what happened (for coach bot). */
  messages: string[];
  /** The card that was drawn, if any. */
  drawnCard?: {
    card: ShitzCreekDbCard;
    parsedAction: ParsedCardAction;
    targetPlayerId?: string;
  };
  /** Whether the bot gets an extra roll (don't advance turn). */
  extraRoll?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────

const TOTAL_SPACES = SPACE_EFFECTS.length;
const FINISH_SPACE = TOTAL_SPACES - 1;

// ─── Target selection helpers ─────────────────────────────────────────

function pickFurthestAhead(
  botId: string,
  positions: Record<string, number>,
  players: { player_id: string; player_name: string }[],
): string | null {
  let best: string | null = null;
  let bestPos = -1;
  for (const p of players) {
    if (p.player_id === botId) continue;
    const pos = positions[p.player_id] || 0;
    if (pos > bestPos) {
      bestPos = pos;
      best = p.player_id;
    }
  }
  return best;
}

function pickClosestBehind(
  botId: string,
  positions: Record<string, number>,
  players: { player_id: string; player_name: string }[],
): string | null {
  const botPos = positions[botId] || 0;
  let best: string | null = null;
  let bestDist = Infinity;

  for (const p of players) {
    if (p.player_id === botId) continue;
    const pos = positions[p.player_id] || 0;
    if (pos <= botPos) {
      const dist = botPos - pos;
      if (dist < bestDist) {
        bestDist = dist;
        best = p.player_id;
      }
    }
  }

  if (!best) {
    for (const p of players) {
      if (p.player_id === botId) continue;
      const dist = Math.abs((positions[p.player_id] || 0) - botPos);
      if (dist < bestDist) {
        bestDist = dist;
        best = p.player_id;
      }
    }
  }

  return best;
}

function getPlayerToRight(
  botId: string,
  players: { player_id: string; player_name: string }[],
): string | null {
  const idx = players.findIndex(p => p.player_id === botId);
  if (idx < 0 || players.length < 2) return null;
  return players[(idx + 1) % players.length].player_id;
}

function getClosestPlayer(
  botId: string,
  positions: Record<string, number>,
  players: { player_id: string; player_name: string }[],
): string | null {
  const botPos = positions[botId] || 0;
  let closest: string | null = null;
  let closestDist = Infinity;
  for (const p of players) {
    if (p.player_id === botId) continue;
    const dist = Math.abs((positions[p.player_id] || 0) - botPos);
    if (dist < closestDist) {
      closestDist = dist;
      closest = p.player_id;
    }
  }
  return closest;
}

function autoSelectTarget(
  action: ParsedCardAction,
  botId: string,
  positions: Record<string, number>,
  players: { player_id: string; player_name: string }[],
): string | null {
  if (!action.needsPlayerSelect) return null;

  const giftTypes = new Set([
    'paddle_gift_choose',
    'bring_player',
  ]);

  if (giftTypes.has(action.type)) {
    return pickClosestBehind(botId, positions, players);
  }

  return pickFurthestAhead(botId, positions, players);
}

// ─── Apply a parsed card action to the game state ─────────────────────

function applyCardAction(
  action: ParsedCardAction,
  botId: string,
  targetPlayerId: string | null,
  pos: Record<string, number>,
  pad: Record<string, number>,
  sk: Record<string, boolean>,
  er: Record<string, boolean>,
  sy: Record<string, boolean>,
  players: { player_id: string; player_name: string }[],
): { shouldDrawAgain: boolean; message: string } {
  if (!pad[botId]) pad[botId] = 1;
  const myPos = pos[botId] || 0;
  let message = action.text;

  const playerName = (id: string | null) =>
    players.find(p => p.player_id === id)?.player_name || 'someone';

  switch (action.type) {
    case 'move_back':
      pos[botId] = Math.max(0, myPos - (action.value || 2));
      message = `Bot moved back ${action.value || 2} spaces`;
      break;
    case 'move_forward':
      pos[botId] = Math.min(FINISH_SPACE, myPos + (action.value || 2));
      message = `Bot moved forward ${action.value || 2} spaces`;
      break;
    case 'paddle_gain':
      pad[botId] = (pad[botId] || 1) + 1;
      message = 'Bot gained a paddle! +1';
      break;
    case 'paddle_lose':
      pad[botId] = Math.max(0, (pad[botId] || 1) - 1);
      message = 'Bot lost a paddle! -1';
      break;
    case 'paddle_steal':
      if (targetPlayerId && (pad[targetPlayerId] || 0) > 0) {
        pad[targetPlayerId]--;
        pad[botId] = (pad[botId] || 1) + 1;
        message = `Bot stole a paddle from ${playerName(targetPlayerId)}!`;
      } else {
        message = 'Bot tried to steal but target has no paddles';
      }
      break;
    case 'paddle_gift_right': {
      const rightId = getPlayerToRight(botId, players);
      if (rightId && pad[botId] > 0) {
        pad[botId]--;
        pad[rightId] = (pad[rightId] || 1) + 1;
        message = `Bot gifted a paddle to ${playerName(rightId)}`;
      }
      break;
    }
    case 'paddle_gift_choose':
      if (targetPlayerId && pad[botId] > 0) {
        pad[botId]--;
        pad[targetPlayerId] = (pad[targetPlayerId] || 1) + 1;
        message = `Bot gifted a paddle to ${playerName(targetPlayerId)}`;
      }
      break;
    case 'lose_turn':
      sk[botId] = true;
      message = 'Bot loses next turn!';
      break;
    case 'extra_turn':
      er[botId] = true;
      message = 'Bot gets another turn!';
      break;
    case 'draw_again':
      message = 'Bot draws again!';
      return { shouldDrawAgain: true, message };
    case 'go_to_space': {
      if (action.targetSpace) {
        const target =
          action.targetSpace === 'shit_pile'
            ? findClosestSpaceOfType(myPos, action.targetSpace)
            : findNextSpaceOfType(myPos, action.targetSpace);
        pos[botId] = target;
        message = `Bot moved to ${SPACE_EFFECTS[target]?.spaceName || action.targetSpace} (space ${target})`;
      }
      break;
    }
    case 'go_to_space_and_gain_paddle': {
      if (action.targetSpace) {
        const target = findClosestSpaceOfType(myPos, action.targetSpace);
        pos[botId] = target;
        pad[botId] = (pad[botId] || 1) + 1;
        message = 'Bot moved to Paddle Shop and got a free paddle!';
      }
      break;
    }
    case 'take_lead': {
      const maxPos = Math.max(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
      if (maxPos > myPos) pos[botId] = Math.min(maxPos + 1, FINISH_SPACE);
      message = 'Bot took the lead!';
      break;
    }
    case 'move_ahead_of_player':
      if (targetPlayerId) {
        const theirPos = pos[targetPlayerId] || 0;
        pos[botId] = Math.min(theirPos + 1, FINISH_SPACE);
        message = `Bot moved ahead of ${playerName(targetPlayerId)}!`;
      }
      break;
    case 'behind_leader': {
      const leaderPos = Math.max(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
      pos[botId] = Math.max(0, leaderPos - (action.value || 3));
      message = 'Bot moved to 3 spaces behind the leader';
      break;
    }
    case 'send_player_to':
      if (targetPlayerId && action.targetSpace) {
        const target = findClosestSpaceOfType(pos[targetPlayerId] || 0, action.targetSpace);
        pos[targetPlayerId] = target;
        message = `Bot sent ${playerName(targetPlayerId)} to ${SPACE_EFFECTS[target]?.spaceName || action.targetSpace}!`;
      }
      break;
    case 'bring_player':
      if (targetPlayerId) {
        pos[targetPlayerId] = myPos;
        message = `Bot brought ${playerName(targetPlayerId)} to its space!`;
      }
      break;
    case 'bring_all_players':
      players.forEach(p => { pos[p.player_id] = myPos; });
      message = 'Bot brought all players to its space!';
      break;
    case 'go_back_with_player': {
      const closestId = getClosestPlayer(botId, pos, players);
      const backSpaces = action.value || 3;
      pos[botId] = Math.max(0, myPos - backSpaces);
      if (closestId) {
        pos[closestId] = Math.max(0, (pos[closestId] || 0) - backSpaces);
        message = `Bot and ${playerName(closestId)} went back ${backSpaces} spaces!`;
      } else {
        message = `Bot went back ${backSpaces} spaces!`;
      }
      break;
    }
    case 'move_player_behind_last':
      if (targetPlayerId) {
        const minPos = Math.min(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
        pos[targetPlayerId] = Math.max(0, minPos - 1);
        message = `Bot moved ${playerName(targetPlayerId)} behind last place!`;
      }
      break;
    case 'skip_yellow':
      sy[botId] = true;
      message = 'Bot got a Skip Yellow Space token!';
      break;
    case 'move_both_to_space': {
      if (action.targetSpace) {
        const target = findClosestSpaceOfType(myPos, action.targetSpace);
        pos[botId] = target;
        if (targetPlayerId) {
          pos[targetPlayerId] = target;
          message = `Bot and ${playerName(targetPlayerId)} moved to ${SPACE_EFFECTS[target]?.spaceName}!`;
        }
      }
      break;
    }
  }

  return { shouldDrawAgain: false, message };
}

// ─── Main: execute a full bot turn ────────────────────────────────────

/**
 * Execute a complete bot turn for Up Shitz Creek.
 *
 * This handles:
 *  1. Skip-turn check
 *  2. Dice roll + movement
 *  3. Win check
 *  4. Space effect application (paddle_gain, move_back, draw_card, etc.)
 *  5. If draw_card: draw from the persistent deck → parseCardEffect → auto-select target → apply
 *  6. Handle draw_again chains (up to 3 to prevent infinite loops)
 *  7. Extra roll handling
 *  8. Turn advancement
 *  9. Return updated deckState so it persists
 */
export function executeBotShitzCreekFullTurn(
  gameData: Record<string, any>,
  botPlayerId: string,
  players: { player_id: string; player_name: string }[],
  dbCards: ShitzCreekDbCard[],
  currentTurnIndex: number,
): BotTurnResult {
  const messages: string[] = [];

  const pos: Record<string, number> = { ...(gameData.positions || {}) };
  const pad: Record<string, number> = { ...(gameData.paddles || {}) };
  const sk: Record<string, boolean> = { ...(gameData.skipTurn || {}) };
  const er: Record<string, boolean> = { ...(gameData.extraRoll || {}) };
  const sy: Record<string, boolean> = { ...(gameData.skipYellow || {}) };

  // Get or initialise the deck state
  let currentDeckState: DeckState | null = gameData.deckState || null;
  if (!currentDeckState && dbCards.length > 0) {
    currentDeckState = initializeDeck(dbCards.map(c => c.id));
    messages.push('Deck initialised for bot turn.');
  }

  if (!pad[botPlayerId]) pad[botPlayerId] = 1;

  const botName = players.find(p => p.player_id === botPlayerId)?.player_name || 'Bot';

  // Build a lookup map for card IDs
  const cardMap = new Map<string, ShitzCreekDbCard>();
  dbCards.forEach(c => cardMap.set(c.id, c));

  // ── 1. Skip turn check ──────────────────────────────────────────
  if (sk[botPlayerId]) {
    sk[botPlayerId] = false;
    messages.push(`${botName} skipped their turn.`);
    return {
      newGameData: {
        ...gameData,
        skipTurn: sk,
        currentTurn: (currentTurnIndex + 1) % players.length,
        deckState: currentDeckState,
      },
      messages,
    };
  }

  // ── 2. Roll dice ────────────────────────────────────────────────
  const roll = Math.floor(Math.random() * 6) + 1;
  const currentPos = pos[botPlayerId] || 0;
  const landingSpace = Math.min(currentPos + roll, FINISH_SPACE);
  pos[botPlayerId] = landingSpace;

  messages.push(`${botName} rolled a ${roll} and moved to space ${landingSpace}.`);

  // ── 3. Win check (before card) ──────────────────────────────────
  if (landingSpace >= FINISH_SPACE && (pad[botPlayerId] || 0) >= 2) {
    messages.push(`${botName} reached the finish with ${pad[botPlayerId]} paddles and WINS!`);
    return {
      newGameData: {
        ...gameData,
        positions: pos,
        paddles: pad,
        dice: roll,
        winner: botPlayerId,
        deckState: currentDeckState,
      },
      messages,
    };
  }

  if (landingSpace >= FINISH_SPACE && (pad[botPlayerId] || 0) < 2) {
    messages.push(`${botName} reached the finish but needs 2 paddles (has ${pad[botPlayerId] || 0}). Must collect more!`);
  }

  // ── 4. Space effect ─────────────────────────────────────────────
  const spaceEffect = getSpaceEffect(landingSpace);
  let needsCard = false;
  let grantExtraRoll = false;

  if (spaceEffect.type !== 'none') {
    messages.push(`Space ${landingSpace}: ${spaceEffect.text}`);

    if (spaceEffect.spaceType === 'shit_pile' && sy[botPlayerId]) {
      sy[botPlayerId] = false;
      messages.push(`${botName} used Skip Yellow token to avoid the Shit Pile!`);
    } else {
      switch (spaceEffect.type) {
        case 'paddle_gain':
          pad[botPlayerId] = (pad[botPlayerId] || 1) + (spaceEffect.value || 1);
          messages.push(`${botName} gained ${spaceEffect.value || 1} paddle(s)! Now has ${pad[botPlayerId]}.`);
          break;
        case 'paddle_lose':
          pad[botPlayerId] = Math.max(0, (pad[botPlayerId] || 1) - (spaceEffect.value || 1));
          messages.push(`${botName} lost ${spaceEffect.value || 1} paddle(s)! Now has ${pad[botPlayerId]}.`);
          break;
        case 'move_forward':
          pos[botPlayerId] = Math.min(FINISH_SPACE, landingSpace + (spaceEffect.value || 2));
          messages.push(`${botName} moved forward ${spaceEffect.value || 2} extra spaces to space ${pos[botPlayerId]}.`);
          break;
        case 'move_back':
          pos[botPlayerId] = Math.max(0, landingSpace - (spaceEffect.value || 2));
          messages.push(`${botName} moved back ${spaceEffect.value || 2} spaces to space ${pos[botPlayerId]}.`);
          break;
        case 'go_to_start':
          pos[botPlayerId] = 0;
          messages.push(`${botName} was sent back to Start!`);
          break;
        case 'take_lead': {
          const maxPos = Math.max(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
          if (maxPos > (pos[botPlayerId] || 0)) {
            pos[botPlayerId] = Math.min(maxPos + 1, FINISH_SPACE);
            messages.push(`${botName} took the lead at space ${pos[botPlayerId]}!`);
          }
          break;
        }
        case 'skip_turn':
          sk[botPlayerId] = true;
          messages.push(`${botName} must skip their next turn!`);
          break;
        case 'extra_roll':
          grantExtraRoll = true;
          messages.push(`${botName} gets to roll again!`);
          break;
        case 'swap_random': {
          const others = players.filter(p => p.player_id !== botPlayerId);
          if (others.length > 0) {
            const rp = others[Math.floor(Math.random() * others.length)];
            const myP = pos[botPlayerId] || 0;
            const theirP = pos[rp.player_id] || 0;
            pos[botPlayerId] = theirP;
            pos[rp.player_id] = myP;
            messages.push(`${botName} swapped positions with ${rp.player_name}!`);
          }
          break;
        }
        case 'draw_card':
          needsCard = true;
          break;
      }
    }
  }

  // ── 5. Draw card(s) if needed — from persistent deck ────────────
  let drawnCardInfo: BotTurnResult['drawnCard'] | undefined;

  if (needsCard && dbCards.length > 0 && currentDeckState) {
    let drawCount = 0;
    const MAX_DRAWS = 3;

    let shouldDrawAgain = true;
    while (shouldDrawAgain && drawCount < MAX_DRAWS) {
      shouldDrawAgain = false;
      drawCount++;

      // Draw from the persistent deck
      const drawResult = drawFromDeck(currentDeckState);
      currentDeckState = drawResult.deckState;

      if (!drawResult.cardId) {
        messages.push(`${botName} tried to draw but the deck is completely empty!`);
        break;
      }

      if (drawResult.reshuffled) {
        messages.push(`Deck was empty — discard pile reshuffled back in! (${currentDeckState.drawPile.length + 1} cards)`);
      }

      // Look up the card
      const card = cardMap.get(drawResult.cardId);
      if (!card) {
        messages.push(`${botName} drew card ID ${drawResult.cardId} but it wasn't found in local data.`);
        continue;
      }

      const parsedAction = parseCardEffect(card.card_effect);

      messages.push(`${botName} drew: "${card.card_effect}" (${parsedAction.type.replace(/_/g, ' ')}) [${currentDeckState.drawPile.length} cards left]`);

      // Auto-select target if needed
      let targetPlayerId: string | null = null;
      if (parsedAction.needsPlayerSelect) {
        targetPlayerId = autoSelectTarget(parsedAction, botPlayerId, pos, players);
        if (targetPlayerId) {
          const targetName = players.find(p => p.player_id === targetPlayerId)?.player_name || 'someone';
          messages.push(`${botName} targets ${targetName}`);
        }
      }

      // Apply the card effect
      const result = applyCardAction(
        parsedAction,
        botPlayerId,
        targetPlayerId,
        pos, pad, sk, er, sy,
        players,
      );

      messages.push(result.message);
      shouldDrawAgain = result.shouldDrawAgain;

      if (!drawnCardInfo) {
        drawnCardInfo = {
          card,
          parsedAction,
          targetPlayerId: targetPlayerId || undefined,
        };
      }
    }
  } else if (needsCard && dbCards.length === 0) {
    messages.push(`${botName} landed on a Shit Pile but no cards are loaded from DB!`);
  } else if (needsCard && !currentDeckState) {
    messages.push(`${botName} landed on a Shit Pile but the deck hasn't been initialised!`);
  }

  // ── 6. Post-card win check ──────────────────────────────────────
  if ((pos[botPlayerId] || 0) >= FINISH_SPACE && (pad[botPlayerId] || 0) >= 2) {
    messages.push(`${botName} reached the finish with ${pad[botPlayerId]} paddles and WINS!`);
    return {
      newGameData: {
        ...gameData,
        positions: pos,
        paddles: pad,
        skipTurn: sk,
        extraRoll: er,
        skipYellow: sy,
        dice: roll,
        winner: botPlayerId,
        deckState: currentDeckState,
        lastCard: drawnCardInfo
          ? { text: drawnCardInfo.parsedAction.text, type: drawnCardInfo.parsedAction.type }
          : gameData.lastCard,
      },
      messages,
      drawnCard: drawnCardInfo,
    };
  }

  // ── 7. Build result ─────────────────────────────────────────────
  const nextTurn = grantExtraRoll || er[botPlayerId]
    ? currentTurnIndex
    : (currentTurnIndex + 1) % players.length;

  const hasExtraRoll = grantExtraRoll || er[botPlayerId];

  if (hasExtraRoll) {
    er[botPlayerId] = false;
  }

  return {
    newGameData: {
      ...gameData,
      positions: pos,
      paddles: pad,
      skipTurn: sk,
      extraRoll: er,
      skipYellow: sy,
      dice: roll,
      currentTurn: nextTurn,
      deckState: currentDeckState,
      lastCard: drawnCardInfo
        ? { text: drawnCardInfo.parsedAction.text, type: drawnCardInfo.parsedAction.type }
        : null,
    },
    messages,
    drawnCard: drawnCardInfo,
    extraRoll: hasExtraRoll,
  };
}
