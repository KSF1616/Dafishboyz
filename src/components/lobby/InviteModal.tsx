import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Copy, Check, Mail, MessageCircle, Share2, Link2, Users } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  gameName: string;
}

export default function InviteModal({ isOpen, onClose, roomCode, gameName }: Props) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${window.location.origin}/lobby?code=${roomCode}`;
  const message = `Join my ${gameName} game! Room code: ${roomCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: string) => {
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + inviteUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(inviteUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}&quote=${encodeURIComponent(message)}`,
      email: `mailto:?subject=${encodeURIComponent(`Join my ${gameName} game!`)}&body=${encodeURIComponent(message + '\n\n' + inviteUrl)}`,
    };
    window.open(urls[platform], '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />Invite Friends
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-2">Room Code</p>
            <p className="text-4xl font-mono font-bold text-white tracking-widest">{roomCode}</p>
            <Button onClick={copyCode} variant="ghost" size="sm" className="mt-2 text-purple-400">
              {copied ? <><Check className="w-4 h-4 mr-1" />Copied!</> : <><Copy className="w-4 h-4 mr-1" />Copy Code</>}
            </Button>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400 text-sm mb-2">Share Link</p>
            <div className="flex gap-2">
              <Input value={inviteUrl} readOnly className="bg-gray-700 border-gray-600 text-white text-sm" />
              <Button onClick={copyLink} size="icon" className="bg-purple-600"><Link2 className="w-4 h-4" /></Button>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-3">Share via</p>
            <div className="grid grid-cols-4 gap-2">
              <Button onClick={() => shareVia('whatsapp')} className="bg-green-600 hover:bg-green-700 flex-col h-16">
                <MessageCircle className="w-5 h-5 mb-1" /><span className="text-xs">WhatsApp</span>
              </Button>
              <Button onClick={() => shareVia('twitter')} className="bg-blue-500 hover:bg-blue-600 flex-col h-16">
                <Share2 className="w-5 h-5 mb-1" /><span className="text-xs">Twitter</span>
              </Button>
              <Button onClick={() => shareVia('facebook')} className="bg-blue-700 hover:bg-blue-800 flex-col h-16">
                <Share2 className="w-5 h-5 mb-1" /><span className="text-xs">Facebook</span>
              </Button>
              <Button onClick={() => shareVia('email')} className="bg-gray-600 hover:bg-gray-700 flex-col h-16">
                <Mail className="w-5 h-5 mb-1" /><span className="text-xs">Email</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
