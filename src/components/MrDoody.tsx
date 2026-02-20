import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { EquippedItems, ThemeColors, DanceFrame } from '@/types/rewards';
import { DANCE_ANIMATIONS, SOUND_EFFECTS, getRewardById } from '@/data/rewardsData';

export type MrDoodyMood = 'happy' | 'sleepy' | 'excited' | 'surprised' | 'love';

interface MrDoodyProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  interactive?: boolean;
  showMessage?: boolean;
  className?: string;
  mood?: MrDoodyMood;
  isDancing?: boolean;
  onBodyPartTap?: (part: string) => void;
  onHug?: () => void;
  enableSounds?: boolean;
  showInteractionHints?: boolean;
  equippedItems?: EquippedItems;
}

// Default colors for Mr. Doody
const DEFAULT_COLORS: ThemeColors = {
  primary: '#8B4513',
  secondary: '#A0522D',
  accent: '#654321',
  highlight: '#D2691E',
  background: '#2D1B0E'
};

// Sound effect generator with custom sounds
const useMrDoodySounds = (enabled: boolean, equippedSound?: string) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: 'hug' | 'giggle' | 'squeak' | 'boing' | 'pop' | 'snore' | 'excited' | 'kiss') => {
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
      
      // Default sounds
      switch (type) {
        case 'hug':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.4);
          break;
          
        case 'giggle':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(600, ctx.currentTime);
          oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
          oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(900, ctx.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.25);
          break;
          
        case 'squeak':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);
          break;
          
        case 'boing':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(300, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
          break;
          
        case 'pop':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
          gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);
          break;
          
        case 'snore':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(80, ctx.currentTime);
          oscillator.frequency.setValueAtTime(100, ctx.currentTime + 0.3);
          oscillator.frequency.setValueAtTime(70, ctx.currentTime + 0.6);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 0.3);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.8);
          break;
          
        case 'excited':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, ctx.currentTime);
          oscillator.frequency.setValueAtTime(500, ctx.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.4);
          break;
          
        case 'kiss':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(500, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
          oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);
          break;
      }
    } catch (e) {
      console.log('Sound not available');
    }
  }, [enabled, getAudioContext, equippedSound]);

  return { playSound };
};

const MrDoody: React.FC<MrDoodyProps> = ({
  size = 'md',
  animated = true,
  interactive = true,
  showMessage = false,
  className = '',
  mood = 'happy',
  isDancing = false,
  onBodyPartTap,
  onHug,
  enableSounds = true,
  showInteractionHints = false,
  equippedItems = {}
}) => {
  const [isWaving, setIsWaving] = useState(false);
  const [isHugging, setIsHugging] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [currentMood, setCurrentMood] = useState<MrDoodyMood>(mood);
  const [tappedPart, setTappedPart] = useState<string | null>(null);
  const [showReaction, setShowReaction] = useState<string | null>(null);
  const [danceFrame, setDanceFrame] = useState(0);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const { playSound } = useMrDoodySounds(enableSounds, equippedItems.activeSound);

  // Get theme colors
  const colors = useMemo(() => {
    if (equippedItems.activeTheme) {
      const themeReward = getRewardById(equippedItems.activeTheme);
      if (themeReward?.themeColors) {
        return themeReward.themeColors;
      }
    }
    return DEFAULT_COLORS;
  }, [equippedItems.activeTheme]);

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

  // Update mood when prop changes
  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  // Dance animation with custom frames
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

    setTappedPart(part);
    
    const reactions: Record<string, { reaction: string; sound: 'giggle' | 'squeak' | 'boing' | 'pop' | 'kiss' }> = {
      head: { reaction: '✨', sound: 'pop' },
      leftEye: { reaction: '😉', sound: 'squeak' },
      rightEye: { reaction: '😉', sound: 'squeak' },
      nose: { reaction: '🤧', sound: 'squeak' },
      mouth: { reaction: '😘', sound: 'kiss' },
      belly: { reaction: '😂', sound: 'giggle' },
      leftHand: { reaction: '🤝', sound: 'pop' },
      rightHand: { reaction: '✋', sound: 'pop' },
      leftFoot: { reaction: '🦶', sound: 'boing' },
      rightFoot: { reaction: '💃', sound: 'boing' },
    };

    const { reaction, sound } = reactions[part] || { reaction: '💫', sound: 'pop' as const };
    setShowReaction(reaction);
    playSound(sound);

    setTimeout(() => {
      setTappedPart(null);
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

  const handleMouseEnter = () => {
    if (interactive) setIsWaving(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsWaving(false);
      setHoveredPart(null);
    }
  };

  // Get eye expression based on mood
  const getEyeExpression = () => {
    switch (currentMood) {
      case 'sleepy':
        return { leftY: 62, rightY: 62, eyeHeight: 4, pupilY: 62 };
      case 'excited':
        return { leftY: 58, rightY: 58, eyeHeight: 9, pupilY: 59 };
      case 'surprised':
        return { leftY: 58, rightY: 58, eyeHeight: 10, pupilY: 58 };
      case 'love':
        return { leftY: 60, rightY: 60, eyeHeight: 7, pupilY: 61, hearts: true };
      default:
        return { leftY: 60, rightY: 60, eyeHeight: 7, pupilY: 61 };
    }
  };

  // Get mouth expression based on mood
  const getMouthPath = () => {
    switch (currentMood) {
      case 'sleepy':
        return 'M52 74 Q60 72 68 74';
      case 'excited':
        return 'M48 70 Q60 85 72 70';
      case 'surprised':
        return 'M55 72 Q60 78 65 72 Q60 84 55 72';
      case 'love':
        return 'M48 72 Q60 84 72 72';
      default:
        return 'M50 72 Q60 82 70 72';
    }
  };

  // Get dance transform from animation frames
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

  const eyeExpr = getEyeExpression();
  const danceState = getDanceTransform();

  // Render head accessories (hats, crowns, etc.)
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
            <circle cx="55" cy="25" r="1.5" fill="#FFD700" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
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
          <g>
            <ellipse cx="60" cy="22" rx="18" ry="5" fill="none" stroke={color} strokeWidth="3" 
                     className="animate-pulse" style={{ filter: 'drop-shadow(0 0 4px #FFD700)' }} />
          </g>
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
            <ellipse cx="52" cy="8" rx="6" ry="8" fill={color} />
            <ellipse cx="68" cy="8" rx="6" ry="8" fill={color} />
          </g>
        );
      default:
        return null;
    }
  };

  // Render face accessories (glasses, etc.)
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
            <path d="M42 58 L35 56" stroke={color} strokeWidth="2" />
            <path d="M78 58 L85 56" stroke={color} strokeWidth="2" />
          </g>
        );
      case 'star-glasses':
        return (
          <g>
            <polygon points="50,52 52,58 58,58 53,62 55,68 50,64 45,68 47,62 42,58 48,58" fill={color} />
            <polygon points="70,52 72,58 78,58 73,62 75,68 70,64 65,68 67,62 62,58 68,58" fill={color} />
            <path d="M58 60 L62 60" stroke={color} strokeWidth="2" />
            <path d="M42 58 L35 56" stroke={color} strokeWidth="2" />
            <path d="M78 58 L85 56" stroke={color} strokeWidth="2" />
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
              <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF0000" />
                <stop offset="25%" stopColor="#FFFF00" />
                <stop offset="50%" stopColor="#00FF00" />
                <stop offset="75%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="#FF00FF" />
              </linearGradient>
            </defs>
            <rect x="42" y="56" width="14" height="10" rx="2" fill="url(#rainbowGrad)" opacity="0.8" />
            <rect x="64" y="56" width="14" height="10" rx="2" fill="url(#rainbowGrad)" opacity="0.8" />
            <path d="M56 60 L64 60" stroke="#FFD700" strokeWidth="2" />
            <path d="M42 60 L35 58" stroke="#FFD700" strokeWidth="2" />
            <path d="M78 60 L85 58" stroke="#FFD700" strokeWidth="2" />
          </g>
        );
      default:
        return null;
    }
  };

  // Render neck accessories (bowties, necklaces, etc.)
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
              <linearGradient id="scarfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF0000" />
                <stop offset="20%" stopColor="#FF7F00" />
                <stop offset="40%" stopColor="#FFFF00" />
                <stop offset="60%" stopColor="#00FF00" />
                <stop offset="80%" stopColor="#0000FF" />
                <stop offset="100%" stopColor="#8B00FF" />
              </linearGradient>
            </defs>
            <path d="M40 85 Q60 95 80 85 L85 100 Q60 110 35 100 Z" fill="url(#scarfGrad)" opacity="0.9" />
            <path d="M35 100 L30 130 L40 128 L45 105" fill="url(#scarfGrad)" opacity="0.8" />
          </g>
        );
      default:
        return null;
    }
  };

  // Render body accessories (capes, vests, wings, etc.)
  const renderBodyAccessory = () => {
    if (!equippedItems.bodyAccessory) return null;
    const reward = getRewardById(equippedItems.bodyAccessory);
    if (!reward) return null;

    const color = reward.color || '#DC143C';

    switch (reward.id) {
      case 'superhero-cape':
        return (
          <g style={{ transform: isDancing ? `rotate(${danceState.body.bodyRotation * 0.3}deg)` : 'none', transformOrigin: '60px 90px' }}>
            <path d="M35 88 Q25 130 35 170 L60 160 L85 170 Q95 130 85 88" 
                  fill={color} opacity="0.9" />
            <path d="M35 88 Q25 130 35 170 L60 160 L85 170 Q95 130 85 88" 
                  fill="none" stroke="#8B0000" strokeWidth="2" />
          </g>
        );
      case 'royal-robe':
        return (
          <g>
            <path d="M30 88 Q20 130 30 175 L60 165 L90 175 Q100 130 90 88" 
                  fill={color} opacity="0.9" />
            <path d="M30 88 L30 100 L90 100 L90 88" fill="#FFD700" />
            <ellipse cx="35" cy="94" rx="3" ry="4" fill="white" />
            <ellipse cx="45" cy="94" rx="3" ry="4" fill="white" />
            <ellipse cx="75" cy="94" rx="3" ry="4" fill="white" />
            <ellipse cx="85" cy="94" rx="3" ry="4" fill="white" />
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
            <path d="M30 95 Q10 80 15 60" fill="none" stroke="#DDD" strokeWidth="1" />
            <path d="M90 95 Q110 80 105 60" fill="none" stroke="#DDD" strokeWidth="1" />
          </g>
        );
      default:
        return null;
    }
  };

  // Render hand accessories (wands, trophies, etc.)
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
            {isWaving && (
              <>
                <circle cx="142" cy="110" r="2" fill="#FFD700" className="animate-ping" />
                <circle cx="145" cy="120" r="1.5" fill="#FFD700" className="animate-ping" style={{ animationDelay: '0.2s' }} />
                <circle cx="140" cy="125" r="1.5" fill="#FFD700" className="animate-ping" style={{ animationDelay: '0.4s' }} />
              </>
            )}
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
            <text x="108" y="115" fontSize="8" fill="#B8860B" fontWeight="bold">#1</text>
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
            <ellipse cx="115" cy="110" rx="2" ry="1.5" fill="#1a1a1a" />
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        {/* Body accessories (behind body) - capes, wings, robes */}
        {renderBodyAccessory()}

        {/* Body */}
        <ellipse
          cx="60"
          cy="110"
          rx="25"
          ry="30"
          fill={colors.primary}
          className={`${animated && !isDancing ? 'animate-pulse' : ''} ${hoveredPart === 'belly' ? 'brightness-110' : ''}`}
          style={{ animationDuration: '3s', cursor: interactive ? 'pointer' : 'default' }}
          onClick={(e) => handleBodyPartTap('belly', e)}
          onMouseEnter={() => setHoveredPart('belly')}
          onMouseLeave={() => setHoveredPart(null)}
        />
        
        {/* Left Leg */}
        <g 
          className={animated && !isHugging && !isDancing ? 'animate-bounce' : ''} 
          style={{ 
            animationDuration: '2s', 
            animationDelay: '0.1s',
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
          <ellipse 
            cx="46" 
            cy="170" 
            rx="8" 
            ry="4" 
            fill={colors.background}
            className={hoveredPart === 'leftFoot' ? 'brightness-150' : ''}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={(e) => handleBodyPartTap('leftFoot', e)}
            onMouseEnter={() => setHoveredPart('leftFoot')}
            onMouseLeave={() => setHoveredPart(null)}
          />
        </g>
        
        {/* Right Leg */}
        <g 
          className={animated && !isHugging && !isDancing ? 'animate-bounce' : ''} 
          style={{ 
            animationDuration: '2s', 
            animationDelay: '0.3s',
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
          <ellipse 
            cx="74" 
            cy="170" 
            rx="8" 
            ry="4" 
            fill={colors.background}
            className={hoveredPart === 'rightFoot' ? 'brightness-150' : ''}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={(e) => handleBodyPartTap('rightFoot', e)}
            onMouseEnter={() => setHoveredPart('rightFoot')}
            onMouseLeave={() => setHoveredPart(null)}
          />
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
          <circle 
            cx="12" 
            cy="118" 
            r="6" 
            fill={colors.secondary}
            className={hoveredPart === 'leftHand' ? 'brightness-125' : ''}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={(e) => handleBodyPartTap('leftHand', e)}
            onMouseEnter={() => setHoveredPart('leftHand')}
            onMouseLeave={() => setHoveredPart(null)}
          />
          <circle cx="8" cy="115" r="2" fill={colors.secondary} />
          <circle cx="6" cy="119" r="2" fill={colors.secondary} />
          <circle cx="8" cy="123" r="2" fill={colors.secondary} />
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
          <circle 
            cx="108" 
            cy="118" 
            r="6" 
            fill={colors.secondary}
            className={hoveredPart === 'rightHand' ? 'brightness-125' : ''}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={(e) => handleBodyPartTap('rightHand', e)}
            onMouseEnter={() => setHoveredPart('rightHand')}
            onMouseLeave={() => setHoveredPart(null)}
          />
          <circle cx="112" cy="115" r="2" fill={colors.secondary} />
          <circle cx="114" cy="119" r="2" fill={colors.secondary} />
          <circle cx="112" cy="123" r="2" fill={colors.secondary} />
          
          {/* Hand accessory */}
          {renderHandAccessory()}
        </g>
        
        {/* Poop Head */}
        <g
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={(e) => handleBodyPartTap('head', e)}
          onMouseEnter={() => setHoveredPart('head')}
          onMouseLeave={() => setHoveredPart(null)}
          className={hoveredPart === 'head' ? 'brightness-110' : ''}
        >
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
            <ellipse 
              cx="50" 
              cy={eyeExpr.leftY} 
              rx="6" 
              ry={eyeExpr.eyeHeight} 
              fill="white"
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={(e) => handleBodyPartTap('leftEye', e)}
            />
            {eyeExpr.hearts ? (
              <text x="47" y="64" fontSize="8" fill="#FF6B6B">♥</text>
            ) : (
              <>
                <circle cx="51" cy={eyeExpr.pupilY} r="3" fill={colors.background} />
                <circle cx="52" cy={eyeExpr.pupilY - 2} r="1" fill="white" />
              </>
            )}
            
            <ellipse 
              cx="70" 
              cy={eyeExpr.rightY} 
              rx="6" 
              ry={eyeExpr.eyeHeight} 
              fill="white"
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={(e) => handleBodyPartTap('rightEye', e)}
            />
            {eyeExpr.hearts ? (
              <text x="67" y="64" fontSize="8" fill="#FF6B6B">♥</text>
            ) : (
              <>
                <circle cx="71" cy={eyeExpr.pupilY} r="3" fill={colors.background} />
                <circle cx="72" cy={eyeExpr.pupilY - 2} r="1" fill="white" />
              </>
            )}
          </g>
          
          {/* Eyebrows */}
          {currentMood === 'sleepy' ? (
            <>
              <path d="M44 54 L56 56" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M64 56 L76 54" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : currentMood === 'excited' ? (
            <>
              <path d="M44 50 Q50 46 56 50" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M64 50 Q70 46 76 50" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : currentMood === 'surprised' ? (
            <>
              <path d="M44 48 Q50 44 56 48" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M64 48 Q70 44 76 48" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M44 52 Q50 50 56 52" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M64 52 Q70 50 76 52" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}
          
          {/* Nose area */}
          <circle 
            cx="60" 
            cy="67" 
            r="5" 
            fill="transparent"
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={(e) => handleBodyPartTap('nose', e)}
          />
          
          {/* Mouth */}
          <path 
            d={getMouthPath()}
            stroke={colors.accent} 
            strokeWidth="2.5" 
            fill={currentMood === 'surprised' ? colors.primary : 'none'}
            strokeLinecap="round"
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={(e) => handleBodyPartTap('mouth', e)}
          />
          
          {currentMood === 'excited' && (
            <ellipse cx="60" cy="78" rx="4" ry="3" fill="#FF6B6B" />
          )}
          
          {/* Rosy cheeks */}
          <ellipse cx="42" cy="68" rx="4" ry="3" fill={colors.highlight} opacity={currentMood === 'love' ? 0.7 : 0.4} />
          <ellipse cx="78" cy="68" rx="4" ry="3" fill={colors.highlight} opacity={currentMood === 'love' ? 0.7 : 0.4} />
          
          {/* Mood effects */}
          {currentMood === 'sleepy' && (
            <g className="animate-pulse">
              <text x="80" y="40" fontSize="10" fill={colors.accent} fontWeight="bold">z</text>
              <text x="88" y="32" fontSize="8" fill={colors.accent} fontWeight="bold">z</text>
              <text x="94" y="26" fontSize="6" fill={colors.accent} fontWeight="bold">z</text>
            </g>
          )}
          
          {currentMood === 'excited' && (
            <g>
              <text x="25" y="40" fontSize="8" className="animate-ping">✨</text>
              <text x="85" y="35" fontSize="8" className="animate-ping" style={{ animationDelay: '0.2s' }}>✨</text>
              <text x="30" y="55" fontSize="6" className="animate-ping" style={{ animationDelay: '0.4s' }}>✨</text>
            </g>
          )}
          
          {currentMood === 'love' && (
            <g>
              <text x="20" y="35" fontSize="10" className="animate-bounce">💕</text>
              <text x="90" y="40" fontSize="8" className="animate-bounce" style={{ animationDelay: '0.3s' }}>💕</text>
            </g>
          )}
        </g>

        {/* Face accessories (glasses) - on top of face */}
        {renderFaceAccessory()}
        
        {/* Head accessories (hats, crowns) - on top of head */}
        {renderHeadAccessory()}
        
        {/* Neck accessories (bowties, necklaces) */}
        {renderNeckAccessory()}
        
        {/* Dance floor glow */}
        {isDancing && (
          <ellipse 
            cx="60" 
            cy="175" 
            rx="40" 
            ry="8" 
            fill="url(#danceGlow)"
            className="animate-pulse"
          />
        )}
        
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="danceGlow" cx="50%" cy="50%" r="50%">
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
      
      {/* Interaction hints */}
      {showInteractionHints && interactive && !tappedPart && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
          Tap different parts!
        </div>
      )}
      
      {/* Message bubble */}
      {showMessage && (
        <div className="absolute -right-4 top-0 bg-white rounded-xl p-3 shadow-lg max-w-[200px] text-xs text-gray-700 border-2 border-amber-300">
          <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
          <p className="font-medium">Let that shit go!</p>
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

export default MrDoody;
