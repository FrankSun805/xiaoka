import React, { useRef, useState, useEffect } from 'react';
import { StarCard, Rarity } from '../types';
import { Sparkles, Repeat } from 'lucide-react';

interface Card3DProps {
  card: StarCard;
  onClick?: () => void;
  interactive?: boolean;
  flippable?: boolean; // New prop to enable flipping
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Card3D: React.FC<Card3DProps> = ({ 
  card, 
  onClick, 
  interactive = true, 
  flippable = false,
  size = 'md' 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  // Size mapping - slightly adjusted for tighter corner radius
  const sizeClasses = {
    sm: "w-28 h-44 rounded-xl",
    md: "w-[44vw] h-[66vw] max-w-[180px] max-h-[270px] rounded-2xl",
    lg: "w-72 h-[420px] rounded-2xl",
    full: "w-[85vw] h-[125vw] max-w-md max-h-[600px] rounded-[24px]" // Apple-like curvature
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!interactive || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Tighter rotation limits for realism
    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ 
      x: (x / rect.width) * 100, 
      y: (y / rect.height) * 100,
      opacity: 1
    });
  };

  const handleLeave = () => {
    if (!interactive) return;
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  const handleClick = (e: React.MouseEvent) => {
    if (flippable) {
      e.stopPropagation(); // Prevent closing the modal if clicking to flip
      setIsFlipped(!isFlipped);
    } else if (onClick) {
      onClick();
    }
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.LEGENDARY: return "#f59e0b"; // Amber
      case Rarity.LIMITED: return "#f43f5e"; // Rose
      case Rarity.RARE: return "#6366f1"; // Indigo
      default: return "#9ca3af"; // Gray
    }
  };

  const rarityColor = getRarityColor(card.rarity);

  return (
    <div 
      className={`relative perspective-1000 ${size === 'full' ? 'z-50' : ''} group cursor-pointer`}
      style={{ perspective: '1200px' }}
      onClick={handleClick}
    >
      {/* 
        Wrapper handles the Tilt (Rotate X/Y).
        Inner handles the Flip (Rotate Y 180).
      */}
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onTouchMove={handleMove}
        onTouchEnd={handleLeave}
        className={`relative ${sizeClasses[size]} transition-transform duration-100 ease-out`}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${interactive && glare.opacity > 0 && !flippable ? 1.02 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* The Card Content Container - Handles the Flip Animation */}
        <div 
          className="relative w-full h-full transition-all duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* === FRONT FACE === */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden overflow-hidden bg-surfaceHighlight border border-white/10"
            style={{ 
              backfaceVisibility: 'hidden',
              borderRadius: 'inherit',
              // Realistic Shadow + Thickness simulation
              boxShadow: `
                0 4px 6px -1px rgba(0, 0, 0, 0.5),
                0 2px 4px -1px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.15), // Top highlight
                inset 0 -1px 0 0 rgba(0, 0, 0, 0.5)      // Bottom shadow (thickness)
              `
            }}
          >
            {/* Image Layer - No Zoom */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${card.imageUrl})` }}
            />

            {/* Grain Texture for Realism */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/90" />

            {/* Front Content */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start transform translate-z-10">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                {card.group}
              </span>
              {card.rarity === Rarity.LEGENDARY && (
                  <Sparkles className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-z-10 flex flex-col gap-1">
              <h3 className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl'} font-bold text-white leading-none tracking-tight drop-shadow-md`}>
                {card.name}
              </h3>
              {size !== 'sm' && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1 w-8 rounded-full" style={{ backgroundColor: rarityColor }} />
                  <span className="text-[10px] text-gray-300 font-medium tracking-wide uppercase">{card.rarity}</span>
                </div>
              )}
            </div>

            {/* Specular Glare (Glossy Finish) */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-soft-light transition-opacity duration-200"
              style={{
                background: `linear-gradient(125deg, transparent 35%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.0) 55%)`,
                backgroundPosition: `${glare.x}% ${glare.y}%`,
                backgroundSize: '250% 250%',
                opacity: glare.opacity
              }}
            />
            {/* Edge Reflection */}
            <div className="absolute inset-0 rounded-[inherit] border border-white/5 pointer-events-none" />
          </div>

          {/* === BACK FACE === */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden bg-[#1a1a1c] border border-white/5 flex flex-col items-center justify-center p-6 text-center"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: 'inherit',
              boxShadow: `
                0 4px 6px -1px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
              `
            }}
          >
             {/* Back Texture: Matte */}
             <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: `radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)`, backgroundSize: '10px 10px' }} 
             />

             <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-black flex items-center justify-center shadow-inner border border-white/5">
                   <Sparkles className="w-8 h-8 text-white/20" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{card.name}</h4>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">{card.group}</p>
                </div>

                <div className="w-full h-px bg-white/10 my-2" />

                <div className="grid grid-cols-2 gap-4 w-full text-left">
                  <div>
                    <span className="block text-[10px] text-zinc-600 uppercase">Rarity</span>
                    <span className="text-sm font-medium" style={{ color: rarityColor }}>{card.rarity}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-600 uppercase">Texture</span>
                    <span className="text-sm text-zinc-300 font-medium capitalize">{card.texture}</span>
                  </div>
                   <div className="col-span-2">
                    <span className="block text-[10px] text-zinc-600 uppercase">Vibe</span>
                    <span className="text-sm text-zinc-400 italic">"{card.vibe}"</span>
                  </div>
                </div>
             </div>

             <div className="absolute bottom-6 text-[10px] text-zinc-700 font-mono">
               ID: {card.id.slice(-6).toUpperCase()}
             </div>
          </div>
        </div>
        
        {/* Flip Hint (Only in Full/Interactive mode if not flipped) */}
        {flippable && !isFlipped && (
          <div className="absolute top-4 right-4 z-20 animate-pulse delay-1000">
             <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
               <Repeat className="w-4 h-4 text-white/70" />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};