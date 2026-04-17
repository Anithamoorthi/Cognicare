import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import AdminDashboard from '../components/AdminDashboard';
import CaregiverDashboard from '../components/CaregiverDashboard';
import PatientDashboard from '../components/PatientDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div id="app" className="visible">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main">
        <header className="topbar">
          <div className="topbar-title">CogniCare</div>
          <div className="topbar-search">
            <span>🔍</span>
            <input type="text" placeholder="Search patients, reports…" />
          </div>
          <div className="topbar-actions">
            <select className="lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">🇬🇧 EN</option>
              <option value="ta">🇮🇳 TA</option>
              <option value="hi">🇮🇳 HI</option>
            </select>
            <div className="topbar-btn">🔔<div className="notif-dot"></div></div>
            <div className="topbar-btn">⚙️</div>
          </div>
        </header>
        
        <div className="page-content">
          {user?.role === 'admin' && <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />}
          {user?.role === 'caregiver' && <CaregiverDashboard activeTab={activeTab} setActiveTab={setActiveTab} />}
          {user?.role === 'patient' && <PatientDashboard activeTab={activeTab} setActiveTab={setActiveTab} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
