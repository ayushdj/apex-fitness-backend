import { useState, useRef, useEffect } from 'react';
import { colors } from '../theme';

interface Message { id: number; role: 'ai' | 'user'; text: string }

const API_URL = '';

// Structured profile we extract as the conversation progresses
interface UserProfile {
  athleteIdentity?: string;
  goals?: string;
  schedule?: string;
  equipment?: string;
  injuries?: string;
  nutrition?: string;
}

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'ai',
      text: "Hey! I'm APEX, your AI coach. Tell me — what kind of athlete do you want to become? No need for perfect answers, just describe yourself and your goals in your own words.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const [turnCount, setTurnCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    // Add user message to UI
    const userMsg: Message = { id: Date.now(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    // Update conversation history for API
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: userText },
    ];

    setLoading(true);
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

    // Update profile from user messages (simple heuristic extraction)
    const updatedProfile = { ...profile };
    if (newTurn === 1) updatedProfile.athleteIdentity = userText;
    if (newTurn === 2) updatedProfile.schedule = userText;
    if (newTurn === 3) updatedProfile.injuries = userText;
    if (newTurn === 4) updatedProfile.nutrition = userText;
    setProfile(updatedProfile);

    // Create AI message placeholder
    const aiId = Date.now() + 1;
    setMessages(prev => [...prev, { id: aiId, role: 'ai', text: '' }]);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyRef.current,
          userProfile: updatedProfile,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let aiText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { text, error } = JSON.parse(payload);
            if (error) throw new Error(error);
            if (text) {
              aiText += text;
              setMessages(prev =>
                prev.map(m => m.id === aiId ? { ...m, text: aiText } : m)
              );
            }
          } catch { /* ignore parse errors on partial chunks */ }
        }
      }

      // Add to history
      historyRef.current = [...historyRef.current, { role: 'assistant', content: aiText }];

      // After 4 user turns, transition to main app
      if (newTurn >= 4) {
        setTimeout(() => onComplete(), 2500);
      }
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === aiId
            ? { ...m, text: `Sorry, I hit an error: ${err.message}. Make sure the server is running.` }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const isDone = turnCount >= 4;

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoRow}>
          <div style={s.logoDot} />
          <span style={s.logoText}>APEX</span>
        </div>
        <span style={s.headerSub}>AI Fitness Coach · Powered by Claude</span>
      </div>

      {/* Progress bar */}
      <div style={s.progressRow}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ ...s.dot, ...(turnCount > i ? s.dotActive : {}) }} />
        ))}
      </div>

      {/* Chat */}
      <div style={s.chat}>
        {messages.map(m => (
          <div key={m.id} style={m.role === 'ai' ? s.aiBubbleWrap : s.userBubbleWrap}>
            {m.role === 'ai' && <div style={s.avatar}>A</div>}
            <div style={{ ...s.bubble, ...(m.role === 'ai' ? s.aiBubble : s.userBubble) }}>
              <span style={{ ...s.bubbleText, ...(m.role === 'user' ? s.userBubbleText : {}) }}>
                {m.text || <span style={s.typing}>▊</span>}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputRow}>
        <textarea
          style={s.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isDone ? 'Building your plan...' : 'Tell me about yourself...'}
          rows={2}
          disabled={loading || isDone}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button
          style={{ ...s.sendBtn, ...((loading || !input.trim() || isDone) ? s.sendBtnDisabled : {}) }}
          onClick={send}
          disabled={loading || !input.trim() || isDone}
        >
          {loading ? '…' : '↑'}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: colors.bg },
  header: { padding: '24px 24px 12px', borderBottom: `1px solid ${colors.border}` },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 },
  logoDot: { width: 10, height: 10, borderRadius: 5, background: colors.accent },
  logoText: { color: colors.accent, fontSize: 20, fontWeight: 800, letterSpacing: 4 },
  headerSub: { color: colors.muted, fontSize: 11 },
  progressRow: { display: 'flex', gap: 6, padding: '12px 24px' },
  dot: { flex: 1, height: 3, borderRadius: 2, background: colors.border },
  dotActive: { background: colors.accent },
  chat: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  aiBubbleWrap: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  userBubbleWrap: { display: 'flex', flexDirection: 'row-reverse' },
  avatar: {
    width: 32, height: 32, borderRadius: 16, background: colors.accent,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: colors.bg, fontWeight: 800, fontSize: 14, flexShrink: 0,
  },
  bubble: { maxWidth: '78%', borderRadius: 20, padding: '12px 16px' },
  aiBubble: { background: colors.surface, borderBottomLeftRadius: 4 },
  userBubble: { background: colors.accent, borderBottomRightRadius: 4 },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: '22px', whiteSpace: 'pre-wrap' },
  userBubbleText: { color: colors.bg, fontWeight: 500 },
  typing: { animation: 'blink 1s step-start infinite', opacity: 0.7 },
  inputRow: {
    display: 'flex', gap: 8, padding: '12px 16px',
    borderTop: `1px solid ${colors.border}`, alignItems: 'flex-end',
  },
  input: {
    flex: 1, background: colors.surface, color: colors.text, border: `1px solid ${colors.border}`,
    borderRadius: 20, padding: '10px 16px', fontSize: 15, resize: 'none', outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, background: colors.accent,
    color: colors.bg, fontSize: 20, fontWeight: 800, border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sendBtnDisabled: { opacity: 0.3, cursor: 'default' },
};
