import { useState } from 'react';
import { colors } from '../theme';

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PLAN: Record<string, { type: string; title: string; details: string; duration: string; color: string }[]> = {
  'Week 1': [
    { type: 'STRENGTH', title: 'Lower Body Power', details: 'RDL · Split Squat · Nordic Curl', duration: '55 min', color: colors.accent },
    { type: 'CARDIO', title: 'Aerobic Base', details: 'Zone 2 Run or Bike', duration: '35 min', color: colors.blue },
    { type: 'STRENGTH', title: 'Upper Body Push/Pull', details: 'Press · Row · Carry', duration: '50 min', color: colors.accent },
    { type: 'REST', title: 'Rest / Walk', details: 'Light movement only', duration: '—', color: colors.muted },
    { type: 'STRENGTH', title: 'Full Body Athletic', details: 'Power · Jumps · Core', duration: '60 min', color: colors.accent },
    { type: 'MOBILITY', title: 'Dancer Flow', details: 'Hip · Shoulder · Spine', duration: '40 min', color: colors.purple },
    { type: 'REST', title: 'Rest', details: '', duration: '—', color: colors.muted },
  ],
  'Week 2': [
    { type: 'STRENGTH', title: 'Lower Body Hypertrophy', details: 'Squat · Lunge · Calf', duration: '55 min', color: colors.accent },
    { type: 'CARDIO', title: 'Tempo Intervals', details: '4×6 min @ 80% max HR', duration: '40 min', color: colors.blue },
    { type: 'STRENGTH', title: 'Horizontal Push/Pull', details: 'Bench · Cable Row · Dip', duration: '50 min', color: colors.accent },
    { type: 'REST', title: 'Rest / Walk', details: '', duration: '—', color: colors.muted },
    { type: 'STRENGTH', title: 'Power & Plyometrics', details: 'Box Jumps · Broad Jump · Sprint', duration: '55 min', color: colors.accent },
    { type: 'MOBILITY', title: 'Full Body Stretch', details: 'Yoga flow + foam roll', duration: '35 min', color: colors.purple },
    { type: 'REST', title: 'Rest', details: '', duration: '—', color: colors.muted },
  ],
  'Week 3': [
    { type: 'STRENGTH', title: 'Lower Body Volume', details: 'High rep squat + RDL', duration: '60 min', color: colors.accent },
    { type: 'CARDIO', title: 'Steady State', details: 'Zone 2 · 45 min easy', duration: '45 min', color: colors.blue },
    { type: 'STRENGTH', title: 'Vertical Push/Pull', details: 'OHP · Lat Pull · Face Pull', duration: '50 min', color: colors.accent },
    { type: 'REST', title: 'Rest / Walk', details: '', duration: '—', color: colors.muted },
    { type: 'STRENGTH', title: 'Athletic Circuit', details: 'Full body, minimal rest', duration: '55 min', color: colors.accent },
    { type: 'MOBILITY', title: 'Recovery Session', details: 'Restorative yoga + breathwork', duration: '30 min', color: colors.purple },
    { type: 'REST', title: 'Rest', details: '', duration: '—', color: colors.muted },
  ],
  'Week 4': [
    { type: 'STRENGTH', title: 'Deload Lower', details: 'Reduced volume, 50% intensity', duration: '40 min', color: colors.accent },
    { type: 'CARDIO', title: 'Easy Movement', details: 'Walk or easy bike', duration: '30 min', color: colors.blue },
    { type: 'STRENGTH', title: 'Deload Upper', details: 'Reduced volume, 50% intensity', duration: '40 min', color: colors.accent },
    { type: 'REST', title: 'Rest', details: '', duration: '—', color: colors.muted },
    { type: 'MOBILITY', title: 'Full Mobility Day', details: 'Extended flow + recovery', duration: '45 min', color: colors.purple },
    { type: 'REST', title: 'Rest', details: '', duration: '—', color: colors.muted },
    { type: 'REST', title: 'Rest', details: '', duration: '—', color: colors.muted },
  ],
};

const GOALS = [
  { label: 'Strength', value: 0.4, color: colors.accent },
  { label: 'Mobility', value: 0.3, color: colors.purple },
  { label: 'Cardio', value: 0.2, color: colors.blue },
  { label: 'Physique', value: 0.1, color: colors.muted },
];

export default function PlanScreen() {
  const [selectedWeek, setSelectedWeek] = useState('Week 1');

  return (
    <div style={s.container}>
      <div style={s.title}>Training Plan</div>
      <div style={s.subtitle}>Hybrid Athlete · Dancer-Strength Focus · Phase 1</div>

      {/* Goal weights */}
      <div style={s.goalsCard}>
        {GOALS.map(g => (
          <div key={g.label} style={s.goalRow}>
            <span style={{ ...s.goalLabel, color: g.color }}>{g.label}</span>
            <div style={s.goalTrack}>
              <div style={{ width: `${g.value * 100}%`, height: '100%', background: g.color, borderRadius: 3 }} />
            </div>
            <span style={{ ...s.goalPct, color: g.color }}>{Math.round(g.value * 100)}%</span>
          </div>
        ))}
      </div>

      {/* Week tabs */}
      <div style={s.weekTabs}>
        {WEEKS.map(w => (
          <button
            key={w}
            style={{ ...s.weekTab, ...(selectedWeek === w ? s.weekTabActive : {}) }}
            onClick={() => setSelectedWeek(w)}
          >
            {w}
            {w === 'Week 4' && <span style={s.deloadBadge}> DELOAD</span>}
          </button>
        ))}
      </div>

      {/* Days */}
      <div style={s.dayList}>
        {PLAN[selectedWeek].map((session, i) => (
          <div key={i} style={s.dayRow}>
            <span style={s.dayLabel}>{DAYS[i]}</span>
            <div style={{ ...s.sessionCard, ...(session.type === 'REST' ? s.sessionCardRest : {}) }}>
              <div style={{ ...s.sessionBar, background: session.color }} />
              <div style={s.sessionInfo}>
                <div style={s.sessionTop}>
                  <span style={s.sessionTitle}>{session.title}</span>
                  <span style={{ ...s.typeBadge, background: session.color + '25', color: session.color }}>
                    {session.type}
                  </span>
                </div>
                {session.details && <div style={s.sessionDetails}>{session.details}</div>}
              </div>
              {session.duration !== '—' && <span style={s.sessionDuration}>{session.duration}</span>}
            </div>
          </div>
        ))}
      </div>

      <button style={s.updateBtn}>💬  Update My Plan</button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { overflowY: 'auto', height: '100%', padding: 24, paddingBottom: 100, background: colors.bg, display: 'flex', flexDirection: 'column', gap: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: 800 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: -8 },
  goalsCard: { background: colors.surface, borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${colors.border}` },
  goalRow: { display: 'flex', alignItems: 'center', gap: 10 },
  goalLabel: { fontSize: 11, fontWeight: 700, width: 60 },
  goalTrack: { flex: 1, height: 6, borderRadius: 3, background: colors.border, overflow: 'hidden' },
  goalPct: { fontSize: 11, fontWeight: 700, width: 30, textAlign: 'right' },
  weekTabs: { display: 'flex', gap: 8, overflowX: 'auto' },
  weekTab: {
    padding: '8px 16px', borderRadius: 20, border: `1px solid ${colors.border}`,
    background: colors.surface, color: colors.muted, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
  },
  weekTabActive: { background: colors.accent, color: colors.bg, border: `1px solid ${colors.accent}` },
  deloadBadge: { color: colors.blue, fontSize: 11, fontWeight: 700 },
  dayList: { display: 'flex', flexDirection: 'column', gap: 8 },
  dayRow: { display: 'flex', alignItems: 'center', gap: 10 },
  dayLabel: { color: colors.muted, fontSize: 11, fontWeight: 700, width: 30, flexShrink: 0 },
  sessionCard: {
    flex: 1, display: 'flex', alignItems: 'center',
    background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden',
  },
  sessionCardRest: { opacity: 0.4 },
  sessionBar: { width: 4, alignSelf: 'stretch', flexShrink: 0 },
  sessionInfo: { flex: 1, padding: '10px 12px' },
  sessionTop: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  sessionTitle: { color: colors.text, fontSize: 13, fontWeight: 600, flex: 1 },
  typeBadge: { borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700 },
  sessionDetails: { color: colors.muted, fontSize: 11, marginTop: 2 },
  sessionDuration: { color: colors.textSub, fontSize: 11, fontWeight: 600, paddingRight: 12, flexShrink: 0 },
  updateBtn: {
    background: colors.surface, color: colors.text, fontWeight: 600,
    fontSize: 15, border: `1px solid ${colors.border}`, borderRadius: 20,
    padding: 14, cursor: 'pointer', width: '100%', fontFamily: 'inherit',
  },
};
