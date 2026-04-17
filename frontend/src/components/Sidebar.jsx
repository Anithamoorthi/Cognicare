import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const getRoleBadge = () => {
    if (user?.role === 'admin') return <div className="sidebar-role-badge role-admin">{t('admin')}</div>;
    if (user?.role === 'caregiver') return <div className="sidebar-role-badge role-caregiver">{t('caregiver')}</div>;
    return <div className="sidebar-role-badge role-patient">{t('patient')}</div>;
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🧠</div>
        <span className="sidebar-logo-name">CogniCare</span>
      </div>
      
      {getRoleBadge()}
      
      <nav className="sidebar-nav" id="sidebar-nav">
        <div className="nav-section-label">{t('dashboard')}</div>
        
        {user?.role === 'patient' && (
          <>
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <div className="nav-icon">📊</div>{t('dashboard')}
            </div>
            <div className={`nav-item ${activeTab === 'test' ? 'active' : ''}`} onClick={() => setActiveTab('test')}>
              <div className="nav-icon">📝</div>{t('take_tests')}
            </div>
            <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <div className="nav-icon">📄</div>{t('reports')}
            </div>
            <div className={`nav-item ${activeTab === 'eyetracking' ? 'active' : ''}`} onClick={() => setActiveTab('eyetracking')}>
              <div className="nav-icon">👁️</div>{t('eye_tracking')}
            </div>
            <div className={`nav-item ${activeTab === 'cognibot' ? 'active' : ''}`} onClick={() => setActiveTab('cognibot')}>
              <div className="nav-icon">🤖</div>{t('cognibot')}
            </div>
            <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <div className="nav-icon">🔔</div>{t('notifications')}
            </div>
          </>
        )}

        {user?.role === 'caregiver' && (
          <>
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <div className="nav-icon">👥</div>{t('my_patients')}
            </div>
            <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <div className="nav-icon">📄</div>{t('reports')}
            </div>
            <div className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
              <div className="nav-icon">🔔</div>{t('alerts')}<div className="nav-badge">2</div>
            </div>
            <div className={`nav-item ${activeTab === 'cognibot' ? 'active' : ''}`} onClick={() => setActiveTab('cognibot')}>
              <div className="nav-icon">🤖</div>{t('cognibot')}
            </div>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <div className="nav-icon">📊</div>{t('dashboard')}
            </div>
            <div className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
              <div className="nav-icon">👥</div>{t('all_patients')}<div className="nav-badge">42</div>
            </div>
            <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <div className="nav-icon">📈</div>{t('ai_reports')}
            </div>
            <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <div className="nav-icon">🔔</div>{t('notifications')}<div className="nav-badge">3</div>
            </div>
            <div className={`nav-item ${activeTab === 'eyetracking' ? 'active' : ''}`} onClick={() => setActiveTab('eyetracking')}>
              <div className="nav-icon">👁️</div>{t('eye_tracking')}
            </div>
            <div className={`nav-item ${activeTab === 'cognibot' ? 'active' : ''}`} onClick={() => setActiveTab('cognibot')}>
              <div className="nav-icon">🤖</div>{t('cognibot')}
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">{t(user?.role)}</div>
        </div>
        <div className="sidebar-logout" onClick={logout} title="Sign out">⎋</div>
      </div>
    </aside>
  );
};

export default Sidebar;
