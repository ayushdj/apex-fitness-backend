#!/bin/bash
# APEX Fitness — start all services
set -e

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
RN_DIR="$BACKEND_DIR/../apex-fitness"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
nvm use 22 --silent 2>/dev/null || true
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:/usr/local/bin:$PATH"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  APEX Fitness Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. ChromaDB ──────────────────────────────────────────────────────
if curl -s http://localhost:8000/api/v2/heartbeat > /dev/null 2>&1; then
  echo "✓ ChromaDB already running"
else
  echo "→ Starting ChromaDB..."
  nohup chroma run --path "$BACKEND_DIR/chroma_data" > /tmp/chroma.log 2>&1 &
  sleep 3
  if curl -s http://localhost:8000/api/v2/heartbeat > /dev/null 2>&1; then
    echo "✓ ChromaDB started"
  else
    echo "✗ ChromaDB failed — check /tmp/chroma.log"
    exit 1
  fi
fi

# ── 2. Express backend ───────────────────────────────────────────────
if curl -s http://localhost:3001/api/stats > /dev/null 2>&1; then
  echo "✓ Backend already running"
else
  echo "→ Starting backend..."
  cd "$BACKEND_DIR"
  set -a; source "$BACKEND_DIR/.env"; set +a
  nohup npx tsx server/index.ts > /tmp/apex-server.log 2>&1 &
  sleep 5
  if curl -s http://localhost:3001/api/stats > /dev/null 2>&1; then
    echo "✓ Backend started (RAG index: $(curl -s http://localhost:3001/api/stats | grep -o '"totalDocs":[0-9]*' | cut -d: -f2) docs)"
  else
    echo "✗ Backend failed — check /tmp/apex-server.log"
    exit 1
  fi
fi

# ── 3. Expo (React Native) ───────────────────────────────────────────
if curl -s http://localhost:8081 > /dev/null 2>&1; then
  echo "✓ Expo Metro already running"
else
  echo "→ Starting Expo Metro bundler..."
  cd "$RN_DIR"
  nohup npx expo start > /tmp/apex-expo.log 2>&1 &
  sleep 8
  if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "✓ Expo Metro started"
  else
    echo "✗ Expo failed — check /tmp/apex-expo.log"
    exit 1
  fi
fi

# ── Get local IP ─────────────────────────────────────────────────────
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "unknown")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  All services running!"
echo ""
echo "  → Open Expo Go on your phone"
echo "  → Scan QR or enter manually:"
echo "    exp://$LOCAL_IP:8081"
echo ""
echo "  Logs:"
echo "    Backend  → /tmp/apex-server.log"
echo "    ChromaDB → /tmp/chroma.log"
echo "    Expo     → /tmp/apex-expo.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
