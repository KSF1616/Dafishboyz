import React, { useEffect, useRef } from 'react';
import { CoachMessage } from '@/types/practiceMode';
import { Lightbulb, AlertTriangle, Trophy, BookOpen, Target, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CoachBotPanelProps {
  messages: CoachMessage[];
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClearMessages: () => void;
  gameName: string;
}

const CoachBotPanel: React.FC<CoachBotPanelProps> = ({
  messages,
  isMinimized,
  onToggleMinimize,
  onClearMessages,
  gameName
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageIcon = (type: CoachMessage['type']) => {
    switch (type) {
      case 'hint':
        return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'praise':
        return <Trophy className="w-5 h-5 text-green-400" />;
      case 'strategy':
        return <Target className="w-5 h-5 text-blue-400" />;
      case 'explanation':
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-400" />;
    }
  };

  const getMessageStyle = (type: CoachMessage['type']) => {
    switch (type) {
      case 'hint':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/30';
      case 'praise':
        return 'bg-green-500/10 border-green-500/30';
      case 'strategy':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'explanation':
        return 'bg-purple-500/10 border-purple-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 hover:scale-105"
      >
        <div className="relative">
          <Bot className="w-6 h-6" />
          {messages.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {messages.length > 9 ? '9+' : messages.length}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl border border-purple-500/30 shadow-xl shadow-purple-500/10 overflow-hidden w-80">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Coach Bot</h3>
              <p className="text-purple-200 text-xs">{gameName} Expert</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={onClearMessages}
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={onToggleMinimize}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Minimize
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-80" ref={scrollRef}>
        <div className="p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                I'm here to help! Click "Get Hint" for tips and strategies.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${getMessageStyle(message.type)} animate-in slide-in-from-right-5 duration-300`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getMessageIcon(message.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-white text-sm">
                        {message.title}
                      </h4>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-3 bg-slate-800/50 border-t border-purple-500/20">
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
            Hints: {messages.filter(m => m.type === 'hint').length}
          </span>
          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
            Praise: {messages.filter(m => m.type === 'praise').length}
          </span>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
            Tips: {messages.filter(m => m.type === 'strategy').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CoachBotPanel;
