/**
 * RAG layer — ChromaDB (REST API) + @xenova/transformers embeddings
 *
 * Uses all-MiniLM-L6-v2 (25 MB, cached locally after first download)
 * to generate semantic embeddings. ChromaDB stores vectors on disk for
 * persistence — no re-indexing needed on subsequent server restarts.
 */

import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';
import { FITNESS_KNOWLEDGE } from './fitnessKnowledge.js';
import { NUTRITION_KNOWLEDGE } from './nutritionKnowledge.js';

// Bump version whenever knowledge base changes — forces re-index on next cold start
const COLLECTION_NAME = 'fitness_knowledge_v2';
const CHROMA_URL = process.env.CHROMA_URL ?? 'http://localhost:8000';
const CHROMA_API = `${CHROMA_URL}/api/v2/tenants/default_tenant/databases/default_database`;
const BATCH_SIZE = 50;

let collectionId: string | null = null;
let extractor: FeatureExtractionPipeline | null = null;
let totalDocs = 0;

// ── Embedding ────────────────────────────────────────────────────────

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    console.log('Loading all-MiniLM-L6-v2 embedding model (downloads once, ~25 MB)...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✓ Embedding model ready');
  }
  return extractor;
}

async function embed(texts: string[]): Promise<number[][]> {
  const model = await getExtractor();
  const embeddings: number[][] = [];
  for (const text of texts) {
    const output = await model(text.slice(0, 512), { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data as Float32Array));
  }
  return embeddings;
}

// ── ChromaDB REST helpers ────────────────────────────────────────────

async function chromaFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${CHROMA_API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ChromaDB ${options?.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function getOrCreateCollection(): Promise<string> {
  // List existing collections
  const collections: { id: string; name: string }[] = await chromaFetch('/collections');
  const existing = collections.find(c => c.name === COLLECTION_NAME);
  if (existing) return existing.id;

  // Create new
  const created = await chromaFetch('/collections', {
    method: 'POST',
    body: JSON.stringify({ name: COLLECTION_NAME }),
  });
  return created.id;
}

async function countDocs(id: string): Promise<number> {
  const result = await chromaFetch(`/collections/${id}/count`);
  return typeof result === 'number' ? result : 0;
}

async function addBatch(
  id: string,
  batchIds: string[],
  batchEmbeddings: number[][],
  batchDocuments: string[],
  batchMetadatas: Record<string, string>[]
) {
  await chromaFetch(`/collections/${id}/add`, {
    method: 'POST',
    body: JSON.stringify({
      ids: batchIds,
      embeddings: batchEmbeddings,
      documents: batchDocuments,
      metadatas: batchMetadatas,
    }),
  });
}

// ── Build index ──────────────────────────────────────────────────────

export async function buildIndex(): Promise<void> {
  // Verify ChromaDB is reachable
  await fetch(`${CHROMA_URL}/api/v2/heartbeat`).then(r => {
    if (!r.ok) throw new Error('ChromaDB not reachable');
  });
  console.log('✓ Connected to ChromaDB at', CHROMA_URL);

  collectionId = await getOrCreateCollection();
  const existing = await countDocs(collectionId);

  if (existing > 0) {
    totalDocs = existing;
    console.log(`✓ ChromaDB: using persisted collection (${existing} docs) — skipping re-index`);
    return;
  }

  // Pre-load embedding model before fetching data
  await getExtractor();

  // ── Assemble documents ─────────────────────────────────────────────
  const ids: string[] = [];
  const texts: string[] = [];
  const metadatas: Record<string, string>[] = [];

  for (const k of FITNESS_KNOWLEDGE) {
    ids.push(k.id);
    texts.push(`${k.title}\n\n${k.content}`);
    metadatas.push({ type: 'knowledge', title: k.title, tags: k.tags.join(',') });
  }

  for (const n of NUTRITION_KNOWLEDGE) {
    ids.push(`nutrition-${n.id}`);
    texts.push(`${n.title}\n\n${n.content}`);
    metadatas.push({ type: 'nutrition', title: n.title, tags: n.tags.join(',') });
  }
  console.log(`✓ Prepared ${NUTRITION_KNOWLEDGE.length} nutrition knowledge chunks`);

  let exerciseCount = 0;
  try {
    console.log('Fetching exercise database from GitHub...');
    const res = await fetch(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
    );
    if (res.ok) {
      const exercises: any[] = await res.json();
      for (const ex of exercises) {
        ids.push(`exercise-${ex.id}`);
        texts.push([
          `Exercise: ${ex.name}`,
          `Category: ${ex.category} | Level: ${ex.level} | Equipment: ${ex.equipment}`,
          `Primary muscles: ${(ex.primaryMuscles ?? []).join(', ')}`,
          (ex.secondaryMuscles ?? []).length ? `Secondary muscles: ${ex.secondaryMuscles.join(', ')}` : '',
          ex.force ? `Force: ${ex.force}` : '',
          ex.mechanic ? `Mechanic: ${ex.mechanic}` : '',
          `Instructions: ${(ex.instructions ?? []).join(' ')}`,
        ].filter(Boolean).join('\n'));
        metadatas.push({
          type: 'exercise',
          title: ex.name,
          tags: [...(ex.primaryMuscles ?? []), ...(ex.secondaryMuscles ?? []), ex.category, ex.level, ex.equipment].join(','),
        });
        exerciseCount++;
      }
      console.log(`✓ Prepared ${exerciseCount} exercises`);
    }
  } catch (err) {
    console.warn('Could not fetch exercises:', err);
  }

  // ── Embed + index in batches ───────────────────────────────────────
  console.log(`Embedding and indexing ${ids.length} documents (runs once)...`);
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const slice = (arr: any[]) => arr.slice(i, i + BATCH_SIZE);
    const batchTexts = slice(texts);
    const embeddings = await embed(batchTexts);
    await addBatch(collectionId!, slice(ids), embeddings, batchTexts, slice(metadatas));
    process.stdout.write(`\r  Indexed ${Math.min(i + BATCH_SIZE, ids.length)}/${ids.length} docs`);
  }
  console.log('\n✓ ChromaDB index complete');

  totalDocs = await countDocs(collectionId!);
  console.log(`✓ ${totalDocs} vectors persisted to disk`);
}

// ── Retrieval ────────────────────────────────────────────────────────

export async function retrieve(query: string, k = 8): Promise<string[]> {
  if (!collectionId) throw new Error('ChromaDB not initialized');
  const [queryEmbedding] = await embed([query]);

  const result = await chromaFetch(`/collections/${collectionId}/query`, {
    method: 'POST',
    body: JSON.stringify({
      query_embeddings: [queryEmbedding],
      n_results: k,
    }),
  });

  return (result.documents?.[0] ?? []).filter(Boolean);
}

export function formatContext(docs: string[]): string {
  return docs.join('\n\n---\n\n');
}

export function getStats() {
  return { totalDocs, chromaUrl: CHROMA_URL, collectionId };
}
