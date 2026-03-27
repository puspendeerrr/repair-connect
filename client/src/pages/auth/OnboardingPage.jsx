import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { House, Wrench as WrenchIcon, MapPin, ArrowRight, ArrowLeft, CheckCircle } from 'phosphor-react';
import { registerUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './OnboardingPage.css';

const SKILLS = ['AC Repair', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Vehicle Repair', 'Phone Repair', 'Appliance Repair'];

export default function OnboardingPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const tempToken = location.state?.tempToken || '';
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', role: '', city: '', address: '', lat: 0, lng: 0,
    bio: '', skills: [], experienceYears: 0,
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const toggleSkill = (skill) => {
    setForm((p) => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter((s) => s !== skill)
        : [...p.skills, skill],
    }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('lat', pos.coords.latitude);
        update('lng', pos.coords.longitude);
        toast.success('Location captured!');
      },
      () => toast.error('Location access denied')
    );
  };

  const totalSteps = form.role === 'provider' ? 3 : 2;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await registerUser({ ...form, email }, tempToken);
      login(data.user);
      toast.success('Account created! Welcome to Repair Connect.');
      navigate(data.user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1) return form.name && form.phone && form.role;
    if (step === 2) return form.city;
    return true;
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card card">
        <div className="onboarding-header">
          <h2>Complete Your Profile</h2>
          <div className="step-dots">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className={`dot ${i + 1 <= step ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="ob-form">
              <div className="input-group">
                <label>Full Name</label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div className="input-group">
                <label>I am a...</label>
                <div className="role-cards">
                  <button className={`role-card ${form.role === 'customer' ? 'selected' : ''}`} onClick={() => update('role', 'customer')}>
                    <House size={28} weight="duotone" />
                    <strong>I need repairs</strong>
                    <span className="text-small">Find technicians near you</span>
                  </button>
                  <button className={`role-card ${form.role === 'provider' ? 'selected' : ''}`} onClick={() => update('role', 'provider')}>
                    <WrenchIcon size={28} weight="duotone" />
                    <strong>I provide services</strong>
                    <span className="text-small">Get consistent work</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="ob-form">
              <button className="btn btn-secondary" onClick={getLocation} style={{ width: '100%' }}>
                <MapPin size={18} /> Allow Location Access
              </button>
              {form.lat !== 0 && (
                <p className="text-small" style={{ color: 'var(--green)' }}>
                  <CheckCircle size={14} weight="fill" /> Location captured ({form.lat.toFixed(4)}, {form.lng.toFixed(4)})
                </p>
              )}
              <div className="input-group">
                <label>City</label>
                <input className="input" placeholder="Mumbai" value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Full Address</label>
                <input className="input" placeholder="123, Street Name, Area" value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>
            </motion.div>
          )}

          {/* Step 3: Provider Skills */}
          {step === 3 && form.role === 'provider' && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="ob-form">
              <div className="input-group">
                <label>Select Your Skills</label>
                <div className="skill-tags">
                  {SKILLS.map((skill) => (
                    <button
                      key={skill}
                      className={`skill-tag ${form.skills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Years of Experience</label>
                <input type="number" className="input" min={0} value={form.experienceYears} onChange={(e) => update('experienceYears', Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Short Bio</label>
                <textarea className="input" placeholder="Tell customers about yourself..." value={form.bio} onChange={(e) => update('bio', e.target.value)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="ob-actions">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {step < totalSteps ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext()} style={{ marginLeft: 'auto' }}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !canNext()} style={{ marginLeft: 'auto' }}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : <>Complete Setup <CheckCircle size={16} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
