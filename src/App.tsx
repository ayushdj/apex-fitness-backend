import { useState } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import PlanScreen from './screens/PlanScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import { colors } from './theme';

type Tab = 'today' | 'plan' | 'progress';
type Screen = 'onboarding' | 'main';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [tab, setTab] = useState<Tab>('today');

  return (
    <div style={outer}>
      <div style={phone}>
        {/* Status bar */}
        <div style={statusBar}>
          <span style={statusText}>9:41</span>
          <span style={statusText}>●●● 100%</span>
        </div>

        {/* Screen content */}
        <div style={screenArea}>
          {screen === 'onboarding' && (
            <OnboardingScreen onComplete={() => setScreen('main')} />
          )}
          {screen === 'main' && tab === 'today' && <HomeScreen />}
          {screen === 'main' && tab === 'plan' && <PlanScreen />}
          {screen === 'main' && tab === 'progress' && <AnalyticsScreen />}
        </div>

        {/* Tab bar */}
        {screen === 'main' && (
          <div style={tabBar}>
            {([
              { id: 'today', icon: '🏠', label: 'Today' },
              { id: 'plan', icon: '📋', label: 'Plan' },
              { id: 'progress', icon: '📊', label: 'Progress' },
            ] as { id: Tab; icon: string; label: string }[]).map(t => (
              <button key={t.id} style={tabBtn} onClick={() => setTab(t.id)}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ ...tabLabel, ...(tab === t.id ? tabLabelActive : {}) }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        <div style={homeIndicator}><div style={homeBar} /></div>
      </div>
    </div>
  );
}

const outer: React.CSSProperties = {
  minHeight: '100vh',
  background: '#111',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
};

const phone: React.CSSProperties = {
  width: 390,
  height: 844,
  background: colors.bg,
  borderRadius: 52,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 0 0 10px #222, 0 0 0 11px #333, 0 40px 80px rgba(0,0,0,0.8)',
};

const statusBar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '14px 28px 0',
  flexShrink: 0,
};

const statusText: React.CSSProperties = {
  color: colors.text,
  fontSize: 12,
  fontWeight: 600,
};

const screenArea: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const tabBar: React.CSSProperties = {
  display: 'flex',
  background: colors.surface,
  borderTop: `1px solid ${colors.border}`,
  paddingTop: 8,
  paddingBottom: 4,
  flexShrink: 0,
};

const tabBtn: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 0',
};

const tabLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: colors.muted,
};

const tabLabelActive: React.CSSProperties = {
  color: colors.accent,
};

const homeIndicator: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  padding: '6px 0 10px',
  background: colors.surface,
  flexShrink: 0,
};

const homeBar: React.CSSProperties = {
  width: 120,
  height: 4,
  background: colors.border,
  borderRadius: 2,
};
