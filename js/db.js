/* =====================================================
   DB.JS — IndexedDB Overlay Layer
   
   Architecture decision: We use IndexedDB as a "patch layer"
   on top of read-only JSON files. User edits/additions are
   stored as patches keyed by uid. When rendering, we merge
   the JSON base data with any patches. This means:
   
   - Original JSON files stay untouched (static server files)
   - All user changes persist in IndexedDB (browser database)
   - A full structured clone of edited words is stored
   - New user-added words use uid prefix "user-"
   - Deleted words are marked with { _deleted: true }
===================================================== */

const DB_NAME    = 'ssc_vocab_db';
const DB_VERSION = 1;
const STORE_WORDS   = 'word_patches';  // edits/deletions per uid
const STORE_ADDED   = 'user_words';    // brand new words added by user

let _db = null;

/* ---- OPEN ---- */

function openDB() {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_WORDS)) {
        db.createObjectStore(STORE_WORDS, { keyPath: 'uid' });
      }
      if (!db.objectStoreNames.contains(STORE_ADDED)) {
        const store = db.createObjectStore(STORE_ADDED, { keyPath: 'uid' });
        store.createIndex('section', 'section', { unique: false });
      }
    };

    req.onsuccess = (e) => {
      _db = e.target.result;
      resolve(_db);
    };

    req.onerror = (e) => {
      console.error('IndexedDB open error:', e);
      reject(e);
    };
  });
}

/* ---- GENERIC HELPERS ---- */

async function dbGet(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror   = () => reject(req.error);
  });
}

async function dbPut(storeName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbDelete(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(req.error);
  });
}

async function dbGetByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index(indexName);
    const req   = index.getAll(value);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(req.error);
  });
}

/* ---- PUBLIC API ---- */

/**
 * Save a word patch (edit). uid = "letter-id" for base words.
 */
async function saveWordPatch(uid, wordData) {
  await dbPut(STORE_WORDS, { uid, ...wordData, _updatedAt: Date.now() });
}

/**
 * Get a word patch by uid. Returns null if not patched.
 */
async function getWordPatch(uid) {
  return dbGet(STORE_WORDS, uid);
}

/**
 * Mark a word as deleted. Stored as { uid, _deleted: true }.
 */
async function markWordDeleted(uid) {
  await dbPut(STORE_WORDS, { uid, _deleted: true, _updatedAt: Date.now() });
}

/**
 * Get all patches (for merge with base data).
 */
async function getAllPatches() {
  const all = await dbGetAll(STORE_WORDS);
  const map = {};
  all.forEach(p => { map[p.uid] = p; });
  return map;
}

/**
 * Save a brand-new user-created word.
 */
async function saveUserWord(word) {
  word._createdAt = word._createdAt || Date.now();
  await dbPut(STORE_ADDED, word);
}

/**
 * Get all user-created words for a section.
 */
async function getUserWordsForSection(section) {
  return dbGetByIndex(STORE_ADDED, 'section', section);
}

/**
 * Delete a user-created word entirely.
 */
async function deleteUserWord(uid) {
  await dbDelete(STORE_ADDED, uid);
}

/**
 * Merge base word array with patches from IndexedDB.
 * Returns new array with edits applied and deletions removed.
 */
async function mergeWithPatches(words) {
  const patches = await getAllPatches();
  return words
    .map(w => {
      const patch = patches[w._uid];
      if (!patch) return w;
      if (patch._deleted) return null;
      return { ...w, ...patch, _patched: true };
    })
    .filter(Boolean);
}

/**
 * Copy JSON word to editable word with _uid tag.
 */
function tagWord(word, letter) {
  word._uid    = `${letter}-${word.id}`;
  word._letter = letter;
  return word;
}

// Initialize DB on load
openDB().catch(e => console.warn('DB init warning:', e));
