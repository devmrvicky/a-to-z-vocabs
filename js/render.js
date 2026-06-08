/* =========================
   RENDER — vocabulary cards
========================= */

/**
 * Render normalized word objects as collapsible cards into #grid.
 */
function renderCards(words) {
  const grid = document.getElementById('grid');
  if (!grid) return;

  if (!words.length) {
    grid.innerHTML = '<div class="empty"><h3>No words found</h3><p>Try a different search or filter</p></div>';
    return;
  }

  grid.innerHTML = words.map((w, i) => {
    const uid = `${currentLetter}-${w.id}`;
    const diff = getWordDifficulty(uid);
    const diffClass = diff !== 'unset' ? `diff-${diff}` : '';

    return `
<div
  class="card collapsed ${diffClass}"
  id="word-${w.id}"
  style="animation-delay:${Math.min(i * 20, 300)}ms"
>
  <!-- COMPACT HEADER -->
  <div class="compact-header" onclick="toggleCard(this)">
    <div class="compact-left">
      <div class="top-line">
        <span class="num">${String(w.id).padStart(2,'0')}</span>
        <span class="word-inline">
          ${w.word}
          ${w.pos ? `<span class="pos-inline">(${w.pos})</span>` : ''}
          <span class="inline-hindi">(${w.hindi})</span>
        </span>
      </div>
      <div class="compact-syno">
        <span class="compact-label">Syno :</span>
        ${w.synonyms.join(', ') || '—'}
      </div>
    </div>

    <!-- RIGHT ACTIONS -->
    <div class="card-actions">
      <button
        class="bookmark-btn ${isBookmarked(uid) ? 'active' : ''}"
        title="Bookmark"
        onclick="toggleBookmark(event, '${uid}')"
      >★</button>

      <div class="diff-selector" onclick="event.stopPropagation()">
        <button
          class="diff-btn ${diff === 'easy' ? 'diff-easy-active' : ''}"
          title="Easy"
          onclick="markDifficulty('${uid}', 'easy', this)"
        >E</button>
        <button
          class="diff-btn ${diff === 'medium' ? 'diff-medium-active' : ''}"
          title="Medium"
          onclick="markDifficulty('${uid}', 'medium', this)"
        >M</button>
        <button
          class="diff-btn ${diff === 'hard' ? 'diff-hard-active' : ''}"
          title="Hard"
          onclick="markDifficulty('${uid}', 'hard', this)"
        >H</button>
      </div>

      <button class="collapse-btn">
        <span class="arrow">›</span>
      </button>
    </div>
  </div>

  <!-- EXPANDED SECTION -->
  <div class="card-expand">
    <div class="card-body">

      ${w.ipa ? `
      <div class="pronunciation-block">
        <div class="row-label">Pronunciation</div>
        <div class="pronunciation-text">${w.ipa}</div>
        <div class="phonetic-text">${w.phonetic}</div>
      </div>` : ''}

      ${w.english ? `
      <div class="meaning-block">
        <div class="row-label">English Meaning</div>
        <div class="meaning-text">${w.english}</div>
      </div>` : ''}

      ${w.exampleEn ? `
      <div class="example-block">
        <div class="row-label">Example</div>
        <div class="example-text">${w.exampleEn}</div>
        ${w.exampleHi ? `<div class="example-hindi">${w.exampleHi}</div>` : ''}
      </div>` : ''}

      ${w.synonyms.length ? `
      <div class="syns-block">
        <div class="row-label">Synonyms</div>
        <div class="syns-list">
          ${w.synonyms.map(s => `<span class="syn">${s}</span>`).join('')}
        </div>
      </div>` : ''}

      ${w.antonyms.length ? `
      <div class="antonym-block">
        <div class="row-label">Antonyms</div>
        <div class="syns-list">
          ${w.antonyms.map(s => `<span class="syn antonym">${s}</span>`).join('')}
        </div>
      </div>` : ''}

      ${w.examSources.length ? `
      <div class="exam-section">
        <div class="row-label">Exam Source</div>
        <div class="exam-source">${w.examSources.join(', ')}</div>
      </div>` : ''}

    </div>
  </div>
</div>`;
  }).join('');
}

/**
 * Render generic section cards (OWS, Idioms, Syns) — simple layout.
 */
function renderSectionCards(sectionKey, data) {
  const grid = document.getElementById('grid');
  if (!data || !data.length) {
    grid.innerHTML = '<div class="empty"><h3>No data</h3><p>This section has no entries yet.</p></div>';
    return;
  }

  grid.innerHTML = data.map((item, i) => {
    // Accept flexible keys
    const word    = item.word || item.phrase || item.idiom || item.w || '';
    const meaning = item.meaning || item.definition || item.h || '';
    const example = item.example || item.sentence || '';
    const syns    = item.synonyms || item.syns || [];
    const index   = item.id || item.n || (i + 1);

    return `
<div class="card collapsed" style="animation-delay:${Math.min(i*20,300)}ms">
  <div class="compact-header" onclick="toggleCard(this)">
    <div class="compact-left">
      <div class="top-line">
        <span class="num">${String(index).padStart(2,'0')}</span>
        <span class="word-inline">${word}</span>
      </div>
      ${typeof meaning === 'string' ? `<div class="compact-syno">${meaning}</div>` : ''}
    </div>
    <div class="card-actions">
      <button class="collapse-btn"><span class="arrow">›</span></button>
    </div>
  </div>
  <div class="card-expand">
    <div class="card-body">
      ${typeof meaning === 'object' && meaning.hindi ? `
        <div class="pronunciation-block">
          <div class="row-label">Hindi</div>
          <div class="pronunciation-text">${meaning.hindi}</div>
        </div>` : ''}
      ${typeof meaning === 'object' && meaning.english ? `
        <div class="meaning-block">
          <div class="row-label">Meaning</div>
          <div class="meaning-text">${meaning.english}</div>
        </div>` : ''}
      ${example ? `
        <div class="example-block">
          <div class="row-label">Example</div>
          <div class="example-text">${example}</div>
        </div>` : ''}
      ${syns.length ? `
        <div class="syns-block">
          <div class="row-label">Synonyms</div>
          <div class="syns-list">
            ${syns.map(s=>`<span class="syn">${s}</span>`).join('')}
          </div>
        </div>` : ''}
    </div>
  </div>
</div>`;
  }).join('');
}

function toggleCard(header) {
  const card = header.closest('.card');
  card.classList.toggle('collapsed');
}
