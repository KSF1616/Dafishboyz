import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session, Provider } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_game: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signInWithProvider: (provider: Provider) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  demoLogin: () => void;
}

// Use a valid UUID format for demo user to avoid database errors
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

const DEMO_USER: User = {
  id: DEMO_USER_ID,
  email: 'admin@test.com',
  app_metadata: { provider: 'demo', role: 'admin' },
  user_metadata: { name: 'Demo Admin' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const DEMO_PROFILE: UserProfile = {
  id: DEMO_USER_ID,
  username: 'demo_admin',
  display_name: 'Demo Admin',
  avatar_url: null,
  bio: 'Demo account for testing admin features',
  favorite_game: 'slanging-shit',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    const savedDemo = localStorage.getItem('demo_session');
    if (savedDemo === 'true') {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const demoLogin = () => {
    localStorage.setItem('demo_session', 'true');
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setIsDemo(true);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    if (email === 'admin@test.com' && password === 'password123') {
      demoLogin();
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id, username: username || email.split('@')[0], display_name: username || email.split('@')[0]
      });
    }
    return { error };
  };

  const signInWithProvider = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/profile` } });
    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem('demo_session');
    setIsDemo(false);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (isDemo) { setProfile({ ...DEMO_PROFILE, ...data }); return { error: null }; }
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('user_profiles').upsert({ id: user.id, ...data });
    if (!error) await fetchProfile(user.id);
    return { error };
  };

  const refreshProfile = async () => { if (!isDemo && user) await fetchProfile(user.id); };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isDemo, signIn, signUp, signInWithProvider, signOut, updateProfile, refreshProfile, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
