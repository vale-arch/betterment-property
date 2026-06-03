'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddPropertyPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [loading, setLoading] = useState(false)
  const [counties, setCounties] = useState<any[]>([])
  const [subCounties, setSubCounties] = useState<any[]>([])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  
  // UI States for Animations
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'house',
    listing_purpose: 'sale',
    price: '',
    county_id: '',
    sub_county_id: '',
    bedrooms: '',
    bathrooms: '',
    sqft: ''
  })

  // Close dropdowns when clicking outside
  useEffect(() => {
    const closeAll = () => setActiveDropdown(null)
    window.addEventListener('click', closeAll)
    return () => window.removeEventListener('click', closeAll)
  }, [])

  useEffect(() => {
    async function getCounties() {
      const { data } = await supabase.from('counties').select('*').order('name')
      if (data) setCounties(data)
    }
    getCounties()
  }, [])

  useEffect(() => {
    if (!form.county_id) return
    async function getSubCounties() {
      const { data } = await supabase
        .from('sub_counties')
        .select('*')
        .eq('county_id', form.county_id)
        .order('name')
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
    if (!form.county_id || !form.sub_county_id) {
        alert("Please select both County and Sub-County")
        return
    }
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: property, error: pError } = await supabase
        .from('properties')
        .insert([{
          owner_id: user.id,
          title: form.title,
          description: form.description,
          property_type: form.property_type,
          listing_purpose: form.listing_purpose,
          price: parseFloat(form.price),
          county_id: parseInt(form.county_id),
          sub_county_id: parseInt(form.sub_county_id),
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          listing_status: 'pending' 
        }])
        .select().single()

      if (pError) throw pError

      if (images.length > 0) {
        for (const file of images) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${property.id}/${fileName}`
          const { error: uploadError } = await supabase.storage.from('Property-image').upload(filePath, file)
          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('Property-image').getPublicUrl(filePath)
          await supabase.from('property_images').insert([{ property_id: property.id, url: publicUrl }])
        }
      }
      alert("Listing submitted successfully!")
      router.push('/dashboard')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper for Custom Dropdown
  const renderCustomSelect = (label: string, value: string, options: any[], key: string, fieldName: string, disabled: boolean = false) => {
    const displayValue = options.find(o => String(o.id || o.value) === String(value))?.name || options.find(o => o.value === value)?.label || "Select Option"
    
    return (
      <div className="input-group" onClick={(e) => { e.stopPropagation(); if(!disabled) setActiveDropdown(activeDropdown === key ? null : key) }}>
        <label>{label}</label>
        <div className={`custom-select-trigger ${activeDropdown === key ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
          <span>{disabled ? 'Select County first...' : displayValue}</span>
          <span className="chevron" style={{ transform: activeDropdown === key ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
        
        <div className={`dropdown-menu ${activeDropdown === key ? 'open' : ''}`}>
          {options.map((opt, i) => (
            <div 
              key={i} 
              className="dropdown-item" 
              onClick={() => {
                setForm({...form, [fieldName]: String(opt.id || opt.value)})
                setActiveDropdown(null)
              }}
            >
              {opt.name || opt.label}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#FDFCF9', minHeight: '100vh', padding: '40px 20px', color: '#1A1A1A' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; }

        .form-card { 
          width: 100%; max-width: 800px; margin: 0 auto; background: #FFFFFF; 
          border: 1px solid rgba(201, 168, 76, 0.2); border-radius: 32px; 
          padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.03);
        }

        .input-group { margin-bottom: 25px; position: relative; }
        label { display: block; font-size: 11px; color: #A3432F; text-transform: uppercase; margin-bottom: 8px; font-weight: 800; letter-spacing: 1px; }

        /* Custom Dropdown Styles */
        .custom-select-trigger {
          width: 100%; background: #F9F9F9; border: 1px solid #EEE; border-radius: 16px; 
          padding: 14px 18px; color: #1A1A1A; cursor: pointer; display: flex; 
          justify-content: space-between; align-items: center; transition: 0.3s;
          font-size: 15px; font-weight: 500;
        }
        .custom-select-trigger.active { border-color: #A3432F; background: #FFF; box-shadow: 0 0 0 4px rgba(163, 67, 47, 0.05); }
        .custom-select-trigger.disabled { opacity: 0.5; cursor: not-allowed; }
        .chevron { font-size: 10px; color: #C9A84C; transition: 0.3s; }

        .dropdown-menu {
          position: absolute; top: 110%; left: 0; right: 0; background: white; 
          border-radius: 16px; border: 1px solid #EEE; z-index: 100;
          max-height: 0; opacity: 0; overflow-y: auto; overflow-x: hidden;
          transform: translateY(-10px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .dropdown-menu.open { max-height: 250px; opacity: 1; transform: translateY(0); padding: 8px; }

        .dropdown-item {
          padding: 12px 16px; border-radius: 10px; cursor: pointer; font-size: 14px;
          color: #666; transition: 0.2s; font-weight: 600;
        }
        .dropdown-item:hover { background: #FCFAF7; color: #A3432F; }

        input, textarea { width: 100%; background: #F9F9F9; border: 1px solid #EEE; border-radius: 16px; padding: 14px 18px; color: #1A1A1A; outline: none; transition: 0.3s; font-family: 'Outfit'; }
        input:focus, textarea:focus { border-color: #A3432F; background: #FFF; box-shadow: 0 0 0 4px rgba(163, 67, 47, 0.05); }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .btn-submit { background: #A3432F; color: #FFF; width: 100%; padding: 18px; border: none; border-radius: 100px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; margin-top: 30px; transition: 0.3s; box-shadow: 0 10px 20px rgba(163, 67, 47, 0.2); }
        .btn-submit:hover { background: #8E3A26; transform: translateY(-2px); }
        .btn-submit:disabled { background: #CCC; cursor: not-allowed; transform: none; }

        .image-upload-box { border: 2px dashed #C9A84C; background: rgba(201, 168, 76, 0.02); border-radius: 20px; padding: 40px; text-align: center; cursor: pointer; transition: 0.3s; }
        .image-upload-box:hover { background: rgba(201, 168, 76, 0.05); }

        .back-link { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #666; font-weight: 700; font-size: 12px; margin-bottom: 30px; transition: 0.3s; }
        .back-link:hover { color: #A3432F; }

        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } .form-card { padding: 25px 20px; } }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/dashboard" className="back-link">← BACK TO DASHBOARD</Link>
      </div>

      <div className="form-card">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', marginBottom: '10px', lineHeight: 1 }}>List New <span style={{ color: '#A3432F' }}>Property</span></h1>
        <p style={{ color: '#888', marginBottom: '40px', fontWeight: '500' }}>Enter details below. Our team will verify the listing before it goes live.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Property Title</label>
            <input required placeholder="e.g. Luxury 4 Bedroom Villa in Karen" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div className="grid-2">
            {renderCustomSelect("Property Category", form.property_type, [
              { value: 'house', label: 'House' },
              { value: 'apartment', label: 'Apartment' },
              { value: 'land', label: 'Land / Plot' },
              { value: 'commercial', label: 'Commercial' }
            ], 'cat', 'property_type')}

            {renderCustomSelect("Listing Status", form.listing_purpose, [
              { value: 'sale', label: 'For Sale' },
              { value: 'rent', label: 'For Rent' }
            ], 'purp', 'listing_purpose')}
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Price (KES)</label>
              <input required type="number" placeholder="e.g. 15000000" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            </div>
            {renderCustomSelect("County", form.county_id, counties, 'county', 'county_id')}
          </div>

          {renderCustomSelect("Sub-County / Area", form.sub_county_id, subCounties, 'subcounty', 'sub_county_id', !form.county_id)}

          <div className="grid-2">
            <div className="input-group">
              <label>Bedrooms</label>
              <input type="number" placeholder="0" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Bathrooms</label>
              <input type="number" placeholder="0" value={form.bathrooms} onChange={e => setForm({...form, bathrooms: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label>Detailed Description</label>
            <textarea rows={6} placeholder="Amenities, security features, surroundings..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Property Photographs</label>
            <div className="image-upload-box" onClick={() => document.getElementById('file-input')?.click()}>
                <span style={{ fontSize: '24px', display: 'block' }}>📸</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#C9A84C' }}>CLICK TO UPLOAD IMAGES</span>
                <input id="file-input" type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '20px' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EEE' }}>
                    <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'UPLOADING ASSETS...' : 'SUBMIT PROPERTY FOR REVIEW'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '11px', color: '#BBB', fontWeight: '700' }}>BETTERMENT GROUP • SECURE ECOSYSTEM</p>
    </div>
  )
}