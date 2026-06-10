/* =====================================================
   RENDER.JS — Vocabulary cards + section cards
===================================================== */

/**
 * Build HTML string for a single vocabulary card.
 * Exported as a named function so word-editor can call it for refresh.
 */
function buildVocabCardHTML(w) {
  const uid      = w._uid || `${currentLetter}-${w.id}`;
  const cardId   = `card-${uid.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const diff     = getWordDifficulty(uid);
  const diffClass = diff !== 'unset' ? `diff-${diff}` : '';
  const section  = getCurrentSection();

  return `
<div
  class="card collapsed ${diffClass}"
  id="${cardId}"
>
  <!-- COMPACT HEADER -->
  <div class="compact-header" onclick="toggleCard(this)">
    <div class="compact-left">
      <div class="top-line">
        <span class="num">${String(w.id).padStart(2,'0')}</span>
        <span class="word-inline">
          ${escapeHtml(w.word)}
          ${w.pos ? `<span class="pos-inline">(${escapeHtml(w.pos)})</span>` : ''}
          ${w.hindi ? `<span class="inline-hindi">(${escapeHtml(w.hindi)})</span>` : ''}
        </span>
        ${w._patched ? '<span class="edited-badge">edited</span>' : ''}
        ${uid.startsWith('user-') ? '<span class="user-badge">custom</span>' : ''}
      </div>
      <div class="compact-syno">
        ${w.synonyms.length
          ? `<span class="compact-label">Syno: </span>${w.synonyms.slice(0,4).map(s=>escapeHtml(s)).join(', ')}`
          : `<span class="compact-syno-muted">${escapeHtml(w.english || w.hindi || '—')}</span>`}
      </div>
    </div>

    <!-- RIGHT ACTIONS -->
    <div class="card-actions" onclick="event.stopPropagation()">
      <button
        class="bookmark-btn ${isBookmarked(uid) ? 'active' : ''}"
        title="Bookmark"
        onclick="toggleBookmark(event, '${uid}')"
      >★</button>

      <!-- THREE DOT MENU -->
      <button
        class="three-dot-btn"
        title="Options"
        onclick="openWordMenu(event, '${uid}', '${section}')"
      >⋮</button>

      <button class="collapse-btn" onclick="toggleCard(this.closest('.card').querySelector('.compact-header'))">
        <span class="arrow">›</span>
      </button>
    </div>
  </div>

  <!-- EXPANDED BODY -->
  <div class="card-expand">
    <div class="card-body">

      ${w.ipa ? `
      <div class="pronunciation-block">
        <div class="row-label">Pronunciation</div>
        <div class="pronunciation-text">${escapeHtml(w.ipa)}</div>
        ${w.phonetic ? `<div class="phonetic-text">${escapeHtml(w.phonetic)}</div>` : ''}
      </div>` : ''}

      ${w.english ? `
      <div class="meaning-block">
        <div class="row-label">English Meaning</div>
        <div class="meaning-text">${escapeHtml(w.english)}</div>
      </div>` : ''}

      ${w.exampleEn ? `
      <div class="example-block">
        <div class="row-label">Example</div>
        <div class="example-text">${escapeHtml(w.exampleEn)}</div>
        ${w.exampleHi ? `<div class="example-hindi">${escapeHtml(w.exampleHi)}</div>` : ''}
      </div>` : ''}

      ${w.synonyms.length ? `
      <div class="syns-block">
        <div class="row-label">Synonyms</div>
        <div class="syns-list">
          ${w.synonyms.map(s => `<span class="syn">${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>` : ''}

      ${w.antonyms.length ? `
      <div class="antonym-block">
        <div class="row-label">Antonyms</div>
        <div class="syns-list">
          ${w.antonyms.map(s => `<span class="syn antonym">${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>` : ''}

      ${w.examSources.length ? `
      <div class="exam-section">
        <div class="row-label">Exam Source</div>
        <div class="exam-source">${w.examSources.map(s=>escapeHtml(s)).join(' · ')}</div>
      </div>` : ''}

    </div>
  </div>
</div>`;
}

/**
 * Render an array of normalized vocab words into #grid.
 */
function renderCards(words) {
  const grid = document.getElementById('grid');
  if (!grid) return;

  // Apply advanced filters (sort, POS, bookmarked, range)
  const filtered = typeof applyAllFilters === 'function' ? applyAllFilters(words) : words;

  if (!filtered.length) {
    grid.innerHTML = `
<div class="empty">
  <div class="empty-icon">📭</div>
  <h3>No words found</h3>
  <p>Try a different filter, letter, or search term</p>
</div>`;
    return;
  }

  grid.innerHTML = filtered.map((w, i) => {
    const html = buildVocabCardHTML(w);
    // Add fade-in delay
    return html.replace('class="card collapsed', `class="card collapsed" style="animation-delay:${Math.min(i*15,250)}ms"`);
  }).join('').replace(/class="card collapsed" style="animation-delay:[^"]*" style="animation-delay:[^"]*"/g,
    m => m.split(' style=')[0] + m.split(' style=')[1]
  );
}

/* ---- SECTION CARDS (OWS, Idioms, Syns) ---- */

function renderSectionCards(sectionKey, data) {
  const grid = document.getElementById('grid');
  if (!data || !data.length) {
    grid.innerHTML = `
<div class="empty">
  <div class="empty-icon">📭</div>
  <h3>No entries found</h3>
  <p>This section has no data yet.</p>
</div>`;
    return;
  }

  grid.innerHTML = data.map((item, i) => {
    const uid       = item.uid || item._uid || `${sectionKey}-${item.id || i+1}`;
    const cardId    = `card-${uid.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const word      = item.word || item.phrase || item.idiom || '';
    const meaning   = item.meaning || item.definition || item.english || '';
    const hindiMeaning = item.hindi || '';
    const example   = item.example || item.sentence || '';
    const syns      = item.synonyms || item.syns || [];
    const antonyms  = item.antonyms || [];
    const examSrc   = item.examSource || (item.examSources || []).join(', ') || '';
    const phrase    = sectionKey === 'ows' ? item.phrase : '';  // OWS definition
    const index     = item.id || item.n || (i+1);

    return `
<div class="card collapsed" id="${cardId}" style="animation-delay:${Math.min(i*15,250)}ms">
  <div class="compact-header" onclick="toggleCard(this)">
    <div class="compact-left">
      <div class="top-line">
        <span class="num">${String(index).padStart(2,'0')}</span>
        <span class="word-inline">${escapeHtml(word)}</span>
        ${uid.startsWith('user-') ? '<span class="user-badge">custom</span>' : ''}
      </div>
      <div class="compact-syno compact-syno-muted">
        ${escapeHtml((sectionKey === 'ows' ? item.phrase : meaning) || meaning || '')}
      </div>
    </div>
    <div class="card-actions" onclick="event.stopPropagation()">
      <button
        class="bookmark-btn ${isBookmarked(uid) ? 'active' : ''}"
        onclick="toggleBookmark(event, '${uid}')"
      >★</button>
      <button class="three-dot-btn" onclick="openWordMenu(event,'${uid}','${sectionKey}')">⋮</button>
      <button class="collapse-btn"><span class="arrow">›</span></button>
    </div>
  </div>
  <div class="card-expand">
    <div class="card-body">
      ${hindiMeaning ? `
      <div class="hindi-block">
        <div class="row-label">Hindi</div>
        <div class="hindi-text">${escapeHtml(hindiMeaning)}</div>
      </div>` : ''}
      ${meaning ? `
      <div class="meaning-block">
        <div class="row-label">${sectionKey==='ows' ? 'Definition' : 'Meaning'}</div>
        <div class="meaning-text">${escapeHtml(meaning)}</div>
      </div>` : ''}
      ${example ? `
      <div class="example-block">
        <div class="row-label">Example</div>
        <div class="example-text">${escapeHtml(example)}</div>
      </div>` : ''}
      ${syns.length ? `
      <div class="syns-block">
        <div class="row-label">Synonyms</div>
        <div class="syns-list">${syns.map(s=>`<span class="syn">${escapeHtml(s)}</span>`).join('')}</div>
      </div>` : ''}
      ${antonyms.length ? `
      <div class="antonym-block">
        <div class="row-label">Antonyms</div>
        <div class="syns-list">${antonyms.map(s=>`<span class="syn antonym">${escapeHtml(s)}</span>`).join('')}</div>
      </div>` : ''}
      ${examSrc ? `
      <div class="exam-section">
        <div class="row-label">Exam Source</div>
        <div class="exam-source">${escapeHtml(examSrc)}</div>
      </div>` : ''}
    </div>
  </div>
</div>`;
  }).join('');
}

function toggleCard(header) {
  const card = header.closest('.card');
  if (!card) return;
  card.classList.toggle('collapsed');
}
