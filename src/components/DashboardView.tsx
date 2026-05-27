import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Timer, 
  Percent, 
  Cpu, 
  TrendingUp, 
  Layers
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { circulars, maps } = useApp();
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ month: string; value: number } | null>(null);

  // Compute metrics
  const totalCirculars = circulars.length;
  const exceptionsCount = maps.filter(m => m.status === 'Exceptions').length;
  const totalValidated = maps.filter(m => ['Approved', 'Exceptions'].includes(m.status)).length;
  const autoValidatedCount = maps.filter(m => ['Approved', 'Exceptions'].includes(m.status) && m.validationConfidence && m.validationConfidence > 85).length;
  
  const autoValidationRate = totalValidated > 0 
    ? Math.round((autoValidatedCount / totalValidated) * 100) 
    : 80; // fallback default metric

  // Custom SVG Line Chart Data
  const monthlyScrapes = [
    { month: 'Jan', value: 8, rbi: 4, sebi: 2, fld: 2 },
    { month: 'Feb', value: 12, rbi: 6, sebi: 3, fld: 3 },
    { month: 'Mar', value: 15, rbi: 7, sebi: 5, fld: 3 },
    { month: 'Apr', value: 22, rbi: 10, sebi: 8, fld: 4 },
    { month: 'May', value: 28, rbi: 14, sebi: 9, fld: 5 }
  ];

  // Custom SVG Donut Chart Data
  const rbiCount = maps.filter(m => {
    const parent = circulars.find(c => c.id === m.circularId);
    return parent?.regulator === 'RBI';
  }).length || 3;

  const sebiCount = maps.filter(m => {
    const parent = circulars.find(c => c.id === m.circularId);
    return parent?.regulator === 'SEBI';
  }).length || 1;

  const fatfCount = maps.filter(m => {
    const parent = circulars.find(c => c.id === m.circularId);
    return parent?.regulator === 'FATF';
  }).length || 1;

  const irdaiCount = maps.filter(m => {
    const parent = circulars.find(c => c.id === m.circularId);
    return parent?.regulator === 'IRDAI';
  }).length || 1;

  const totalMapShares = rbiCount + sebiCount + fatfCount + irdaiCount;

  // Pie chart calculation helper
  const getSliceCoordinates = (percent: number, accumulatedPercent: number) => {
    const x1 = Math.cos(2 * Math.PI * accumulatedPercent);
    const y1 = Math.sin(2 * Math.PI * accumulatedPercent);
    const x2 = Math.cos(2 * Math.PI * (accumulatedPercent + percent));
    const y2 = Math.sin(2 * Math.PI * (accumulatedPercent + percent));
    return { x1, y1, x2, y2 };
  };

  const donutSlices = [
    { label: 'RBI', count: rbiCount, color: 'var(--primary)', percent: rbiCount / totalMapShares },
    { label: 'SEBI', count: sebiCount, color: 'var(--info)', percent: sebiCount / totalMapShares },
    { label: 'FATF', count: fatfCount, color: 'var(--warning)', percent: fatfCount / totalMapShares },
    { label: 'IRDAI', count: irdaiCount, color: 'var(--danger)', percent: irdaiCount / totalMapShares }
  ];

  // Cumulative percent for rendering donut slices
  let accumulatedPercent = 0;

  return (
    <div className="content-pane">
      {/* Title */}
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Autonomous Compliance Orchestrator</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Real-time telemetry and validation monitoring across commercial regulatory circulars.</p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span> SYSTEM STABLE (0 SLA BREACHES)
        </span>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* KPI 1 */}
        <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex-between" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Circulars Scraped</span>
            <Layers size={16} />
          </div>
          <div>
            <span style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{totalCirculars}</span>
            <div style={{ fontSize: '11px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <TrendingUp size={12} /> <span>100% of feeds monitored</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex-between" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-Validation Rate</span>
            <Percent size={16} />
          </div>
          <div>
            <span style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(to right, var(--success), #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{autoValidationRate}%</span>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Target SLA: 80.0%
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex-between" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reg-to-MAP SLA</span>
            <Timer size={16} />
          </div>
          <div>
            <span style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>&lt; 15m</span>
            <div style={{ fontSize: '11px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span>Avg translation: 2m 45s</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex-between" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Exceptions</span>
            <ShieldAlert size={16} style={{ color: exceptionsCount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }} />
          </div>
          <div>
            <span style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              fontFamily: 'var(--font-display)',
              color: exceptionsCount > 0 ? 'var(--danger)' : 'var(--text-primary)'
            }}>{exceptionsCount}</span>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Requires compliance override
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        
        {/* Custom SVG Line Chart */}
        <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Regulatory Volumes (6 Months Trend)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Monthly auto-scrape throughput metrics of Sentinel Scraper.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                <span>Total Circulars</span>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', height: '200px', width: '100%', marginTop: '10px' }}>
            {/* Custom SVG Line chart */}
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 50, 100, 150, 200].map((y, idx) => (
                <line 
                  key={idx} 
                  x1="0" 
                  y1={y} 
                  x2="100%" 
                  y2={y} 
                  stroke="var(--border-color)" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                />
              ))}

              {/* Draw area and line path */}
              {/* Point Coordinates: x = 0%, 25%, 50%, 75%, 100%
                  y mapping: value 8 -> 170, 12 -> 150, 15 -> 135, 22 -> 100, 28 -> 70 */}
              <path
                d="M 0 170 L 150 150 L 300 135 L 450 100 L 600 70 L 600 200 L 0 200 Z"
                fill="url(#lineGrad)"
                style={{ transition: 'all 0.5s ease' }}
              />
              <path
                d="M 0 170 L 150 150 L 300 135 L 450 100 L 600 70"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ transition: 'all 0.5s ease' }}
              />

              {/* Data points */}
              {[
                { x: 0, y: 170, data: monthlyScrapes[0] },
                { x: 150, y: 150, data: monthlyScrapes[1] },
                { x: 300, y: 135, data: monthlyScrapes[2] },
                { x: 450, y: 100, data: monthlyScrapes[3] },
                { x: 600, y: 70, data: monthlyScrapes[4] }
              ].map((pt, idx) => (
                <g 
                  key={idx} 
                  cursor="pointer"
                  onMouseEnter={() => setHoveredDataPoint({ month: pt.data.month, value: pt.data.value })}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={hoveredDataPoint?.month === pt.data.month ? "6" : "4"} 
                    fill="var(--card-surface)" 
                    stroke="var(--primary)" 
                    strokeWidth="3" 
                  />
                  <text 
                    x={pt.x} 
                    y="225" 
                    fill="var(--text-secondary)" 
                    fontSize="11" 
                    textAnchor="middle"
                  >
                    {pt.data.month}
                  </text>
                </g>
              ))}
            </svg>

            {/* Tooltip on hover */}
            {hoveredDataPoint && (
              <div className="linear-card" style={{
                position: 'absolute',
                top: '20px',
                left: '200px',
                padding: '6px 10px',
                fontSize: '11px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--primary)',
                pointerEvents: 'none'
              }}>
                <span style={{ fontWeight: 600 }}>{hoveredDataPoint.month}: </span>
                <span>{hoveredDataPoint.value} Scrapes</span>
              </div>
            )}
          </div>
        </div>

        {/* Custom SVG Donut Chart */}
        <div className="linear-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600 }}>MAPs by Regulator</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Proportion of current action items.</p>
          </div>

          <div className="flex-center" style={{ position: 'relative', height: '140px' }}>
            <svg width="120" height="120" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
              {donutSlices.map((slice, idx) => {
                const slicePercent = slice.percent;
                const coords = getSliceCoordinates(slicePercent, accumulatedPercent);
                accumulatedPercent += slicePercent;

                // Simple path rendering for circular slice
                const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
                const pathData = [
                  `M ${coords.x1} ${coords.y1}`,
                  `A 1 1 0 ${largeArcFlag} 1 ${coords.x2} ${coords.y2}`,
                  `L 0 0`
                ].join(' ');

                return (
                  <path 
                    key={idx}
                    d={pathData} 
                    fill={slice.color} 
                    stroke="var(--card-surface)" 
                    strokeWidth="0.04"
                  />
                );
              })}
              {/* Inner cutout for donut effect */}
              <circle cx="0" cy="0" r="0.65" fill="var(--card-surface)" />
            </svg>

            {/* Total display inside Donut */}
            <div style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>{maps.length}</span>
              <span style={{ fontSize: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>MAPs</span>
            </div>
          </div>

          {/* Legend Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '11px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '10px'
          }}>
            {donutSlices.map((slice, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: slice.color }}></span>
                <span style={{ fontWeight: 500 }}>{slice.label}</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>({slice.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent System Telemetry Panel */}
      <div className="linear-card">
        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Active Agent Operations Monitor</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Resource orchestration metrics and LLM throughput telemetry.</p>
          </div>
          <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
            <Cpu size={12} /> Claude 3.5 Sonnet Engine
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {/* Agent 1: Sentinel */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>Sentinel Agent</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div className="flex-between"><span>Throughput:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>4 feeds/m</span></div>
              <div className="flex-between"><span>Latency:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>8.4s</span></div>
              <div className="flex-between"><span>API Cost / Scrape:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$0.00</span></div>
            </div>
          </div>

          {/* Agent 2: Translator */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>Translator Agent</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div className="flex-between"><span>LLM Latency:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>4.2s</span></div>
              <div className="flex-between"><span>Accuracy Rating:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>99.2%</span></div>
              <div className="flex-between"><span>Cost / 1K tokens:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$0.015</span></div>
            </div>
          </div>

          {/* Agent 3: Router */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>Router Agent</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div className="flex-between"><span>Ontology match:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Precedent SQL</span></div>
              <div className="flex-between"><span>Routing latency:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>120ms</span></div>
              <div className="flex-between"><span>Conflict resol:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Auto-resol</span></div>
            </div>
          </div>

          {/* Agent 4: Validator */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>Validator Agent</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div className="flex-between"><span>Verification rate:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>94% success</span></div>
              <div className="flex-between"><span>Mean review time:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>5.8s</span></div>
              <div className="flex-between"><span>Failed check alerts:</span> <span style={{ fontWeight: 600, color: 'var(--text-danger)' }}>{exceptionsCount}</span></div>
            </div>
          </div>

          {/* Agent 5: Audit Trail */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>Audit Agent</span>
              <span className="agent-pulse" style={{ width: '6px', height: '6px' }}></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div className="flex-between"><span>Chain Block:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Active SHA-256</span></div>
              <div className="flex-between"><span>Log consistency:</span> <span style={{ fontWeight: 600, color: 'var(--success)' }}>100% verified</span></div>
              <div className="flex-between"><span>Regulator exports:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>JSON format</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
