import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { LanguageContext } from '../context/LanguageContext';
import { generatePatientPDF } from '../utils/pdfGenerator';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', password: '', age: '', gender: 'Male', phone: '', assignedCaregiver: '' });
  const { t } = useContext(LanguageContext);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [patientsRes, caregiversRes] = await Promise.all([
        axios.get('https://cognicare-1-lxfi.onrender.com/auth/patients', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://cognicare-1-lxfi.onrender.com/api/auth/caregivers', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPatients(patientsRes.data);
      setCaregivers(caregiversRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://cognicare-1-lxfi.onrender.com/tests/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientHistory(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://cognicare-1-lxfi.onrender.com/api/auth/patients/add', newPatient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      fetchData();
      alert('Patient added successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add patient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://cognicare-1-lxfi.onrender.com/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleAssign = async (patientId, caregiverId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://cognicare-1-lxfi.onrender.com/api/auth/assign', { patientId, caregiverId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Assignment failed');
    }
  };

  const handleViewReport = (patient) => {
    setSelectedPatient(patient);
    fetchPatientHistory(patient._id);
    setActiveTab('reports');
  };

  const handleDownloadPDF = async (patient) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://cognicare-1-lxfi.onrender.com/api/tests/patient/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      generatePatientPDF(patient.name, res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    }
  };

  const renderPatientTable = () => (
    <div className="table-wrap">
      <table>
        <thead><tr><th>{t('patient')}</th><th>AGE</th><th>CAREGIVER</th><th>LAST TEST</th><th>{t('risk')}</th><th>{t('action')}</th></tr></thead>
        <tbody>
          {patients.length === 0 && (
            <tr><td colSpan="6" className="text-center">No patients found.</td></tr>
          )}
          {patients.map(p => (
            <tr key={p._id}>
              <td>
                <div className="d-flex gap-2 align-center">
                  <div className="sidebar-avatar">{p.name.charAt(0)}</div>
                  <div>
                     <div>{p.name}</div>
                     <div style={{fontSize: '11px', color: 'var(--text2)'}}>{p.email}</div>
                  </div>
                </div>
              </td>
              <td>{p.age || '-'}</td>
              <td>
                <select 
                  value={p.assignedCaregiver?._id || ''} 
                  onChange={(e) => handleAssign(p._id, e.target.value)}
                  style={{ border: 'none', background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
                >
                  <option value="">Unassigned</option>
                  {caregivers.map(cg => (
                    <option key={cg._id} value={cg._id}>{cg.name}</option>
                  ))}
                </select>
              </td>
              <td>{p.isForwardedToDoctor ? 'Forwarded' : 'Active'}</td>
              <td>
                <span className={`risk-${(p.riskLevel || 'Pending').toLowerCase()}`}>{p.riskLevel || 'Pending'}</span>
              </td>
              <td>
                <div className="action-row">
                  <button className="btn-icon btn-outline" title="View Detailed Report" onClick={() => handleViewReport(p)}>📄</button>
                  <button className="btn-icon blue" title="Download PDF" onClick={() => handleDownloadPDF(p)}>⬇</button>
                  <button className="btn-icon red" title="Remove Patient" onClick={() => handleDelete(p._id)}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const pieData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [
        patients.filter(p => p.riskLevel === 'Low').length || 3,
        patients.filter(p => p.riskLevel === 'Medium').length || 2,
        patients.filter(p => p.riskLevel === 'High').length || 7
      ],
      backgroundColor: ['#2daa6d', '#e5930a', '#d94040'],
      borderWidth: 0,
    }]
  };

  const pieOpts = { plugins: { legend: { position: 'bottom' } }, cutout: '70%' };

  if (activeTab === 'patients') {
    return (
      <div className="page active animate-in">
        <div className="page-header d-flex justify-between align-center">
          <div>
            <h1>👥 {t('all_patients')}</h1>
            <p>Manage patient enrollment and caregiver assignments.</p>
          </div>
          <button className="btn btn-blue" onClick={() => setShowAddModal(true)}>+ Add New Patient</button>
        </div>
        <div className="card mt-4">
          <div className="card-title mb-4">Registry ({patients.length})</div>
          {renderPatientTable()}
        </div>
      </div>
    );
  }

  if (activeTab === 'reports') {
    if (!selectedPatient) {
      return (
        <div className="page active animate-in">
          <div className="page-header">
            <h1>📈 {t('ai_reports')}</h1>
            <p>Select a patient from the list to view their detailed cognitive health analysis.</p>
          </div>
          <div className="card mt-4">
             <div className="card-title mb-4">Patient Selection</div>
             <div className="grid-3">
               {patients.map(p => (
                 <div key={p._id} className="patient-card" onClick={() => handleViewReport(p)}>
                    <div className="patient-card-header">
                      <div className="patient-avatar">{p.name.charAt(0)}</div>
                      <div>
                        <div className="patient-name">{p.name}</div>
                        <div className="patient-age">Age: {p.age || '-'} | <span className={`risk-${(p.riskLevel || 'Pending').toLowerCase()}`}>{p.riskLevel || 'Pending'}</span></div>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      );
    }

    const latest = patientHistory[patientHistory.length - 1] || {};
    const avgScore = patientHistory.length > 0 ? (patientHistory.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0) / patientHistory.length).toFixed(0) : 0;
    
    return (
      <div className="page active animate-in">
        <div className="page-header d-flex align-center gap-4">
          <button className="btn-icon btn-outline" onClick={() => setSelectedPatient(null)}>←</button>
          <div>
            <h1>Detailed Report: {selectedPatient.name}</h1>
            <p>Patient ID: {selectedPatient._id} · Risk Level: {selectedPatient.riskLevel}</p>
          </div>
        </div>

        <div className="report-hero-card mb-4" style={{ background: 'linear-gradient(135deg, var(--blue) 0%, #1a57b0 100%)' }}>
          <div className="report-hero-stats">
            <div className="report-stat">
              <div className="val">{avgScore}%</div>
              <div className="lbl">Average Performance</div>
            </div>
            <div className="report-stat">
              <div className="val">{selectedPatient.riskLevel || 'N/A'}</div>
              <div className="lbl">Risk Classification</div>
            </div>
            <div className="report-stat">
              <div className="val">{patientHistory.length}</div>
              <div className="lbl">Total Tests</div>
            </div>
            <div className="report-stat">
               <div className="val">{selectedPatient.age || '-'}</div>
               <div className="lbl">Patient Age</div>
            </div>
          </div>
          <div style={{ position: 'absolute', top: '32px', right: '32px' }}>
            <button className="btn btn-outline" style={{ borderColor: 'var(--white)', color: '#fff' }} onClick={() => handleDownloadPDF(selectedPatient)}>⬇ Download PDF</button>
          </div>
        </div>

        <div className="grid-6-4">
          <div className="card">
            <div className="card-title mb-4 uppercase tracking-wider text-xs text-slate-400">TEST HISTORY</div>
            <div className="table-wrap">
              <table style={{fontSize: '13px'}}>
                <thead><tr><th>DAY</th><th>DATE</th><th>SCORE</th><th>ATTENTION</th></tr></thead>
                <tbody>
                  {patientHistory.map(h => (
                    <tr key={h._id}>
                      <td>Day {h.day}</td>
                      <td>{new Date(h.dateTaken).toLocaleDateString()}</td>
                      <td><strong>{((h.score / h.maxScore) * 100).toFixed(0)}%</strong></td>
                      <td>{h.attentionScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
             <div className="card-title mb-4 uppercase tracking-wider text-xs text-slate-400">AI DIAGNOSIS & NOTES</div>
             <div className="p-4 bg-slate-50 rounded-xl mb-4 border-l-4 border-blue-500">
                <div className="font-bold text-blue-700 mb-1">Doctor Recommendations</div>
                <div className="text-sm text-slate-600 line-height-1.4">{selectedPatient.doctorRecommendation || "No recommendations generated yet."}</div>
             </div>
             <div className="alert alert-info">
                <div className="alert-icon">ℹ️</div>
                <div className="alert-body">
                   <div className="alert-title">AI Observation</div>
                   <div className="alert-msg">Patient shows {selectedPatient.riskLevel === 'Low' ? 'stable' : 'varied'} cognitive stability over {patientHistory.length} tests.</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active animate-in">
      <div className="page-header">
        <h1>📊 {t('admin')} {t('dashboard')}</h1>
        <p>{t('system_overview')} · {t('patient_management')} · Caregiver monitoring</p>
      </div>

      <div className="stat-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon" style={{background:'var(--purple-light)'}}>👥</div>
           <div className="stat-info"><div className="stat-val">{patients.length}</div><div className="stat-label">{t('total_patients')}</div><div className="stat-change stat-up">↑ 3 this week</div></div>
        </div>
        <div className="stat-card">
           <div className="stat-icon" style={{background:'var(--teal-light)'}}>🩺</div>
           <div className="stat-info"><div className="stat-val">{caregivers.length}</div><div className="stat-label">{t('active_caregivers')}</div><div className="stat-change stat-up">↑ 1 new</div></div>
        </div>
        <div className="stat-card">
           <div className="stat-icon" style={{background:'var(--red-light)', color:'var(--red)'}}>⚠️</div>
           <div className="stat-info"><div className="stat-val">{patients.filter(p => p.riskLevel === 'High').length}</div><div className="stat-label">{t('high_risk_patients')}</div><div className="stat-change stat-down">↑ 2 from yesterday</div></div>
        </div>
        <div className="stat-card">
           <div className="stat-icon" style={{background:'var(--green-light)', color:'var(--green)'}}>✅</div>
           <div className="stat-info"><div className="stat-val">89%</div><div className="stat-label">{t('test_completion')}</div><div className="stat-change stat-up">↑ 4% vs last week</div></div>
        </div>
      </div>

      <div className="grid-7-3">
        <div className="card">
          <div className="d-flex" style={{justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <div className="card-title">{t('patient_list')}</div>
              <div className="card-sub mb-4">Recent activity and overview</div>
            </div>
            <button className="btn btn-blue btn-sm" onClick={() => setActiveTab('patients')}>Manage All</button>
          </div>
          {renderPatientTable()}
        </div>

        <div className="d-flex flex-col gap-4">
          <div className="card text-center d-flex flex-col align-center">
            <div className="card-title align-self-start">{t('risk_distribution')}</div>
            <div style={{width:'200px', height:'200px', margin:'0 auto'}}>
              <Doughnut data={pieData} options={pieOpts} />
            </div>
          </div>
          
          <div className="card">
            <div className="card-title mb-4">{t('alerts')}</div>
            <div className="alert alert-danger" style={{ background: 'var(--red-light)', borderLeft: '4px solid var(--red)' }}>
              <div className="alert-icon" style={{marginTop: '2px'}}>🔴</div>
              <div className="alert-body">
                <div className="alert-title">High Risk Detected</div>
                <div className="alert-msg">System check: {patients.filter(p => p.riskLevel === 'High').length} patients require immediate review.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '32px', margin: 'auto' }}>
            <h3 className="mb-4">Add New Patient</h3>
            <form onSubmit={handleAddPatient}>
              <div className="auth-field"><label>Name</label><input type="text" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} /></div>
              <div className="auth-field"><label>Email</label><input type="email" required value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} /></div>
              <div className="auth-field"><label>Password</label><input type="password" required value={newPatient.password} onChange={e => setNewPatient({...newPatient, password: e.target.value})} /></div>
              <div className="grid-2">
                <div className="auth-field"><label>Age</label><input type="number" required value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} /></div>
                <div className="auth-field"><label>Gender</label>
                  <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="auth-field"><label>Initial Caregiver</label>
                <select value={newPatient.assignedCaregiver} onChange={e => setNewPatient({...newPatient, assignedCaregiver: e.target.value})}>
                  <option value="">None</option>
                  {caregivers.map(cg => <option key={cg._id} value={cg._id}>{cg.name}</option>)}
                </select>
              </div>
              <div className="d-flex gap-2 mt-6">
                <button type="button" className="btn btn-outline flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-blue flex-1">Create Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
