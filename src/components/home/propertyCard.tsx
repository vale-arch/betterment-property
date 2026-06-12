'use client'
import { MapPin, ShieldCheck, Bed, Bath, Move } from 'lucide-react';
import Link from 'next/link';

export default function PropertyCard({ property }: { property: any }) {
  return (
    <Link href={`/properties/${property.id}`} className="group block h-full">
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-[0_30px_60px_-15px_rgba(163,67,47,0.15)] transition-all duration-700 h-full flex flex-col">
        <div className="relative h-72 overflow-hidden">
          <img src={property.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-savannah-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
          </div>
          <div className="absolute bottom-5 left-5 text-white z-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-savannah-gold mb-1">Price</p>
            <p className="font-bebas text-3xl tracking-wider">KES {Number(property.price).toLocaleString()}</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        
        <div className="p-8 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-gray-400 mb-3">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{property.sub_counties?.name || 'Savannah'}</span>
          </div>
          <h3 className="font-bebas text-3xl text-savannah-charcoal mb-6 group-hover:text-savannah-terracotta transition-colors">{property.title}</h3>
          
          <div className="mt-auto grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
            <div className="flex flex-col items-center border-r border-gray-50">
               <Bed className="w-4 h-4 text-savannah-gold mb-1" />
               <span className="text-[10px] font-bold">{property.bedrooms || '—'} BEDS</span>
            </div>
            <div className="flex flex-col items-center border-r border-gray-50">
               <Bath className="w-4 h-4 text-savannah-gold mb-1" />
               <span className="text-[10px] font-bold">{property.bathrooms || '—'} BATHS</span>
            </div>
            <div className="flex flex-col items-center">
               <Move className="w-4 h-4 text-savannah-gold mb-1" />
               <span className="text-[10px] font-bold uppercase">{property.sq_ft || '—'} SqFt</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}