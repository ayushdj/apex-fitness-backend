import { useState } from 'react';
import { colors } from '../theme';

const EXERCISES = [
  { name: 'Romanian Deadlift', sets: '4 × 6', load: '65–70% 1RM', tag: 'STRENGTH' },
  { name: 'Bulgarian Split Squat', sets: '3 × 8 each', load: 'Moderate', tag: 'STRENGTH' },
  { name: 'Nordic Hamstring Curl', sets: '3 × 5', load: 'Bodyweight', tag: 'STRENGTH' },
  { name: 'Hip Flexor Flow', sets: '2 × 60s', load: 'Bodyweight', tag: 'MOBILITY' },
];

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SESSION_TYPES = ['Strength', 'Cardio', 'Strength', 'Rest', 'Strength', 'Mobility', 'Rest'];
const TODAY = 1;

const TAG_COLORS: Record<string, string> = {
  STRENGTH: colors.accent,
  MOBILITY: colors.purple,
  CARDIO: colors.blue,
};

const PIP_COLORS: Record<string, string> = {
  Strength: colors.accent,
  Cardio: colors.blue,
  Mobility: colors.purple,
  Rest: colors.border,
};

export default function HomeScreen() {
  const [logged, setLogged] = useState<number[]>([]);

  const toggle = (i: number) =>
    setLogged(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  return (
    <div style={s.container}>
      {/* Greeting */}
      <div style={s.greetRow}>
        <div>
          <div style={s.greetSub}>Good morning</div>
          <div style={s.greetName}>Alex 👊</div>
        </div>
        <div style={s.streakBadge}>
          <span style={s.streakNum}>12</span>
          <span style={s.streakLabel}>day streak</span>
        </div>
      </div>

      {/* Readiness */}
      <div style={s.readinessCard}>
        <div style={s.readinessLeft}>
          <div style={s.readinessLabel}>Readiness</div>
          <div style={s.readinessScore}>78</div>
          <div style={s.readinessBadge}><span style={s.readinessBadgeText}>GOOD</span></div>
        </div>
        <div style={s.readinessRight}>
          <MetricRow icon="💤" label="Sleep" value="7h 12m" />
          <MetricRow icon="❤️" label="Resting HR" value="52 bpm" />
          <MetricRow icon="⚡" label="HRV" value="64 ms" />
        </div>
      </div>

      {/* Insight */}
      <div style={s.insightCard}>
        <span style={{ fontSize: 18 }}>🧠</span>
        <span style={s.insightText}>
          You slept well and HRV is solid — today's lower-body session is on as planned. Don't skip the Nordic curls, they're your weakest link.
        </span>
      </div>

      {/* Week strip */}
      <div style={s.sectionTitle}>This Week</div>
      <div style={s.weekRow}>
        {WEEK.map((d, i) => (
          <div key={i} style={{ ...s.dayCell, ...(i === TODAY ? s.dayCellActive : {}) }}>
            <span style={{ ...s.dayLetter, ...(i === TODAY ? s.dayLetterActive : {}) }}>{d}</span>
            <div style={{ ...s.dayPip, background: PIP_COLORS[SESSION_TYPES[i]], ...(i === TODAY ? { width: 10, height: 10, borderRadius: 5 } : {}) }} />
          </div>
        ))}
      </div>

      {/* Today's session */}
      <div style={s.sessionHeader}>
        <div>
          <div style={s.sectionTitle}>Today's Session</div>
          <div style={s.sessionMeta}>Lower Body · Strength · ~55 min</div>
        </div>
        <button style={s.startBtn}>Start →</button>
      </div>

      {EXERCISES.map((ex, i) => (
        <div key={i} style={s.exerciseCard} onClick={() => toggle(i)}>
          <div style={s.exerciseLeft}>
            <div style={{ ...s.check, ...(logged.includes(i) ? s.checkDone : {}) }}>
              {logged.includes(i) && <span style={s.checkMark}>✓</span>}
            </div>
            <div>
              <div style={s.exerciseName}>{ex.name}</div>
              <div style={s.exerciseMeta}>{ex.sets} · {ex.load}</div>
            </div>
          </div>
          <div style={{ ...s.exTag, background: TAG_COLORS[ex.tag] + '20' }}>
            <span style={{ ...s.exTagText, color: TAG_COLORS[ex.tag] }}>{ex.tag}</span>
          </div>
        </div>
      ))}

      <button style={s.logBtn}>Log Completed Workout</button>
    </div>
  );
}

function MetricRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={s.metricRow}>
      <span style={{ width: 20 }}>{icon}</span>
      <span style={s.metricLabel}>{label}</span>
      <span style={s.metricValue}>{value}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { overflowY: 'auto', height: '100%', padding: 24, paddingBottom: 100, background: colors.bg, display: 'flex', flexDirection: 'column', gap: 16 },
  greetRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  greetSub: { color: colors.muted, fontSize: 13 },
  greetName: { color: colors.text, fontSize: 22, fontWeight: 700 },
  streakBadge: { background: colors.surfaceAlt, borderRadius: 12, padding: '8px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  streakNum: { color: colors.accent, fontSize: 18, fontWeight: 800 },
  streakLabel: { color: colors.muted, fontSize: 11 },
  readinessCard: {
    background: colors.surface, borderRadius: 20, padding: 20,
    display: 'flex', gap: 20, border: `1px solid ${colors.border}`,
  },
  readinessLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  readinessLabel: { color: colors.muted, fontSize: 11, marginBottom: 4 },
  readinessScore: { color: colors.accent, fontSize: 52, fontWeight: 800, lineHeight: '56px' },
  readinessBadge: { background: colors.accent + '20', borderRadius: 6, padding: '2px 8px', marginTop: 4 },
  readinessBadgeText: { color: colors.accent, fontSize: 11, fontWeight: 700 },
  readinessRight: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 },
  metricRow: { display: 'flex', alignItems: 'center', gap: 8 },
  metricLabel: { color: colors.textSub, fontSize: 13, flex: 1 },
  metricValue: { color: colors.text, fontSize: 13, fontWeight: 600 },
  insightCard: {
    background: colors.surfaceAlt, borderRadius: 12, padding: 14,
    display: 'flex', gap: 10, borderLeft: `3px solid ${colors.accent}`,
    alignItems: 'flex-start',
  },
  insightText: { color: colors.textSub, fontSize: 13, lineHeight: '20px', flex: 1 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: 700, marginBottom: 0 },
  weekRow: { display: 'flex', gap: 4 },
  dayCell: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 4px', borderRadius: 8 },
  dayCellActive: { background: colors.surface },
  dayLetter: { color: colors.muted, fontSize: 11, fontWeight: 600 },
  dayLetterActive: { color: colors.accent },
  dayPip: { width: 6, height: 6, borderRadius: 3 },
  sessionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sessionMeta: { color: colors.muted, fontSize: 13 },
  startBtn: {
    background: colors.accent, color: colors.bg, fontWeight: 700, fontSize: 13,
    border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer',
  },
  exerciseCard: {
    background: colors.surface, borderRadius: 12, padding: 14,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    border: `1px solid ${colors.border}`, cursor: 'pointer',
  },
  exerciseLeft: { display: 'flex', alignItems: 'center', gap: 14, flex: 1 },
  check: {
    width: 24, height: 24, borderRadius: 12, border: `2px solid ${colors.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkDone: { background: colors.accent, border: `2px solid ${colors.accent}` },
  checkMark: { color: colors.bg, fontWeight: 800, fontSize: 13 },
  exerciseName: { color: colors.text, fontSize: 15, fontWeight: 600 },
  exerciseMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  exTag: { borderRadius: 6, padding: '3px 8px' },
  exTagText: { fontSize: 11, fontWeight: 700 },
  logBtn: {
    background: colors.surface, color: colors.accent, fontWeight: 700,
    fontSize: 15, border: `1px solid ${colors.accent}`, borderRadius: 20,
    padding: 14, cursor: 'pointer', width: '100%',
  },
};
