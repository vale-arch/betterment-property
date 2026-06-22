'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function AddPropertyPage() {
  const router = useRouter()
  const supabase = createClient()

  // Constants
  const MAX_IMAGES = 20;
  const MAX_FILE_SIZE_MB = 5;

  // Form States
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
    sqft: ''
  })

  useEffect(() => {
    const closeAll = () => setActiveDropdown(null)
    window.addEventListener('click', closeAll)
    async function fetchData() {
      const { data: cData } = await supabase.from('counties').select('*').order('name')
      if (cData) setCounties(cData)
      
      // Fetching the amenities from your Supabase table
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

  // --- Image Handling Logic ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (images.length + files.length > MAX_IMAGES) {
        alert(`You can only upload a maximum of ${MAX_IMAGES} photos.`)
        return
      }
      const oversized = files.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
      if (oversized.length > 0) {
        alert(`Some images are too large. Max size is ${MAX_FILE_SIZE_MB}MB.`)
        return
      }
      setImages(prev => [...prev, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.county_id) { alert("Please select a County"); return }
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Please sign in to list properties.")

      // 1. Send listing data to Properties Table
      const { data: property, error: pError } = await supabase
        .from('properties')
        .insert([{
          owner_id: user.id,
          title: form.title,
          description: form.description,
          features: selectedAmenities, // Saving the Quick Select array
          property_type: form.property_type,
          listing_purpose: form.listing_purpose,
          price: parseFloat(form.price),
          county_id: parseInt(form.county_id),
          sub_county_id: form.sub_county_id ? parseInt(form.sub_county_id) : null,
          bedrooms: form.total_rooms ? parseInt(form.total_rooms) : 0, // Mapping rooms to DB
          sq_ft: form.sqft ? parseInt(form.sqft) : 0,
          listing_status: 'pending' 
        }])
        .select().single()

      if (pError) throw pError

      // 2. Handle Image Uploads
      if (images.length > 0) {
        for (const file of images) {
          const fileName = `${Date.now()}-${file.name}`
          const filePath = `${property.id}/${fileName}`
          const { error: uploadError } = await supabase.storage.from('Property-image').upload(filePath, file)
          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('Property-image').getPublicUrl(filePath)
          
          // Save to images table and update main property array
          await supabase.from('property_images').insert([{ property_id: property.id, url: publicUrl }])
          await supabase.rpc('append_property_image', { prop_id: property.id, image_url: publicUrl })
        }
      }

      alert("Success! Your listing has been sent for verification.")
      router.push('/dashboard')
    } catch (error: any) { alert(error.message) } finally { setLoading(false) }
  }

  const renderCustomSelect = (label: string, value: string, options: any[], key: string, fieldName: string, disabled: boolean = false) => {
    const displayValue = options.find(o => String(o.id || o.value) === String(value))?.name || options.find(o => o.value === value)?.label || "Select Option"
    return (
      <div className="input-group" style={{ zIndex: activeDropdown === key ? 100 : 1 }} onClick={(e) => { e.stopPropagation(); if(!disabled) setActiveDropdown(activeDropdown === key ? null : key) }}>
        <label>{label}</label>
        <div className={`custom-select-trigger ${activeDropdown === key ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
          <span>{disabled ? 'Select County first...' : displayValue}</span>
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
        .dropdown-menu { position: absolute; top: 110%; left: 0; right: 0; background: white; border-radius: 12px; border: 1px solid #E5E7EB; z-index: 1000 !important; max-height: 250px; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.1); padding: 8px; }
        .dropdown-item { padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #4B5563; font-weight: 600; }
        .dropdown-item:hover { background: #F3E8FF; color: #7B2CBF; }
        input, textarea { width: 100%; background: #FFF; border: 1px solid #D1D5DB; border-radius: 12px; padding: 14px 18px; color: #1B1464; outline: none; transition: 0.2s; font-family: inherit; font-weight: 600; font-size: 14px; }
        input:focus, textarea:focus { border-color: #7B2CBF; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .amenity-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
        .amenity-chip { padding: 10px 18px; border-radius: 12px; border: 1px solid #E5E7EB; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s; background: white; color: #6B7280; }
        .amenity-chip.selected { background: #2D004F; color: white; border-color: #2D004F; }
        .btn-submit { background: #2D004F; color: #FFF; width: 100%; padding: 20px; border: none; border-radius: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; margin-top: 40px; transition: 0.3s; }
        .btn-submit:hover { background: #7B2CBF; transform: translateY(-2px); }
        .image-upload-box { border: 2px dashed #D1D5DB; background: #FDFCF9; border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: 0.3s; }
        .image-upload-box:hover { border-color: #7B2CBF; background: #F5EFFF; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } .form-card { padding: 30px 20px; } }
      `}</style>

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: '#6B7280', fontWeight: '800', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', letterSpacing: '1px' }}>
          ← CANCEL AND RETURN TO DASHBOARD
        </Link>
      </div>

      <div className="form-card">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '3.5rem', color: '#2D004F', margin: 0 }}>Register <span style={{ color: '#7B2CBF' }}>New Asset</span></h1>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginTop: '40px' }}>
            <label>Listing Title</label>
            <input required placeholder="e.g. Modern 4 Bedroom Manor" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div className="grid-2">
            {renderCustomSelect("Category", form.property_type, [
              { value: 'house', label: 'House' }, 
              { value: 'apartment', label: 'Apartment' }, 
              { value: 'land', label: 'Land' }, 
              { value: 'house_land', label: 'House + Land' }
            ], 'cat', 'property_type')}
            
            {renderCustomSelect("Market Status", form.listing_purpose, [
                { value: 'sale', label: 'For Sale' }, 
                { value: 'rent', label: 'For Rent (Monthly)' }
            ], 'purp', 'listing_purpose')}
          </div>

          <div className="grid-2">
            <div className="input-group">
                <label>Asking Price (KES)</label>
                <input required type="number" placeholder="Enter amount" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            </div>
            {renderCustomSelect("County", form.county_id, counties, 'county', 'county_id')}
          </div>

          {renderCustomSelect("Sub-County / Area (Optional)", form.sub_county_id, subCounties, 'subcounty', 'sub_county_id', !form.county_id)}

          <div className="grid-2">
            {form.property_type !== 'land' ? (
              <div className="input-group">
                <label>Total Rooms</label>
                <input type="number" placeholder="e.g. 5" value={form.total_rooms} onChange={e => setForm({...form, total_rooms: e.target.value})} />
              </div>
            ) : (
              <div className="input-group">
                <label>Land Status</label>
                <input placeholder="e.g. Freehold / Leasehold" />
              </div>
            )}
            <div className="input-group">
                <label>{form.property_type.includes('land') ? 'Size (Acres/SqFt)' : 'Floor Area (SqFt)'}</label>
                <input value={form.sqft} placeholder="e.g. 0.5 Acres" onChange={e => setForm({...form, sqft: e.target.value})} />
            </div>
          </div>

          {/* KEY FEATURES SECTION */}
          <div className="input-group">
            <label>Key Features (Quick Select)</label>
            <div className="amenity-grid">
              {availableAmenities.map((amn) => (
                <button
                  key={amn.id}
                  type="button"
                  onClick={() => toggleAmenity(amn.name)}
                  className={`amenity-chip ${selectedAmenities.includes(amn.name) ? 'selected' : ''}`}
                >
                  {selectedAmenities.includes(amn.name) ? '✓ ' : '+ '} {amn.name}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea rows={4} placeholder="Describe the surroundings, security and finishes..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Gallery (Max {MAX_IMAGES} photos • {images.length}/{MAX_IMAGES})</label>
            <div className="image-upload-box" onClick={() => document.getElementById('file-input')?.click()}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}>🖼️</span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#7B2CBF' }}>BROWSE FILES</span>
                <input id="file-input" type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginTop: '20px' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', height: '85px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }} style={{ position: 'absolute', top: '5px', right: '5px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>✕</button>
                </div>
              ))}
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