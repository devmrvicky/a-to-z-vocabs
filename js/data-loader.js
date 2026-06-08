/* =========================
   DATA LOADER
   - loads vocab JSON by letter
   - caches loaded data
   - updates alphabet filter UI
========================= */

let currentLetter = 'a';
let allWords = [];           // raw normalized words for current view
let currentDiffFilter = 'all';

// In-memory cache so letters we've visited don't re-fetch
const _dataCache = {};

/**
 * Load words for a given letter, normalize them, render, restore scroll.
 */
async function loadWords(letter = 'a') {
  try {
    currentLetter = letter.toLowerCase();
    localStorage.setItem('selectedLetter', currentLetter);

    let raw;
    if (_dataCache[currentLetter]) {
      raw = _dataCache[currentLetter];
    } else {
      const res = await fetch(`./data/vocabs/${currentLetter}.json`);
      if (!res.ok) throw new Error('JSON not found');
      raw = await res.json();
      _dataCache[currentLetter] = raw;
    }

    // Normalize all words to unified schema
    allWords = raw.map(normalizeWord);

    updateLetterCount(letter, allWords.length);
    updateActiveLetter();

    applyDifficultyFilter();   // renders cards after filtering
    scrollToLastVisited();

  } catch (err) {
    console.error('loadWords error:', err);
    document.getElementById('grid').innerHTML = `
      <div class="empty">
        <h3>No words found</h3>
        <p>${letter.toUpperCase()} vocabulary file is not available.</p>
      </div>`;
  }
}

/**
 * Apply current difficulty filter to allWords and render.
 */
function applyDifficultyFilter() {
  if (currentDiffFilter === 'all') {
    renderCards(allWords);
    return;
  }
  const filtered = allWords.filter(w => getWordDifficulty(`${currentLetter}-${w.id}`) === currentDiffFilter);
  renderCards(filtered);
}

/**
 * Set difficulty filter and re-render.
 */
function setDifficultyFilter(level, btn) {
  currentDiffFilter = level;
  document.querySelectorAll('.filter-btn[data-diff]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyDifficultyFilter();
}

/**
 * Build the A-Z button bar.
 */
function createAlphabetFilters() {
  const container = document.getElementById('alphabetFilter');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  container.innerHTML = letters.map(letter => `
    <button
      class="alphabet-btn"
      data-letter="${letter.toLowerCase()}"
      onclick="loadWords('${letter.toLowerCase()}')"
    >
      <span class="letter-name">${letter}</span>
      <span class="letter-count"></span>
    </button>
  `).join('');
}

function updateActiveLetter() {
  document.querySelectorAll('.alphabet-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.letter === currentLetter) {
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });
}

function updateLetterCount(letter, count) {
  const btn = document.querySelector(`[data-letter="${letter.toLowerCase()}"]`);
  if (!btn) return;
  btn.querySelector('.letter-count').textContent = count;
}

/**
 * Generic section loader — for OWS, Idioms etc.
 * Expects path: ./data/<section>/<section>.json
 */
async function loadSection(sectionKey) {
  document.getElementById('grid').innerHTML =
    '<div class="empty"><p>Loading…</p></div>';
  try {
    const res = await fetch(`./data/${sectionKey}/${sectionKey}.json`);
    if (!res.ok) throw new Error(`${sectionKey}.json not found`);
    const data = await res.json();
    renderSectionCards(sectionKey, data);
  } catch (err) {
    console.error('loadSection error:', err);
    document.getElementById('grid').innerHTML = `
      <div class="empty">
        <h3>Coming Soon</h3>
        <p>This section's data file is not yet available.</p>
      </div>`;
  }
}

/**
 * Fetch all vocab letters for quiz generation.
 * Returns array of normalized word objects tagged with their letter.
 */
async function fetchVocabLetters(letters) {
  const results = [];
  for (const letter of letters) {
    const l = letter.toLowerCase();
    let raw;
    try {
      if (_dataCache[l]) {
        raw = _dataCache[l];
      } else {
        const res = await fetch(`./data/vocabs/${l}.json`);
        if (!res.ok) continue;
        raw = await res.json();
        _dataCache[l] = raw;
      }
      raw.forEach(w => {
        const norm = normalizeWord(w);
        norm._letter = l;
        results.push(norm);
      });
    } catch (e) {
      console.warn(`Skipping letter ${l}:`, e);
    }
  }
  return results;
}
