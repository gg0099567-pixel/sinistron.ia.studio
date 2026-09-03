import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SinistronLogo } from './SinistronLogo';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  Shield,
  Zap,
  Check,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [username, setUsername] = useState('Guilherme Gomes');
  const [password, setPassword] = useState('');
  const [loginStep, setLoginStep] = useState<'username' | 'password'>('username');
  const [stepDirection, setStepDirection] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({
    x: -1000,
    y: -1000,
    radius: 140,
  });

  // Animated background constellation particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const colors = [
      '#f43f5e', // rose
      '#d946ef', // fuchsia
      '#a855f7', // purple
      '#818cf8', // indigo
      '#38bdf8', // cyan
      '#c084fc', // violet
    ];

    const particleCount = Math.min(Math.floor((width * height) / 10000), 85);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.5 + 0.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: baseAlpha,
        baseAlpha,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Subtle ambient glowing radial orbs
      const grad1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time * 0.4) * 70,
        height * 0.4 + Math.cos(time * 0.5) * 50,
        20,
        width * 0.3,
        height * 0.4,
        width * 0.4
      );
      grad1.addColorStop(0, 'rgba(217, 70, 239, 0.08)');
      grad1.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)');
      grad1.addColorStop(1, 'rgba(7, 3, 14, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Connect close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const lineAlpha = (1 - dist / 115) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Render each particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const mdx = mouseRef.current.x - p.x;
        const mdy = mouseRef.current.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouseRef.current.radius) {
          const force = (1 - mdist / mouseRef.current.radius) * 1.5;
          p.x -= (mdx / (mdist || 1)) * force * 1.8;
          p.y -= (mdy / (mdist || 1)) * force * 1.8;
          p.alpha = Math.min(p.baseAlpha + 0.45, 1);
        } else {
          p.alpha = p.baseAlpha + Math.sin(time * 2 + i) * 0.15;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 35 : -35,
      opacity: 0,
      filter: 'blur(3px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -35 : 35,
      opacity: 0,
      filter: 'blur(3px)',
      transition: {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const handleContinueToPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setLoginError('Por favor, informe seu usuário ou e-mail.');
      return;
    }
    setLoginError('');
    setStepDirection(1);
    setLoginStep('password');
  };

  const handleBackToUsername = () => {
    setLoginError('');
    setStepDirection(-1);
    setLoginStep('username');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError('Por favor, digite sua senha de acesso.');
      return;
    }
    setLoginError('');
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess(username.trim() || 'Guilherme Gomes');
    }, 450);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess(signupName || 'Novo Usuário');
    }, 450);
  };

  const featureCards = [
    {
      title: 'Controle de Vendas',
      desc: 'Metas e resultados em tempo real',
      icon: TrendingUp,
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/20',
      hoverBorder: 'hover:border-emerald-400/60',
    },
    {
      title: 'Gestão de Estoque',
      desc: 'Inventário e entradas/saídas',
      icon: Package,
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-950/20',
      hoverBorder: 'hover:border-cyan-400/60',
    },
    {
      title: 'Equipe & Usuários',
      desc: 'Permissões e desempenho',
      icon: Users,
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-950/20',
      hoverBorder: 'hover:border-purple-400/60',
    },
    {
      title: 'Relatórios Avançados',
      desc: 'Dados e análises precisas',
      icon: BarChart3,
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-950/20',
      hoverBorder: 'hover:border-amber-400/60',
    },
  ];

  return (
    <div
      id="login-screen-root"
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#07040d] text-white p-4 sm:p-6 lg:p-12 select-none"
    >
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Ambient Moving Aurora Lights */}
      <motion.div
        animate={{
          scale: [1, 1.25, 0.95, 1],
          x: [0, 45, -35, 0],
          y: [0, -40, 25, 0],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-10 left-10 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-fuchsia-600/25 via-indigo-600/25 to-cyan-500/20 blur-[130px] pointer-events-none z-0"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 50, 0],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
        className="absolute bottom-0 right-10 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-purple-600/30 via-fuchsia-700/20 to-blue-700/25 blur-[150px] pointer-events-none z-0"
      />

      {/* Main Dual-Column Split Screen Container */}
      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ========================================================= */}
        {/* LEFT COLUMN: BRAND HERO & HIGHLIGHTS WITH VORTEX LOGO */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col justify-between space-y-8"
        >
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-fuchsia-500/40 to-indigo-500/40 blur-md opacity-70 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
              <SinistronLogo
                size={44}
                variant="horizontal"
                glow={true}
                animated={true}
                continuousSpin={true}
                textColor="text-white"
              />
            </div>
            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-300 border border-purple-600/60 tracking-wider">
              PRO
            </span>
          </div>

          {/* Bold Display Headline matching User's Design Image */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="block"
              >
                Poderoso.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="block bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-sm"
              >
                Intuitivo.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="block"
              >
                Essencial.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm sm:text-base text-slate-300/80 max-w-md leading-relaxed pt-2"
            >
              Cada detalhe foi projetado para colocar o controle absoluto da operação na palma da sua mão.
            </motion.p>
          </div>

          {/* 4 Glowing Interactive Feature Cards with Motion */}
          <div className="space-y-3 pt-2">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 + idx * 0.1 }}
                  whileHover={{ x: 6, scale: 1.01 }}
                  className={`flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl border ${feat.borderColor} ${feat.bgColor} backdrop-blur-xl ${feat.hoverBorder} transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] group cursor-default`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 ${feat.iconColor} group-hover:scale-110 group-hover:bg-white/10 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-purple-200 transition-colors">
                      {feat.title}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                      {feat.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Left Footer Badges */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400/70 border-t border-purple-500/15 gap-2">
            <div className="flex items-center gap-2">
              <span>© 2026 sinistron.ia</span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistema Online
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="hover:text-slate-300 transition cursor-pointer">Termos de Uso</span>
              <span>•</span>
              <span className="hover:text-slate-300 transition cursor-pointer">Política de Privacidade</span>
            </div>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: LOGIN & AUTH INTERACTIVE GLASS PANEL */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex justify-center"
        >
          <div className="w-full max-w-md relative [perspective:1200px]">
            {/* Ambient Moving Aura behind login card */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [0.98, 1.04, 0.98],
                opacity: [0.55, 0.8, 0.55],
              }}
              transition={{
                rotate: { duration: 24, repeat: Infinity, ease: 'linear' },
                scale: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute -inset-2 rounded-[36px] blur-2xl pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(168,85,247,0.35), rgba(217,70,239,0.3), rgba(79,70,229,0.3), rgba(168,85,247,0.35))',
              }}
            />

            <div
              className={`w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* FRONT CARD — LOGIN */}
              <div
                id="login-front-card"
                className="w-full bg-[#100921]/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)] [backface-visibility:hidden] relative overflow-hidden"
              >
                {/* Top subtle light accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

                {/* Header matching User's Design Image */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Bem-vindo de volta
                  </h2>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Seguro</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 mb-5">
                  {loginStep === 'username'
                    ? 'Informe seu usuário ou e-mail corporativo'
                    : 'Confirme sua senha para validar o acesso'}
                </p>

                {/* Step indicator pills */}
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      loginStep === 'username'
                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                        : 'bg-purple-600/50'
                    }`}
                  />
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      loginStep === 'password'
                        ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                        : 'bg-purple-900/40'
                    }`}
                  />
                </div>

                {/* Animated Step Transition Container */}
                <div className="relative overflow-hidden min-h-[220px]">
                  <AnimatePresence mode="wait" custom={stepDirection}>
                    {loginStep === 'username' ? (
                      /* STEP 1: USERNAME / EMAIL */
                      <motion.div
                        key="step-username"
                        custom={stepDirection}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full space-y-4"
                      >
                        <form onSubmit={handleContinueToPassword} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                              USUÁRIO OU E-MAIL
                            </label>
                            <div className="relative group/input">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-cyan-400 transition" />
                              <input
                                id="login-username-input"
                                type="text"
                                autoFocus
                                placeholder="Digite seu usuário ou e-mail"
                                value={username}
                                onChange={(e) => {
                                  setUsername(e.target.value);
                                  if (loginError) setLoginError('');
                                }}
                                required
                                className="w-full bg-[#180e2e]/90 border border-purple-500/30 text-white placeholder-slate-500 text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
                              />
                            </div>
                          </div>

                          {loginError && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300"
                            >
                              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              <span>{loginError}</span>
                            </motion.div>
                          )}

                          <motion.button
                            id="login-continue-btn"
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-3 py-4 px-6 rounded-2xl font-black text-base text-white tracking-wide bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 hover:from-blue-500 hover:via-indigo-500 hover:to-fuchsia-500 shadow-[0_12px_30px_rgba(99,102,241,0.45)] hover:shadow-[0_16px_40px_rgba(99,102,241,0.65)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
                          >
                            <span>Continuar</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                          </motion.button>
                        </form>
                      </motion.div>
                    ) : (
                      /* STEP 2: PASSWORD / PIN */
                      <motion.div
                        key="step-password"
                        custom={stepDirection}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full space-y-4"
                      >
                        {/* Selected User Identity Badge with Back/Change action */}
                        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#180e2e]/90 border border-purple-500/40 shadow-inner">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md flex-shrink-0">
                              {username ? username.trim().charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-purple-300/80 font-bold">
                                Acessando como
                              </p>
                              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[170px] sm:max-w-[210px]">
                                {username || 'Usuário'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleBackToUsername}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/30 transition cursor-pointer flex-shrink-0"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Trocar</span>
                          </button>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                SENHA / PIN DE ACESSO
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  alert('Instruções de recuperação foram enviadas para o e-mail cadastrado.')
                                }
                                className="text-xs text-purple-400 hover:text-purple-300 transition cursor-pointer"
                              >
                                Esqueceu?
                              </button>
                            </div>
                            <div className="relative group/input">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-fuchsia-400 transition" />
                              <input
                                id="login-password-input"
                                type={showPassword ? 'text' : 'password'}
                                autoFocus
                                placeholder="Digite sua senha de acesso"
                                value={password}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  if (loginError) setLoginError('');
                                }}
                                required
                                className="w-full bg-[#180e2e]/90 border border-purple-500/30 text-white placeholder-slate-500 text-sm rounded-xl pl-11 pr-11 py-3.5 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/20 transition shadow-inner"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1"
                                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {loginError && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300"
                            >
                              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              <span>{loginError}</span>
                            </motion.div>
                          )}

                          <motion.button
                            id="login-submit-btn"
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-3 py-4 px-6 rounded-2xl font-black text-base text-white tracking-wide bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 hover:from-blue-500 hover:via-indigo-500 hover:to-fuchsia-500 shadow-[0_12px_30px_rgba(99,102,241,0.45)] hover:shadow-[0_16px_40px_rgba(99,102,241,0.65)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Validando Acesso...</span>
                              </div>
                            ) : (
                              <>
                                <span>Entrar no Sistema</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                              </>
                            )}
                          </motion.button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Security Footer Badges (Criptografado • Verificado • Acesso Rápido) */}
                <div className="mt-6 pt-5 border-t border-purple-500/20 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 hover:text-slate-200 transition">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Criptografado</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 hover:text-slate-200 transition">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verificado</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 hover:text-slate-200 transition">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Acesso Rápido</span>
                  </div>
                </div>

                {/* Sign up flip button */}
                <div className="mt-5 text-center text-xs text-slate-400">
                  Novo por aqui?{' '}
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="font-bold text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2 ml-1 cursor-pointer"
                  >
                    Criar conta
                  </button>
                </div>
              </div>

              {/* BACK CARD — SIGN UP */}
              <div
                id="login-back-card"
                className="w-full absolute inset-0 bg-[#100921]/95 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-purple-500/20">
                    <div>
                      <h2 className="text-xl font-bold text-white">Criar Nova Conta</h2>
                      <p className="text-xs text-purple-200/70 mt-0.5">
                        Plataforma sinistron.ia
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-600/50">
                      Registro
                    </span>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1 ml-1">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <input
                          type="text"
                          placeholder="Ex: Carlos Eduardo"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                          className="w-full bg-[#180d2e] border border-purple-500/30 text-white placeholder-purple-300/40 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-fuchsia-400 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1 ml-1">
                        E-mail Corporativo
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <input
                          type="email"
                          placeholder="nome@empresa.com.br"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="w-full bg-[#180d2e] border border-purple-500/30 text-white placeholder-purple-300/40 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-fuchsia-400 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1 ml-1">
                        Criar Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          className="w-full bg-[#180d2e] border border-purple-500/30 text-white placeholder-purple-300/40 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-fuchsia-400 transition"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-3 py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide text-white uppercase bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 hover:from-blue-500 hover:to-fuchsia-500 shadow-lg shadow-purple-900/50 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Concluir Cadastro</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.button>
                  </form>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-500/20 text-center text-xs text-purple-300/70">
                  Já possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="font-bold text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2 ml-1 cursor-pointer"
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
