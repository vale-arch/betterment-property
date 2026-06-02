'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddPropertyPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [loading, setLoading] = useState(false)
  const [counties, setCounties] = useState<any[]>([])
  const [subCounties, setSubCounties] = useState<any[]>([])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

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

  // 1. Fetch Counties on mount
  useEffect(() => {
    async function getCounties() {
      const { data } = await supabase.from('counties').select('*').order('name')
      if (data) setCounties(data)
    }
    getCounties()
  }, [])

  // 2. Fetch Sub-counties when County changes
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

  // 3. Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages(prev => [...prev, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }

  // 4. THE SUBMIT LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // A. Insert Property Record
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
          listing_status: 'pending' // Admin must approve
        }])
        .select()
        .single()

      if (pError) throw pError

      // B. Upload Images to Storage & Save to DB
      if (images.length > 0) {
        for (const file of images) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${property.id}/${fileName}`

          // Upload to the bucket you created
          const { error: uploadError } = await supabase.storage
            .from('Property-image')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          // Get Public URL
          const { data: { publicUrl } } = supabase.storage
            .from('Property-image')
            .getPublicUrl(filePath)

          // Save image URL to property_images table
          await supabase.from('property_images').insert([{
            property_id: property.id,
            url: publicUrl
          }])
        }
      }

      alert("Listing submitted for review!")
      router.push('/dashboard')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#080810', minHeight: '100vh', padding: '40px 20px', color: '#fff' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .form-card { width: 100%; max-width: 100%; margin: 0 auto; background: #111118; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 24px; }
        .input-group { margin-bottom: 20px; }
        label { display: block; font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; }
        input, select, textarea { width: 100%; background: #080810; border: 1.5px solid #222; border-radius: 12px; padding: 12px; color: #fff; outline: none; }
        input:focus { border-color: #C9A84C; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .btn-submit { background: #C9A84C; color: #000; width: 100%; padding: 15px; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; margin-top: 20px; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } .form-card { padding: 20px 16px; } input, select, textarea { font-size: 16px; width: 100%; max-width: 100%; } }
      `}</style>

      <div className="form-card">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', marginBottom: '10px' }}>List New Property</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Fill in the details below. Our team will review and publish your listing within 24 hours.</p>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="input-group">
            <label>Property Title</label>
            <input required placeholder="e.g. Modern 3 Bedroom Apartment in Kilimani" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Property Type</label>
              <select value={form.property_type} onChange={e => setForm({...form, property_type: e.target.value})}>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="input-group">
              <label>Purpose</label>
              <select value={form.listing_purpose} onChange={e => setForm({...form, listing_purpose: e.target.value})}>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          {/* Pricing & Location */}
          <div className="grid-2">
            <div className="input-group">
              <label>Price (KES)</label>
              <input required type="number" placeholder="5500000" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            </div>
            <div className="input-group">
               <label>County</label>
               <select required value={form.county_id} onChange={e => setForm({...form, county_id: e.target.value})}>
                 <option value="">Select County</option>
                 {counties.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
          </div>

          <div className="input-group">
            <label>Sub-County / Area</label>
            <select required value={form.sub_county_id} onChange={e => setForm({...form, sub_county_id: e.target.value})} disabled={!form.county_id}>
              <option value="">Select Sub-County</option>
              {subCounties.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
          </div>

          {/* Features */}
          <div className="grid-2">
            <div className="input-group">
              <label>Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={e => setForm({...form, bathrooms: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea rows={5} placeholder="Describe the property, amenities, security, etc..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          {/* Image Upload */}
          <div className="input-group">
            <label>Upload Photos</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ border: '2px dashed #333', padding: '30px', textAlign: 'center' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '15px' }}>
              {previews.map((src, i) => (
                <img key={i} src={src} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? '🚀 Uploading Property...' : 'Submit Listing for Approval'}
          </button>
        </form>
      </div>
    </div>
  )
}