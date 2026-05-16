// src/auth/AuthContext.jsx
// Provides login/logout state and helpers to the entire app via React Context.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:8000/api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('apex_token'));
  const [loading, setLoading] = useState(true); // true while verifying stored token
  const [error, setError]     = useState('');

  // On mount: if we have a stored token, verify it with the server
  useEffect(() => {
    if (!token) { setLoading(false); return; }

    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user);
        else           handleLogout();          // token invalid/expired
      })
      .catch(() => handleLogout())
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // Login: POST credentials → receive JWT → store in localStorage
  const login = useCallback(async (email, password) => {
    setError('');
    try {
      const res  = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return false;
      }

      localStorage.setItem('apex_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch {
      setError('Cannot reach server. Is the backend running?');
      return false;
    }
  }, []);

  // Logout: clear local state + storage
  const handleLogout = useCallback(() => {
    localStorage.removeItem('apex_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout: handleLogout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}