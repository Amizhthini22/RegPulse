import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Plus, 
  Cpu, 
  ArrowRight
} from 'lucide-react';

interface Rule {
  id: string;
  keyword: string;
  department: string;
  precedent: string;
}

export const OrgMappingView: React.FC = () => {
  const { maps, addNotification, activeRole } = useApp();

  const [rules, setRules] = useState<Rule[]>([
    { id: 'rule-1', keyword: 'cyber resilience / firewall / API', department: 'IT', precedent: 'RBI Master Direction Cyber security standard' },
    { id: 'rule-2', keyword: 'liquidity stress testing / volatility', department: 'Treasury', precedent: 'SEBI Mutual Fund guidelines' },
    { id: 'rule-3', keyword: 'database mirroring / RPO failover', department: 'Operations', precedent: 'IRDAI DB failover directive' },
    { id: 'rule-4', keyword: 'AML monitoring / cross-border customer scoring', department: 'Risk', precedent: 'FATF Cross-border guidelines' }
  ]);

  // Form states
  const [newKeyword, setNewKeyword] = useState('');
  const [newDept, setNewDept] = useState('IT');

  const departmentsData = [
    { name: 'IT', lead: 'Vikram Mehta (Chief IT Officer)', rate: 98, keywords: ['firewall', 'gateway', 'OWASP', 'system security', 'API', 'access logs'] },
    { name: 'Risk', lead: 'Rajesh Sen (VP Risk Operations)', rate: 100, keywords: ['AML scoring', 'corridors', 'due diligence', 'KYC controls', 'risk weighting'] },
    { name: 'Treasury', lead: 'Anjali Nair (Head of Treasury)', rate: 96, keywords: ['volatility', 'underlying pools', 'stress test', 'liquidity', 'capital adequacy'] },
    { name: 'Operations', lead: 'Siddharth Mehta (Director of Operations)', rate: 92, keywords: ['mirroring', 'synchronisation delay', 'outage failover', 'RPO limit'] }
  ];

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword) return;

    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      keyword: newKeyword,
      department: newDept,
      precedent: 'Compliance manual override'
    };

    setRules(prev => [...prev, newRule]);
    addNotification(
      'Ontology Trigger Added',
      `Router Agent updated with new keyword trigger "${newKeyword}" -> ${newDept}.`,
      'success'
    );
    setNewKeyword('');
  };

  return (
    <div className="content-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Organization Ontology Mapper</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Configure keywords and precedents mapped by the Router Agent to automatically assign MAPs to bank departments.</p>
      </div>

      {/* Main layout: Departments on Left, Rule Builder on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flex: 1, overflowY: 'auto' }}>
        
        {/* Departments List (Left) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Active Department Mappings</h3>
          
          <div className="org-grid">
            {departmentsData.map(dept => {
              const deptMAPs = maps.filter(m => m.department.toLowerCase() === dept.name.toLowerCase()).length;
              return (
                <div key={dept.name} className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={18} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{dept.name}</span>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '10px' }}>{dept.rate}% SLA</span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <div><strong>Department Lead:</strong> <span style={{ color: 'var(--text-primary)' }}>{dept.lead}</span></div>
                    <div style={{ marginTop: '2px' }}><strong>Assigned tasks:</strong> <span style={{ color: 'var(--text-primary)' }}>{deptMAPs} MAPs</span></div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ontology Keywords</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {dept.keywords.map(kw => (
                        <span key={kw} style={{
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)'
                        }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rule Builder Panel (Right) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Add Rule Form */}
          {activeRole === 'compliance_officer' ? (
            <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Create Router Trigger Rule</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Train the Router Agent ontology with historical precedents.</p>
              </div>

              <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Matching Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g. encryption, hardware storage, vulnerability scan"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Destination Bank Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="form-select"
                  >
                    <option value="IT">IT (Information Technology)</option>
                    <option value="Risk">Risk Operations</option>
                    <option value="Treasury">Treasury</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                  <Plus size={14} /> Add Precedent Rule
                </button>
              </form>
            </div>
          ) : (
            <div className="linear-card flex-center" style={{ height: '160px', color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
              Only Compliance Officers are permitted to adjust systemic router agent trigger rules. Toggle role in header to edit.
            </div>
          )}

          {/* Active Rules List */}
          <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex-between">
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Router Precedent Database</h3>
              <span className="badge badge-info" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Cpu size={10} /> Router agent active
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rules.map(rule => (
                <div key={rule.id} style={{
                  padding: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div><strong>Keyword matches:</strong> <span style={{ color: 'var(--text-primary)' }}>"{rule.keyword}"</span></div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>Precedent: {rule.precedent}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <ArrowRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="badge badge-primary">{rule.department}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
