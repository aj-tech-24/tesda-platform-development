'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { Users, Award, Building2, MousePointerClick } from 'lucide-react';

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

export function Screensaver() {
  const isIdle = useIdleTimeout(10000); // 1 minute idle time
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isIdle) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ACHIEVEMENTS.length);
    }, 6000); // rotate every 6 seconds

    return () => clearInterval(interval);
  }, [isIdle]);

  if (!mounted || !isIdle) return null;

  const currentAchievement = ACHIEVEMENTS[currentIndex];
  const Icon = currentAchievement.icon;

  return (
    <div className="fixed inset-0 z-[9999] bg-black animate-fade-in flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {ACHIEVEMENTS.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0 bg-black/50 z-10" /> {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          <Image
            src={item.image}
            alt={item.title}
            fill
            className={`object-cover object-center transition-transform duration-[10000ms] ease-linear ${index === currentIndex ? 'scale-110' : 'scale-100'}`}
            priority
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center space-y-8 mt-20">
        <div key={currentIndex} className="animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
            <Icon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-xl">
            {currentAchievement.title}
          </h2>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            {currentAchievement.description}
          </p>
        </div>
      </div>

      {/* Bottom interaction prompt */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center">
        <div className="animate-pulse flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 shadow-lg">
          <MousePointerClick className="w-5 h-5" />
          <span className="font-medium tracking-wide">Move mouse or press any key to return</span>
        </div>
      </div>
    </div>
  );
}
