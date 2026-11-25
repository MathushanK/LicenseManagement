'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User { id: number; username: string; fullName: string; role: string; }
interface AuthContextType { user: User | null; token: string | null; login: (username: string, password: string) => Promise<void>; logout: (redirect?: boolean) => void; isLoading: boolean; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

function isExpired(token: string) { try { const payload = JSON.parse(atob(token.split('.')[1])); return !payload.exp || payload.exp * 1000 <= Date.now(); } catch { return true; } }
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [token, setToken] = useState<string | null>(null); const [isLoading, setIsLoading] = useState(true); const router = useRouter();
  const logout = (redirect = true) => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); if (redirect) router.replace('/login'); };
  useEffect(() => { const restore = async () => { const storedToken = localStorage.getItem('token'); if (!storedToken || isExpired(storedToken)) { if (storedToken) logout(false); setIsLoading(false); return; } try { const response = await axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${storedToken}` } }); setToken(storedToken); setUser(response.data.user); localStorage.setItem('user', JSON.stringify(response.data.user)); } catch { logout(false); } finally { setIsLoading(false); } }; void restore(); }, []);
  const login = async (username: string, password: string) => { const response = await axios.post(`${API_URL}/auth/login`, { username, password }); const { token: nextToken, user: nextUser } = response.data; if (!nextToken || isExpired(nextToken)) throw new Error('Invalid session token'); localStorage.setItem('token', nextToken); localStorage.setItem('user', JSON.stringify(nextUser)); setToken(nextToken); setUser(nextUser); router.replace('/dashboard'); };
  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context; }
