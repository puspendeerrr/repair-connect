import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, MapPin, CheckCircle, ArrowRight, ArrowLeft } from 'phosphor-react';
import { createRequest, uploadMultipleImages } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = ['AC Repair', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Vehicle Repair', 'Phone Repair', 'Appliance Repair', 'Other'];

export default function PostRequestPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: '', urgency: 'normal',
    budgetMin: 500, budgetMax: 5000, lat: user?.lat || 0, lng: user?.lng || 0,
    city: user?.city || '', address: user?.address || '',
  });

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImageFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { update('lat', pos.coords.latitude); update('lng', pos.coords.longitude); toast.success('Location updated!'); },
      () => toast.error('Location access denied')
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let images = [];
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append('images', f));
        const { data } = await uploadMultipleImages(fd);
        images = data.urls;
      }
      await createRequest({ ...form, images });
      toast.success('Request posted successfully!');
      navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post request.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="page-header"><h1>Post a Repair Request</h1><p>Describe your issue and get quotes from nearby technicians</p></div>

        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {[1, 2, 3, 4].map((s) => (<div key={s} className="dot" style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'var(--amber)' : 'var(--border-color)' }} />))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group"><label>Title *</label><input className="input" placeholder="e.g. AC not cooling" value={form.title} onChange={(e) => update('title', e.target.value)} /></div>
              <div className="input-group"><label>Category *</label>
                <select className="input" value={form.category} onChange={(e) => update('category', e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group"><label>Description *</label><textarea className="input" placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} /></div>
              <div className="input-group"><label>Urgency</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['normal', 'urgent', 'emergency'].map((u) => (
                    <button key={u} className={`btn btn-sm ${form.urgency === u ? 'btn-primary' : 'btn-secondary'}`} onClick={() => update('urgency', u)}>{u}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label>Upload Photos (up to 5)</label>
                <label className="card card-glow" style={{ cursor: 'pointer', textAlign: 'center', padding: 32 }}>
                  <Camera size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <p className="text-small">Click to upload images</p>
                  <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                </label>
              </div>
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {previews.map((p, i) => <img key={i} src={p} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />)}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group"><label>Budget Range (₹)</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input type="number" className="input" placeholder="Min" value={form.budgetMin} onChange={(e) => update('budgetMin', Number(e.target.value))} />
                  <input type="number" className="input" placeholder="Max" value={form.budgetMax} onChange={(e) => update('budgetMax', Number(e.target.value))} />
                </div>
              </div>
              <button className="btn btn-secondary" onClick={getLocation}><MapPin size={18} /> Update Location</button>
              {form.lat !== 0 && <p className="text-small" style={{ color: 'var(--green)' }}><CheckCircle size={14} weight="fill" /> Location set</p>}
              <div className="input-group"><label>City *</label><input className="input" value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
              <div className="input-group"><label>Address</label><input className="input" value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 className="heading-sm">Review Your Request</h3>
              <div className="card" style={{ background: 'var(--bg-input)' }}>
                <p><strong>Title:</strong> {form.title}</p>
                <p><strong>Category:</strong> {form.category}</p>
                <p><strong>Description:</strong> {form.description}</p>
                <p><strong>Urgency:</strong> <span style={{ textTransform: 'capitalize' }}>{form.urgency}</span></p>
                <p><strong>Budget:</strong> ₹{form.budgetMin} - ₹{form.budgetMax}</p>
                <p><strong>Location:</strong> {form.city} {form.address && `— ${form.address}`}</p>
                <p><strong>Photos:</strong> {imageFiles.length} uploaded</p>
              </div>
            </motion.div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>}
            <div style={{ marginLeft: 'auto' }}>
              {step < 4 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setStep(step + 1)} 
                  disabled={
                    (step === 1 && (!form.title || !form.category || !form.description)) ||
                    (step === 3 && (!form.city))
                  }
                >Next <ArrowRight size={16} /></button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : <>Post Request <CheckCircle size={16} /></>}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
