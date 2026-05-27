import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Brain
} from 'lucide-react';

export const EvidenceUploadView: React.FC = () => {
  const { 
    maps, 
    uploadEvidence, 
    activeUploadMapId, 
    setActiveUploadMapId,
    activeRole,
    overrideMAPValidation
  } = useApp();

  // Pick target MAP for submission
  const eligibleMaps = maps.filter(m => ['In Progress', 'Exceptions', 'Pending Validation'].includes(m.status));
  const [selectedMapId, setSelectedMapId] = useState<string>(activeUploadMapId || eligibleMaps[0]?.id || '');

  const activeMap = maps.find(m => m.id === selectedMapId);

  // Drag-and-drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form input override notes
  const [overrideNotes, setOverrideNotes] = useState('');

  // Sync state if redirected from MAP board
  useEffect(() => {
    if (activeUploadMapId) {
      setSelectedMapId(activeUploadMapId);
    }
  }, [activeUploadMapId]);

  // Pre-made quick load templates
  const loadSuccessfulTemplate = () => {
    if (!selectedMapId) return;
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          uploadEvidence(
            selectedMapId,
            'OWASP_Security_Assessment_Signed.pdf',
            'SECURE TRANSACTION PORTAL SECURITY AUDIT 2026.\nTarget: Core Transaction API.\nAuditor: CySec Guard Ltd.\nOWASP Compliance Rating: AAA.\nCritical Vulnerabilities Found: 0.\nMedium/Low Vulnerabilities: 2 (patched).\nAPI Gateway rating: Rate Limiting Active. Conclusion: Secure.'
          );
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const loadFailureTemplate = () => {
    if (!selectedMapId) return;
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          uploadEvidence(
            selectedMapId,
            'DR_Drill_Logs_Operations_Failover.txt',
            'Apex Trust Disaster Recovery Drill Report\nDate: May 12, 2026\nSystem Tested: Core Policyholder Records DB\nMethod: Server Mirroring failover sequence.\nPrimary Server Disabled: 10:00 AM\nSecondary Server Synchronization: 01:15 PM\nData Replication Gap: 195 minutes\nTransaction Logs Verified: Complete.'
          );
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && selectedMapId) {
      const file = files[0];
      setUploading(true);
      setUploadProgress(0);

      // Read file content
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = (reader.result as string) || `Uploaded custom text for ${file.name}`;
        
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setUploading(false);
              uploadEvidence(selectedMapId, file.name, textContent);
              return 100;
            }
            return prev + 20;
          });
        }, 150);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="content-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
      
      {/* Title block */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Autonomous Evidence Validator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Upload compliance proof files. The Validator Agent autonomously parses text against clauses in real time.</p>
      </div>

      {/* Main layout grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Upload & Target selection pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* Target selection drop */}
          <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Measurable Action Point (MAP)
            </label>
            <select
              value={selectedMapId}
              onChange={(e) => {
                setSelectedMapId(e.target.value);
                setActiveUploadMapId(e.target.value);
              }}
              className="form-select"
              style={{ height: '36px', fontSize: '13px' }}
            >
              <option value="" disabled>Select active task...</option>
              {eligibleMaps.map(m => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.title.substring(0, 40)}... ({m.status})
                </option>
              ))}
            </select>

            {activeMap && (
              <div style={{ marginTop: '8px', fontSize: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <div className="flex-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Active Contract:</span>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{activeMap.department}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{activeMap.contract}</p>
              </div>
            )}
          </div>

          {/* Drag & Drop Zone */}
          {selectedMapId ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="linear-card flex-center"
              style={{
                flexDirection: 'column',
                height: '240px',
                border: isDragOver ? '2px dashed var(--primary)' : '1.5px dashed var(--border-color)',
                backgroundColor: isDragOver ? 'var(--bg-tertiary)' : 'var(--card-surface)',
                gap: '12px',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <UploadCloud size={40} style={{ color: isDragOver ? 'var(--primary)' : 'var(--text-tertiary)' }} />
              
              {uploading ? (
                <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Extracting document features...</span>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: 'var(--primary)', transition: 'width 0.2s ease' }} />
                  </div>
                </div>
              ) : (
                <div>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>Drag & Drop evidence document here</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Supports PDF, TXT, JSON (Max 5MB)</p>
                </div>
              )}
            </div>
          ) : (
            <div className="linear-card flex-center" style={{ height: '240px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
              Please select a MAP to activate the upload terminal.
            </div>
          )}

          {/* Interactive Fast Templates (Unique Feature to test fail/pass) */}
          {selectedMapId && (
            <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600 }}>Simulation Helper Templates</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click templates below to instantly load files representing different validation contracts:</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  onClick={loadSuccessfulTemplate}
                  disabled={uploading}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '10px', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                >
                  <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> SECURE TEMPLATE
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Auto-approves (IT MAPs)</span>
                </button>

                <button 
                  onClick={loadFailureTemplate}
                  disabled={uploading}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '10px', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                >
                  <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> EXCEPTION TEMPLATE
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Fails SLA limits (RPO Drill)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Dual-Pane Validator Explainer Panel */}
        {activeMap ? (
          <div className="linear-card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--bg-secondary)',
            overflowY: 'auto'
          }}>
            {/* Header info */}
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Validator Agent Explainer</span>
              </div>
              
              {activeMap.validationConfidence && (
                <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Confidence: {activeMap.validationConfidence}%
                </span>
              )}
            </div>

            {/* If no evidence yet */}
            {!activeMap.evidenceName ? (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '12px', color: 'var(--text-tertiary)', padding: '40px 0' }}>
                <UploadCloud size={48} />
                <span style={{ fontSize: '13px' }}>Awaiting evidence upload to run validation contract matching</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                
                {/* Visual Matching Link Excerpts (Dual panel) */}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Semantic Clause ↔ Evidence Matching
                  </h4>
                  
                  <div className="matching-pane" style={{ height: '220px' }}>
                    {/* Left: Original Clause */}
                    <div className="match-box">
                      <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>Clause Criteria ({activeMap.clauseRef})</span>
                      <p style={{ fontSize: '11px', marginTop: '6px', lineHeight: '1.4' }}>{activeMap.clauseText}</p>
                    </div>

                    {/* Right: Uploaded Evidence Text Highlight */}
                    <div className="match-box" style={{ borderColor: activeMap.status === 'Approved' ? 'var(--success)' : 'var(--danger)' }}>
                      <span style={{ fontSize: '10px', color: activeMap.status === 'Approved' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        Extracted Excerpt ({activeMap.evidenceName})
                      </span>
                      <div className="match-highlight" style={{
                        borderColor: activeMap.status === 'Approved' ? 'var(--success)' : 'var(--danger)',
                        backgroundColor: activeMap.status === 'Approved' ? 'var(--success-light)' : 'var(--danger-light)'
                      }}>
                        {activeMap.validationMatchExcerpt}
                      </div>
                      <p style={{ color: 'var(--text-tertiary)', marginTop: '6px', fontSize: '9px', lineHeight: '1.3' }}>
                        {activeMap.evidenceText?.substring(0, 120)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validation log details */}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Agent Execution Log & Justification
                  </h4>
                  <div style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    color: 'var(--text-primary)'
                  }}>
                    {activeMap.validationLog}
                  </div>
                </div>

                {/* Overriding logic */}
                {activeMap.status === 'Exceptions' && activeRole === 'compliance_officer' && (
                  <div style={{ 
                    borderTop: '1px solid var(--border-color)', 
                    paddingTop: '12px', 
                    marginTop: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>Compliance Override Console</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Enter manual justification reason..."
                        value={overrideNotes}
                        onChange={(e) => setOverrideNotes(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '11px', height: '28px' }}
                      />
                      <button
                        disabled={!overrideNotes}
                        onClick={() => {
                          overrideMAPValidation(activeMap.id, true, overrideNotes);
                          setOverrideNotes('');
                        }}
                        className="btn btn-primary"
                        style={{ padding: '2px 10px', fontSize: '11px', height: '28px', opacity: overrideNotes ? 1 : 0.6 }}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          <div className="linear-card flex-center" style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
            No target MAP parameter selected.
          </div>
        )}
      </div>

    </div>
  );
};
