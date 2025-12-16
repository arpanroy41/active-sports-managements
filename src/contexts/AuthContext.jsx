import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, TABLES } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const fetchedUserIdRef = useRef(null);
  const initialSessionHandled = useRef(false);

  const fetchProfile = useCallback(async (userId, userObj = null) => {
    // Prevent multiple simultaneous fetches for the same user
    if (fetchingRef.current || fetchedUserIdRef.current === userId) {
      return;
    }
    
    fetchingRef.current = true;
    fetchedUserIdRef.current = userId;
    
    try {
      // OPTIMIZATION: Try to get role from JWT metadata first (instant, no DB query!)
      const roleFromJWT = userObj?.app_metadata?.role;
      
      if (roleFromJWT) {        
        // We have the role from JWT, but still need full profile data from DB
        // Set loading to false immediately with JWT data
        setProfile({
          id: userId,
          role: roleFromJWT,
          email: userObj.email || '',
          name: 'Loading...', // Will be updated by background fetch
          team_name: 'Loading...'
        });
        setLoading(false); // Unblock UI immediately!
        
        // Fetch full profile in background (non-blocking)
        supabase
          .from(TABLES.USERS)
          .select('*')
          .eq('id', userId)
          .maybeSingle()
          .then(({ data, error }) => {
            fetchingRef.current = false;
            if (!error && data) {              
              setProfile(data); // Update with full data
            } else {
              console.error('Error fetching full profile:', error);
            }
          })
          .catch((err) => {
            console.error('Profile fetch error:', err);
            fetchingRef.current = false;
          });
        
        return;
      }
      
      // Fallback: No JWT metadata, fetch from database (slower)      
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      if (data) {        
        setProfile(data);
      } else {
        console.error('No profile found for user:', userId);
        // Use fallback profile
        setProfile({ id: userId, role: 'player', name: 'User', team_name: null });
      }
    } catch (error) {
      console.error('Error fetching profile caught:', error);
      // Set a default profile so the app doesn't hang
      setProfile({ id: userId, role: 'player', name: 'User', team_name: null });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {      
      setUser(session?.user ?? null);
      if (session?.user) {        
        // Pass the user object to fetchProfile so it can use JWT metadata
        fetchProfile(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {        
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'INITIAL_SESSION') {
          // Skip - already handled by getSession above
          if (!initialSessionHandled.current) {
            initialSessionHandled.current = true;
          }
          return;
        } else if (event === 'SIGNED_IN') {
          // Fetch profile on login
          setLoading(true);
          if (session?.user) {            
            await fetchProfile(session.user.id, session.user);
          }
        } else if (event === 'USER_UPDATED') {
          // Fetch profile on profile update
          if (session?.user) {            
            await fetchProfile(session.user.id, session.user);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // JWT expired and was refreshed automatically - just update user, no need to refetch profile
          // User stays logged in seamlessly
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLoading(false);
          initialSessionHandled.current = false; // Reset for next login
          fetchedUserIdRef.current = null;
          fetchingRef.current = false;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email, password, name, teamName = null) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            team_name: teamName,
          },
        },
      });

      if (error) throw error;

      // The trigger will create the user profile automatically
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Clear profile state and reset fetch tracking
      setProfile(null);
      setUser(null);
      fetchedUserIdRef.current = null;
      fetchingRef.current = false;
    }
    return { error };
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin: profile?.role === 'admin',
    isPlayer: profile?.role === 'player',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

