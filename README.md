# APEX Fitness — Backend

Python/FastAPI backend for the APEX Fitness app. Provides AI-powered plan generation, RAG-backed coaching chat, user authentication, and progress tracking.

## Tech Stack

- **FastAPI** + **uvicorn** — async REST API
- **Anthropic Claude** — plan generation (Haiku 4.5) and coaching chat (Opus 4.6)
- **ChromaDB** — vector store for RAG (fitness + nutrition knowledge)
- **fastembed** — ONNX-based embeddings (all-MiniLM-L6-v2, no PyTorch required)
- **MongoDB Atlas** — user, plan, and progress storage via motor (async)
- **python-jose** + **passlib** — JWT auth and bcrypt password hashing

## Project Structure

```
server/
├── main.py                  # App setup, middleware, router registration
├── db.py                    # MongoDB connection
├── utils.py                 # Shared helpers
├── routers/                 # Thin endpoint files (no business logic)
│   ├── auth.py              # POST /api/auth/register|login
│   ├── chat.py              # POST /api/chat, /api/chat/complete
│   ├── plan.py              # /api/plan/generate + CRUD
│   ├── progress.py          # /api/progress + /complete
│   └── credits.py           # /api/credits, /api/stats
├── services/                # All business logic
│   ├── auth_service.py      # JWT, bcrypt, register, login, require_auth
│   ├── chat_service.py      # Streaming + non-streaming Claude chat
│   ├── plan_service.py      # Parallel training + meal plan generation
│   ├── credit_service.py    # Per-request billing and credit management
│   └── rag_service.py       # ChromaDB indexing and semantic retrieval
└── knowledge/               # Static knowledge base
    ├── fitness.py           # 18 fitness/training knowledge chunks
    └── nutrition.py         # 20 nutrition/food knowledge chunks
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/chat` | JWT | Streaming SSE coaching chat |
| POST | `/api/chat/complete` | JWT | Non-streaming chat (React Native) |
| POST | `/api/plan/generate` | JWT | Generate training + meal plan via Claude |
| GET | `/api/plan` | JWT | Fetch saved plan |
| POST | `/api/plan` | JWT | Save plan |
| DELETE | `/api/plan` | JWT | Delete plan and progress |
| GET | `/api/progress` | JWT | Fetch completed workout days |
| POST | `/api/progress/complete` | JWT | Mark a day complete |
| GET | `/api/credits` | JWT | Check credit balance |
| GET | `/api/stats` | — | RAG index stats |

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Fill in MONGODB_URI, ANTHROPIC_API_KEY, JWT_SECRET, CHROMA_URL

# Run the server
cd server && uvicorn main:app --reload --port 3001
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `JWT_SECRET` | Secret for signing JWTs |
| `CHROMA_URL` | ChromaDB URL — set automatically to `http://chromadb:8000` in Docker |

## Deployment (AWS EC2 + Docker Compose)

The backend and ChromaDB run as Docker containers on a single EC2 instance (t3.small recommended). ChromaDB data is persisted via a named Docker volume.

### First-time EC2 setup

```bash
# SSH into your EC2 instance, then run:
bash <(curl -s https://raw.githubusercontent.com/ayushdj/apex-fitness-backend/main/scripts/setup-ec2.sh)

# Fill in your secrets
nano ~/apex-fitness-backend/.env

# Start everything
cd ~/apex-fitness-backend && docker compose up -d --build
```

### Deploy updates

```bash
export EC2_HOST=your-ec2-public-ip
export EC2_USER=ec2-user          # or ubuntu
export SSH_KEY_PATH=~/.ssh/your-key.pem

./scripts/deploy.sh
```

This pulls the latest code and restarts the containers with zero manual steps.

### EC2 Security Group

Open these inbound ports:
- **22** (SSH) — your IP only
- **8000** (API) — `0.0.0.0/0` (or behind a load balancer)

ChromaDB is not exposed publicly — it only communicates with the API container over Docker's internal network.
