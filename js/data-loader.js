/* =====================================================
   DATA LOADER — loads JSON, merges DB patches, renders
===================================================== */

let currentLetter   = 'a';
let allWords        = [];
let currentDiffFilter = 'all';

const _dataCache = {};

/* ---- VOCAB LOADER ---- */

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

    // Normalize + tag each word with _uid
    let words = raw.map(w => {
      const norm = normalizeWord(w);
      norm._uid    = `${currentLetter}-${norm.id}`;
      norm._letter = currentLetter;
      return norm;
    });

    // Merge IndexedDB patches
    words = await mergeWithPatches(words);

    // Append user-created words for this letter
    const userWords = await getUserWordsForSection('vocabs');
    const vocabUserWords = userWords.filter(w =>
      w.section === 'vocabs' && !w._deleted
    );
    words = [...words, ...vocabUserWords];

    allWords = words;

    updateLetterCount(letter, allWords.filter(w=>!w._deleted).length);
    updateActiveLetter();
    applyDifficultyFilter();
    scrollToLastVisited();

  } catch (err) {
    console.error('loadWords error:', err);
    document.getElementById('grid').innerHTML = `
<div class="empty">
  <div class="empty-icon">⚠️</div>
  <h3>Could not load words</h3>
  <p>${letter.toUpperCase()} vocabulary file is not available.</p>
</div>`;
  }
}

/* ---- APPLY DIFFICULTY + RENDER ---- */

function applyDifficultyFilter() {
  let words = allWords;
  if (currentDiffFilter !== 'all') {
    words = allWords.filter(w => {
      const uid = w._uid || `${currentLetter}-${w.id}`;
      return getWordDifficulty(uid) === currentDiffFilter;
    });
  }
  renderCards(words);
}

function setDifficultyFilter(level, btn) {
  currentDiffFilter = level;
  document.querySelectorAll('.filter-btn[data-diff]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyDifficultyFilter();
}

/* ---- ALPHABET FILTER ---- */

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
</button>`).join('');
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

/* ---- SECTION LOADER (syns, ows, idioms) ---- */

async function loadSection(sectionKey) {
  document.getElementById('grid').innerHTML =
    '<div class="empty"><div class="section-loading"><div class="quiz-spinner"></div></div></div>';
  try {
    const res = await fetch(`./data/${sectionKey}/${sectionKey}.json`);
    if (!res.ok) throw new Error(`${sectionKey}.json not found`);
    const baseData = await res.json();

    // Tag each item
    let data = baseData.map((item, i) => {
      const uid = `${sectionKey}-${item.id || i+1}`;
      return { ...item, _uid: uid, _letter: sectionKey, section: sectionKey };
    });

    // Merge patches
    data = await mergeWithPatches(data);

    // Append user words
    const userWords = await getUserWordsForSection(sectionKey);
    data = [...data, ...userWords.filter(w => !w._deleted)];

    allWords = data;
    renderSectionCards(sectionKey, data.filter(w => !w._deleted));

  } catch (err) {
    console.error('loadSection error:', err);
    document.getElementById('grid').innerHTML = `
<div class="empty">
  <div class="empty-icon">📭</div>
  <h3>Section data not found</h3>
  <p>${sectionKey}.json is not available.</p>
</div>`;
  }
}

/* ---- QUIZ DATA FETCHER ---- */

async function fetchVocabLetters(letters) {
  const results = [];
  for (const letter of letters) {
    const l = letter.toLowerCase();
    try {
      let raw;
      if (_dataCache[l]) {
        raw = _dataCache[l];
      } else {
        const res = await fetch(`./data/vocabs/${l}.json`);
        if (!res.ok) continue;
        raw = await res.json();
        _dataCache[l] = raw;
      }
      raw.forEach(w => {
        const norm    = normalizeWord(w);
        norm._uid     = `${l}-${norm.id}`;
        norm._letter  = l;
        results.push(norm);
      });
    } catch (e) {
      console.warn(`Skipping letter ${l}:`, e);
    }
  }
  return results;
}
