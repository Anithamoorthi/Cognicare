import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const { login } = useContext(AuthContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      login(res.data);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Login Failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password, role, language });
      setTab('login');
      alert('Registered Successfully. Please Login.');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div id="auth-screen">
      <div className="auth-brand">
        <div className="auth-brand-icon">🧠</div>
        <div className="auth-brand-name">CogniCare</div>
        <div className="auth-brand-tagline">AI-Powered Dementia Monitoring System</div>
      </div>

      <div className="auth-card animate-in">
        <div className="auth-lang-bar" style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
          <button className={`auth-lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>🇬🇧 English</button>
          <button className={`auth-lang-btn ${language === 'ta' ? 'active' : ''}`} onClick={() => setLanguage('ta')}>🇮🇳 தமிழ்</button>
          <button className={`auth-lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>🇮🇳 हिंदी</button>
        </div>

        <h1 className="auth-title">{t('welcome_back')}</h1>
        <p className="auth-sub">{t('sign_in')} to your CogniCare account</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>{t('sign_in')}</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>{t('register')}</button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-primary" type="submit">{t('sign_in')} →</button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="auth-field"><label>Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="auth-field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="auth-field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <div className="auth-field">
              <label>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="patient">Patient</option>
                <option value="caregiver">Caregiver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">{t('register')} →</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
