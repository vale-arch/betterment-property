'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RollingShowcase() {
  const [index, setIndex] = useState(0);
  const [properties, setProperties] = useState<any[]>([]);
  const supabase = createClient();

  // Category-specific fallbacks for a perfect 4-image roll
  const fallbacks = [
    { title: "Prime Investment Land", type: "land", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600", price: "2,500,000" },
    { title: "Executive Urban Rental", type: "rent", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600", price: "150,000" },
    { title: "Modern Family Manor", type: "house", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600", price: "45,000,000" },
    { title: "Luxury Savannah Villa", type: "house", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600", price: "85,000,000" }
  ];

  useEffect(() => {
    const fetchDiverseHero = async () => {
      // We fetch more than we need to ensure we can pick a variety
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data && data.length > 0) {
        // Logic to pick 1 Land, 1 Rent, and 2 Houses
        const land = data.find(p => p.property_type === 'land');
        const rental = data.find(p => p.listing_purpose === 'rent');
        const houses = data.filter(p => p.property_type === 'house' && p.listing_purpose === 'sale').slice(0, 2);

        // Filter out nulls and combine
        const selection = [land, rental, ...houses].filter(Boolean);
        
        // If we don't have enough variety in DB, just use the latest 4
        setProperties(selection.length >= 4 ? selection : data.slice(0, 4));
      } else {
        // Use beautiful fallbacks if DB is empty
        setProperties(fallbacks);
      }
    };
    fetchDiverseHero();
  }, []);

  useEffect(() => {
    if (properties.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % properties.length);
    }, 7000); // 7 seconds for a more relaxed luxury feel
    return () => clearInterval(timer);
  }, [properties]);

  if (properties.length === 0) return <div className="h-[85vh] bg-[#2D004F] animate-pulse" />;

  const current = properties[index];

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
            {/* LUXURY VIOLET GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D004F] via-[#2D004F]/40 to-transparent z-10 hover:bg-[#2D004F]/20 transition-all duration-700" />
            
            <motion.img 
              key={`img-${current.id || index}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
              src={current.images?.[0] || current.img} 
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
                {/* DYNAMIC CATEGORY TAG */}
                <p className="text-[#7B2CBF] font-black uppercase tracking-[0.4em] text-[10px] mb-4 bg-white/10 w-fit px-3 py-1 rounded backdrop-blur-md">
                   {current.property_type === 'land' ? 'Investment Acreage' : 
                    current.listing_purpose === 'rent' ? 'Premium Rental' : 
                    'Exclusive Residence'}
                </p>
                
                <h1 className="text-white text-5xl md:text-8xl font-black leading-[0.9] mb-6 tracking-tighter">
                  {current.title}
                </h1>
                
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <p className="text-white/90 text-3xl font-bold">
                    KES {typeof current.price === 'number' ? current.price.toLocaleString() : current.price}
                    {current.listing_purpose === 'rent' && <span className="text-lg font-light"> / Month</span>}
                  </p>
                  
                  <span className="bg-[#7B2CBF] text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase shadow-xl shadow-[#2D004F]/40 hover:bg-white hover:text-[#2D004F] transition-all duration-300">
                    Explore Details →
                  </span>
                </div>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* 4-SLOT NAVIGATION INDICATORS */}
      <div className="absolute bottom-20 left-10 md:left-24 z-30 flex gap-3 items-center">
        {properties.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-700 ${i === index ? 'w-16 bg-[#7B2CBF]' : 'w-4 bg-white/20'}`}
          />
        ))}
        <span className="text-white/40 text-[10px] font-black tracking-widest ml-2 uppercase">
          Category {index + 1} of 4
        </span>
      </div>
    </div>
  ); 
}