'use client'
import { useState, useEffect, useRef } from 'react';
import { MapPin, Home, Search, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPill() {
  const router = useRouter();
  const supabase = createClient();
  const [counties, setCounties] = useState<any[]>([]);
  const [subCounties, setSubCounties] = useState<any[]>([]);
  
  // Search States
  const [county, setCounty] = useState({ id: '', name: 'All Counties' });
  const [subCounty, setSubCounty] = useState({ id: '', name: 'Anywhere' });
  const [type, setType] = useState('All Types');
  
  // UI States
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data: c } = await supabase.from('counties').select('*').order('name');
      if (c) setCounties(c);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (county.id) {
      supabase.from('sub_counties').select('*').eq('county_id', county.id)
        .then(({ data }) => setSubCounties(data || []));
    } else {
      setSubCounties([]);
    }
  }, [county]);

  const executeSearch = () => {
    const params = new URLSearchParams({
      county: county.id,
      subCounty: subCounty.id,
      type: type === 'All Types' ? '' : type
    });
    router.push(`/listings?${params.toString()}`);
  };

  // Helper Component for Animated Dropdown
  const CustomDropdown = ({ id, label, value, options, onSelect, icon: Icon, disabled = false }: any) => {
    const isOpen = activeDropdown === id;

    return (
      <div className="flex-1 relative w-full">
        <button
          disabled={disabled}
          onClick={() => setActiveDropdown(isOpen ? null : id)}
          className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-all duration-300 border-b md:border-b-0 md:border-r border-gray-100 group ${disabled ? 'opacity-30' : 'opacity-100'}`}
        >
          {Icon && <Icon className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#7B2CBF]' : 'text-[#2D004F]'}`} />}
          <div className="flex-1 overflow-hidden">
            <label className="text-[9px] font-black text-gray-400 block uppercase tracking-tighter cursor-pointer">
              {label}
            </label>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-[#2D004F] truncate">{value}</span>
              <ChevronDown className={`w-3 h-3 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-[110%] left-0 right-0 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto overflow-x-hidden p-2"
            >
              {options.map((opt: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelect(opt);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-[#2D004F] hover:bg-[#F5EFFF] hover:text-[#7B2CBF] rounded-xl transition-colors mb-1 last:mb-0"
                >
                  {opt.name || opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="relative z-30 -mt-16 px-4 flex justify-center" ref={pillRef}>
      <div className="bg-white/95 backdrop-blur-md w-[95%] max-w-6xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(45,0,79,0.15)] p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2 border border-white/20">

        {/* Location Dropdown */}
        <CustomDropdown
          id="county"
          label="Region"
          value={county.name}
          icon={MapPin}
          options={[{ id: '', name: 'All Counties' }, ...counties]}
          onSelect={(val: any) => {
            setCounty(val);
            setSubCounty({ id: '', name: 'Anywhere' });
          }}
        />

        {/* Neighborhood Dropdown */}
        <CustomDropdown
          id="subCounty"
          label="Neighborhood"
          value={subCounty.name}
          disabled={!county.id}
          options={[{ id: '', name: 'Anywhere' }, ...subCounties]}
          onSelect={(val: any) => setSubCounty(val)}
        />

        {/* Property Type Dropdown */}
        <CustomDropdown
          id="type"
          label="Home Type"
          value={type}
          icon={Home}
          options={['All Types', 'Villa', 'Penthouse', 'Apartment', 'Townhouse']}
          onSelect={(val: any) => setType(val)}
        />

        {/* Search Button */}
        <button 
          onClick={executeSearch}
          className="bg-[#2D004F] text-white px-10 py-5 rounded-[1.8rem] font-bold text-lg tracking-widest hover:bg-[#7B2CBF] hover:scale-[1.02] transition-all duration-300 w-full md:w-auto shadow-xl flex items-center justify-center gap-3 uppercase"
        >
          <Search className="w-5 h-5" />
          <span>Find My Home</span>
        </button>
      </div>
    </div>
  );
}