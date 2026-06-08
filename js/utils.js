/* =========================
   UTILS — shared helpers
========================= */

/**
 * Normalize a word object that may use either the full schema (a.json)
 * or the compact schema (b–z.json) into a single canonical shape.
 *
 * Full schema keys:  id, word, pos, pronunciation, meaning, example, synonyms, antonyms, exam_sources
 * Compact schema:    n, w, h, syns, exam
 */
function normalizeWord(raw) {
  if (raw.word !== undefined) {
    // Full schema (a.json style)
    return {
      id:          raw.id,
      word:        raw.word,
      pos:         raw.pos || '',
      hindi:       raw.meaning?.hindi || '',
      english:     raw.meaning?.english || '',
      ipa:         raw.pronunciation?.ipa || '',
      phonetic:    raw.pronunciation?.phonetic || '',
      exampleEn:   raw.example?.english || '',
      exampleHi:   raw.example?.hindi || '',
      synonyms:    raw.synonyms || [],
      antonyms:    raw.antonyms || [],
      examSources: raw.exam_sources || [],
    };
  } else {
    // Compact schema (b.json, c.json, … style)
    return {
      id:          raw.n,
      word:        raw.w,
      pos:         '',
      hindi:       raw.h || '',
      english:     '',
      ipa:         '',
      phonetic:    '',
      exampleEn:   '',
      exampleHi:   '',
      synonyms:    raw.syns || [],
      antonyms:    [],
      examSources: raw.exam ? [raw.exam] : [],
    };
  }
}

/**
 * Shuffle an array in-place using Fisher-Yates.
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick `n` random items from an array (non-destructive).
 */
function pickRandom(arr, n) {
  return shuffleArray([...arr]).slice(0, n);
}

/**
 * Format a date as "DD MMM YYYY · HH:MM".
 */
function formatDate(ts) {
  const d = new Date(ts);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`;
}

/**
 * Compute a letter grade from percentage.
 */
function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', label: 'Outstanding', color: '#f0b429' };
  if (pct >= 80) return { grade: 'A',  label: 'Excellent',   color: '#4ade80' };
  if (pct >= 70) return { grade: 'B',  label: 'Good',        color: '#38bdf8' };
  if (pct >= 60) return { grade: 'C',  label: 'Average',     color: '#fb923c' };
  return               { grade: 'D',  label: 'Needs Work',   color: '#f87171' };
}

/**
 * Get difficulty for a word id from localStorage.
 */
function getWordDifficulty(wordId) {
  const map = JSON.parse(localStorage.getItem('wordDifficulty') || '{}');
  return map[wordId] || 'unset';
}

/**
 * Set difficulty for a word id in localStorage.
 */
function setWordDifficulty(wordId, level) {
  const map = JSON.parse(localStorage.getItem('wordDifficulty') || '{}');
  map[wordId] = level;
  localStorage.setItem('wordDifficulty', JSON.stringify(map));
}
