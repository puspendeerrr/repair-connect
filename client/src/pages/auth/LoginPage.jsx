import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Envelope, ArrowRight, ArrowLeft } from 'phosphor-react';
import { sendOtp, verifyOtp } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './LoginPage.css';

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await sendOtp(email);
      setStep(2);
      setCountdown(30);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process email.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value.slice(-1);
    setOtp(newOtp);
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (newOtp.every((d) => d !== '')) handleOtpSubmit(newOtp.join(''));
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (code) => {
    setLoading(true);
    try {
      const { data } = await verifyOtp(email, code || otp.join(''));
      
      if (!data.isNewUser) {
        localStorage.setItem('token', data.token);
        console.log('Token stored in localStorage:', data.token);
        login(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        const path = data.user.role === 'admin' ? '/admin/dashboard'
          : data.user.role === 'provider' ? '/provider/dashboard'
          : '/customer/dashboard';
        window.location.href = path;
      } else {
        toast.success('Email verified! Please complete your profile.');
        navigate('/onboarding', { state: { email, tempToken: data.tempToken } });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await sendOtp(email);
      setCountdown(30);
      toast.success('New OTP sent!');
    } catch (err) {
      toast.error('Failed to resend OTP.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div className="login-logo">
            <Wrench size={28} weight="fill" />
          </div>
          <h1>Repair Connect</h1>
          <p className="text-small">Your trusted repair partner</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="email-step"
              className="login-form"
              onSubmit={handleEmailSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="input-group">
                <label>Enter your email to continue</label>
                <div className="input-icon-wrapper">
                  <Envelope size={18} className="input-icon" />
                  <input
                    type="email"
                    className="input input-with-icon"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div
              key="otp-step"
              className="login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-body" style={{ textAlign: 'center', marginBottom: 24 }}>
                We sent a 6-digit code to <strong className="text-amber">{email}</strong>
              </p>
              <div className="otp-inputs">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-box"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleOtpSubmit()}
                disabled={loading || otp.some((d) => !d)}
              >
                {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : 'Verify'}
              </button>
              <div className="otp-footer">
                <button className="link-btn" onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }}>
                  <ArrowLeft size={14} /> Change email
                </button>
                <button className="link-btn" onClick={handleResend} disabled={countdown > 0}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
