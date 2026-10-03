/**
 * Durable storage for the portfolio's mutable documents.
 *
 * Local development keeps using the plain JSON files in server/data — zero
 * setup, synchronous, exactly as before. In production you set MONGODB_URI and
 * the same documents live in a MongoDB Atlas free cluster instead, so a
 * redeploy no longer wipes contact messages, analytics or panel edits.
 *
 * Why an in-memory cache: the whole app reads content synchronously (every
 * page render, the sitemap, SEO tags). Loading the documents once at boot keeps
 * those reads instant and unchanged; writes update the cache first and persist
 * right after, so a request never blocks on a network round trip.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoClient } from 'mongodb'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')

/** The mutable documents this app owns. `settings` holds panel-level overrides. */
export const KEYS = ['content', 'messages', 'analytics', 'settings']

const FILES = {
  content: path.join(DATA_DIR, 'content.json'),
  messages: path.join(DATA_DIR, 'messages.json'),
  analytics: path.join(DATA_DIR, 'analytics.json'),
  settings: path.join(DATA_DIR, 'settings.json'),
}

const DEFAULTS = {
  content: {},
  messages: [],
  analytics: [],
  settings: {},
}

const cache = {} // key -> parsed document (source of truth for reads)
const mtimes = {} // key -> ISO timestamp of the last write
const pending = new Map() // key -> in-flight write promise

let backend = 'file'
let client = null
let collection = null

// --- file backend -----------------------------------------------------------

function readFileValue(key) {
  try {
    return JSON.parse(fs.readFileSync(FILES[key], 'utf8'))
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(`[store] could not read ${FILES[key]}:`, err.message)
    return null
  }
}

function fileMtime(key) {
  try {
    return fs.statSync(FILES[key]).mtime.toISOString()
  } catch {
    return null
  }
}

function writeFileValue(key, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(FILES[key], JSON.stringify(data, null, 2), 'utf8')
}

function loadFromFiles() {
  for (const key of KEYS) {
    const value = readFileValue(key)
    cache[key] = value ?? DEFAULTS[key]
    mtimes[key] = fileMtime(key) || new Date().toISOString()
  }
}

// --- mongo backend ----------------------------------------------------------

async function loadFromMongo() {
  // Seed each document from the committed/on-disk copy the first time, so the
  // very first deploy against an empty cluster starts from the real content.
  for (const key of KEYS) {
    const doc = await collection.findOne({ _id: key })
    if (doc && doc.data !== undefined) {
      cache[key] = doc.data
      mtimes[key] = doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString()
    } else {
      const seed = readFileValue(key) ?? DEFAULTS[key]
      cache[key] = seed
      mtimes[key] = new Date().toISOString()
      await collection.updateOne(
        { _id: key },
        { $set: { data: seed, updatedAt: new Date() } },
        { upsert: true }
      )
    }
  }
}

function persistMongo(key, data) {
  const run = collection
    .updateOne({ _id: key }, { $set: { data, updatedAt: new Date() } }, { upsert: true })
    .catch((err) => {
      console.error(`[store] failed to persist "${key}" to MongoDB:`, err.message)
    })
  pending.set(
    key,
    run.finally(() => {
      if (pending.get(key) === run) pending.delete(key)
    })
  )
  return run
}

// --- public API -------------------------------------------------------------

/**
 * Connect to the configured backend and load every document into memory.
 * Never throws: if the database is unreachable the app still boots on files,
 * so a database hiccup can't take the whole site down.
 */
export async function initStore() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    backend = 'file'
    loadFromFiles()
    return { backend }
  }
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 })
    await client.connect()
    const db = client.db(process.env.MONGODB_DB || 'portfolio')
    collection = db.collection(process.env.MONGODB_COLLECTION || 'documents')
    await loadFromMongo()
    backend = 'mongo'
    return { backend }
  } catch (err) {
    console.error('[store] MongoDB unavailable — falling back to local files:', err.message)
    backend = 'file'
    loadFromFiles()
    return { backend, error: err.message }
  }
}

/** Synchronous read of the in-memory copy. */
export function read(key) {
  return cache[key] ?? DEFAULTS[key]
}

/**
 * Update a document. The cache changes immediately (so the next read sees it)
 * and the value is persisted to the active backend.
 */
export async function write(key, data) {
  cache[key] = data
  mtimes[key] = new Date().toISOString()
  if (backend === 'mongo' && collection) {
    await persistMongo(key, data)
  } else {
    writeFileValue(key, data)
  }
}

/** Last-write timestamp (ISO string) for a document — used by the sitemap. */
export function lastModified(key) {
  return mtimes[key] || new Date().toISOString()
}

/** Wait for every in-flight write to settle (used on graceful shutdown). */
export async function flushStore() {
  await Promise.all([...pending.values()])
}

/** Which backend is active: 'file' or 'mongo'. */
export function backendName() {
  return backend
}

/** Close the database connection, if any. */
export async function closeStore() {
  await flushStore()
  if (client) await client.close().catch(() => {})
}
