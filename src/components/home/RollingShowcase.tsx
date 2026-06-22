'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image
import { supabaseLoader } from '@/lib/image-loader'; // Import your loader

export default function RollingShowcase() {
  const [index, setIndex] = useState(0);
  const [properties, setProperties] = useState<any[]>([]);
  const supabase = createClient();

  const backupImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600";

  useEffect(() => {
    const fetchDiverseHero = async () => {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url)')
        .eq('listing_status', 'active')
        .limit(10);
      
      if (data && data.length > 0) {
        setProperties(data);
      } else {
        setProperties([
          { title: "Luxury Modern Villa", price: 85000000, property_type: 'house' },
          { title: "Prime Commercial Plot", price: 15000000, property_type: 'land' }
        ]);
      }
    };
    fetchDiverseHero();
  }, []);

  useEffect(() => {
    if (properties.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % properties.length);
    }, 7000); // Slightly longer for premium feel
    return () => clearInterval(timer);
  }, [properties]);

  if (properties.length === 0) return <div className="h-[85vh] bg-[#2D004F] animate-pulse" />;

  const current = properties[index];
  const displayImage = current.images?.[0] || current.property_images?.[0]?.url || backupImage;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-[#2D004F]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 cursor-pointer"
        >
          <Link href={current.id ? `/properties/${current.id}` : "#"}>
            {/* 1. THE OPTIMIZED ANIMATED IMAGE */}
            <motion.div
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
              className="absolute inset-0"
            >
              <Image
                loader={supabaseLoader}
                src={displayImage}
                alt={current.title || "Premium Property"}
                fill
                priority
                quality={85}
                style={{ objectFit: 'cover' }}
                className="transition-opacity duration-1000"
              />
            </motion.div>

            {/* 2. OVERLAYS (Gradient and Text) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D004F] via-[#2D004F]/40 to-transparent z-10 hover:bg-[#2D004F]/10 transition-all duration-700" />

            <div className="absolute inset-0 z-20 flex items-center px-10 md:px-24">
              <motion.div 
                initial={{ x: -40, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <p className="text-[#7B2CBF] font-black uppercase tracking-[0.4em] text-[10px] mb-4 bg-white/10 w-fit px-3 py-1 rounded backdrop-blur-md">
                   {current.property_type?.toUpperCase() || 'PREMIUM'}
                </p>
                <h1 className="text-white text-5xl md:text-8xl font-black leading-[0.9] mb-6 tracking-tighter shadow-sm">
                  {current.title}
                </h1>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <p className="text-white/90 text-3xl font-bold">
                    KES {Number(current.price || 0).toLocaleString()}
                  </p>
                  <span className="bg-[#7B2CBF] text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase shadow-xl hover:bg-white hover:text-[#2D004F] transition-all duration-300">
                    Explore Details →
                  </span>
                </div>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* PROGRESS INDICATORS */}
      <div className="absolute bottom-20 left-10 md:left-24 z-30 flex gap-3 items-center">
        {properties.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-700 ${i === index ? 'w-16 bg-[#7B2CBF]' : 'w-4 bg-white/20'}`} 
          />
        ))}
      </div>
    </div>
  ); 
}