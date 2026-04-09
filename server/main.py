import os
from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import db
from routers import auth, chat, credits, plan, progress
from services.rag_service import build_index, get_stats

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect_db()
    await build_index()
    stats = get_stats()
    print(f"✓ RAG index ready: {stats['totalDocs']} documents")
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(plan.router)
app.include_router(progress.router)
app.include_router(credits.router)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "3001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
