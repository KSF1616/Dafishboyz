import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/contexts/FriendsContext';
import { useLogo } from '@/contexts/LogoContext';
import { Settings, User, LogOut, Trophy, UserCircle, Users, Zap, Tv, Eye, GraduationCap, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationBell from '@/components/NotificationBell';

interface HeaderProps {
  onCartClick: () => void;
  onNavClick: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, onNavClick }) => {
  const { itemCount } = useCart();
  const { user, profile, signOut, isDemo } = useAuth();
  const { pendingRequests } = useFriends();
  const { logoUrl } = useLogo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ['Games', 'Pricing', 'Reviews', 'About'];
  const tournamentNav = { label: 'Tournaments', path: '/tournaments', icon: Trophy };

  const initials = (profile?.display_name || user?.email || 'U').slice(0, 2).toUpperCase();


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
          {/* Logo - Dynamic from LogoContext */}
          <div className="relative">
            <img 
              src={logoUrl} 
              alt="Dafish Boyz Logo" 
              className="w-12 h-12 object-contain rounded-lg shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-500/20 to-lime-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-black text-white block leading-tight">
              Fun<span className="text-amber-400">Shit</span>Games
            </span>
            <span className="text-xs text-gray-500">by Dafish Boyz</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button key={item} onClick={() => onNavClick(item.toLowerCase())} className="text-gray-300 hover:text-amber-400 transition-colors font-medium">
              {item}
            </button>
          ))}
          <Link to="/practice" className="text-gray-300 hover:text-purple-400 transition-colors font-medium flex items-center gap-1">
            <GraduationCap className="w-4 h-4" /> Practice
          </Link>
          <Link to="/spectator" className="text-gray-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1">
            <Tv className="w-4 h-4" /> Spectator
          </Link>
          <Link to="/tournaments" className="text-gray-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1">
            <Trophy className="w-4 h-4" /> Tournaments
          </Link>
          <Link to="/leaderboard" className="text-gray-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1">
            <Trophy className="w-4 h-4" /> Leaderboard
          </Link>
          <div className="relative group">
            <button className="text-gray-300 hover:text-amber-400 transition-colors font-medium">
              Game Tools
            </button>
            <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-amber-500/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <Link to="/practice" className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-gray-800 transition-colors text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Practice Mode
              </Link>
              <Link to="/drop-deuce-rules" className="block px-4 py-3 text-gray-300 hover:text-amber-400 hover:bg-gray-800 transition-colors text-sm">
                Drop A Deuce Rules & Music
              </Link>

              <Link to="/let-that-shit-go-rules" className="block px-4 py-3 text-gray-300 hover:text-amber-400 hover:bg-gray-800 transition-colors text-sm">
                Let That Shit Go Rules
              </Link>
              <Link to="/shito-calling-cards" className="block px-4 py-3 text-gray-300 hover:text-amber-400 hover:bg-gray-800 transition-colors text-sm">
                Shito Calling Cards
              </Link>
            </div>
          </div>

        </nav>



        <div className="flex items-center gap-3">
          {isDemo && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 text-xs font-semibold">
              <Zap className="w-3 h-3" /> Demo Mode
            </span>
          )}
          {user ? (
            <>
              <NotificationBell />
              <Link to="/friends" className="relative p-2 text-gray-400 hover:text-amber-400 transition-colors" title="Friends">
                <Users className="w-5 h-5" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors">
                <Avatar className="w-8 h-8 border border-amber-500/50">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium">{profile?.display_name || 'Profile'}</span>
              </Link>
              <Link to="/admin/upload" className="p-2 text-gray-400 hover:text-amber-400 transition-colors" title="Admin">
                <Settings className="w-5 h-5" />
              </Link>
              <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Sign Out">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link to="/login" className="p-2 text-gray-400 hover:text-amber-400 transition-colors" title="Login">
              <User className="w-5 h-5" />
            </Link>
          )}

          <button onClick={onCartClick} className="relative p-2 text-white hover:text-amber-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-lime-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-amber-500/30 px-4 py-4">
          {navItems.map(item => (
            <button key={item} onClick={() => { onNavClick(item.toLowerCase()); setMobileMenuOpen(false); }} className="block w-full text-left py-3 text-gray-300 hover:text-amber-400">
              {item}
            </button>
          ))}
          <Link to="/practice" className="block w-full text-left py-3 text-gray-300 hover:text-purple-400 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <GraduationCap className="w-4 h-4" /> Practice Mode
          </Link>
          <Link to="/spectator" className="block w-full text-left py-3 text-gray-300 hover:text-amber-400 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Tv className="w-4 h-4" /> Spectator
          </Link>
          <Link to="/leaderboard" className="block w-full text-left py-3 text-gray-300 hover:text-amber-400 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Trophy className="w-4 h-4" /> Leaderboard
          </Link>
          <div className="border-t border-gray-800 my-2 pt-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Game Tools</p>
            <Link to="/drop-deuce-rules" className="block w-full text-left py-2 text-gray-300 hover:text-amber-400 text-sm" onClick={() => setMobileMenuOpen(false)}>
              Drop A Deuce Rules & Music
            </Link>

            <Link to="/let-that-shit-go-rules" className="block w-full text-left py-2 text-gray-300 hover:text-amber-400 text-sm" onClick={() => setMobileMenuOpen(false)}>
              Let That Shit Go Rules
            </Link>
            <Link to="/shito-calling-cards" className="block w-full text-left py-2 text-gray-300 hover:text-amber-400 text-sm" onClick={() => setMobileMenuOpen(false)}>
              Shito Calling Cards
            </Link>
          </div>


          {user ? (
            <>
              <Link to="/friends" className="block w-full text-left py-3 text-gray-300 hover:text-amber-400 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Users className="w-4 h-4" /> Friends {pendingRequests.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{pendingRequests.length}</span>}
              </Link>
              <Link to="/profile" className="block w-full text-left py-3 text-gray-300 hover:text-amber-400 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <UserCircle className="w-4 h-4" /> My Profile
              </Link>
              <Link to="/admin/upload" className="block w-full text-left py-3 text-gray-300 hover:text-amber-400" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
              <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="block w-full text-left py-3 text-gray-300 hover:text-red-400">Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="block w-full text-left py-3 text-gray-300 hover:text-amber-400" onClick={() => setMobileMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </header>

  );
};

export default Header;
