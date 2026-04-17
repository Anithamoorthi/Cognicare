import React, { useContext, useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { LanguageContext } from '../context/LanguageContext';
import axios from 'axios';
import { generatePatientPDF } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CaregiverDashboard = ({ activeTab, setActiveTab }) => {
  const [patients, setPatients] = useState([]);
  const { t } = useContext(LanguageContext);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://cognicare-1-lxfi.onrender.com', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSendReminder = async (patientName) => {
    alert(`Reminder notification sent to ${patientName} via Mobile App.`);
  };

  const handleDownloadPDF = async (patient) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://cognicare-1-lxfi.onrender.com/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      generatePatientPDF(patient.name, res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    }
  };

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Avg Patient Score',
      data: [65, 70, 75, 45, 80, 85, 90],
      backgroundColor: (context) => {
        const val = context.dataset.data[context.dataIndex];
        return val > 80 ? '#2daa6d' : val > 60 ? '#e5930a' : '#d94040';
      },
      borderRadius: 4
    }]
  };
  const barOpts = { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false };

  if (activeTab === 'reports') {
    return (
      <div className="page active">
        <div className="page-header">
          <h1>📄 {t('reports')}</h1>
        </div>
        <div className="card mt-4">
          <h2>Patient Reports</h2>
          <p>Detailed performance reports for all your assigned patients.</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'alerts') {
    return (
      <div className="page active">
        <div className="page-header">
          <h1>🔔 {t('alerts')}</h1>
        </div>
        <div className="card mt-4">
          <h2>Active Alerts</h2>
          <div className="alert alert-danger mt-4">
            <div className="alert-icon">🔴</div>
            <div className="alert-body">
              <div className="alert-title">Ravi Kumar</div>
              <div className="alert-msg">Cognitive score critically low — 38%</div>
            </div>
          </div>
          <div className="alert alert-warning mt-4">
            <div className="alert-icon">🟡</div>
            <div className="alert-body">
              <div className="alert-title">Lakshmi Iyer</div>
              <div className="alert-msg">Missed 2 consecutive tests</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'cognibot') {
    return (
      <div className="page active">
        <div className="page-header">
          <h1>🤖 {t('cognibot')}</h1>
        </div>
        <div className="card mt-4">
          <h2>CogniBot Assistant</h2>
          <p>Ask CogniBot for insights and intervention recommendations based on patient data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h1>🩺 {t('caregiver')} {t('dashboard')}</h1>
        <p>Monitor your assigned patients · Track progress · Send alerts</p>
      </div>

      <div className="stat-grid mb-4">
        <div className="stat-card"><div className="stat-icon" style={{background:'var(--blue-light)'}}>👤</div><div className="stat-info"><div className="stat-val">{patients.length}</div><div className="stat-label">My Patients</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{background:'var(--amber-light)',color:'var(--amber)'}}>⏰</div><div className="stat-info"><div className="stat-val">2</div><div className="stat-label">Tests Due Today</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{background:'var(--red-light)',color:'var(--red)'}}>🚨</div><div className="stat-info"><div className="stat-val">1</div><div className="stat-label">Urgent Alerts</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{background:'var(--green-light)',color:'var(--green)'}}>📈</div><div className="stat-info"><div className="stat-val">74%</div><div className="stat-label">Avg Score</div></div></div>
      </div>

      <div className="grid-6-4">
        <div>
          <div className="d-flex" style={{justifyContent: 'space-between', marginBottom: '16px'}}>
            <div className="card-title">My Patients</div>
          </div>
          
          <div className="grid-2">
            {patients.length === 0 && <p>No patients assigned to you yet.</p>}
            {patients.map(p => (
              <div className="patient-card" key={p._id}>
                <div className="patient-card-header">
                  <div className="patient-avatar">{p.name.charAt(0)}</div>
                  <div className="flex-1"><div className="patient-name">{p.name}</div><div className="patient-age">{p.email}</div></div>
                  <div className={`risk-${String(p.riskLevel || 'Pending').toLowerCase()}`}>{p.riskLevel || 'Pending'}</div>
                </div>
                <div className="progress-bar" style={{ background: 'var(--bg2)', height: '8px', borderRadius: '4px', overflow: 'hidden', margin: '14px 0' }}>
                  <div 
                    className={`progress-fill`} 
                    style={{ 
                      width: p.riskLevel === 'High' ? '40%' : p.riskLevel === 'Medium' ? '65%' : '85%', 
                      background: p.riskLevel === 'High' ? 'var(--red)' : p.riskLevel === 'Medium' ? 'var(--amber)' : 'var(--green)',
                      height: '100%'
                    }}
                  ></div>
                </div>
                <div className="patient-stats">
                  <div className="patient-stat">
                    <div className="val" style={{ color: p.isForwardedToDoctor ? 'var(--red)' : 'var(--text)' }}>
                      {p.isForwardedToDoctor ? 'REQUIRED' : 'NONE'}
                    </div>
                    <div className="lbl">Doctor Review</div>
                  </div>
                  <div className="patient-stat">
                    <div className="val">{p.age || '—'}</div>
                    <div className="lbl">Age</div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4 mt-auto">
                  <button className="btn btn-outline flex-1 btn-sm" onClick={() => handleDownloadPDF(p)}>View Report</button>
                  <button className="btn btn-sm" style={{background: 'var(--amber)', color: '#fff', flex: 1}} onClick={() => handleSendReminder(p.name)}>📩 Send Reminder</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="d-flex flex-col gap-4">
          <div className="card">
            <div className="card-title mb-4">Recent Alerts</div>
            <div className="alert alert-danger">
              <div className="alert-icon">🔴</div>
              <div className="alert-body"><div className="alert-title">Ravi Kumar</div><div className="alert-msg">Cognitive score critically low — 38%</div></div>
            </div>
            <div className="alert alert-warning">
              <div className="alert-icon">🟡</div>
              <div className="alert-body"><div className="alert-title">Lakshmi Iyer</div><div className="alert-msg">Missed 2 consecutive tests</div></div>
            </div>
          </div>

          <div className="card">
            <div className="card-title mb-4">Score Overview</div>
            <div style={{height: '180px'}}><Bar data={barData} options={barOpts} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
