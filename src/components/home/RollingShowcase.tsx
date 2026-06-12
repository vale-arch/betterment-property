'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RollingShowcase() {
  const [index, setIndex] = useState(0);
  const [properties, setProperties] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecent = async () => {
      // We fetch the latest 5 properties (the same ones in your Recent Offers)
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data && data.length > 0) setProperties(data);
    };
    fetchRecent();
  }, []);

  useEffect(() => {
    if (properties.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % properties.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [properties]);

  if (properties.length === 0) return <div className="h-[80vh] bg-[#1A1A1A] animate-pulse" />;

  const current = properties[index];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-[#2D004F]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 cursor-pointer"
        >
          <Link href={`/properties/${current.id}`}>
            {/* LUXURY VIOLET GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D004F] via-[#2D004F]/40 to-transparent z-10 hover:bg-[#2D004F]/20 transition-all duration-700" />
            
            <motion.img 
              key={`img-${current.id}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "linear" }}
              src={current.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600'} 
              className="h-full w-full object-cover"
              alt={current.title}
            />

            <div className="absolute inset-0 z-20 flex items-center px-10 md:px-24">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="max-w-4xl"
              >
                {/* FRIENDLY LUXURY TAG */}
                <p className="text-[#7B2CBF] font-black uppercase tracking-[0.4em] text-[10px] mb-4 bg-white/10 w-fit px-3 py-1 rounded backdrop-blur-md">
                  Hand-picked for you
                </p>
                
                {/* MODERN TYPOGRAPHY */}
                <h1 className="text-white text-5xl md:text-8xl font-black leading-[0.9] mb-6 tracking-tighter">
                  {current.title}
                </h1>
                
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <p className="text-white/90 text-3xl font-bold">
                    KES {Number(current.price).toLocaleString()}
                  </p>
                  
                  {/* INVITING BUTTON STYLE */}
                  <span className="bg-[#7B2CBF] text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase shadow-xl shadow-[#2D004F]/40 hover:bg-white hover:text-[#2D004F] transition-all duration-300">
                    See this home →
                  </span>
                </div>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* NAVIGATION INDICATORS: Vivid Purple */}
      <div className="absolute bottom-20 left-10 md:left-24 z-30 flex gap-3 items-center">
        {properties.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-700 ${i === index ? 'w-16 bg-[#7B2CBF]' : 'w-4 bg-white/20'}`}
          />
        ))}
        <span className="text-white/40 text-[10px] font-black tracking-widest ml-2">
          {String(index + 1).padStart(2, '0')} / {String(properties.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  ); 
  }