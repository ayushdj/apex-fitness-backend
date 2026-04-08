import { useState } from 'react';
import { colors } from '../theme';

const ADHERENCE = [5, 3, 4, 5, 4, 5, 4];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
const MAX_S = 5;

const READINESS = [72, 68, 74, 71, 78, 75, 78];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const GOALS = [
  { label: 'Strength', pct: 0.62, color: colors.accent },
  { label: 'Mobility', pct: 0.48, color: colors.purple },
  { label: 'Cardio Base', pct: 0.55, color: colors.blue },
  { label: 'Physique', pct: 0.35, color: colors.muted },
];

const INSIGHTS = [
  { icon: '📈', text: 'Lower body strength up ~12% over 4 weeks based on logged loads.', positive: true },
  { icon: '🔄', text: 'Your cardio load has risen 2 weeks in a row. Strength volume is being held steady.', positive: true },
  { icon: '💤', text: 'Sleep averaged 6h 42m this week — below target. Recovery-focused sessions recommended.', positive: false },
  { icon: '🤸', text: 'Mobility hit 4/5 planned weeks. Hip range of motion improving.', positive: true },
];

const STATS = [
  { label: 'Sessions', value: '18', sub: 'Last 30 days' },
  { label: 'Adherence', value: '86%', sub: 'vs plan' },
  { label: 'Avg Readiness', value: '74', sub: 'Trend: ↑' },
  { label: 'Streak', value: '12d', sub: 'Personal best' },
];

function readinessColor(score: number) {
  if (score >= 75) return colors.accent;
  if (score >= 65) return colors.blue;
  return colors.red;
}

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<'4W' | '8W' | '12W'>('8W');

  return (
    <div style={s.container}>
      <div style={s.title}>Progress</div>

      {/* Stat grid */}
      <div style={s.statGrid}>
        {STATS.map((st, i) => (
          <div key={i} style={s.statCard}>
            <div style={s.statValue}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
            <div style={s.statSub}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Adherence chart */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Weekly Adherence</span>
          <div style={s.periodRow}>
            {(['4W', '8W', '12W'] as const).map(p => (
              <button key={p} style={{ ...s.periodBtn, ...(period === p ? s.periodBtnActive : {}) }} onClick={() => setPeriod(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div style={s.barChart}>
          {ADHERENCE.map((v, i) => (
            <div key={i} style={s.barCol}>
              <div style={s.barTrack}>
                <div style={{ height: `${(v / MAX_S) * 100}%`, background: v === MAX_S ? colors.accent : colors.accent + '80', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
              </div>
              <span style={s.barLabel}>{MONTHS[i]}</span>
            </div>
          ))}
        </div>
        <div style={s.legend}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: colors.accent }} />
          <span style={s.legendText}>Completed sessions (target: 5/week)</span>
        </div>
      </div>

      {/* Readiness trend */}
      <div style={s.card}>
        <div style={s.cardTitle}>Readiness Trend</div>
        <div style={s.readinessTrend}>
          {READINESS.map((score, i) => (
            <div key={i} style={s.trendCol}>
              <span style={{ fontSize: 11, fontWeight: 700, color: readinessColor(score) }}>{score}</span>
              <div style={{ height: 60, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: 20, height: (score / 100) * 60, borderRadius: '4px 4px 0 0',
                  background: readinessColor(score), transition: 'height 0.3s',
                }} />
              </div>
              <span style={s.trendDay}>{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goal progress */}
      <div style={s.card}>
        <div style={s.cardTitle}>Goal Progress</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {GOALS.map(g => (
            <div key={g.label} style={s.goalRow}>
              <span style={s.goalLabel}>{g.label}</span>
              <div style={s.goalTrack}>
                <div style={{ width: `${g.pct * 100}%`, height: '100%', background: g.color, borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
              <span style={{ ...s.goalPct, color: g.color }}>{Math.round(g.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div style={s.sectionTitle}>Coach Insights</div>
      {INSIGHTS.map((ins, i) => (
        <div key={i} style={{ ...s.insightCard, ...(ins.positive ? s.insightPos : s.insightNeg) }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
          <span style={s.insightText}>{ins.text}</span>
        </div>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { overflowY: 'auto', height: '100%', padding: 24, paddingBottom: 100, background: colors.bg, display: 'flex', flexDirection: 'column', gap: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: 800 },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  statCard: { background: colors.surface, borderRadius: 12, padding: 14, border: `1px solid ${colors.border}` },
  statValue: { color: colors.accent, fontSize: 32, fontWeight: 800 },
  statLabel: { color: colors.text, fontSize: 13, fontWeight: 600 },
  statSub: { color: colors.muted, fontSize: 11 },
  card: { background: colors.surface, borderRadius: 20, padding: 16, border: `1px solid ${colors.border}` },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 12 },
  periodRow: { display: 'flex', gap: 4 },
  periodBtn: {
    padding: '4px 8px', borderRadius: 6, background: colors.surfaceAlt, border: 'none',
    color: colors.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  periodBtnActive: { background: colors.accent, color: colors.bg },
  barChart: { display: 'flex', gap: 8, height: 100, alignItems: 'flex-end' },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', background: colors.border, borderRadius: 4, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' },
  barLabel: { color: colors.muted, fontSize: 10 },
  legend: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 },
  legendText: { color: colors.muted, fontSize: 11 },
  readinessTrend: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  trendCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  trendDay: { color: colors.muted, fontSize: 11 },
  goalRow: { display: 'flex', alignItems: 'center', gap: 10 },
  goalLabel: { color: colors.textSub, fontSize: 13, width: 80 },
  goalTrack: { flex: 1, height: 8, background: colors.border, borderRadius: 4, overflow: 'hidden' },
  goalPct: { fontSize: 13, fontWeight: 700, width: 36, textAlign: 'right' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: 700 },
  insightCard: { display: 'flex', gap: 10, borderRadius: 12, padding: 14, alignItems: 'flex-start' },
  insightPos: { background: colors.accent + '10', borderLeft: `3px solid ${colors.accent}` },
  insightNeg: { background: colors.red + '10', borderLeft: `3px solid ${colors.red}` },
  insightText: { color: colors.textSub, fontSize: 13, lineHeight: '20px', flex: 1 },
};
