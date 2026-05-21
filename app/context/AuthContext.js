'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);
  const [prefersVideo, setPrefersVideo] = useState(false);

  // Fetch current session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();

    // Load video preference
    const storedVideoPref = localStorage.getItem('prefersVideo');
    if (storedVideoPref === 'true') {
      setPrefersVideo(true);
    }
  }, []);

  const toggleVideoPreference = () => {
    setPrefersVideo(prev => {
      const newVal = !prev;
      localStorage.setItem('prefersVideo', newVal ? 'true' : 'false');
      return newVal;
    });
  };

  const openAuthModal = (callback = null) => {
    if (callback && typeof callback === 'function') {
      setAuthSuccessCallback(() => callback);
    } else {
      setAuthSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthSuccessCallback(null);
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    setUser(data.user);
    setIsAuthModalOpen(false);
    
    if (authSuccessCallback) {
      authSuccessCallback(data.user);
      setAuthSuccessCallback(null);
    }
    return data.user;
  };

  const register = async (email, password, name) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register');
    }

    setUser(data.user);
    setIsAuthModalOpen(false);

    if (authSuccessCallback) {
      authSuccessCallback(data.user);
      setAuthSuccessCallback(null);
    }
    return data.user;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        prefersVideo,
        toggleVideoPreference,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
