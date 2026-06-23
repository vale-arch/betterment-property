'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseLoader } from '@/lib/image-loader';

export default function RollingShowcase() {
  const [index, setIndex] = useState(0);
  const [properties, setProperties] = useState<any[]>([]);
  const supabase = createClient();

  const backupImage = "https://images.unsplash.com/photo-1600607687940-c52af04657b3?q=80&w=1600";

  useEffect(() => {
    const fetchDiverseHero = async () => {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url)')
        .eq('listing_status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && data.length > 0) {
        const land = data.find(p => p.property_type === 'land');
        const rental = data.find(p => p.listing_purpose === 'rent');
        const houses = data.filter(p => p.property_type === 'house' && p.listing_purpose === 'sale').slice(0, 2);
        const selection = [land, rental, ...houses].filter(Boolean);
        setProperties(selection.length >= 4 ? selection : data.slice(0, 4));
      } else {
        setProperties([
          { title: "The Glass Pavilion", price: 85000000, type: 'house', img: backupImage },
          { title: "Savannah Acreage", price: 12000000, type: 'land', img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600" },
          { title: "Urban Sky Suite", price: 120000, type: 'rent', img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600" },
          { title: "The Ivory Manor", price: 45000000, type: 'house', img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600" }
        ]);
      }
    };
    fetchDiverseHero();
  }, []);

  useEffect(() => {
    if (properties.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % properties.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [properties]);

  if (properties.length === 0) return <div className="h-[85vh] bg-[#0D0221] animate-pulse" />;

  const current = properties[index];
  const displayImage = current.images?.[0] || current.property_images?.[0]?.url || current.img || backupImage;

  return (
    // Container is now Midnight Purple to prevent white flashes
    <div className="relative h-[90vh] w-full overflow-hidden bg-[#0D0221]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 cursor-pointer"
        >
          <Link href={current.id ? `/properties/${current.id}` : "#"}>
            
            {/* 1. PHOTO CLEANUP & GRADING */}
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
              className="absolute inset-0"
            >
              <Image
                loader={supabaseLoader}
                src={displayImage}
                alt={current.title}
                fill
                priority
                quality={100}
                style={{ 
                   objectFit: 'cover', 
                   // This filter "cleans" the image: 
                   // Slightly dims (0.85) to make white text pop, 
                   // Increases saturation (1.2) for luxury colors, 
                   // Adds punchy contrast (1.1)
                   filter: 'brightness(0.85) saturate(1.2) contrast(1.1)' 
                }}
              />
            </motion.div>

            {/* 2. THE MULTI-STOP ELITE GRADIENT */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              // Gradient is now deeper at the bottom and left for maximum text clarity
              background: 'linear-gradient(to right, rgba(13, 2, 33, 0.9) 0%, rgba(13, 2, 33, 0.3) 50%, transparent 100%), linear-gradient(to top, rgba(13, 2, 33, 0.5) 0%, transparent 30%)',
              zIndex: 10 
            }} />

            {/* 3. THE ELITE CONTENT */}
            <div className="absolute inset-0 z-20 flex items-center px-8 md:px-24">
              <div className="max-w-4xl">
                <div className="overflow-hidden mb-4">
                  <motion.p 
                    initial={{ y: '100%' }} animate={{ y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-[#7B2CBF] font-black uppercase tracking-[0.5em] text-[10px] bg-white/10 backdrop-blur-xl px-4 py-2 rounded-md w-fit border border-white/10"
                  >
                    {current.listing_purpose === 'rent' ? 'Exclusive Lease' : current.property_type === 'land' ? 'Investment Plot' : 'Private Portfolio'}
                  </motion.p>
                </div>

                <div className="overflow-hidden mb-8">
                  <motion.h1 
                    initial={{ y: '100%', skewY: 5 }} animate={{ y: 0, skewY: 0 }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-white text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter"
                    style={{ textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                  >
                    {current.title}
                  </motion.h1>
                </div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="flex flex-col md:flex-row md:items-center gap-10"
                >
                  <div className="border-l-2 border-[#7B2CBF] pl-6">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Official Valuation</p>
                    <p className="text-white text-4xl font-light tracking-tight">
                      KES {Number(current.price || 0).toLocaleString()}
                      {current.listing_purpose === 'rent' && <span className="text-sm opacity-50"> / MO</span>}
                    </p>
                  </div>
                  
                  <button className="group/btn relative overflow-hidden bg-[#7B2CBF] text-white px-12 py-5 rounded-xl font-bold text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:bg-white hover:text-[#0D0221] shadow-[0_15px_40px_rgba(123,44,191,0.3)]">
                    <span className="relative z-10">Request Briefing →</span>
                  </button>
                </motion.div>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* 4. REFINED NAVIGATION */}
      <div className="absolute bottom-16 left-8 md:left-24 z-30 flex items-center gap-8">
        <div className="flex gap-3">
          {properties.map((_, i) => (
            <button 
              key={i}
              onClick={() => setIndex(i)}
              className={`h-[3px] transition-all duration-1000 rounded-full ${i === index ? 'w-20 bg-[#7B2CBF]' : 'w-6 bg-white/20 hover:bg-white/40'}`} 
            />
          ))}
        </div>
        <div className="text-white/40 font-black text-[12px] tracking-[0.4em] hidden md:block">
          {String(index + 1).padStart(2, '0')} <span className="mx-2 text-white/10">|</span> 04
        </div>
      </div>
    </div>
  ); 
}