/* =====================================================
   WORD EDITOR — Three-dot menu, Edit form, Add Word form
===================================================== */

/* ---- THREE-DOT MENU ---- */

let _menuWord   = null;  // word data of currently open menu
let _menuUid    = null;
let _menuSection = null;

/**
 * Open the three-dot action menu for a card.
 * Called from card HTML: openWordMenu(event, uid, section)
 */
function openWordMenu(event, uid, section) {
  event.stopPropagation();

  _menuUid     = uid;
  _menuSection = section || getCurrentSection();

  // Get word from current allWords (may be patched)
  _menuWord = allWords.find(w => w._uid === uid) || null;

  const diff = getWordDifficulty(uid);

  const menu = document.createElement('div');
  menu.id        = 'wordActionMenu';
  menu.className = 'action-menu';

  menu.innerHTML = `
<div class="action-menu-header">
  <span class="action-menu-word">${_menuWord?.word || uid}</span>
  <button class="action-menu-close" onclick="closeWordMenu()">✕</button>
</div>

<div class="action-menu-items">

  <div class="action-menu-section-label">DIFFICULTY</div>
  <div class="action-menu-diff-row">
    <button class="action-diff-btn ${diff==='easy'?'adb-easy-active':''}"   onclick="menuSetDiff('easy')">Easy</button>
    <button class="action-diff-btn ${diff==='medium'?'adb-medium-active':''}" onclick="menuSetDiff('medium')">Medium</button>
    <button class="action-diff-btn ${diff==='hard'?'adb-hard-active':''}"   onclick="menuSetDiff('hard')">Hard</button>
  </div>

  <div class="action-menu-divider"></div>

  <button class="action-menu-item" onclick="openEditForm('${uid}')">
    <span class="ami-icon">✏️</span> Edit Word
  </button>
  <button class="action-menu-item" onclick="copyWordJson('${uid}')">
    <span class="ami-icon">📋</span> Copy JSON
  </button>
  <button class="action-menu-item ami-danger" onclick="confirmDeleteWord('${uid}')">
    <span class="ami-icon">🗑️</span> Delete Word
  </button>
</div>`;

  // Remove existing menu
  const existing = document.getElementById('wordActionMenu');
  if (existing) existing.remove();

  document.body.appendChild(menu);

  // Position near click
  const rect = event.currentTarget.getBoundingClientRect();
  const menuW = 240;
  let left = rect.right - menuW;
  let top  = rect.bottom + 8;

  if (left < 8) left = 8;
  if (top + 300 > window.innerHeight) top = rect.top - 310;

  menu.style.left = left + 'px';
  menu.style.top  = (top + window.scrollY) + 'px';

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', closeWordMenuOutside, { once: true });
  }, 10);
}

function closeWordMenuOutside(e) {
  const menu = document.getElementById('wordActionMenu');
  if (menu && !menu.contains(e.target)) closeWordMenu();
}

function closeWordMenu() {
  const menu = document.getElementById('wordActionMenu');
  if (menu) {
    menu.classList.add('action-menu-closing');
    setTimeout(() => menu.remove(), 180);
  }
  document.removeEventListener('click', closeWordMenuOutside);
}

function menuSetDiff(level) {
  if (!_menuUid) return;
  const map = JSON.parse(localStorage.getItem('wordDifficulty') || '{}');
  const current = map[_menuUid];
  const newLevel = current === level ? 'unset' : level;
  setWordDifficulty(_menuUid, newLevel);

  // Update card border
  const card = document.getElementById(`card-${_menuUid.replace(/[^a-zA-Z0-9]/g, '-')}`);
  if (card) {
    card.classList.remove('diff-easy','diff-medium','diff-hard');
    if (newLevel !== 'unset') card.classList.add(`diff-${newLevel}`);
  }

  closeWordMenu();
}

/* ---- COPY JSON ---- */

function copyWordJson(uid) {
  const word = allWords.find(w => w._uid === uid);
  if (!word) return;
  const json = JSON.stringify(word, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    showToast('JSON copied to clipboard!');
  }).catch(() => {
    showToast('Could not copy — try again');
  });
  closeWordMenu();
}

/* ---- DELETE ---- */

function confirmDeleteWord(uid) {
  closeWordMenu();
  openModal({
    title: 'Delete Word',
    body:  `<p style="color:var(--text);font-size:15px;">Are you sure you want to delete <strong>${_menuWord?.word || uid}</strong>?<br><span style="color:var(--muted);font-size:13px">This can be undone by clearing app data.</span></p>`,
    footer: `
      <button class="modal-action-btn modal-btn-danger" onclick="doDeleteWord('${uid}')">Delete</button>
      <button class="modal-action-btn modal-btn-secondary" onclick="closeGenericModal()">Cancel</button>`,
  });
}

async function doDeleteWord(uid) {
  closeGenericModal();
  // If it's a user-created word, delete from IndexedDB entirely
  if (uid.startsWith('user-')) {
    await deleteUserWord(uid);
  } else {
    await markWordDeleted(uid);
  }
  // Remove card from DOM
  const card = document.getElementById(`card-${uid.replace(/[^a-zA-Z0-9]/g, '-')}`);
  if (card) {
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    setTimeout(() => card.remove(), 300);
  }
  showToast('Word deleted');
}

/* ---- EDIT FORM ---- */

async function openEditForm(uid) {
  closeWordMenu();

  let word = allWords.find(w => w._uid === uid);
  if (!word) return;

  // Check if there's a DB patch
  const patch = await getWordPatch(uid);
  if (patch && !patch._deleted) {
    word = { ...word, ...patch };
  }

  openModal({
    title: `Edit: ${word.word}`,
    wide:  true,
    body:  buildEditFormHTML(word, uid),
    footer: `
      <button class="modal-action-btn modal-btn-primary" onclick="saveEditForm('${uid}')">Save Changes</button>
      <button class="modal-action-btn modal-btn-secondary" onclick="closeGenericModal()">Cancel</button>`,
  });
}

function buildEditFormHTML(w, uid) {
  const fieldRow = (label, id, value, placeholder='') => `
<div class="edit-form-row">
  <label class="edit-form-label" for="${id}">${label}</label>
  <input class="edit-form-input" id="${id}" value="${escapeHtmlAttr(value || '')}" placeholder="${placeholder}" />
</div>`;

  const textareaRow = (label, id, value, placeholder='') => `
<div class="edit-form-row">
  <label class="edit-form-label" for="${id}">${label}</label>
  <textarea class="edit-form-textarea" id="${id}" rows="2" placeholder="${placeholder}">${escapeHtml(value || '')}</textarea>
</div>`;

  return `
<div class="edit-form" id="editForm-${uid}">
  ${fieldRow('Word', 'ef-word', w.word)}
  ${fieldRow('Part of Speech', 'ef-pos', w.pos, 'e.g. Noun, Verb, Adjective')}
  ${fieldRow('IPA Pronunciation', 'ef-ipa', w.ipa, 'e.g. /æmˈbɪɡ.ju.əs/')}
  ${fieldRow('Phonetic', 'ef-phonetic', w.phonetic, 'e.g. am-big-yoo-uhs')}
  ${textareaRow('English Meaning', 'ef-english', w.english)}
  ${fieldRow('Hindi Meaning', 'ef-hindi', w.hindi)}
  ${textareaRow('Example (English)', 'ef-exampleEn', w.exampleEn)}
  ${textareaRow('Example (Hindi)', 'ef-exampleHi', w.exampleHi)}
  <div class="edit-form-row">
    <label class="edit-form-label">Synonyms <span class="edit-form-hint">(comma-separated)</span></label>
    <input class="edit-form-input" id="ef-synonyms" value="${escapeHtmlAttr((w.synonyms||[]).join(', '))}" />
  </div>
  <div class="edit-form-row">
    <label class="edit-form-label">Antonyms <span class="edit-form-hint">(comma-separated)</span></label>
    <input class="edit-form-input" id="ef-antonyms" value="${escapeHtmlAttr((w.antonyms||[]).join(', '))}" />
  </div>
  <div class="edit-form-row">
    <label class="edit-form-label">Exam Sources <span class="edit-form-hint">(comma-separated)</span></label>
    <input class="edit-form-input" id="ef-examSources" value="${escapeHtmlAttr((w.examSources||[]).join(', '))}" />
  </div>
</div>`;
}

async function saveEditForm(uid) {
  const get = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };
  const getList = id => get(id).split(',').map(s=>s.trim()).filter(Boolean);

  const patch = {
    word:        get('ef-word'),
    pos:         get('ef-pos'),
    ipa:         get('ef-ipa'),
    phonetic:    get('ef-phonetic'),
    english:     get('ef-english'),
    hindi:       get('ef-hindi'),
    exampleEn:   get('ef-exampleEn'),
    exampleHi:   get('ef-exampleHi'),
    synonyms:    getList('ef-synonyms'),
    antonyms:    getList('ef-antonyms'),
    examSources: getList('ef-examSources'),
  };

  await saveWordPatch(uid, patch);

  // Update in-memory word list
  const idx = allWords.findIndex(w => w._uid === uid);
  if (idx !== -1) {
    allWords[idx] = { ...allWords[idx], ...patch };
  }

  closeGenericModal();

  // Re-render just this card
  refreshCard(uid);
  showToast('Changes saved ✓');
}

/**
 * Re-render a single card in-place without reloading all words.
 */
function refreshCard(uid) {
  const word = allWords.find(w => w._uid === uid);
  if (!word) return;
  const cardId = `card-${uid.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const existing = document.getElementById(cardId);
  if (!existing) return;
  const temp = document.createElement('div');
  temp.innerHTML = buildVocabCardHTML(word);
  const newCard = temp.firstElementChild;
  existing.replaceWith(newCard);
}

/* ---- ADD WORD FORM (FAB) ---- */

function openAddWordForm() {
  const section = getCurrentSection();
  const sectionLabel = {
    vocabs: 'Vocabulary',
    syns:   'Synonyms & Antonyms',
    ows:    'One Word Substitution',
    idioms: 'Idioms & Phrases',
  }[section] || 'Vocabulary';

  openModal({
    title: `Add New Word — ${sectionLabel}`,
    wide:  true,
    body:  buildAddFormHTML(section),
    footer: `
      <button class="modal-action-btn modal-btn-primary" onclick="saveNewWord('${section}')">Add Word</button>
      <button class="modal-action-btn modal-btn-secondary" onclick="closeGenericModal()">Cancel</button>`,
  });
}

function buildAddFormHTML(section) {
  const fieldRow = (label, id, placeholder='') => `
<div class="edit-form-row">
  <label class="edit-form-label" for="${id}">${label}</label>
  <input class="edit-form-input" id="${id}" placeholder="${placeholder}" />
</div>`;

  const textareaRow = (label, id, placeholder='') => `
<div class="edit-form-row">
  <label class="edit-form-label" for="${id}">${label}</label>
  <textarea class="edit-form-textarea" id="${id}" rows="2" placeholder="${placeholder}"></textarea>
</div>`;

  if (section === 'vocabs') {
    return `
<div class="edit-form">
  ${fieldRow('Word *', 'nw-word', 'e.g. Benevolent')}
  ${fieldRow('Part of Speech', 'nw-pos', 'Noun / Verb / Adjective…')}
  ${fieldRow('Hindi Meaning *', 'nw-hindi', 'e.g. दयालु')}
  ${textareaRow('English Meaning', 'nw-english', 'Full meaning in English')}
  ${fieldRow('IPA Pronunciation', 'nw-ipa', '/bɪˈnev.ə.lənt/')}
  ${fieldRow('Phonetic', 'nw-phonetic', 'bih-nev-uh-luhnt')}
  ${textareaRow('Example (English)', 'nw-exampleEn', 'Use the word in a sentence')}
  <div class="edit-form-row">
    <label class="edit-form-label">Synonyms <span class="edit-form-hint">(comma-separated)</span></label>
    <input class="edit-form-input" id="nw-synonyms" placeholder="Kind, Generous, Charitable" />
  </div>
  <div class="edit-form-row">
    <label class="edit-form-label">Antonyms <span class="edit-form-hint">(comma-separated)</span></label>
    <input class="edit-form-input" id="nw-antonyms" placeholder="Cruel, Selfish" />
  </div>
  ${fieldRow('Exam Source', 'nw-examSources', 'SSC CGL 2023')}
</div>`;
  }

  if (section === 'idioms') {
    return `<div class="edit-form">
      ${fieldRow('Idiom / Phrase *', 'nw-word', 'e.g. Break the ice')}
      ${textareaRow('Meaning *', 'nw-english', 'What does this idiom mean?')}
      ${fieldRow('Hindi Meaning', 'nw-hindi', 'Hindi translation')}
      ${textareaRow('Example Sentence', 'nw-exampleEn', 'Use the idiom in a sentence')}
      ${fieldRow('Exam Source', 'nw-examSources', 'SSC CGL 2023')}
    </div>`;
  }

  if (section === 'ows') {
    return `<div class="edit-form">
      ${textareaRow('Phrase / Definition *', 'nw-english', 'e.g. A person who walks in sleep')}
      ${fieldRow('One Word *', 'nw-word', 'e.g. Somnambulist')}
      ${fieldRow('Hindi Meaning', 'nw-hindi', 'Hindi translation')}
      ${textareaRow('Example Sentence', 'nw-exampleEn', 'Use the word in a sentence')}
      ${fieldRow('Exam Source', 'nw-examSources', 'SSC CGL 2023')}
    </div>`;
  }

  // syns
  return `<div class="edit-form">
    ${fieldRow('Word *', 'nw-word', 'e.g. Abate')}
    ${fieldRow('Hindi Meaning', 'nw-hindi', 'Hindi translation')}
    <div class="edit-form-row">
      <label class="edit-form-label">Synonyms * <span class="edit-form-hint">(comma-separated)</span></label>
      <input class="edit-form-input" id="nw-synonyms" placeholder="Diminish, Reduce, Subside" />
    </div>
    <div class="edit-form-row">
      <label class="edit-form-label">Antonyms <span class="edit-form-hint">(comma-separated)</span></label>
      <input class="edit-form-input" id="nw-antonyms" placeholder="Increase, Intensify" />
    </div>
    ${textareaRow('Example Sentence', 'nw-exampleEn', 'Use the word in a sentence')}
    ${fieldRow('Exam Source', 'nw-examSources', 'SSC CGL 2023')}
  </div>`;
}

async function saveNewWord(section) {
  const get = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };
  const getList = id => get(id).split(',').map(s=>s.trim()).filter(Boolean);

  const word = get('nw-word');
  if (!word) { showToast('Word/phrase is required'); return; }

  const uid  = `user-${section}-${Date.now()}`;
  const newWord = {
    uid,
    _uid:    uid,
    _letter: 'user',
    section,
    id:      Date.now(),
    word,
    pos:         get('nw-pos'),
    hindi:       get('nw-hindi'),
    english:     get('nw-english'),
    ipa:         get('nw-ipa'),
    phonetic:    get('nw-phonetic'),
    exampleEn:   get('nw-exampleEn'),
    exampleHi:   '',
    synonyms:    getList('nw-synonyms'),
    antonyms:    getList('nw-antonyms'),
    examSources: getList('nw-examSources'),
    _createdAt:  Date.now(),
  };

  await saveUserWord(newWord);

  closeGenericModal();
  showToast(`"${word}" added ✓`);

  // Refresh current view if section matches
  if (getCurrentSection() === section) {
    if (section === 'vocabs') {
      loadWords(currentLetter);
    } else {
      loadSection(section);
    }
  }
}

/* ---- HELPER: HTML ESCAPE ---- */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function escapeHtmlAttr(str) {
  return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
