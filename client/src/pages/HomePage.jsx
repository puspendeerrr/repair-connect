import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wrench, Drop, Lightning, PaintBrush, Car, DeviceMobile,
  Thermometer, Ruler, ArrowRight, Star, Users, MapPin, CheckCircle,
  Briefcase, ShieldCheck, CurrencyDollar
} from 'phosphor-react';
import './HomePage.css';

const categories = [
  { name: 'AC Repair', icon: Thermometer, color: '#06b6d4' },
  { name: 'Plumbing', icon: Drop, color: '#3b82f6' },
  { name: 'Electrical', icon: Lightning, color: '#f59e0b' },
  { name: 'Carpentry', icon: Ruler, color: '#a855f7' },
  { name: 'Painting', icon: PaintBrush, color: '#ec4899' },
  { name: 'Vehicle Repair', icon: Car, color: '#ef4444' },
  { name: 'Phone Repair', icon: DeviceMobile, color: '#22c55e' },
  { name: 'Appliance Repair', icon: Wrench, color: '#f97316' },
];

const steps = [
  { num: '01', title: 'Post Your Request', desc: 'Describe the issue, set your budget, and share your location.' },
  { num: '02', title: 'Get Quotes', desc: 'Verified technicians nearby send competitive quotes.' },
  { num: '03', title: 'Book & Relax', desc: 'Choose the best, chat live, and pay securely.' },
];

const stats = [
  { value: '500+', label: 'Service Providers' },
  { value: '2,000+', label: 'Jobs Completed' },
  { value: '50+', label: 'Cities Covered' },
  { value: '4.8★', label: 'Average Rating' },
];

const testimonials = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Found an AC technician within 15 minutes. Fixed on the same day at a fair price. Amazing experience!' },
  { name: 'Rajesh Kumar', city: 'Delhi', rating: 5, text: 'As a plumber, Repair Connect gives me consistent work. My bookings have doubled in 2 months.' },
  { name: 'Anita Desai', city: 'Bangalore', rating: 4, text: 'Very transparent pricing and excellent service quality. I trust this platform for all my home repairs.' },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function HomePage() {
  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <motion.div
            className="hero-text"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">
              <ShieldCheck size={16} weight="fill" />
              <span>Trusted by 2,000+ customers</span>
            </div>
            <h1 className="heading-xl">
              Get Any Repair Done,<br />
              <span className="text-amber">Fast & Reliable.</span>
            </h1>
            <p className="text-body" style={{ maxWidth: 520, fontSize: '1.1rem', marginTop: 16 }}>
              Connect with verified repair technicians near you. Compare quotes, 
              chat live, and get it fixed — just like booking a cab.
            </p>
            <div className="hero-ctas">
              <Link to="/login" className="btn btn-primary btn-lg">
                Post a Request <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Become a Provider
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="hero-features"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="hero-feature-card">
              <CheckCircle size={24} weight="fill" className="text-amber" />
              <div>
                <h4>Verified Professionals</h4>
                <p>Background-checked and skill-verified technicians</p>
              </div>
            </div>
            <div className="hero-feature-card">
              <CurrencyDollar size={24} weight="fill" className="text-amber" />
              <div>
                <h4>Transparent Pricing</h4>
                <p>Compare quotes. No hidden charges, ever</p>
              </div>
            </div>
            <div className="hero-feature-card">
              <Briefcase size={24} weight="fill" className="text-amber" />
              <div>
                <h4>Guaranteed Quality</h4>
                <p>Ratings & reviews you can trust</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section how-it-works">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="heading-lg">How It Works</h2>
            <p className="text-body">Get your repair done in 3 simple steps</p>
          </motion.div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="step-card card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <span className="step-num">{s.num}</span>
                <h3 className="heading-sm">{s.title}</h3>
                <p className="text-body">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section categories">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="heading-lg">Service Categories</h2>
            <p className="text-body">Find experts for every repair need</p>
          </motion.div>
          <div className="grid-4 categories-grid">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                className="category-card card card-glow"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="category-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                  <cat.icon size={28} weight="duotone" />
                </div>
                <h4>{cat.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-row">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <span className="stat-number">{s.value}</span>
                <span className="stat-text">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section testimonials">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="heading-lg">What People Say</h2>
            <p className="text-body">Real reviews from real customers and providers</p>
          </motion.div>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="testimonial-card card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <div className="stars" style={{ marginBottom: 12 }}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: 'var(--amber)' }} />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    <Users size={18} />
                  </div>
                  <div>
                    <strong>{t.name}</strong>
                    <span className="text-small"><MapPin size={12} /> {t.city}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section cta-section">
        <div className="container">
          <motion.div className="cta-box" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="heading-lg">Ready to Get Started?</h2>
            <p className="text-body" style={{ maxWidth: 480, margin: '12px auto 28px' }}>
              Whether you need a repair or want to offer your services — join thousands of happy users today.
            </p>
            <div className="flex-center gap-md">
              <Link to="/login" className="btn btn-primary btn-lg">
                Post a Request <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Join as Provider
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container flex-between" style={{ flexWrap: 'wrap', gap: 24 }}>
          <div className="footer-brand">
            <Wrench size={20} weight="fill" style={{ color: 'var(--amber)' }} />
            <span>Repair Connect</span>
          </div>
          <p className="text-small">© 2026 Repair Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
