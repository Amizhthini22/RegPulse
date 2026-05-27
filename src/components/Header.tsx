import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { RoleType } from '../context/AppContext';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Play, 
  Pause, 
  UserCheck, 
  CheckCheck,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    activeRole, 
    setActiveRole, 
    searchQuery, 
    setSearchQuery, 
    realTimeSimulation, 
    setRealTimeSimulation,
    notifications,
    markNotificationsAsRead
  } = useApp();

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRole(e.target.value as RoleType);
  };

  const getNotifColor = (type: string) => {
    switch (type) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      default: return 'var(--info)';
    }
  };

  return (
    <header className="flex-between" style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      position: 'relative',
      zIndex: 10,
      flexShrink: 0
    }}>
      {/* Left side: Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '400px', position: 'relative' }}>
        <Search size={16} style={{ 
          position: 'absolute', 
          left: '12px', 
          color: 'var(--text-tertiary)',
          pointerEvents: 'none'
        }} />
        <input
          type="text"
          placeholder="Search MAPs, circulars, compliance criteria..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{
            paddingLeft: '36px',
            backgroundColor: 'var(--bg-primary)',
            fontSize: '13px',
            maxWidth: '360px'
          }}
        />
      </div>

      {/* Right side: Simulation controls, Role select, Theme toggle, Notification bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Real-time simulation switch */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Live Mock Agent Stream</span>
          <button
            onClick={() => setRealTimeSimulation(!realTimeSimulation)}
            className="btn"
            style={{
              padding: '2px 6px',
              height: '24px',
              fontSize: '10px',
              backgroundColor: realTimeSimulation ? 'var(--success-light)' : 'var(--bg-tertiary)',
              color: realTimeSimulation ? 'var(--success)' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {realTimeSimulation ? <Play size={10} style={{ fill: 'currentColor' }} /> : <Pause size={10} />}
            <span style={{ fontWeight: 600 }}>{realTimeSimulation ? 'ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>

        {/* Role-based selection switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={activeRole}
            onChange={handleRoleChange}
            className="form-select"
            style={{
              padding: '6px 28px 6px 10px',
              width: '180px',
              fontSize: '12px',
              height: '32px',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            <option value="compliance_officer">Compliance Officer</option>
            <option value="dept_submitter">Department Staff</option>
            <option value="regulator_auditor">Regulator / Auditor</option>
          </select>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ width: '32px', height: '32px' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className="btn-icon"
            style={{ width: '32px', height: '32px', position: 'relative' }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications slide-out panel */}
          {showNotifDrawer && (
            <div className="linear-card" style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              backgroundColor: 'var(--card-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px',
              zIndex: 100
            }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Agent Orchestrations</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markNotificationsAsRead} 
                      className="btn" 
                      style={{ padding: '2px 6px', fontSize: '10px', border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                      <CheckCheck size={12} style={{ marginRight: '2px' }} /> Mark read
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifDrawer(false)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{
                        padding: '10px',
                        backgroundColor: n.read ? 'transparent' : 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${getNotifColor(n.type)}`,
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <div className="flex-between">
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{n.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
