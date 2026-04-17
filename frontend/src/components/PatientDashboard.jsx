import React, { useState, useEffect, useContext } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import CognitiveTest from './CognitiveTest';
import axios from 'axios';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { generatePatientPDF } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PatientDashboard = ({ activeTab, setActiveTab }) => {
  const [history, setHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { t } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  
  const currentDay = history.length < 7 ? history.length + 1 : 7;
  const hasTakenToday = history.some(h => new Date(h.dateTaken).toDateString() === new Date().toDateString());

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://cognicare-1-lxfi.onrender.com/api/tests/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [activeTab]);

  useEffect(() => {
    // 7-day completion evaluation trigger
    const evaluateRisk = async () => {
      if (history.length === 7 && (!user.riskLevel || user.riskLevel === 'Pending')) {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post('https://cognicare-1-lxfi.onrender.com/api/chat/evaluate', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Refresh page or global state normally here, 
          // but for simplicity we'll just alert and reload if first evaluated.
          alert('7-day diagnosis complete! Your new risk level has been calculated.');
          window.location.reload();
        } catch (err) {
          console.error("AI Evaluation error:", err);
        }
      }
    };
    evaluateRisk();
  }, [history, user]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://cognicare-1-lxfi.onrender.com/api/chat/message', { message: msg }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your internet or try again later.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const latestScore = history.length > 0 ? ((history[history.length-1].score / history[history.length-1].maxScore) * 100).toFixed(0) : 0;
  const avgResponseTime = history.length > 0 ? history[history.length-1].averageResponseTime?.toFixed(1) : "0.0";
  const riskLevel = latestScore > 80 ? "Low" : latestScore > 50 ? "Medium" : "High";
  const riskColor = riskLevel === "Low" ? "var(--green)" : riskLevel === "Medium" ? "var(--amber)" : "var(--red)";

  const chartLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const chartDataPoints = [null, null, null, null, null, null, null];
  history.forEach(h => {
    if (h.day >= 1 && h.day <= 7) {
      chartDataPoints[h.day - 1] = ((h.score / h.maxScore) * 100).toFixed(0);
    }
  });

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Performance %',
      data: chartDataPoints,
      borderColor: 'var(--blue)',
      backgroundColor: 'rgba(42, 107, 204, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: 'var(--blue)',
      pointRadius: 6,
      fill: true,
      tension: 0.3,
      spanGaps: true
    }]
  };

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(26, 37, 64, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: { 
      y: { 
        min: 0, 
        max: 100,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 20 }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  if (activeTab === 'test') {
    return (
      <div className="page active">
        <div className="page-header">
          <h1>👤 {t('dashboard')} / {t('take_tests')}</h1>
        </div>
        <div className="mt-4">
          {hasTakenToday ? (
            <div className="card text-center">
              <h2>You've completed your test for today!</h2>
              <p>Please come back tomorrow for Day {currentDay + 1 <= 7 ? currentDay + 1 : 7}.</p>
            </div>
          ) : (
            <CognitiveTest day={currentDay} onComplete={() => setActiveTab('overview')} />
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'reports') {
    return (
      <div className="page active">
        <div className="page-header d-flex justify-between align-center">
          <h1 className="mb-0">📄 {t('reports')}</h1>
        </div>
        <p className="card-sub mb-4">Cognitive assessment · Risk analysis · AI recommendations</p>

        <div className="report-hero-card mb-4" style={{ position: 'relative' }}>
          <h2>Cognitive Health Report</h2>
          <p style={{ opacity: 0.9 }}>Patient: {user.name || 'Patient'} · Generated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          
          <div className="report-hero-stats">
            <div className="report-stat">
              <div className="val">{latestScore}%</div>
              <div className="lbl">Overall Score</div>
            </div>
            <div className="report-stat">
              <div className="val">{riskLevel}</div>
              <div className="lbl">Risk Level</div>
            </div>
            <div className="report-stat">
              <div className="val">{history.length}/7</div>
              <div className="lbl">Tests Done</div>
            </div>
            <div className="report-stat">
              <div className="val">—</div>
              <div className="lbl">Weekly Trend</div>
            </div>
          </div>

          <div style={{ position: 'absolute', top: '32px', right: '32px', display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>🔄 Regenerate</button>
            <button 
              className="btn btn-outline" 
              style={{ borderColor: 'var(--white)', color: '#fff' }}
              onClick={() => generatePatientPDF(user.name || 'Patient', history)}
              disabled={history.length === 0}
            >
              ⬇ Download Report
            </button>
          </div>
        </div>

        <div className="grid-6-4">
          <div className="card">
            <div className="card-title text-uppercase" style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', marginBottom: '16px' }}>7-DAY PERFORMANCE HISTORY</div>
            <div className="d-flex flex-col gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(d => {
                const testData = history.find(h => h.day === d);
                return (
                  <div key={d} className="d-flex justify-between align-center" style={{ padding: '12px 0', borderBottom: d !== 7 ? '1px solid var(--border)' : 'none' }}>
                    <div className="d-flex align-center gap-3">
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: testData ? 'var(--blue-light)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '12px', fontWeight: 'bold', color: testData ? 'var(--blue)' : 'var(--text3)' }}>{d}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text2)' }}>Assessment Day {d}</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{testData ? `${((testData.score / testData.maxScore) * 100).toFixed(0)}%` : 'Pending'}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="card">
            <div className="card-title text-uppercase" style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', marginBottom: '16px' }}>RISK ANALYSIS BY CATEGORY</div>
            
            <div className="risk-analysis-row mt-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>Weekly Diagnosis</div>
              <div className={`risk-${riskLevel.toLowerCase()}`}>{riskLevel} Risk</div>
            </div>

            {/* Use testBreakdown if available, otherwise fallback */}
            {(() => {
              const latest = history[history.length - 1] || {};
              const breakdown = latest.testBreakdown || { memory: 0, reaction: 0, qa: 0, speech: 0 };
              const categories = [
                { label: 'Memory recall', field: 'memory', color: 'blue' },
                { label: 'Reaction Speeed', field: 'reaction', color: 'amber' },
                { label: 'Eye Attention', field: 'attention', color: 'green', value: latest.attentionScore },
                { label: 'Speech Stability', field: 'speech', color: 'purple' }
              ];

              return categories.map(cat => {
                const val = cat.value !== undefined ? cat.value : (breakdown[cat.field] / 10 * 100);
                return (
                  <div key={cat.label} className="mb-4">
                    <div className="risk-analysis-row">
                      <div>{cat.label}</div>
                      <div style={{ fontWeight: '600', color: `var(--${cat.color})` }}>{val ? val.toFixed(0) : 0}%</div>
                    </div>
                    <div className="trend-line">
                      <div className={`progress-fill`} style={{ width: `${val}%`, background: `var(--${cat.color})` }}></div>
                    </div>
                  </div>
                );
              });
            })()}

            {user.doctorRecommendation && (
              <div className="mt-4 p-4" style={{ background: 'var(--bg)', borderRadius: '12px', borderLeft: '4px solid var(--blue)' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--blue)', marginBottom: '4px' }}>AI RECOMMENDATION</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.5' }}>{user.doctorRecommendation}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'eyetracking') {
    return (
      <div className="page active">
        <div className="page-header">
          <h1>👁️ {t('eye_tracking')}</h1>
        </div>
        <div className="card mt-4 text-center">
          <h2>Eye Tracking Setup</h2>
          <p>This module helps calibrate and monitor your eye tracking accuracy during tests.</p>
          <div style={{ maxWidth: '600px', margin: '20px auto', height: '400px' }}>
            {/* Embedded EyeTracker or Calibration Box could go here */}
            <div className="camera-box d-flex align-center justify-center p-4">
               <div className="camera-placeholder text-center">
                 <div className="cam-icon" style={{fontSize: '48px'}}>📹</div>
                 <p className="mt-2">Camera is ready</p>
                 <button className="btn-blue mt-4" onClick={() => setActiveTab('test')}>Proceed to Assessment</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'cognibot') {
    return (
      <div className="page active">
        <div className="page-header d-flex justify-between align-center">
          <h1 className="mb-0">🤖 {t('cognibot')} Assistant</h1>
        </div>
        <p className="card-sub mb-4">AI-powered dementia care assistant · 24/7 support</p>
        
        <div className="grid-7-3">
          <div className="card d-flex flex-col" style={{ height: '560px', padding: 0, overflow: 'hidden' }}>
            
            <div className="chat-header" style={{ background: 'var(--white)', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div className="chat-bot-avatar">🤖</div>
              <div className="chat-bot-info ml-2" style={{ marginLeft: '12px' }}>
                <div className="chat-bot-name" style={{ fontSize: '15px', fontWeight: '700' }}>CogniBot</div>
                <div className="chat-bot-status" style={{ fontSize: '12px', color: 'var(--green)' }}>● Online · Ready to help</div>
              </div>
            </div>

            <div className="chat-messages flex-1" style={{ padding: '24px', overflowY: 'auto', background: 'var(--bg2)' }}>
               {chatMessages.length === 0 && (
                 <div className="d-flex" style={{ marginBottom: '16px' }}>
                   <div className="chat-bot-avatar" style={{ marginRight: '12px', flexShrink: 0 }}>🤖</div>
                   <div className="chat-bubble-custom chat-bubble-bot">
                     Hello! I'm CogniBot, your AI dementia care assistant. 👋 I can help you understand test scores, risk levels, and dementia care. What would you like to know?
                   </div>
                 </div>
               )}
               {chatMessages.map((msg, i) => (
                  <div key={i} className={`d-flex ${msg.role === 'user' ? 'justify-end' : ''}`} style={{ marginBottom: '16px' }}>
                    {msg.role !== 'user' && <div className="chat-bot-avatar" style={{ marginRight: '12px', flexShrink: 0 }}>🤖</div>}
                    <div className={`chat-bubble-custom ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                      {msg.content}
                    </div>
                  </div>
               ))}
               {isChatLoading && (
                 <div className="d-flex" style={{ marginBottom: '16px' }}>
                   <div className="chat-bot-avatar" style={{ marginRight: '12px', flexShrink: 0 }}>🤖</div>
                   <div className="chat-bubble-custom chat-bubble-bot">...</div>
                 </div>
               )}
            </div>
            
            <div className="chat-input-row" style={{ padding: '16px 20px', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
               <input 
                 type="text" 
                 placeholder="Type a message..." 
                 value={chatInput} 
                 onChange={e => setChatInput(e.target.value)} 
                 onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                 style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', width: '100%' }}
               />
               <button className="chat-send-btn" style={{ marginLeft: '12px', width: '44px', height: '44px', borderRadius: '8px' }} onClick={sendMessage}>
                 ▶
               </button>
            </div>
          </div>

          <div className="d-flex flex-col gap-4">
            <div className="card text-left">
              <div className="card-title mb-4">Quick Topics</div>
              <button className="pill-btn" onClick={() => { setChatInput('Early signs of dementia'); sendMessage(); }}>🧠 Early signs of dementia</button>
              <button className="pill-btn" onClick={() => { setChatInput('How scores are calculated'); sendMessage(); }}>📊 How scores are calculated</button>
              <button className="pill-btn" onClick={() => { setChatInput('High risk guidance'); sendMessage(); }}>⚠️ High risk guidance</button>
              <button className="pill-btn" onClick={() => { setChatInput('Caregiver tips'); sendMessage(); }}>🩺 Caregiver tips</button>
              <button className="pill-btn" onClick={() => { setChatInput('Eye tracking explained'); sendMessage(); }}>👁️ Eye tracking explained</button>
            </div>

            <div className="card text-left">
              <div className="card-title mb-2">About CogniBot</div>
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>
                CogniBot answers questions about dementia care, test scores, and CogniCare features. For medical emergencies, always contact a professional.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'notifications') {
    return (
      <div className="page active">
        <div className="page-header">
          <h1>🔔 {t('notifications')}</h1>
        </div>
        <div className="card mt-4">
          <h2>Notifications</h2>
          <p>You have no new notifications at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h1>👤 My Dashboard</h1>
        <p>Your cognitive health overview · Take tests · View reports</p>
      </div>

      {user.isForwardedToDoctor && (
        <div className="alert alert-danger mb-4">
          <div className="alert-icon">⚠️</div>
          <div className="alert-body">
            <div className="alert-title">Diagnostic Notice: {user.riskLevel} Risk Detected</div>
            <div className="alert-msg">
              Your recent test results indicate a requirement for medical review. Your caregiver/doctor has been notified.
              <br/><strong>AI Suggestion:</strong> {user.doctorRecommendation || "Please proceed with doctor suggestions for further treatment."}
            </div>
          </div>
        </div>
      )}
      
      {user.riskLevel === 'Low' && history.length === 7 && (
        <div className="alert alert-success mb-4" style={{background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--green)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '16px'}}>
          <div style={{fontSize: '24px'}}>🌟</div>
          <div>
            <div style={{fontWeight: 600, fontSize: '16px'}}>Great Job! Normal Cognitive Health Detected</div>
            <div style={{marginTop: '4px'}}>Your AI diagnosis returned Low risk. Keep your brain active by practicing our AI daily training modules, reading, and solving puzzles.</div>
          </div>
        </div>
      )}

      <div className="grid-3 mb-4">
        <div className="stat-card">
          <div className="stat-icon" style={{background:'var(--purple-light)'}}>🧠</div>
          <div className="stat-info">
            <div className="stat-val">{latestScore}%</div>
            <div className="stat-label">{t('latest_score')}</div>
            <div className="stat-change stat-up">↑ 5% from last</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'var(--teal-light)'}}>📅</div>
          <div className="stat-info">
            <div className="stat-val">{history.length}/7</div>
            <div className="stat-label">{t('tests_completed')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'var(--amber-light)', color:'var(--amber)'}}>⚡</div>
          <div className="stat-info">
            <div className="stat-val">{avgResponseTime}s</div>
            <div className="stat-label">{t('avg_response_time')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'var(--red-light)', color:'var(--red)'}}>🎯</div>
          <div className="stat-info">
            <div className="stat-val" style={{color: riskColor}}>{riskLevel}</div>
            <div className="stat-label">{t('risk_level')}</div>
          </div>
        </div>
      </div>
      
      <div className="grid-6-4 mb-4">
        <div className="card">
          <div className="card-title">{t('seven_day_progress')}</div>
          <div className="chart-wrap" style={{ height: "250px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card d-flex flex-col align-center justify-center text-center">
          <div className="card-title" style={{ alignSelf: 'flex-start' }}>{t('todays_test')}</div>
          <div style={{fontSize: '48px', marginTop: '20px'}}>📄</div>
          <h3 className="mt-4">Day {currentDay} Cognitive Test</h3>
          <p className="card-sub mb-4">Difficulty increases based on progress.</p>
          <button className="btn-primary" onClick={() => setActiveTab('test')}>{t('start_test')}</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title mb-4">{t('test_history')}</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>{t('day')}</th><th>{t('date')}</th><th>{t('score')}</th><th>{t('response_time')}</th><th>{t('attention')}</th><th>{t('risk')}</th></tr></thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan="6" className="text-center">No tests taken yet.</td></tr>}
              {history.map((h, i) => {
                const s = ((h.score / h.maxScore) * 100);
                const r = s > 80 ? 'Low' : s > 50 ? 'Medium' : 'High';
                return (
                  <tr key={i}>
                    <td>Day {h.day}</td>
                    <td>{new Date(h.dateTaken).toLocaleDateString()}</td>
                    <td><strong>{s.toFixed(0)}%</strong></td>
                    <td>{h.averageResponseTime?.toFixed(1)}s</td>
                    <td>{h.attentionScore}%</td>
                    <td><span className={`risk-${r.toLowerCase()}`}>{r}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PatientDashboard;
