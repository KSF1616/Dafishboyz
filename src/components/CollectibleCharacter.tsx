import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CollectibleCharacter, CharacterMood } from '@/types/collectibles';
import { EquippedItems, ThemeColors, DanceFrame } from '@/types/rewards';
import { DANCE_ANIMATIONS, SOUND_EFFECTS, getRewardById } from '@/data/rewardsData';

interface CollectibleCharacterProps {
  character: CollectibleCharacter;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  interactive?: boolean;
  mood?: CharacterMood;
  isDancing?: boolean;
  onBodyPartTap?: (part: string) => void;
  onHug?: () => void;
  enableSounds?: boolean;
  className?: string;
  equippedItems?: EquippedItems;
}

// Sound generator hook with custom sounds
const useCharacterSounds = (enabled: boolean, characterId: string, equippedSound?: string) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: string) => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Check for custom sound effect
      const customSound = equippedSound ? SOUND_EFFECTS[equippedSound] : null;
      
      if (customSound && (type === 'hug' && customSound.type === 'hug' || 
                          type === 'giggle' && customSound.type === 'giggle')) {
        oscillator.type = customSound.waveType;
        oscillator.frequency.setValueAtTime(customSound.frequency, ctx.currentTime);
        
        if (customSound.modulation) {
          if (customSound.modulation.type === 'frequency') {
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = customSound.modulation.rate;
            lfoGain.gain.value = customSound.modulation.depth;
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            lfo.start(ctx.currentTime);
            lfo.stop(ctx.currentTime + customSound.duration);
          }
        }
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + customSound.duration);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + customSound.duration);
        return;
      }
      
      // Character-specific sound variations
      const baseFreq = characterId === 'sir-flush' ? 300 : 
                       characterId === 'princess-plop' ? 500 :
                       characterId === 'captain-clog' ? 200 :
                       characterId === 'duke-dookie' ? 350 :
                       characterId === 'lady-loo' ? 450 :
                       characterId === 'baron-bog' ? 150 :
                       characterId === 'queen-commode' ? 400 : 400;
      
      switch (type) {
        case 'hug':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, ctx.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.4);
          break;
          
        case 'giggle':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
          oscillator.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime + 0.05);
          oscillator.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.25);
          break;
          
        case 'special':
          oscillator.type = characterId === 'baron-bog' ? 'sawtooth' : 
                          characterId === 'captain-clog' ? 'square' : 'sine';
          oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
          break;
          
        default:
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.log('Sound not available');
    }
  }, [enabled, getAudioContext, characterId, equippedSound]);

  return { playSound };
};

const CollectibleCharacterComponent: React.FC<CollectibleCharacterProps> = ({
  character,
  size = 'md',
  animated = true,
  interactive = true,
  mood = 'happy',
  isDancing = false,
  onBodyPartTap,
  onHug,
  enableSounds = true,
  className = '',
  equippedItems = {}
}) => {
  const [isWaving, setIsWaving] = useState(false);
  const [isHugging, setIsHugging] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [currentMood, setCurrentMood] = useState<CharacterMood>(mood);
  const [showReaction, setShowReaction] = useState<string | null>(null);
  const [danceFrame, setDanceFrame] = useState(0);

  const { playSound } = useCharacterSounds(enableSounds, character.id, equippedItems.activeSound);

  // Get theme colors - use equipped theme or character's default colors
  const colors = useMemo(() => {
    if (equippedItems.activeTheme) {
      const themeReward = getRewardById(equippedItems.activeTheme);
      if (themeReward?.themeColors) {
        return themeReward.themeColors;
      }
    }
    // Use character's default colors
    return {
      primary: character.colors.primary,
      secondary: character.colors.secondary,
      accent: character.colors.accent,
      highlight: character.colors.highlight,
      background: '#2D1B0E'
    };
  }, [equippedItems.activeTheme, character.colors]);

  // Get dance animation
  const danceAnimation = useMemo(() => {
    if (equippedItems.activeDance) {
      const danceReward = getRewardById(equippedItems.activeDance);
      if (danceReward?.danceStyle && DANCE_ANIMATIONS[danceReward.danceStyle]) {
        return DANCE_ANIMATIONS[danceReward.danceStyle];
      }
    }
    return DANCE_ANIMATIONS['basic-bounce'];
  }, [equippedItems.activeDance]);

  const sizeMap = {
    sm: { width: 80, height: 120 },
    md: { width: 120, height: 180 },
    lg: { width: 180, height: 270 },
    xl: { width: 240, height: 360 }
  };

  const { width, height } = sizeMap[size];

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  useEffect(() => {
    if (isDancing && danceAnimation) {
      const frameCount = danceAnimation.frames.length;
      const frameDuration = danceAnimation.duration / frameCount;
      
      const interval = setInterval(() => {
        setDanceFrame(prev => (prev + 1) % frameCount);
      }, frameDuration);
      return () => clearInterval(interval);
    } else {
      setDanceFrame(0);
    }
  }, [isDancing, danceAnimation]);

  const handleBodyPartTap = useCallback((part: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive) return;

    const reactions: Record<string, string> = {
      head: '✨',
      belly: '😂',
      leftHand: '🤝',
      rightHand: '✋',
    };

    setShowReaction(reactions[part] || '💫');
    playSound('giggle');

    setTimeout(() => {
      setShowReaction(null);
    }, 800);

    onBodyPartTap?.(part);
  }, [interactive, onBodyPartTap, playSound]);

  const handleClick = useCallback(() => {
    if (!interactive) return;
    
    if (!isHugging) {
      setIsHugging(true);
      setShowHeart(true);
      playSound('hug');
      onHug?.();
      setTimeout(() => {
        setIsHugging(false);
        setShowHeart(false);
      }, 2000);
    }
  }, [interactive, isHugging, onHug, playSound]);

  const getDanceTransform = (): { body: DanceFrame; transform: string } => {
    if (!isDancing || !danceAnimation) {
      return {
        body: { bodyRotation: 0, bodyTranslateY: 0, leftArmRotation: 0, rightArmRotation: 0, leftLegRotation: 0, rightLegRotation: 0 },
        transform: ''
      };
    }
    
    const frame = danceAnimation.frames[danceFrame] || danceAnimation.frames[0];
    return {
      body: frame,
      transform: `rotate(${frame.bodyRotation}deg) translateY(${frame.bodyTranslateY}px)`
    };
  };

  const getEyeExpression = () => {
    switch (currentMood) {
      case 'sleepy':
        return { eyeHeight: 4, pupilOffset: 0 };
      case 'excited':
        return { eyeHeight: 9, pupilOffset: -1 };
      case 'surprised':
        return { eyeHeight: 10, pupilOffset: -2 };
      case 'love':
        return { eyeHeight: 7, pupilOffset: 0, hearts: true };
      case 'angry':
        return { eyeHeight: 6, pupilOffset: 1, angry: true };
      case 'proud':
        return { eyeHeight: 7, pupilOffset: 0, proud: true };
      default:
        return { eyeHeight: 7, pupilOffset: 0 };
    }
  };

  const getMouthPath = () => {
    switch (currentMood) {
      case 'sleepy':
        return 'M52 74 Q60 72 68 74';
      case 'excited':
        return 'M48 70 Q60 85 72 70';
      case 'surprised':
        return 'M55 72 Q60 78 65 72 Q60 84 55 72';
      case 'angry':
        return 'M52 76 Q60 72 68 76';
      case 'proud':
        return 'M50 72 Q60 78 70 72';
      case 'love':
        return 'M48 72 Q60 84 72 72';
      default:
        return 'M50 72 Q60 82 70 72';
    }
  };

  const eyeExpr = getEyeExpression();
  const danceState = getDanceTransform();

  // Render head accessories
  const renderHeadAccessory = () => {
    if (!equippedItems.headAccessory) return null;
    const reward = getRewardById(equippedItems.headAccessory);
    if (!reward) return null;

    const color = reward.color || '#FFD700';

    switch (reward.id) {
      case 'party-hat':
        return (
          <g className="animate-pulse" style={{ animationDuration: '3s' }}>
            <polygon points="60,5 45,35 75,35" fill={color} stroke="#FF4444" strokeWidth="1" />
            <circle cx="60" cy="5" r="4" fill="#FFD700" />
            <line x1="50" y1="15" x2="70" y2="15" stroke="#00FF00" strokeWidth="2" />
            <line x1="48" y1="25" x2="72" y2="25" stroke="#0000FF" strokeWidth="2" />
          </g>
        );
      case 'golden-crown':
        return (
          <g>
            <path d="M40 32 L45 15 L52 28 L60 8 L68 28 L75 15 L80 32 L80 38 L40 38 Z" 
                  fill={color} stroke="#B8860B" strokeWidth="1.5" />
            <circle cx="60" cy="35" r="3" fill="#FF0000" />
            <circle cx="50" cy="35" r="2" fill="#00FF00" />
            <circle cx="70" cy="35" r="2" fill="#0000FF" />
          </g>
        );
      case 'wizard-hat':
        return (
          <g>
            <path d="M40 38 Q60 35 80 38 L65 -5 Q60 -10 55 -5 Z" fill={color} />
            <ellipse cx="60" cy="38" rx="22" ry="5" fill={color} />
            <circle cx="58" cy="15" r="2" fill="#FFD700" className="animate-pulse" />
            <circle cx="65" cy="5" r="1.5" fill="#FFD700" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
          </g>
        );
      case 'flower-crown':
        return (
          <g>
            <path d="M42 35 Q60 28 78 35" fill="none" stroke="#228B22" strokeWidth="3" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${45 + i * 8}, ${32 - Math.sin(i) * 3})`}>
                <circle r="4" fill={['#FF69B4', '#FFB6C1', '#FF1493', '#FFC0CB', '#FF69B4'][i]} />
                <circle r="2" fill="#FFD700" />
              </g>
            ))}
          </g>
        );
      case 'halo':
        return (
          <ellipse cx="60" cy="22" rx="18" ry="5" fill="none" stroke={color} strokeWidth="3" 
                   className="animate-pulse" style={{ filter: 'drop-shadow(0 0 4px #FFD700)' }} />
        );
      case 'top-hat':
        return (
          <g>
            <ellipse cx="60" cy="35" rx="22" ry="5" fill={color} />
            <rect x="45" y="5" width="30" height="30" fill={color} />
            <ellipse cx="60" cy="5" rx="15" ry="4" fill={color} />
            <rect x="45" y="28" width="30" height="3" fill="#DC143C" />
          </g>
        );
      case 'santa-hat':
        return (
          <g>
            <path d="M40 38 Q45 35 60 20 Q75 5 85 15 Q80 25 75 35 Q60 40 40 38" fill={color} />
            <ellipse cx="40" cy="38" rx="12" ry="5" fill="white" />
            <circle cx="85" cy="15" r="6" fill="white" />
          </g>
        );
      case 'chef-hat':
        return (
          <g>
            <ellipse cx="60" cy="35" rx="20" ry="5" fill={color} />
            <rect x="42" y="10" width="36" height="25" fill={color} />
            <ellipse cx="60" cy="10" rx="18" ry="12" fill={color} />
          </g>
        );
      default:
        return null;
    }
  };

  // Render face accessories
  const renderFaceAccessory = () => {
    if (!equippedItems.faceAccessory) return null;
    const reward = getRewardById(equippedItems.faceAccessory);
    if (!reward) return null;

    const color = reward.color || '#1a1a1a';

    switch (reward.id) {
      case 'cool-sunglasses':
        return (
          <g>
            <rect x="42" y="56" width="14" height="10" rx="2" fill={color} />
            <rect x="64" y="56" width="14" height="10" rx="2" fill={color} />
            <path d="M56 60 L64 60" stroke={color} strokeWidth="2" />
            <path d="M42 60 L35 58" stroke={color} strokeWidth="2" />
            <path d="M78 60 L85 58" stroke={color} strokeWidth="2" />
          </g>
        );
      case 'heart-glasses':
        return (
          <g>
            <path d="M42 60 C42 55 47 52 50 56 C53 52 58 55 58 60 C58 65 50 70 50 70 C50 70 42 65 42 60" fill={color} />
            <path d="M62 60 C62 55 67 52 70 56 C73 52 78 55 78 60 C78 65 70 70 70 70 C70 70 62 65 62 60" fill={color} />
            <path d="M58 60 L62 60" stroke={color} strokeWidth="2" />
          </g>
        );
      case 'star-glasses':
        return (
          <g>
            <polygon points="50,52 52,58 58,58 53,62 55,68 50,64 45,68 47,62 42,58 48,58" fill={color} />
            <polygon points="70,52 72,58 78,58 73,62 75,68 70,64 65,68 67,62 62,58 68,58" fill={color} />
            <path d="M58 60 L62 60" stroke={color} strokeWidth="2" />
          </g>
        );
      case 'monocle-fancy':
        return (
          <g>
            <circle cx="70" cy="60" r="10" fill="none" stroke={color} strokeWidth="2" />
            <circle cx="70" cy="60" r="8" fill="rgba(200,200,255,0.2)" />
            <path d="M80 60 Q95 70 90 90" stroke={color} strokeWidth="1.5" fill="none" />
          </g>
        );
      case 'rainbow-glasses':
        return (
          <g>
            <defs>
              <linearGradient id={`rainbowGrad-${character.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF0000" />
                <stop offset="50%" stopColor="#00FF00" />
                <stop offset="100%" stopColor="#FF00FF" />
              </linearGradient>
            </defs>
            <rect x="42" y="56" width="14" height="10" rx="2" fill={`url(#rainbowGrad-${character.id})`} opacity="0.8" />
            <rect x="64" y="56" width="14" height="10" rx="2" fill={`url(#rainbowGrad-${character.id})`} opacity="0.8" />
            <path d="M56 60 L64 60" stroke="#FFD700" strokeWidth="2" />
          </g>
        );
      default:
        return null;
    }
  };

  // Render neck accessories
  const renderNeckAccessory = () => {
    if (!equippedItems.neckAccessory) return null;
    const reward = getRewardById(equippedItems.neckAccessory);
    if (!reward) return null;

    const color = reward.color || '#DC143C';

    switch (reward.id) {
      case 'red-bowtie':
        return (
          <g>
            <path d="M50 88 L60 92 L70 88 L70 96 L60 92 L50 96 Z" fill={color} />
            <circle cx="60" cy="92" r="4" fill={color} stroke="#000" strokeWidth="0.5" />
          </g>
        );
      case 'gold-chain':
        return (
          <g>
            <path d="M45 88 Q60 95 75 88" fill="none" stroke={color} strokeWidth="3" />
            <circle cx="60" cy="95" r="5" fill={color} stroke="#B8860B" strokeWidth="1" />
            <text x="57" y="98" fontSize="6" fill="#B8860B" fontWeight="bold">$</text>
          </g>
        );
      case 'pearl-necklace':
        return (
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <circle key={i} cx={45 + i * 5} cy={88 + Math.sin(i * 0.5) * 3} r="3" 
                      fill={color} stroke="#DDD" strokeWidth="0.5" />
            ))}
          </g>
        );
      case 'rainbow-scarf':
        return (
          <g>
            <defs>
              <linearGradient id={`scarfGrad-${character.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF0000" />
                <stop offset="50%" stopColor="#00FF00" />
                <stop offset="100%" stopColor="#8B00FF" />
              </linearGradient>
            </defs>
            <path d="M40 85 Q60 95 80 85 L85 100 Q60 110 35 100 Z" fill={`url(#scarfGrad-${character.id})`} opacity="0.9" />
          </g>
        );
      default:
        return null;
    }
  };

  // Render body accessories
  const renderBodyAccessory = () => {
    if (!equippedItems.bodyAccessory) return null;
    const reward = getRewardById(equippedItems.bodyAccessory);
    if (!reward) return null;

    const color = reward.color || '#DC143C';

    switch (reward.id) {
      case 'superhero-cape':
        return (
          <path d="M35 88 Q25 130 35 170 L60 160 L85 170 Q95 130 85 88" 
                fill={color} opacity="0.9" stroke="#8B0000" strokeWidth="2" />
        );
      case 'royal-robe':
        return (
          <g>
            <path d="M30 88 Q20 130 30 175 L60 165 L90 175 Q100 130 90 88" 
                  fill={color} opacity="0.9" />
            <path d="M30 88 L30 100 L90 100 L90 88" fill="#FFD700" />
          </g>
        );
      case 'sparkle-vest':
        return (
          <g>
            <path d="M42 90 L42 130 L60 135 L78 130 L78 90 Q60 85 42 90" fill={color} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={48 + (i % 3) * 10} cy={100 + Math.floor(i / 3) * 15} r="2" 
                      fill="#FFD700" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </g>
        );
      case 'angel-wings':
        return (
          <g className={isDancing ? 'animate-pulse' : ''}>
            <path d="M30 95 Q10 80 15 60 Q25 70 35 85 Q25 75 20 60 Q30 70 40 90" 
                  fill={color} opacity="0.9" />
            <path d="M90 95 Q110 80 105 60 Q95 70 85 85 Q95 75 100 60 Q90 70 80 90" 
                  fill={color} opacity="0.9" />
          </g>
        );
      default:
        return null;
    }
  };

  // Render hand accessories
  const renderHandAccessory = () => {
    if (!equippedItems.handAccessory) return null;
    const reward = getRewardById(equippedItems.handAccessory);
    if (!reward) return null;

    const color = reward.color || '#9370DB';

    switch (reward.id) {
      case 'magic-wand':
        return (
          <g style={{ transform: `rotate(${isWaving ? -30 : 0}deg)`, transformOrigin: '108px 118px', transition: 'transform 0.3s' }}>
            <rect x="108" y="115" width="25" height="4" fill="#8B4513" rx="1" />
            <polygon points="133,117 140,112 140,122" fill={color} />
            <circle cx="136" cy="117" r="4" fill="#FFD700" className="animate-pulse" 
                    style={{ filter: 'drop-shadow(0 0 4px #FFD700)' }} />
          </g>
        );
      case 'trophy':
        return (
          <g>
            <path d="M105 105 L105 115 L100 115 Q95 110 100 105 L105 105" fill={color} />
            <path d="M120 105 L120 115 L125 115 Q130 110 125 105 L120 105" fill={color} />
            <path d="M103 100 L103 118 L108 125 L117 125 L122 118 L122 100 Z" fill={color} />
            <rect x="108" y="125" width="9" height="5" fill={color} />
            <rect x="105" y="130" width="15" height="3" fill={color} />
          </g>
        );
      case 'heart-balloon':
        return (
          <g className="animate-bounce" style={{ animationDuration: '2s' }}>
            <path d="M115 80 C115 70 125 65 130 72 C135 65 145 70 145 80 C145 95 130 105 130 105 C130 105 115 95 115 80" 
                  fill={color} />
            <path d="M130 105 L125 120" stroke={color} strokeWidth="1" />
          </g>
        );
      case 'teddy-bear':
        return (
          <g>
            <ellipse cx="115" cy="115" rx="10" ry="12" fill={color} />
            <circle cx="110" cy="105" r="5" fill={color} />
            <circle cx="120" cy="105" r="5" fill={color} />
            <circle cx="115" cy="108" r="7" fill={color} />
            <circle cx="112" cy="106" r="2" fill="#1a1a1a" />
            <circle cx="118" cy="106" r="2" fill="#1a1a1a" />
          </g>
        );
      default:
        return null;
    }
  };

  // Render character's built-in accessories
  const renderCharacterAccessories = () => {
    return character.accessories.map((accessory, index) => {
      switch (accessory.type) {
        case 'crown':
          return (
            <g key={index}>
              <path
                d="M45 28 L50 18 L55 25 L60 15 L65 25 L70 18 L75 28 L75 32 L45 32 Z"
                fill={accessory.color}
                stroke="#B8860B"
                strokeWidth="1"
              />
              <circle cx="60" cy="30" r="2" fill="#FF0000" />
              <circle cx="52" cy="30" r="1.5" fill="#00FF00" />
              <circle cx="68" cy="30" r="1.5" fill="#0000FF" />
            </g>
          );
        case 'tiara':
          return (
            <g key={index}>
              <path
                d="M48 30 Q60 20 72 30"
                fill="none"
                stroke={accessory.color}
                strokeWidth="3"
              />
              <circle cx="60" cy="22" r="3" fill="#FF69B4" />
              <circle cx="52" cy="26" r="2" fill="#FFB6C1" />
              <circle cx="68" cy="26" r="2" fill="#FFB6C1" />
            </g>
          );
        case 'hat':
          return (
            <g key={index}>
              <ellipse cx="60" cy="30" rx="20" ry="5" fill={accessory.color} />
              <path
                d="M50 30 L50 15 Q60 5 70 15 L70 30"
                fill={accessory.color}
              />
              <ellipse cx="60" cy="15" rx="10" ry="3" fill={accessory.color} />
              {character.id === 'captain-clog' && (
                <g>
                  <circle cx="60" cy="20" r="4" fill="white" />
                  <path d="M54 26 L66 26" stroke="white" strokeWidth="2" />
                  <circle cx="58" cy="19" r="1" fill="black" />
                  <circle cx="62" cy="19" r="1" fill="black" />
                </g>
              )}
            </g>
          );
        case 'eyepatch':
          return (
            <g key={index}>
              <ellipse cx="50" cy="60" rx="8" ry="6" fill={accessory.color} />
              <path d="M42 55 Q30 50 25 45" stroke={accessory.color} strokeWidth="2" fill="none" />
              <path d="M58 55 Q75 50 85 55" stroke={accessory.color} strokeWidth="2" fill="none" />
            </g>
          );
        case 'monocle':
          return (
            <g key={index}>
              <circle cx="70" cy="60" r="8" fill="none" stroke={accessory.color} strokeWidth="2" />
              <path d="M78 60 Q90 65 95 80" stroke={accessory.color} strokeWidth="1" fill="none" />
            </g>
          );
        case 'bowtie':
          return (
            <g key={index}>
              <path
                d="M50 88 L60 92 L70 88 L70 96 L60 92 L50 96 Z"
                fill={accessory.color}
              />
              <circle cx="60" cy="92" r="3" fill={accessory.color} stroke="#000" strokeWidth="0.5" />
            </g>
          );
        case 'cape':
          return (
            <g key={index}>
              <path
                d="M35 90 Q30 130 40 160 L60 150 L80 160 Q90 130 85 90"
                fill={accessory.color}
                opacity="0.8"
              />
            </g>
          );
        case 'sword':
          return (
            <g key={index} style={{ transform: 'rotate(-30deg)', transformOrigin: '100px 100px' }}>
              <rect x="95" y="105" width="25" height="3" fill={accessory.color} />
              <rect x="92" y="102" width="5" height="9" fill="#8B4513" />
              <circle cx="94" cy="106" r="2" fill="#FFD700" />
            </g>
          );
        case 'wand':
          return (
            <g key={index}>
              <rect x="105" y="100" width="20" height="3" fill="#8B4513" rx="1" />
              <polygon points="125,101.5 130,98 130,105" fill={accessory.color} />
              <circle cx="127" cy="101.5" r="3" fill="#FFD700" className="animate-pulse" />
            </g>
          );
        case 'hook':
          return (
            <g key={index}>
              <path
                d="M12 118 Q5 115 5 125 Q5 135 15 135"
                fill="none"
                stroke={accessory.color}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          );
        default:
          return null;
      }
    });
  };

  // Character-specific decorations
  const renderCharacterDecorations = () => {
    switch (character.id) {
      case 'sir-flush':
        return (
          <g className={isDancing ? 'animate-pulse' : ''}>
            <path d="M30 95 L25 85 L35 85 Z" fill="#FFD700" opacity="0.6" />
            <path d="M90 95 L85 85 L95 85 Z" fill="#FFD700" opacity="0.6" />
          </g>
        );
      case 'princess-plop':
        return (
          <g>
            {[...Array(5)].map((_, i) => (
              <circle
                key={i}
                cx={30 + i * 15}
                cy={25 + (i % 2) * 5}
                r="2"
                fill="#FFB6C1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </g>
        );
      case 'captain-clog':
        return (
          <g>
            <circle cx="25" cy="140" r="3" fill="#FFD700" />
            <circle cx="95" cy="145" r="2" fill="#FFD700" />
            <circle cx="30" cy="155" r="2.5" fill="#FFD700" />
          </g>
        );
      case 'baron-bog':
        return (
          <g className="animate-pulse" style={{ opacity: 0.5 }}>
            <ellipse cx="60" cy="175" rx="35" ry="8" fill="#4B0082" />
          </g>
        );
      case 'queen-commode':
        return (
          <g>
            {[...Array(8)].map((_, i) => (
              <circle
                key={i}
                cx={20 + i * 12}
                cy={20 + Math.sin(i) * 10}
                r="1.5"
                fill="#FFD700"
                className="animate-ping"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '2s' }}
              />
            ))}
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative inline-block ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => interactive && setIsWaving(true)}
      onMouseLeave={() => interactive && setIsWaving(false)}
      style={{ transform: danceState.transform, transition: isDancing ? 'none' : 'transform 0.3s ease' }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'transition-transform duration-300' : ''}
        style={{ transform: isHugging ? 'scale(1.1)' : 'scale(1)' }}
      >
        {/* Character-specific decorations (background) */}
        {renderCharacterDecorations()}

        {/* Body accessories (behind body) - equipped rewards */}
        {renderBodyAccessory()}

        {/* Cape (behind body) - character's built-in */}
        {character.accessories.find(a => a.type === 'cape') && (
          <path
            d="M35 90 Q30 130 40 160 L60 150 L80 160 Q90 130 85 90"
            fill={character.accessories.find(a => a.type === 'cape')?.color}
            opacity="0.8"
          />
        )}

        {/* Body */}
        <ellipse
          cx="60"
          cy="110"
          rx="25"
          ry="30"
          fill={colors.primary}
          className={`${animated && !isDancing ? 'animate-pulse' : ''}`}
          style={{ animationDuration: '3s', cursor: interactive ? 'pointer' : 'default' }}
          onClick={(e) => handleBodyPartTap('belly', e)}
        />
        
        {/* Left Leg */}
        <g 
          style={{ 
            transform: isDancing ? `rotate(${danceState.body.leftLegRotation}deg)` : 'rotate(0deg)',
            transformOrigin: '47px 135px',
            transition: isDancing ? 'none' : 'transform 0.3s ease'
          }}
        >
          <path
            d="M45 135 L40 165 Q38 170 42 170 L50 170 Q54 170 52 165 L50 140"
            fill={colors.primary}
            stroke={colors.accent}
            strokeWidth="1"
          />
          <ellipse cx="46" cy="170" rx="8" ry="4" fill={colors.accent} />
        </g>
        
        {/* Right Leg */}
        <g 
          style={{ 
            transform: isDancing ? `rotate(${danceState.body.rightLegRotation}deg)` : 'rotate(0deg)',
            transformOrigin: '73px 135px',
            transition: isDancing ? 'none' : 'transform 0.3s ease'
          }}
        >
          <path
            d="M75 135 L80 165 Q82 170 78 170 L70 170 Q66 170 68 165 L70 140"
            fill={colors.primary}
            stroke={colors.accent}
            strokeWidth="1"
          />
          <ellipse cx="74" cy="170" rx="8" ry="4" fill={colors.accent} />
        </g>
        
        {/* Left Arm */}
        <g 
          style={{ 
            transformOrigin: '35px 100px',
            transform: isWaving ? 'rotate(-30deg)' : isHugging ? 'rotate(45deg)' : isDancing ? `rotate(${danceState.body.leftArmRotation}deg)` : 'rotate(0deg)',
            transition: isDancing ? 'none' : 'transform 0.3s ease'
          }}
        >
          <path
            d="M35 95 Q15 100 10 115 Q8 120 12 122 L18 120 Q25 110 35 105"
            fill={colors.primary}
            stroke={colors.accent}
            strokeWidth="1"
          />
          {character.accessories.find(a => a.type === 'hook') ? (
            <path
              d="M12 118 Q5 115 5 125 Q5 135 15 135"
              fill="none"
              stroke="#C0C0C0"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <>
              <circle cx="12" cy="118" r="6" fill={colors.secondary} />
              <circle cx="8" cy="115" r="2" fill={colors.secondary} />
              <circle cx="6" cy="119" r="2" fill={colors.secondary} />
              <circle cx="8" cy="123" r="2" fill={colors.secondary} />
            </>
          )}
        </g>
        
        {/* Right Arm */}
        <g 
          style={{ 
            transformOrigin: '85px 100px',
            transform: isWaving ? 'rotate(30deg)' : isHugging ? 'rotate(-45deg)' : isDancing ? `rotate(${danceState.body.rightArmRotation}deg)` : 'rotate(0deg)',
            transition: isDancing ? 'none' : 'transform 0.3s ease'
          }}
        >
          <path
            d="M85 95 Q105 100 110 115 Q112 120 108 122 L102 120 Q95 110 85 105"
            fill={colors.primary}
            stroke={colors.accent}
            strokeWidth="1"
          />
          <circle cx="108" cy="118" r="6" fill={colors.secondary} />
          <circle cx="112" cy="115" r="2" fill={colors.secondary} />
          <circle cx="114" cy="119" r="2" fill={colors.secondary} />
          <circle cx="112" cy="123" r="2" fill={colors.secondary} />
          
          {/* Hand accessory */}
          {renderHandAccessory()}
        </g>
        
        {/* Poop Head */}
        <g onClick={(e) => handleBodyPartTap('head', e)}>
          <ellipse cx="60" cy="75" rx="28" ry="18" fill={colors.primary} />
          <ellipse cx="60" cy="58" rx="22" ry="15" fill={colors.primary} />
          <ellipse cx="60" cy="45" rx="15" ry="12" fill={colors.primary} />
          <ellipse cx="62" cy="32" rx="8" ry="8" fill={colors.primary} />
          <path d="M62 24 Q68 28 65 35 Q60 30 62 24" fill={colors.primary} />
          
          {/* Highlights */}
          <ellipse cx="50" cy="50" rx="4" ry="6" fill={colors.secondary} opacity="0.5" />
          <ellipse cx="70" cy="65" rx="3" ry="5" fill={colors.secondary} opacity="0.5" />
          
          {/* Eyes */}
          <g>
            {!character.accessories.find(a => a.type === 'eyepatch') ? (
              <>
                <ellipse cx="50" cy="60" rx="6" ry={eyeExpr.eyeHeight} fill="white" />
                {eyeExpr.hearts ? (
                  <text x="47" y="64" fontSize="8" fill="#FF6B6B">♥</text>
                ) : (
                  <>
                    <circle cx="51" cy={60 + eyeExpr.pupilOffset} r="3" fill={colors.accent} />
                    <circle cx="52" cy={58 + eyeExpr.pupilOffset} r="1" fill="white" />
                  </>
                )}
              </>
            ) : (
              <ellipse cx="50" cy="60" rx="8" ry="6" fill="#000000" />
            )}
            
            <ellipse cx="70" cy="60" rx="6" ry={eyeExpr.eyeHeight} fill="white" />
            {eyeExpr.hearts ? (
              <text x="67" y="64" fontSize="8" fill="#FF6B6B">♥</text>
            ) : (
              <>
                <circle cx="71" cy={60 + eyeExpr.pupilOffset} r="3" fill={colors.accent} />
                <circle cx="72" cy={58 + eyeExpr.pupilOffset} r="1" fill="white" />
              </>
            )}
          </g>
          
          {/* Eyebrows */}
          {eyeExpr.angry ? (
            <>
              <path d="M44 52 L56 56" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M64 56 L76 52" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : eyeExpr.proud ? (
            <>
              <path d="M44 54 L56 52" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M64 52 L76 54" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M44 52 Q50 50 56 52" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M64 52 Q70 50 76 52" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}
          
          {/* Mouth */}
          <path 
            d={getMouthPath()}
            stroke={colors.accent} 
            strokeWidth="2.5" 
            fill={currentMood === 'surprised' ? colors.primary : 'none'}
            strokeLinecap="round"
          />
          
          {/* Rosy cheeks */}
          <ellipse cx="42" cy="68" rx="4" ry="3" fill={colors.highlight} opacity={currentMood === 'love' ? 0.7 : 0.4} />
          <ellipse cx="78" cy="68" rx="4" ry="3" fill={colors.highlight} opacity={currentMood === 'love' ? 0.7 : 0.4} />
        </g>

        {/* Character's built-in accessories */}
        {renderCharacterAccessories()}
        
        {/* Equipped face accessories */}
        {renderFaceAccessory()}
        
        {/* Equipped head accessories */}
        {renderHeadAccessory()}
        
        {/* Equipped neck accessories */}
        {renderNeckAccessory()}

        {/* Bowtie - character's built-in */}
        {character.accessories.find(a => a.type === 'bowtie') && !equippedItems.neckAccessory && (
          <g>
            <path
              d="M50 88 L60 92 L70 88 L70 96 L60 92 L50 96 Z"
              fill={character.accessories.find(a => a.type === 'bowtie')?.color}
            />
            <circle cx="60" cy="92" r="3" fill={character.accessories.find(a => a.type === 'bowtie')?.color} stroke="#000" strokeWidth="0.5" />
          </g>
        )}

        {/* Monocle - character's built-in */}
        {character.accessories.find(a => a.type === 'monocle') && !equippedItems.faceAccessory && (
          <g>
            <circle cx="70" cy="60" r="8" fill="none" stroke={character.accessories.find(a => a.type === 'monocle')?.color} strokeWidth="2" />
            <path d="M78 60 Q90 65 95 80" stroke={character.accessories.find(a => a.type === 'monocle')?.color} strokeWidth="1" fill="none" />
          </g>
        )}

        {/* Dance floor glow */}
        {isDancing && (
          <ellipse 
            cx="60" 
            cy="175" 
            rx="40" 
            ry="8" 
            fill={`url(#danceGlow-${character.id})`}
            className="animate-pulse"
          />
        )}
        
        <defs>
          <radialGradient id={`danceGlow-${character.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.highlight} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.highlight} stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Floating Heart */}
      {showHeart && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="30" height="30" viewBox="0 0 24 24" fill={colors.highlight}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      )}
      
      {/* Reaction popup */}
      {showReaction && (
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-2xl animate-bounce pointer-events-none"
          style={{ animation: 'floatUp 0.8s ease-out forwards' }}
        >
          {showReaction}
        </div>
      )}
      
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -200%) scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default CollectibleCharacterComponent;
export { CollectibleCharacterComponent as CollectibleCharacter };
