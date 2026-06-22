'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { Users, Award, Building2, MousePointerClick, ChevronRight } from 'lucide-react';

const ACHIEVEMENTS = [
  {
    title: "10,000+ Skilled Graduates",
    description: "Successfully trained and certified over 10,000 individuals across the province in 2023, empowering them with world-class technical skills.",
    icon: Users,
    image: "/achievements/achievement_graduates_1778551848321.png"
  },
  {
    title: "Most Outstanding Office 2025",
    description: "Awarded as the top-performing TESDA Provincial Office nationwide for exceptional program delivery and community impact.",
    icon: Award,
    image: "/achievements/achievement_award_1778551863619.png"
  },
  {
    title: "100+ Active Partner Industries",
    description: "Collaborating with leading industry partners to ensure our training programs match the current demands of the global workforce.",
    icon: Building2,
    image: "/achievements/achievement_industry_1778551878893.png"
  }
];

const ROTATION_TIME = 6000; // 6 seconds

export function Screensaver() {
  const isIdle = useIdleTimeout(10000); // Trigger screensaver after 10s of inactivity (dev mode, change to 60000 for prod if needed)
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);

  // Check if current route is an admin page
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Activate screensaver when idle
  useEffect(() => {
    if (isIdle) {
      setIsActive(true);
    }
  }, [isIdle]);

  // Handle slide rotation and progress bar
  useEffect(() => {
    if (!isIdle || !isActive || isAdminRoute) return;

    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / (ROTATION_TIME / 100)), 100));
    }, 100);

    const rotationTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ACHIEVEMENTS.length);
      setProgress(0);
    }, ROTATION_TIME);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(rotationTimer);
    };
  }, [isIdle, isActive, currentIndex, isAdminRoute]);

  if (!mounted || !isActive || isAdminRoute) return null;

  const currentAchievement = ACHIEVEMENTS[currentIndex];
  const Icon = currentAchievement.icon;

  return (
    <div 
      onClick={() => setIsActive(false)}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden font-sans cursor-pointer"
    >
      {/* Self-contained premium animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .animate-ken-burns {
          animation: kenBurns 24s infinite ease-in-out;
        }
        @keyframes orbit {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 5%) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-orbit {
          animation: orbit 15s infinite ease-in-out;
        }
      `}} />

      {/* Ambient Moving Glows */}
      <div className="absolute top-[20%] left-[10%] w-[45rem] h-[45rem] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-orbit mix-blend-screen opacity-60" />
      <div className="absolute bottom-[10%] right-[5%] w-[40rem] h-[40rem] bg-accent/15 rounded-full blur-[100px] pointer-events-none animate-orbit mix-blend-screen opacity-50" style={{ animationDelay: '-5s' }} />

      {/* Background Slideshow */}
      {ACHIEVEMENTS.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/30 to-transparent z-10" />
          <Image
            src={item.image}
            alt={item.title}
            fill
            className={`object-cover object-center ${index === currentIndex ? 'animate-ken-burns' : ''}`}
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Layout Grid */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-between py-16">
        
        {/* Top Header info (Minimal & Premium) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-sm">
              <Image src="/tesda-logo.png" alt="TESDA Logo" fill className="object-contain p-1.5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-wide">TESDA Provincial Office</div>
              <div className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Davao del Sur</div>
            </div>
          </div>
          <div className="text-white/50 text-xs font-mono tracking-widest bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
            ACHIEVEMENT SHOWCASE
          </div>
        </div>

        {/* Center / Bottom Left Content Card */}
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          
          {/* Main Showcase Panel */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div key={currentIndex} className="animate-fade-in-up duration-500 space-y-6">
              
              {/* Animated Floating Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-xs font-semibold text-white tracking-wide shadow-md">
                <Icon className="w-4 h-4 text-primary animate-pulse" />
                Featured Milestone
              </div>

              {/* Title & Description with high-contrast text rendering */}
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  {currentAchievement.title}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-white/85 font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] max-w-3xl">
                  {currentAchievement.description}
                </p>
              </div>
            </div>

            {/* Slide Indicators / Navigation Controls */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex gap-2">
                {ACHIEVEMENTS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setProgress(0);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Progress Line */}
              <div className="h-0.5 w-32 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                <div 
                  className="h-full bg-primary transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

          </div>

          {/* Interactive Navigation Panel (Frosted Glass Panel on Right) */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="bg-black/35 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
              <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider">UPCOMING MILESTONES</div>
              <div className="space-y-3">
                {ACHIEVEMENTS.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setProgress(0);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300 active:scale-98 ${
                        isCurrent
                          ? 'bg-primary/20 border-primary/40 text-white shadow-lg'
                          : 'bg-white/5 border-transparent hover:bg-white/10 text-white/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-primary text-white' : 'bg-white/10 text-white/60'
                        }`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold truncate">{item.title}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isCurrent ? 'translate-x-0.5 text-primary' : 'text-white/30'
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom interaction prompt */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8 mt-4">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/80 text-xs sm:text-sm font-semibold tracking-wide animate-pulse">
            <MousePointerClick className="w-4.5 h-4.5 text-primary" />
            <span>Click anywhere to return</span>
          </div>
          <div className="text-white/30 text-xs font-medium">
            © {new Date().getFullYear()} TESDA. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
}
