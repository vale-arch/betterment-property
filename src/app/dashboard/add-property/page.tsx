'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import map to prevent SSR errors
const InteractiveMap = dynamic(() => import('@/components/properties/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="h-[350px] bg-gray-100 animate-pulse rounded-2xl" />
});

export default function AddPropertyPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [loading, setLoading] = useState(false)
  const [counties, setCounties] = useState<any[]>([])
  const [subCounties, setSubCounties] = useState<any[]>([])
  const [availableAmenities, setAvailableAmenities] = useState<any[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'house',
    listing_purpose: 'sale',
    price: '',
    county_id: '',
    sub_county_id: '',
    total_rooms: '',
    sqft: '',
    latitude: -1.286389, // Default
    longitude: 36.817223  // Default
  })

  useEffect(() => {
    const closeAll = () => setActiveDropdown(null)
    window.addEventListener('click', closeAll)
    async function fetchData() {
      const { data: cData } = await supabase.from('counties').select('*').order('name')
      if (cData) setCounties(cData)
      const { data: aData } = await supabase.from('amenities').select('*').order('name')
      if (aData) setAvailableAmenities(aData)
    }
    fetchData()
    return () => window.removeEventListener('click', closeAll)
  }, [])

  useEffect(() => {
    if (!form.county_id) return
    async function getSubCounties() {
      const { data } = await supabase.from('sub_counties').select('*').eq('county_id', form.county_id).order('name')
      if (data) setSubCounties(data)
    }
    getSubCounties()
  }, [form.county_id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages(prev => [...prev, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.county_id) { alert("Please select a County"); return }
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const finalDescription = `${form.description}\n\nFeatures: ${selectedAmenities.join(', ')}`

      const { data: property, error: pError } = await supabase
        .from('properties')
        .insert([{
          owner_id: user.id,
          title: form.title,
          description: finalDescription,
          property_type: form.property_type,
          listing_purpose: form.listing_purpose,
          price: parseFloat(form.price),
          county_id: parseInt(form.county_id),
          sub_county_id: form.sub_county_id ? parseInt(form.sub_county_id) : null,
          bedrooms: form.total_rooms ? parseInt(form.total_rooms) : 0,
          sq_ft: form.sqft ? parseInt(form.sqft) : 0,
          latitude: form.latitude, // SAVING LAT
          longitude: form.longitude, // SAVING LNG
          listing_status: 'pending' 
        }])
        .select().single()

      if (pError) throw pError

      if (images.length > 0) {
        for (const file of images) {
          const fileName = `${Date.now()}-${file.name}`
          const filePath = `${property.id}/${fileName}`
          const { error: uploadError } = await supabase.storage.from('Property-image').upload(filePath, file)
          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('Property-image').getPublicUrl(filePath)
          await supabase.from('property_images').insert([{ property_id: property.id, url: publicUrl }])
        }
      }
      alert("Property listed successfully!")
      router.push('/dashboard')
    } catch (error: any) { alert(error.message) } finally { setLoading(false) }
  }

  const renderCustomSelect = (label: string, value: string, options: any[], key: string, fieldName: string, disabled: boolean = false) => {
    const displayValue = options.find(o => String(o.id || o.value) === String(value))?.name || options.find(o => o.value === value)?.label || "Select Option"
    return (
      <div className="input-group" onClick={(e) => { e.stopPropagation(); if(!disabled) setActiveDropdown(activeDropdown === key ? null : key) }}>
        <label>{label}</label>
        <div className={`custom-select-trigger ${activeDropdown === key ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
          <span>{displayValue}</span>
          <span className="chevron" style={{ transform: activeDropdown === key ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
        <AnimatePresence>
          {activeDropdown === key && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="dropdown-menu">
              {options.map((opt, i) => (
                <div key={i} className="dropdown-item" onClick={() => { setForm({...form, [fieldName]: String(opt.id || opt.value)}); setActiveDropdown(null); }}>
                  {opt.name || opt.label}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '60px 20px', color: '#1B1464' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .form-card { width: 100%; max-width: 850px; margin: 0 auto; background: #FFF; border: 1px solid #E5E7EB; border-radius: 24px; padding: 50px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); }
        .input-group { margin-bottom: 25px; position: relative; }
        label { display: block; font-size: 10px; color: #2D004F; text-transform: uppercase; margin-bottom: 8px; font-weight: 800; letter-spacing: 1.5px; }
        .custom-select-trigger { width: 100%; background: #FFF; border: 1px solid #D1D5DB; border-radius: 12px; padding: 14px 18px; color: #1B1464; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; font-size: 14px; font-weight: 600; }
        .custom-select-trigger.active { border-color: #7B2CBF; box-shadow: 0 0 0 4px rgba(123, 44, 191, 0.05); }
        .dropdown-menu { position: absolute; top: 110%; left: 0; right: 0; background: white; border-radius: 12px; border: 1px solid #E5E7EB; z-index: 100; max-height: 250px; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.1); padding: 8px; }
        .dropdown-item { padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #4B5563; font-weight: 600; }
        .dropdown-item:hover { background: #F3E8FF; color: #7B2CBF; }
        input, textarea { width: 100%; background: #FFF; border: 1px solid #D1D5DB; border-radius: 12px; padding: 14px 18px; color: #1B1464; outline: none; transition: 0.2s; font-family: inherit; font-weight: 600; font-size: 14px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .amenity-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
        .amenity-chip { padding: 8px 16px; border-radius: 100px; border: 1px solid #E5E7EB; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; background: white; color: #6B7280; }
        .amenity-chip.selected { background: #2D004F; color: white; border-color: #2D004F; }
        .btn-submit { background: #2D004F; color: #FFF; width: 100%; padding: 20px; border: none; border-radius: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; margin-top: 40px; transition: 0.3s; }
        .image-upload-box { border: 2px dashed #7B2CBF; background: #FDFCF9; border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: '#6B7280', fontWeight: '800', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>← BACK TO DASHBOARD</Link>
      </div>

      <div className="form-card">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '3.5rem', color: '#2D004F', margin: 0 }}>List New <span style={{ color: '#7B2CBF' }}>Asset</span></h1>
        
        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="input-group" style={{ marginTop: '40px' }}>
            <label>Listing Title</label>
            <input required placeholder="e.g. Elegant 4 Bedroom House" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div className="grid-2">
            {renderCustomSelect("Category", form.property_type, [
              { value: 'house', label: 'House' }, { value: 'apartment', label: 'Apartment' }, { value: 'land', label: 'Land' }, { value: 'house_land', label: 'House + Land' }
            ], 'cat', 'property_type')}
            {renderCustomSelect("Purpose", form.listing_purpose, [{ value: 'sale', label: 'For Sale' }, { value: 'rent', label: 'For Rent' }], 'purp', 'listing_purpose')}
          </div>

          <div className="grid-2">
            <div className="input-group"><label>Price (KES)</label><input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
            {renderCustomSelect("County", form.county_id, counties, 'county', 'county_id')}
          </div>

          {/* Section 2: Precise Location Map */}
          <div className="input-group">
            <label>Precise Location Pin</label>
            <InteractiveMap onLocationSelect={(lat, lng) => setForm({...form, latitude: lat, longitude: lng})} />
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <span style={{ fontSize: '10px', color: '#999' }}>LAT: {form.latitude.toFixed(4)}</span>
              <span style={{ fontSize: '10px', color: '#999' }}>LNG: {form.longitude.toFixed(4)}</span>
            </div>
          </div>

          {/* Section 3: Specs */}
          <div className="grid-2">
            {form.property_type !== 'land' && (
              <div className="input-group"><label>Total Rooms</label><input type="number" value={form.total_rooms} onChange={e => setForm({...form, total_rooms: e.target.value})} /></div>
            )}
            <div className="input-group"><label>Total Area (SqFt/Acres)</label><input value={form.sqft} onChange={e => setForm({...form, sqft: e.target.value})} /></div>
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Property Photos</label>
            <div className="image-upload-box" onClick={() => document.getElementById('file-input')?.click()}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#7B2CBF' }}>UPLOAD PHOTOGRAPHS</span>
                <input id="file-input" type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'SYNCING ASSETS...' : 'REGISTER PROPERTY'}
          </button>
        </form>
      </div>
    </div>
  )
}