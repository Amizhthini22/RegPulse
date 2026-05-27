import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { AuditLog } from '../context/AppContext';
import { 
  ShieldCheck, 
  Copy, 
  Filter, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useApp();
  const [filterAgent, setFilterAgent] = useState<'all' | AuditLog['agent']>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    if (filterAgent === 'all') return true;
    return log.agent === filterAgent;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getAgentColor = (agent: AuditLog['agent']) => {
    switch (agent) {
      case 'Sentinel': return 'var(--primary)';
      case 'Translator': return 'var(--info)';
      case 'Router': return '#d97706'; // orange
      case 'Validator': return 'var(--success)';
      case 'Audit Trail': return '#8b5cf6'; // violet
      case 'Compliance Officer': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const getAgentBg = (agent: AuditLog['agent']) => {
    switch (agent) {
      case 'Sentinel': return 'var(--primary-light)';
      case 'Translator': return 'var(--info-light)';
      case 'Router': return 'var(--warning-light)';
      case 'Validator': return 'var(--success-light)';
      case 'Audit Trail': return '#f3e8ff'; // light violet
      case 'Compliance Officer': return 'var(--danger-light)';
      default: return 'var(--bg-tertiary)';
    }
  };

  return (
    <div className="content-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
      
      {/* Title block */}
      <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Immutable Ledger Audit Trail</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Blockchain-linked chronological log of every regulatory check, translation, routing, and validation state change.</p>
        </div>

        {/* Action Button: Export report */}
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `RegPulse_Audit_Trail_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
        >
          <FileSpreadsheet size={14} /> Export Audit Report (JSON)
        </button>
      </div>

      {/* Filter panel */}
      <div className="linear-card" style={{
        padding: '12px 16px',
        backgroundColor: 'var(--bg-secondary)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Filter size={14} />
          <span style={{ fontWeight: 600 }}>Filter Timeline:</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['all', 'Sentinel', 'Translator', 'Router', 'Validator', 'Audit Trail', 'Compliance Officer'] as const).map(agent => (
            <button
              key={agent}
              onClick={() => setFilterAgent(agent)}
              className="btn"
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '4px',
                backgroundColor: filterAgent === agent ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                color: filterAgent === agent ? 'var(--primary)' : 'var(--text-secondary)',
                border: filterAgent === agent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                fontWeight: filterAgent === agent ? 600 : 500
              }}
            >
              {agent === 'all' ? 'All Activities' : agent}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        <div className="timeline">
          {filteredLogs.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No audit logs match selected filter.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="timeline-item">
                
                {/* Visual timeline circle indicator */}
                <div 
                  className="timeline-dot" 
                  style={{ borderColor: getAgentColor(log.agent) }} 
                />

                {/* Audit Card */}
                <div className="linear-card" style={{
                  padding: '14px',
                  backgroundColor: 'var(--card-surface)',
                  marginLeft: '8px'
                }}>
                  {/* Card Header */}
                  <div className="flex-between" style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge" style={{
                        backgroundColor: getAgentBg(log.agent),
                        color: getAgentColor(log.agent),
                        fontSize: '9px',
                        fontWeight: 600
                      }}>
                        {log.agent} Agent
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{log.action}</span>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Details paragraph */}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4', marginBottom: '8px' }}>
                    {log.details}
                  </p>

                  {/* Cryptographic Hash Badge (Copy hover copy triggers) */}
                  <div className="flex-between" style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '8px',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)'
                  }}>
                    {/* Association metadata */}
                    <div>
                      {log.mapId && <span style={{ marginRight: '12px' }}>MAP Target: <strong>{log.mapId}</strong></span>}
                      {log.circularId && <span>Source Circ: <strong>{log.circularId}</strong></span>}
                    </div>

                    {/* Hash Verification tag */}
                    <div 
                      onClick={() => handleCopyHash(log.hash)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <ShieldCheck size={10} style={{ color: 'var(--success)' }} />
                      <span>LEDGER COMMIT: {log.hash.substring(0, 16)}...</span>
                      <Copy size={9} />
                      {copiedHash === log.hash && (
                        <span style={{ color: 'var(--success)', fontSize: '9px', fontWeight: 600 }}>Copied!</span>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
