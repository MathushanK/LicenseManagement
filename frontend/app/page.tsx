'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, BarChart3, CheckCircle2, KeyRound, Moon, ShieldCheck, Sun, UsersRound } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const rise = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } };
function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter(); const searchParams = useSearchParams();
  useEffect(() => { if (searchParams.get('returnToLogin') === '1') { const timer = window.setTimeout(() => router.replace('/login'), 2600); return () => window.clearTimeout(timer); } }, [router, searchParams]);
  const returnToLogin = searchParams.get('returnToLogin') === '1';
  return <main className="landing"><header className="landing-nav"><Link href="/" className="landing-brand"><Image src="/leco-logo.png" alt="LECO logo" width={36} height={56}/><small>License Management</small></Link><div className="landing-actions"><button className="theme-button" onClick={toggleTheme}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button><Link href="/login" className="landing-login">Sign in <ArrowRight size={15}/></Link></div></header>{returnToLogin && <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="return-notice">Welcome to LECO License Management — taking you back to sign in…</motion.div>}<section className="hero"><motion.div initial="hidden" animate="show" transition={{staggerChildren:.12}} className="hero-copy"><motion.div variants={rise} className="hero-tag"><span/> Built for LECO teams</motion.div><motion.h1 variants={rise}>Licenses, <em>made clear.</em></motion.h1><motion.p variants={rise}>A calm, secure place to request, approve and allocate the software access your teams need to keep Sri Lanka moving.</motion.p><motion.div variants={rise} className="hero-buttons"><Link href="/login" className="hero-primary">Enter license desk <ArrowRight size={18}/></Link><a href="#how-it-works" className="hero-secondary">Explore the system</a></motion.div><motion.div variants={rise} className="hero-proof"><CheckCircle2 size={16}/> Secure access control <span/> <CheckCircle2 size={16}/> One shared source of truth</motion.div></motion.div><motion.div initial={{opacity:0,scale:.92,rotate:-2}} animate={{opacity:1,scale:1,rotate:0}} transition={{duration:.7,delay:.18}} className="hero-visual"><div className="sun-disc"/><div className="visual-card visual-card-top"><span className="mini-icon"><KeyRound size={17}/></span><div><b>43 available</b><small>licenses ready to assign</small></div><i/></div><div className="visual-card visual-card-main"><div className="visual-title"><span>License activity</span><b>+18%</b></div><div className="bars"><i/><i/><i/><i/><i/><i/></div><div className="visual-legend"><span><i/> Assigned</span><span><i/> Available</span></div></div><div className="visual-card visual-card-bottom"><span className="mini-icon yellow"><ShieldCheck size={17}/></span><div><b>Protected by JWT</b><small>role-based access</small></div></div><Image className="hero-logo" src="/leco-logo.png" alt="Sri Lanka LECO mark" width={115} height={201}/></motion.div></section><motion.section id="how-it-works" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.3}} className="landing-features"><div><span className="feature-number">01</span><KeyRound/><h2>Know your capacity</h2><p>See every available and allocated license at a glance.</p></div><div><span className="feature-number">02</span><UsersRound/><h2>Move requests forward</h2><p>Keep every request, OASYS ticket and decision connected.</p></div><div><span className="feature-number">03</span><BarChart3/><h2>Make informed decisions</h2><p>Use a clear operational view of allocation and demand.</p></div></motion.section><footer className="landing-footer">LECO License Management <span>•</span> Secure internal workspace</footer></main>;
}

export default function Home() {
  return <Suspense fallback={<main className="landing" />}><LandingPage /></Suspense>;
}
