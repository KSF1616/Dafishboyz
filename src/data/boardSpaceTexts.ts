// Space texts for Shitz Creek board - spoken aloud when players land
export const SHITZ_CREEK_SPACE_TEXTS: Record<number, { text: string; sound?: 'fart' | 'flush' | 'splash' | 'bubbles' }> = {
  0: { text: "Start! Begin your journey up Shitz Creek!", sound: 'splash' },
  1: { text: "Paddle forward! The current is with you." },
  2: { text: "Watch out for floating debris!", sound: 'splash' },
  3: { text: "Shit Pile! Draw a card from the pile!", sound: 'fart' },
  4: { text: "Smooth sailing... for now." },
  5: { text: "The water gets murky here.", sound: 'bubbles' },
  6: { text: "You hear bubbling sounds from below...", sound: 'bubbles' },
  7: { text: "Shit Pile! Draw a card!", sound: 'fart' },
  8: { text: "A strong current pushes you forward!" },
  9: { text: "Something splashes nearby!", sound: 'splash' },
  10: { text: "The creek narrows here. Stay focused!" },
  11: { text: "You smell something terrible...", sound: 'fart' },
  12: { text: "Shit Pile! What will you find?", sound: 'fart' },
  13: { text: "The water churns violently!", sound: 'splash' },
  14: { text: "You're making good progress!" },
  15: { text: "Halfway there! Keep paddling!" },
  16: { text: "A toilet flushes in the distance...", sound: 'flush' },
  17: { text: "The stench is overwhelming!", sound: 'fart' },
  18: { text: "Shit Pile! Brace yourself!", sound: 'fart' },
  19: { text: "You can see the Latrine ahead!" },
  20: { text: "Almost there! Don't lose your paddles!" },
  21: { text: "The final stretch begins!", sound: 'splash' },
  22: { text: "One more push to the finish!" },
  23: { text: "Shit Pile! Last chance for a card!", sound: 'fart' },
  24: { text: "The Latrine is in sight!", sound: 'flush' },
  25: { text: "The Latrine! Do you have 2 paddles?", sound: 'flush' }
};

export const getSpaceText = (spaceIndex: number): { text: string; sound?: 'fart' | 'flush' | 'splash' | 'bubbles' } => {
  return SHITZ_CREEK_SPACE_TEXTS[spaceIndex] || { text: `Space ${spaceIndex}` };
};
