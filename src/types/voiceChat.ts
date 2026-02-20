export type VoiceMode = 'push-to-talk' | 'voice-activation';

export interface VoiceParticipant {
  odplayerId: string;
  playerName: string;
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number;
  isConnected: boolean;
  audioLevel: number;
}

export interface VoiceSettings {
  mode: VoiceMode;
  inputDevice: string;
  outputDevice: string;
  inputVolume: number;
  outputVolume: number;
  voiceActivationThreshold: number;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

export interface PeerConnection {
  playerId: string;
  connection: RTCPeerConnection;
  audioStream?: MediaStream;
  audioElement?: HTMLAudioElement;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  from: string;
  to?: string;
  payload?: any;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  mode: 'push-to-talk',
  inputDevice: 'default',
  outputDevice: 'default',
  inputVolume: 100,
  outputVolume: 100,
  voiceActivationThreshold: 30,
  noiseSuppression: true,
  echoCancellation: true
};

export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
