import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Circular, SeverityType } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  FileSearch
} from 'lucide-react';

export const RegulationFeedView: React.FC = () => {
  const { circulars, searchQuery } = useApp();
  const [selectedCir, setSelectedCir] = useState<Circular | null>(circulars[0] || null);

  const filteredCirculars = circulars.filter(cir => 
    cir.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cir.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cir.regulator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cir.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getRegulatorLogoBg = (reg: string) => {
    switch (reg) {
      case 'RBI': return '#e0f2fe';
      case 'SEBI': return '#e0e7ff';
      case 'IRDAI': return '#ecfdf5';
      case 'FATF': return '#fffbeb';
      default: return '#f1f5f9';
    }
  };

  const getRegulatorLogoColor = (reg: string) => {
    switch (reg) {
      case 'RBI': return '#0369a1';
      case 'SEBI': return '#4338ca';
      case 'IRDAI': return '#047857';
      case 'FATF': return '#b45309';
      default: return '#475569';
    }
  };

  return (
    <div className="content-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
      
      {/* Title block */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Sentinel Scrape Feed</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Real-time updates of regulatory circulars scraped within minutes of publish by Sentinel Agent.</p>
      </div>

      {/* Main split dashboard pane */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Circular Feed list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredCirculars.map(cir => {
            const isSelected = selectedCir?.id === cir.id;
            return (
              <div
                key={cir.id}
                onClick={() => setSelectedCir(cir)}
                className="linear-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'var(--card-surface)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Header metadata */}
                <div className="flex-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="flex-center" style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: getRegulatorLogoBg(cir.regulator),
                      color: getRegulatorLogoColor(cir.regulator)
                    }}>
                      {cir.regulator}
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{cir.id}</span>
                    </div>
                  </div>

                  <span className="badge" style={{
                    backgroundColor: getSeverityBg(cir.severity),
                    color: getSeverityColor(cir.severity),
                    fontSize: '9px',
                    padding: '1px 6px'
                  }}>
                    {cir.severity}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '13px', fontWeight: 600, lineHeight: '1.4' }}>
                  {cir.title}
                </h3>

                {/* Scraped latency block */}
                <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Calendar size={11} /> Published: {cir.publishDate}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--success)', fontWeight: 500 }}>
                    <Clock size={11} /> Scraped in 4m
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Deep Translation Split Inspection panel */}
        {selectedCir ? (
          <div className="linear-card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--bg-secondary)',
            overflowY: 'auto'
          }}>
            {/* Header info */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="badge badge-primary">{selectedCir.regulator}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{selectedCir.id}</span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>{selectedCir.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                <span>Scraped timestamp: {new Date(selectedCir.scrapedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Split layout: Legalese on Left, Translation on Right */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1 }}>
              
              {/* Legalese (Left) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <FileSearch size={12} /> Scraped Legalese Content
                </h4>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                  height: '240px',
                  overflowY: 'auto'
                }}>
                  {selectedCir.fullText}
                </div>
              </div>

              {/* AI Translation & Mapping (Right) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <ShieldCheck size={12} /> Translator AI Breakdown
                </h4>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  height: '240px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div>
                    <strong style={{ fontSize: '11px', color: 'var(--primary)' }}>SUMMARY PARSE:</strong>
                    <p style={{ marginTop: '2px', color: 'var(--text-secondary)', fontSize: '11px' }}>{selectedCir.summary}</p>
                  </div>
                  
                  <div>
                    <strong style={{ fontSize: '11px', color: 'var(--primary)' }}>EXTRACTED SYSTEM CONTRACTS:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                      {selectedCir.clauses.map((clause, idx) => (
                        <div key={idx} style={{
                          padding: '6px',
                          border: '1px dashed var(--border-color)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-secondary)',
                          fontSize: '10px'
                        }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{clause.clauseId}: {clause.title}</span>
                          <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{clause.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Translation System Metrics */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <span>Status: <span className="badge badge-success" style={{ fontSize: '9px' }}>✓ TRANSLATION VERIFIED</span></span>
              <span>Throughput: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>120 tokens/sec</span></span>
            </div>

          </div>
        ) : (
          <div className="linear-card flex-center" style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
            Select a regulation to inspect the active translator mapping.
          </div>
        )}
      </div>

    </div>
  );
};
