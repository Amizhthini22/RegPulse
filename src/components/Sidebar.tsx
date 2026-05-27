import React from 'react';
import { useApp } from '../context/AppContext';
import type { ViewType } from '../context/AppContext';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Rss, 
  UploadCloud, 
  Network, 
  History, 
  ShieldCheck, 
  Activity, 
  BrainCircuit
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, activeRole, realTimeSimulation, maps } = useApp();

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban' as ViewType, label: 'MAP Kanban Board', icon: KanbanSquare },
    { id: 'feed' as ViewType, label: 'Regulation Feed', icon: Rss },
    { id: 'upload' as ViewType, label: 'Evidence Validator', icon: UploadCloud },
    { id: 'org' as ViewType, label: 'Org Mapping Rules', icon: Network },
    { id: 'audit' as ViewType, label: 'Immutable Audit Trail', icon: History }
  ];

  // Helper to get Role labels
  const getRoleLabel = () => {
    switch (activeRole) {
      case 'compliance_officer':
        return 'Compliance Officer (Admin)';
      case 'dept_submitter':
        return 'Department Staff (Submitter)';
      case 'regulator_auditor':
        return 'Auditor / Regulator (Read-Only)';
      default:
        return 'Compliance Officer';
    }
  };

  const activeExceptions = maps.filter(m => m.status === 'Exceptions').length;

  return (
    <aside className="sidebar" style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '20px 16px',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Brand Logo Header */}
      <div className="flex-between" style={{ marginBottom: '28px', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="flex-center" style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
            boxShadow: 'var(--glow-primary)'
          }}>
            <ShieldCheck size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '18px', 
              fontWeight: 700, 
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              RegPulse
            </span>
            <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Compliance Orchestrator
            </div>
          </div>
        </div>
        <div className="flex-center" style={{ position: 'relative' }}>
          <Activity 
            size={16} 
            className="agent-pulse" 
            style={{ 
              animation: realTimeSimulation ? 'pulseGlow 1.8s infinite' : 'none',
              backgroundColor: realTimeSimulation ? 'var(--success)' : 'var(--text-tertiary)'
            }} 
          />
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '10px 12px',
                borderRadius: '6px',
                width: '100%',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '13px' }}>{item.label}</span>
              {item.id === 'kanban' && activeExceptions > 0 && (
                <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: '9px', borderRadius: '10px' }}>
                  {activeExceptions}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Agent System Health Monitor Panel */}
      <div className="linear-card" style={{
        marginTop: 'auto',
        padding: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <BrainCircuit size={14} />
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent Orchestrator</span>
          </div>
          <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 6px' }}>80% Auto</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
          <div className="flex-between">
            <span style={{ color: 'var(--text-secondary)' }}>Sentinel Scraper</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>RBI/SEBI</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
          </div>
          
          <div className="flex-between">
            <span style={{ color: 'var(--text-secondary)' }}>Translator LLM</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Legalese</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
          </div>

          <div className="flex-between">
            <span style={{ color: 'var(--text-secondary)' }}>Router Precedent</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Ontology</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
          </div>

          <div className="flex-between">
            <span style={{ color: 'var(--text-secondary)' }}>Validator Contract</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Auto-check</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
          </div>

          <div className="flex-between">
            <span style={{ color: 'var(--text-secondary)' }}>Audit Trail Log</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>SHA-256</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Profile Info */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
          Active Session
        </div>
        <div style={{ fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: activeRole === 'compliance_officer' ? 'var(--primary)' : activeRole === 'dept_submitter' ? 'var(--warning)' : 'var(--info)' 
          }} />
          {getRoleLabel()}
        </div>
      </div>
    </aside>
  );
};
