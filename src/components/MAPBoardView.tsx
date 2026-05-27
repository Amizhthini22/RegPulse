import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { MAP, ColumnType, SeverityType } from '../context/AppContext';
import { 
  Calendar, 
  ShieldCheck, 
  X, 
  Upload, 
  ArrowRight
} from 'lucide-react';

export const MAPBoardView: React.FC = () => {
  const { 
    maps, 
    circulars, 
    updateMAPStatus, 
    searchQuery, 
    filterSeverity, 
    setFilterSeverity,
    filterRegulator, 
    setFilterRegulator,
    filterDepartment, 
    setFilterDepartment,
    activeRole,
    overrideMAPValidation,
    setCurrentView,
    setActiveUploadMapId
  } = useApp();

  const [selectedMap, setSelectedMap] = useState<MAP | null>(null);
  const [overrideNotes, setOverrideNotes] = useState('');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Filter and Search Logic
  const filteredMaps = maps.filter(map => {
    const parentCircular = circulars.find(c => c.id === map.circularId);
    
    // Search filter
    const matchesSearch = 
      map.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      map.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (map.clauseText && map.clauseText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (map.contract && map.contract.toLowerCase().includes(searchQuery.toLowerCase()));

    // Severity filter
    const matchesSeverity = filterSeverity === 'all' || map.severity === filterSeverity;

    // Regulator filter
    const matchesRegulator = 
      filterRegulator === 'all' || 
      (parentCircular && parentCircular.regulator === filterRegulator);

    // Department filter
    const matchesDepartment = 
      filterDepartment === 'all' || 
      map.department.toLowerCase() === filterDepartment.toLowerCase();

    return matchesSearch && matchesSeverity && matchesRegulator && matchesDepartment;
  });

  const columns: ColumnType[] = [
    'Intake', 
    'Triage', 
    'In Progress', 
    'Pending Validation', 
    'Approved', 
    'Exceptions'
  ];

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, mapId: string) => {
    setDraggedCardId(mapId);
    e.dataTransfer.setData('text/plain', mapId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumn: ColumnType) => {
    e.preventDefault();
    const mapId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (mapId) {
      updateMAPStatus(mapId, targetColumn);
      
      // Update selected map details live if open
      if (selectedMap && selectedMap.id === mapId) {
        setSelectedMap(prev => prev ? { ...prev, status: targetColumn } : null);
      }
    }
    setDraggedCardId(null);
  };

  // Helper to color codes
  const getSeverityColor = (sev: SeverityType) => {
    switch (sev) {
      case 'CRITICAL': return 'var(--danger)';
      case 'HIGH': return 'var(--warning)';
      case 'MEDIUM': return 'var(--info)';
      case 'LOW': return 'var(--text-tertiary)';
    }
  };

  const getSeverityBg = (sev: SeverityType) => {
    switch (sev) {
      case 'CRITICAL': return 'var(--danger-light)';
      case 'HIGH': return 'var(--warning-light)';
      case 'MEDIUM': return 'var(--info-light)';
      case 'LOW': return 'var(--bg-tertiary)';
    }
  };

  const getColIcon = (col: ColumnType) => {
    switch (col) {
      case 'Intake': return '📥';
      case 'Triage': return '⚖️';
      case 'In Progress': return '⚙️';
      case 'Pending Validation': return '🛡️';
      case 'Approved': return '✅';
      case 'Exceptions': return '🚨';
    }
  };

  const openEvidenceValidator = (map: MAP) => {
    setActiveUploadMapId(map.id);
    setCurrentView('upload');
  };

  return (
    <div className="content-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
      
      {/* Header and Filter Bar */}
      <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Measurable Action Points (MAPs)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Manage the state validation machine of regulatory directives.</p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Regulator */}
          <div>
            <select
              value={filterRegulator}
              onChange={(e) => setFilterRegulator(e.target.value as any)}
              className="form-select"
              style={{ fontSize: '11px', height: '28px', padding: '2px 24px 2px 8px', width: '110px' }}
            >
              <option value="all">Regulators</option>
              <option value="RBI">RBI</option>
              <option value="SEBI">SEBI</option>
              <option value="IRDAI">IRDAI</option>
              <option value="FATF">FATF</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="form-select"
              style={{ fontSize: '11px', height: '28px', padding: '2px 24px 2px 8px', width: '120px' }}
            >
              <option value="all">Departments</option>
              <option value="IT">IT</option>
              <option value="Risk">Risk</option>
              <option value="Treasury">Treasury</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="form-select"
              style={{ fontSize: '11px', height: '28px', padding: '2px 24px 2px 8px', width: '100px' }}
            >
              <option value="all">Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="kanban-grid" style={{ flex: 1 }}>
        {columns.map(col => {
          const colMaps = filteredMaps.filter(m => m.status === col);
          return (
            <div 
              key={col} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: draggedCardId ? '1px dashed var(--primary)' : '1px solid var(--border-color)',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <span>{getColIcon(col)}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{col}</span>
                </span>
                <span className="kanban-column-count">{colMaps.length}</span>
              </div>

              {/* Cards List */}
              <div className="kanban-column-cards">
                {colMaps.map(map => (
                  <div
                    key={map.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, map.id)}
                    onClick={() => setSelectedMap(map)}
                    className="linear-card"
                    style={{
                      padding: '12px',
                      cursor: 'grab',
                      userSelect: 'none',
                      backgroundColor: 'var(--card-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div className="flex-between">
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{map.id}</span>
                      <span className="badge" style={{
                        backgroundColor: getSeverityBg(map.severity),
                        color: getSeverityColor(map.severity),
                        fontSize: '9px',
                        padding: '1px 6px'
                      }}>
                        {map.severity}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '13px', fontWeight: 600, lineHeight: '1.4', cursor: 'pointer' }}>
                      {map.title}
                    </h4>

                    {/* Metadata indicators */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '9px', padding: '1px 6px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {map.department}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        <Calendar size={10} />
                        {map.deadline}
                      </span>
                    </div>

                    {/* Verifier status & Upload trigger */}
                    <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--text-tertiary)' }}>
                        {map.evidenceName ? '🛡️ Evidence Attached' : '📥 No Evidence'}
                      </span>
                      
                      {/* Submitter Quick Upload or Validator quick explainer */}
                      {col === 'In Progress' && activeRole === 'dept_submitter' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEvidenceValidator(map);
                          }}
                          className="btn btn-primary"
                          style={{
                            padding: '2px 6px',
                            fontSize: '9px',
                            borderRadius: '4px',
                            height: '20px'
                          }}
                        >
                          <Upload size={8} /> Upload
                        </button>
                      )}

                      {col === 'Pending Validation' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEvidenceValidator(map);
                          }}
                          className="btn btn-secondary"
                          style={{
                            padding: '2px 6px',
                            fontSize: '9px',
                            borderRadius: '4px',
                            height: '20px',
                            color: 'var(--primary)'
                          }}
                        >
                          <ArrowRight size={8} /> Validator
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Detail Modal */}
      {selectedMap && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="linear-card" style={{
            width: '100%',
            maxWidth: '640px',
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{selectedMap.id} / Source: {selectedMap.circularId}</span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>{selectedMap.title}</h2>
              </div>
              <button 
                onClick={() => { setSelectedMap(null); setOverrideNotes(''); }}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', fontSize: '13px' }}>
              
              {/* Left Side: Directives and Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>Original Clause Text</h4>
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: '6px', 
                    backgroundColor: 'var(--bg-primary)', 
                    border: '1px solid var(--border-color)',
                    lineHeight: '1.4',
                    fontStyle: 'italic'
                  }}>
                    {selectedMap.clauseText}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>Embedded Action Contract</h4>
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: '6px', 
                    backgroundColor: 'var(--bg-primary)', 
                    border: '1px dashed var(--border-color)',
                    lineHeight: '1.4'
                  }}>
                    {selectedMap.contract}
                  </div>
                </div>

                {/* Validator Explainer Excerpt */}
                {selectedMap.evidenceName && (
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>Validator Agent Explanation</h4>
                    <div style={{ 
                      padding: '10px', 
                      borderRadius: '6px', 
                      backgroundColor: selectedMap.status === 'Approved' ? 'var(--success-light)' : 'var(--danger-light)', 
                      color: selectedMap.status === 'Approved' ? 'var(--success)' : 'var(--danger)',
                      border: `1px solid ${selectedMap.status === 'Approved' ? 'var(--success)' : 'var(--danger)'}`,
                      lineHeight: '1.4'
                    }}>
                      <strong>Match confidence: {selectedMap.validationConfidence}%</strong>
                      <p style={{ marginTop: '4px', fontSize: '12px' }}>{selectedMap.validationLog}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Metadata and History timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>System Parameters</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div className="flex-between"><span>Severity:</span> <span className="badge" style={{ backgroundColor: getSeverityBg(selectedMap.severity), color: getSeverityColor(selectedMap.severity) }}>{selectedMap.severity}</span></div>
                    <div className="flex-between"><span>Department:</span> <span style={{ fontWeight: 600 }}>{selectedMap.department}</span></div>
                    <div className="flex-between"><span>Deadline:</span> <span style={{ fontWeight: 600 }}>{selectedMap.deadline}</span></div>
                    <div className="flex-between"><span>Assignee:</span> <span style={{ color: 'var(--text-secondary)' }}>{selectedMap.assignee.split(' (')[0]}</span></div>
                    <div className="flex-between"><span>Status:</span> <span className="badge badge-info" style={{ textTransform: 'none' }}>{selectedMap.status}</span></div>
                  </div>
                </div>

                {/* Audit Trail Timeline */}
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}>Local Event Signatures</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedMap.history.map((hist, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '11px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hist.action}</span>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '9px' }}>By: {hist.user} • {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontFamily: 'monospace', fontSize: '8px', color: 'var(--primary)' }}>
                            <ShieldCheck size={8} /> hash: {hist.hash}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
              {/* Evidence Upload */}
              {selectedMap.status === 'In Progress' && activeRole === 'dept_submitter' && (
                <button
                  onClick={() => { setSelectedMap(null); openEvidenceValidator(selectedMap); }}
                  className="btn btn-primary"
                >
                  <Upload size={14} /> Upload Evidence Proof
                </button>
              )}

              {/* Compliance Officer Override controls */}
              {selectedMap.status === 'Exceptions' && activeRole === 'compliance_officer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <span style={{ fontWeight: 600, fontSize: '11px', color: 'var(--text-secondary)' }}>Override Exception State</span>
                  <input
                    type="text"
                    placeholder="Enter manual approval justification notes..."
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', marginTop: '4px' }}>
                    <button
                      disabled={!overrideNotes}
                      onClick={() => {
                        overrideMAPValidation(selectedMap.id, true, overrideNotes);
                        setSelectedMap(null);
                        setOverrideNotes('');
                      }}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px', opacity: overrideNotes ? 1 : 0.6 }}
                    >
                      Override (Approve MAP)
                    </button>
                  </div>
                </div>
              )}

              <button 
                onClick={() => { setSelectedMap(null); setOverrideNotes(''); }}
                className="btn btn-secondary"
                style={{ marginLeft: 'auto' }}
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
