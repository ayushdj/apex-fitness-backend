import os

import httpx
from fastembed import TextEmbedding

from knowledge.fitness import FITNESS_KNOWLEDGE
from knowledge.nutrition import NUTRITION_KNOWLEDGE

CHROMA_URL = os.getenv("CHROMA_URL", "http://chromadb.railway.internal:8000")
COLLECTION_NAME = "fitness_knowledge_v2"

ALL_DOCS = FITNESS_KNOWLEDGE + NUTRITION_KNOWLEDGE

_embedder: TextEmbedding | None = None
_collection_id: str | None = None


def _get_embedder() -> TextEmbedding:
    global _embedder
    if _embedder is None:
        _embedder = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")
    return _embedder


def _embed(texts: list[str]) -> list[list[float]]:
    return [v.tolist() for v in _get_embedder().embed(texts)]


async def _get_or_create_collection() -> str:
    global _collection_id
    if _collection_id:
        return _collection_id

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{CHROMA_URL}/api/v1/collections/{COLLECTION_NAME}")
        if resp.status_code == 200:
            _collection_id = resp.json()["id"]
            print(f"✓ Using existing ChromaDB collection: {COLLECTION_NAME}")
            return _collection_id

        resp = await client.post(
            f"{CHROMA_URL}/api/v1/collections",
            json={"name": COLLECTION_NAME, "metadata": {"hnsw:space": "cosine"}},
        )
        resp.raise_for_status()
        _collection_id = resp.json()["id"]
        print(f"✓ Created ChromaDB collection: {COLLECTION_NAME}")
        return _collection_id


async def build_index() -> None:
    collection_id = await _get_or_create_collection()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.get(f"{CHROMA_URL}/api/v1/collections/{collection_id}/count")
        count = resp.json() if resp.status_code == 200 else 0

        if isinstance(count, int) and count >= len(ALL_DOCS):
            print(f"✓ ChromaDB index already populated ({count} docs)")
            return

        print(f"  Indexing {len(ALL_DOCS)} documents into ChromaDB...")

        ids, documents, metadatas = [], [], []
        for doc in ALL_DOCS:
            text = f"{doc['title']}. Tags: {', '.join(doc['tags'])}. {doc['content']}"
            ids.append(doc["id"])
            documents.append(text)
            metadatas.append({"title": doc["title"], "tags": ", ".join(doc["tags"])})

        embeddings = _embed(documents)

        batch_size = 50
        for i in range(0, len(ids), batch_size):
            resp = await client.post(
                f"{CHROMA_URL}/api/v1/collections/{collection_id}/upsert",
                json={
                    "ids": ids[i : i + batch_size],
                    "documents": documents[i : i + batch_size],
                    "metadatas": metadatas[i : i + batch_size],
                    "embeddings": embeddings[i : i + batch_size],
                },
            )
            resp.raise_for_status()

        print(f"✓ Indexed {len(ids)} documents into ChromaDB")


async def retrieve(query: str, n_results: int = 8) -> list[dict]:
    collection_id = await _get_or_create_collection()
    query_embedding = _embed([query])[0]

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{CHROMA_URL}/api/v1/collections/{collection_id}/query",
            json={
                "query_embeddings": [query_embedding],
                "n_results": min(n_results, len(ALL_DOCS)),
                "include": ["documents", "metadatas", "distances"],
            },
        )
        if resp.status_code != 200:
            return []

        data = resp.json()
        return [
            {"content": doc, "title": meta.get("title", ""), "score": 1 - dist}
            for doc, meta, dist in zip(
                data.get("documents", [[]])[0],
                data.get("metadatas", [[]])[0],
                data.get("distances", [[]])[0],
            )
        ]


def format_context(docs: list[dict]) -> str:
    if not docs:
        return ""
    return "\n\n".join(f"[{i}] {doc['title']}\n{doc['content']}" for i, doc in enumerate(docs, 1))


def get_stats() -> dict:
    return {"totalDocs": len(ALL_DOCS), "collection": COLLECTION_NAME}
