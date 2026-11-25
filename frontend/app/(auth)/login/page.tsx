'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Image from 'next/image'; import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, UserRound, ArrowRight, Moon, Sun, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion'; import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext'; import { useTheme } from '@/context/ThemeContext'; import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); const { theme, toggleTheme } = useTheme(); const router = useRouter();
  useEffect(() => {
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const seenLanding = sessionStorage.getItem('leco-login-landing-seen');
    if (entry?.type === 'reload' && !seenLanding) { sessionStorage.setItem('leco-login-landing-seen', 'true'); router.replace('/?returnToLogin=1'); }
  }, [router]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setIsLoading(true); try { await login(username, password); } catch (error: any) { toast.error(error.response?.data?.message || 'Unable to sign in. Check your credentials.'); } finally { setIsLoading(false); } };
  return <main className="login-page"><header className="login-header"><Link href="/" className="landing-brand"><Image src="/leco-logo.png" alt="LECO logo" width={34} height={53}/><small>License Management</small></Link><button className="theme-button" onClick={toggleTheme}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button></header><div className="login-layout"><motion.section initial={{opacity:0,x:-18}} animate={{opacity:1,x:0}} className="login-intro"><span className="hero-tag"><span/> Secure LECO workspace</span><h1>Your license estate,<em> in order.</em></h1><p>Sign in to manage requests, allocations and governance from one trusted workspace.</p><div className="login-art"><div className="login-art-grid"/><div className="login-art-card"><span><ShieldCheck size={20}/></span><div><b>Protected access</b><small>JWT authenticated session</small></div></div><div className="login-art-card second"><span><KeyRound size={19}/></span><div><b>Ready to manage</b><small>Licenses in one place</small></div></div></div></motion.section><motion.section initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{delay:.1}} className="login-card"><div><p className="eyebrow">Welcome back</p><h2>Sign in to License Management</h2><p className="login-muted">Use your LECO credentials to continue.</p></div><form onSubmit={submit}><label className="field-label">Username</label><div className="login-input"><UserRound size={18}/><input value={username} onChange={event=>setUsername(event.target.value)} placeholder="Enter username" required autoComplete="username"/></div><label className="field-label">Password</label><div className="login-input"><LockKeyhole size={18}/><input type={showPassword?'text':'password'} value={password} onChange={event=>setPassword(event.target.value)} placeholder="Enter password" required autoComplete="current-password"/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div><button disabled={isLoading} className="login-submit">{isLoading?'Signing in…':<>Sign in securely <ArrowRight size={17}/></>}</button></form><p className="login-help">Need access? Please contact the LECO system administrator.</p></motion.section></div></main>;
}
