import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

const LAST_ACTIVE_KEY = 'oss_last_active';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  partner: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const stampActivity = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    }
  };

  const fetchProfiles = async (userId: string) => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');
    
    if (profiles) {
      const myProfile = profiles.find(p => p.user_id === userId);
      const otherProfile = profiles.find(p => p.user_id !== userId);
      setProfile(myProfile || null);
      setPartner(otherProfile || null);
    }
  };

  const refreshProfiles = async () => {
    if (user) {
      await fetchProfiles(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          stampActivity();
        }
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfiles(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setPartner(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const lastActive = typeof window !== 'undefined' ? Number(localStorage.getItem(LAST_ACTIVE_KEY) || 0) : 0;
      const inactiveTooLong = lastActive && Date.now() - lastActive > WEEK_MS;

      if (session?.user && inactiveTooLong) {
        supabase.auth.signOut().finally(() => {
          setSession(null);
          setUser(null);
          setProfile(null);
          setPartner(null);
          setLoading(false);
        });
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        stampActivity();
        fetchProfiles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const mark = () => stampActivity();
    window.addEventListener('click', mark);
    window.addEventListener('keydown', mark);
    window.addEventListener('touchstart', mark);
    window.addEventListener('visibilitychange', mark);
    return () => {
      window.removeEventListener('click', mark);
      window.removeEventListener('keydown', mark);
      window.removeEventListener('touchstart', mark);
      window.removeEventListener('visibilitychange', mark);
    };
  }, [user]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: displayName }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setPartner(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LAST_ACTIVE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      partner, 
      loading, 
      signUp, 
      signIn, 
      signOut,
      refreshProfiles 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
