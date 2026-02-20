import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Save, X, Trophy, Gamepad2, Calendar } from 'lucide-react';

interface ProfileHeaderProps {
  stats: { totalGames: number; wins: number; currentStreak: number };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ stats }) => {
  const { user, profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ display_name: displayName, bio });
    setSaving(false);
    setEditing(false);
  };

  const initials = (profile?.display_name || user?.email || 'U').slice(0, 2).toUpperCase();
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="bg-gradient-to-r from-purple-600 to-amber-500 rounded-2xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Avatar className="w-24 h-24 border-4 border-white/30">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left">
          {editing ? (
            <div className="space-y-3">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display Name" className="bg-white/20 border-white/30 text-white placeholder:text-white/60" />
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="bg-white/20 border-white/30 text-white placeholder:text-white/60" rows={2} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-white text-purple-600 hover:bg-white/90">
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-white hover:bg-white/20">
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold">{profile?.display_name || profile?.username || 'Player'}</h1>
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="text-white/80 hover:text-white hover:bg-white/20">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-white/80 mt-1">@{profile?.username || 'username'}</p>
              {profile?.bio && <p className="text-white/90 mt-2">{profile.bio}</p>}
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-white/70 text-sm">
                <Calendar className="w-4 h-4" /> Joined {joinDate}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-6 text-center">
          <div className="bg-white/20 rounded-xl p-4 min-w-[80px]">
            <Gamepad2 className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <div className="text-xs text-white/80">Games</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 min-w-[80px]">
            <Trophy className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.wins}</div>
            <div className="text-xs text-white/80">Wins</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 min-w-[80px]">
            <span className="text-2xl">🔥</span>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-white/80">Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
