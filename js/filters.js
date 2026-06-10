/* =====================================================
   ADVANCED FILTERS & SORTING
===================================================== */

let _currentSort   = 'default';
let _activeFilters = {
  pos:        'all',
  bookmarked: false,
  range:      null,   // { start: number, end: number }
};

/* ---- SORT ---- */

function sortWords(words, sortKey) {
  const arr = [...words];
  switch (sortKey) {
    case 'az':
      return arr.sort((a,b) => a.word.localeCompare(b.word));
    case 'za':
      return arr.sort((a,b) => b.word.localeCompare(a.word));
    case 'hard-first':
      return arr.sort((a,b) => {
        const order = { hard:0, medium:1, easy:2, unset:3 };
        const da = getWordDifficulty(a._uid || `${currentLetter}-${a.id}`);
        const db_ = getWordDifficulty(b._uid || `${currentLetter}-${b.id}`);
        return (order[da]??3) - (order[db_]??3);
      });
    case 'bookmarked-first':
      return arr.sort((a,b) => {
        const ba = isBookmarked(a._uid || `${currentLetter}-${a.id}`) ? 0 : 1;
        const bb = isBookmarked(b._uid || `${currentLetter}-${b.id}`) ? 0 : 1;
        return ba - bb;
      });
    case 'newest':
      return arr.sort((a,b) => (b._createdAt||0) - (a._createdAt||0));
    default:
      return arr; // original order
  }
}

/* ---- FILTER BY RANGE ---- */

function applyRangeFilter(words) {
  const range = _activeFilters.range;
  if (!range) return words;
  return words.filter(w => {
    const n = Number(w.id);
    return n >= range.start && n <= range.end;
  });
}

/* ---- APPLY ALL FILTERS ---- */

function applyAllFilters(words) {
  let result = [...words];

  // Range
  result = applyRangeFilter(result);

  // POS
  if (_activeFilters.pos !== 'all') {
    result = result.filter(w =>
      (w.pos || '').toLowerCase() === _activeFilters.pos.toLowerCase()
    );
  }

  // Bookmarked only
  if (_activeFilters.bookmarked) {
    result = result.filter(w => {
      const uid = w._uid || `${currentLetter}-${w.id}`;
      return isBookmarked(uid);
    });
  }

  // Sort
  result = sortWords(result, _currentSort);

  return result;
}

/* ---- FILTER PANEL ---- */

function openFilterPanel() {
  const posOptions = ['all','Noun','Verb','Adjective','Adverb','Preposition'];
  const sortOptions = [
    { val:'default',          label:'Default Order' },
    { val:'az',               label:'A → Z' },
    { val:'za',               label:'Z → A' },
    { val:'hard-first',       label:'Hard Words First' },
    { val:'bookmarked-first', label:'Bookmarked First' },
    { val:'newest',           label:'Newest First' },
  ];

  const range = _activeFilters.range;

  openModal({
    title: 'Filters & Sorting',
    body: `
<div class="filter-panel">

  <div class="fp-group">
    <div class="fp-label">Sort By</div>
    <div class="fp-options">
      ${sortOptions.map(o => `
        <button
          class="fp-btn ${_currentSort === o.val ? 'fp-btn-active' : ''}"
          onclick="fpSetSort('${o.val}', this)"
        >${o.label}</button>
      `).join('')}
    </div>
  </div>

  <div class="fp-group">
    <div class="fp-label">Part of Speech</div>
    <div class="fp-options">
      ${posOptions.map(p => `
        <button
          class="fp-btn ${_activeFilters.pos === p ? 'fp-btn-active' : ''}"
          onclick="fpSetPos('${p}', this)"
        >${p === 'all' ? 'All' : p}</button>
      `).join('')}
    </div>
  </div>

  <div class="fp-group">
    <label class="fp-check-row">
      <input type="checkbox" id="fp-bookmarked" ${_activeFilters.bookmarked?'checked':''} onchange="fpToggleBookmarked(this)">
      <span>Bookmarked Only ★</span>
    </label>
  </div>

  <div class="fp-group">
    <div class="fp-label">Word Range</div>
    <div class="fp-range-row">
      <input type="number" class="fp-range-input" id="fp-range-start" placeholder="Start #"
        value="${range?.start || ''}" min="1">
      <span class="fp-range-sep">—</span>
      <input type="number" class="fp-range-input" id="fp-range-end" placeholder="End #"
        value="${range?.end || ''}" min="1">
    </div>
  </div>

</div>`,
    footer: `
      <button class="modal-action-btn modal-btn-primary" onclick="applyFilterPanel()">Apply</button>
      <button class="modal-action-btn modal-btn-secondary" onclick="resetFilters()">Reset</button>
      <button class="modal-action-btn modal-btn-secondary" onclick="closeGenericModal()">Close</button>`,
  });
}

function fpSetSort(val, btn) {
  _currentSort = val;
  document.querySelectorAll('.fp-btn').forEach(b => {
    if (['Default Order','A → Z','Z → A','Hard Words First','Bookmarked First','Newest First'].includes(b.textContent)) {
      b.classList.remove('fp-btn-active');
    }
  });
  btn.classList.add('fp-btn-active');
}

function fpSetPos(val, btn) {
  _activeFilters.pos = val;
  const posLabels = ['All','Noun','Verb','Adjective','Adverb','Preposition'];
  document.querySelectorAll('.fp-btn').forEach(b => {
    if (posLabels.includes(b.textContent)) b.classList.remove('fp-btn-active');
  });
  btn.classList.add('fp-btn-active');
}

function fpToggleBookmarked(cb) {
  _activeFilters.bookmarked = cb.checked;
}

function applyFilterPanel() {
  const start = parseInt(document.getElementById('fp-range-start')?.value) || null;
  const end   = parseInt(document.getElementById('fp-range-end')?.value)   || null;
  _activeFilters.range = (start && end) ? { start, end } : null;
  closeGenericModal();
  // Trigger re-render
  applyDifficultyFilter();
  updateFilterBadge();
}

function resetFilters() {
  _currentSort   = 'default';
  _activeFilters = { pos: 'all', bookmarked: false, range: null };
  closeGenericModal();
  applyDifficultyFilter();
  updateFilterBadge();
}

function updateFilterBadge() {
  const btn = document.getElementById('filterToggleBtn');
  if (!btn) return;
  const active = _currentSort !== 'default' || _activeFilters.pos !== 'all'
    || _activeFilters.bookmarked || _activeFilters.range;
  btn.classList.toggle('filter-active', active);
  btn.textContent = active ? '⚙ Filters ●' : '⚙ Filters';
}
