/* =====================================================
   QUIZ UI — home, config, active quiz, result, review, history
===================================================== */

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Auto-next settings
let _autoNext       = true;
let _autoNextTimer  = null;
let _autoNextDelay  = 3000; // ms

/* ---- HOME ---- */

function renderQuizHome() {
  const qs      = document.getElementById('quizSection');
  const history = getQuizHistory();
  const last    = history[0];

  qs.innerHTML = `
<div class="quiz-home">
  <div class="quiz-home-hero">
    <div class="quiz-hero-icon">🧠</div>
    <h2 class="quiz-home-title">Quiz Mode</h2>
    <p class="quiz-home-subtitle">Test your vocabulary with adaptive quizzes</p>
  </div>

  <div class="quiz-home-cards">
    <div class="quiz-home-card" onclick="renderQuizConfig()">
      <div class="qhc-icon">⚡</div>
      <div class="qhc-title">Start Quiz</div>
      <div class="qhc-desc">Custom quiz with full settings</div>
    </div>
    <div class="quiz-home-card" onclick="startHardWordsQuiz()">
      <div class="qhc-icon">🔥</div>
      <div class="qhc-title">Hard Words</div>
      <div class="qhc-desc">Practice words you marked Hard</div>
    </div>
    <div class="quiz-home-card" onclick="showQuizHistoryModal()">
      <div class="qhc-icon">📊</div>
      <div class="qhc-title">History</div>
      <div class="qhc-desc">${history.length} attempt${history.length !== 1 ? 's' : ''}</div>
    </div>
  </div>

  ${last ? `
  <div class="quiz-last-attempt">
    <div class="qla-label">Last Attempt</div>
    <div class="qla-row">
      <span>${formatDate(last.date)}</span>
      <span class="qla-score">${last.correct}/${last.total} · ${last.percentage}%</span>
      <span class="qla-grade" style="color:${getGrade(last.percentage).color}">${getGrade(last.percentage).grade}</span>
    </div>
  </div>` : ''}
</div>`;
}

/* ---- CONFIG ---- */

function renderQuizConfig() {
  const qs = document.getElementById('quizSection');

  qs.innerHTML = `
<div class="quiz-config">
  <div class="quiz-config-header">
    <button class="quiz-back-btn" onclick="renderQuizHome()">← Back</button>
    <h2>Quiz Settings</h2>
  </div>

  <!-- 1. Questions -->
  <div class="config-group">
    <div class="config-label">1 · Number of Questions</div>
    <select class="config-select" id="cfg-num">
      <option value="10">10 Questions</option>
      <option value="20" selected>20 Questions</option>
      <option value="30">30 Questions</option>
      <option value="50">50 Questions</option>
      <option value="100">100 Questions</option>
      <option value="all">All Available</option>
    </select>
  </div>

  <!-- 2. Word Range -->
  <div class="config-group">
    <div class="config-label">2 · Word Range <span class="config-hint">(optional)</span></div>
    <div class="config-range-row">
      <input type="number" class="config-range-input" id="cfg-range-start" placeholder="Start word #" min="1">
      <span class="config-range-sep">to</span>
      <input type="number" class="config-range-input" id="cfg-range-end"   placeholder="End word #"   min="1">
    </div>
    <div class="config-range-presets">
      <button class="config-range-preset" onclick="setRangePreset(1,50)">1–50</button>
      <button class="config-range-preset" onclick="setRangePreset(1,100)">1–100</button>
      <button class="config-range-preset" onclick="setRangePreset(51,100)">51–100</button>
      <button class="config-range-preset" onclick="setRangePreset(101,200)">101–200</button>
      <button class="config-range-preset" onclick="setRangePreset(201,320)">201–320</button>
      <button class="config-range-preset cfg-range-clear" onclick="clearRange()">Clear</button>
    </div>
  </div>

  <!-- 3. Difficulty -->
  <div class="config-group">
    <div class="config-label">3 · Difficulty Filter</div>
    <div class="config-radio-group" id="cfg-diff">
      <label class="config-radio active-radio"><input type="radio" name="diff" value="all" checked> All</label>
      <label class="config-radio"><input type="radio" name="diff" value="easy"> Easy</label>
      <label class="config-radio"><input type="radio" name="diff" value="medium"> Medium</label>
      <label class="config-radio"><input type="radio" name="diff" value="hard"> Hard</label>
    </div>
  </div>

  <!-- 4. Question Types -->
  <div class="config-group">
    <div class="config-label">4 · Question Types</div>
    <div class="config-checks" id="cfg-types">
      <label class="config-check"><input type="checkbox" value="meaning" checked> 📖 Meaning Based</label>
      <label class="config-check"><input type="checkbox" value="synonym" checked> 🔄 Synonym Based</label>
      <label class="config-check"><input type="checkbox" value="antonym" checked> ⚡ Antonym Based</label>
      <label class="config-check"><input type="checkbox" value="example"> ✏️ Fill in the Blank</label>
    </div>
  </div>

  <!-- 5. Letters -->
  <div class="config-group">
    <div class="config-label">5 · Letter Selection</div>
    <div class="config-letter-controls">
      <button class="cfg-letter-ctrl-btn" onclick="selectAllLetters()">Select All</button>
      <button class="cfg-letter-ctrl-btn" onclick="clearAllLetters()">Clear All</button>
    </div>
    <div class="config-letters" id="cfg-letters">
      ${ALL_LETTERS.map(l => `
        <label class="config-letter-btn">
          <input type="checkbox" value="${l.toLowerCase()}" checked>${l}
        </label>`).join('')}
    </div>
  </div>

  <!-- 6. Options -->
  <div class="config-group">
    <div class="config-label">6 · Options</div>
    <label class="config-toggle" style="margin-bottom:12px">
      <input type="checkbox" id="cfg-shuffle" checked>
      <span class="toggle-track"><span class="toggle-thumb"></span></span>
      <span class="toggle-label">Shuffle Questions</span>
    </label>
    <label class="config-toggle">
      <input type="checkbox" id="cfg-autonext" checked>
      <span class="toggle-track"><span class="toggle-thumb"></span></span>
      <span class="toggle-label">Auto Next (3s)</span>
    </label>
  </div>

  <button class="quiz-start-btn" onclick="startQuizFromConfig()">
    Start Quiz →
  </button>
</div>`;

  // Wire radio styles
  document.querySelectorAll('#cfg-diff input[type=radio]').forEach(r => {
    r.addEventListener('change', () => {
      document.querySelectorAll('#cfg-diff .config-radio').forEach(l => l.classList.remove('active-radio'));
      r.closest('label').classList.add('active-radio');
    });
  });
}

function setRangePreset(start, end) {
  document.getElementById('cfg-range-start').value = start;
  document.getElementById('cfg-range-end').value   = end;
  document.querySelectorAll('.config-range-preset:not(.cfg-range-clear)').forEach(btn => {
    btn.classList.toggle('cfg-preset-active', btn.textContent === `${start}–${end}`);
  });
}

function clearRange() {
  document.getElementById('cfg-range-start').value = '';
  document.getElementById('cfg-range-end').value   = '';
  document.querySelectorAll('.config-range-preset').forEach(b => b.classList.remove('cfg-preset-active'));
}

function selectAllLetters() {
  document.querySelectorAll('#cfg-letters input').forEach(c => c.checked = true);
}

function clearAllLetters() {
  document.querySelectorAll('#cfg-letters input').forEach(c => c.checked = false);
}

/* ---- START FROM CONFIG ---- */

async function startQuizFromConfig() {
  const numQ    = document.getElementById('cfg-num').value;
  const diff    = document.querySelector('#cfg-diff input:checked')?.value || 'all';
  const types   = [...document.querySelectorAll('#cfg-types input:checked')].map(c=>c.value);
  const letters = [...document.querySelectorAll('#cfg-letters input:checked')].map(c=>c.value);
  const shuffle = document.getElementById('cfg-shuffle')?.checked ?? true;
  _autoNext     = document.getElementById('cfg-autonext')?.checked ?? true;

  const rangeStart = parseInt(document.getElementById('cfg-range-start')?.value) || null;
  const rangeEnd   = parseInt(document.getElementById('cfg-range-end')?.value)   || null;
  const wordRange  = (rangeStart && rangeEnd) ? { start: rangeStart, end: rangeEnd } : null;

  if (!types.length)   { showToast('Select at least one question type'); return; }
  if (!letters.length) { showToast('Select at least one letter');         return; }

  await startQuiz({ numQuestions: numQ, difficultyFilter: diff, questionTypes: types, letters, shuffle, wordRange });
}

async function startHardWordsQuiz() {
  _autoNext = true;
  await startQuiz({
    numQuestions:     'all',
    difficultyFilter: 'hard',
    questionTypes:    ['meaning','synonym','antonym'],
    letters:          ALL_LETTERS.map(l=>l.toLowerCase()),
    shuffle:          true,
    isHardMode:       true,
  });
}

/* ---- START QUIZ ---- */

async function startQuiz(config) {
  const qs = document.getElementById('quizSection');
  qs.innerHTML = `
<div class="quiz-loading">
  <div class="quiz-spinner"></div>
  <p>Generating questions…</p>
</div>`;

  try {
    const wordPool = await fetchVocabLetters(config.letters);

    if (!wordPool.length) {
      qs.innerHTML = '<div class="empty"><h3>No words available</h3><p>Try more letters.</p></div>';
      return;
    }

    const questions = generateQuestions(wordPool, config);

    if (!questions.length) {
      qs.innerHTML = `
<div class="empty">
  <div class="empty-icon">😕</div>
  <h3>No questions generated</h3>
  <p>Not enough data for selected filters. Try different settings.</p>
  <button class="quiz-start-btn" style="margin-top:16px" onclick="renderQuizConfig()">← Back</button>
</div>`;
      return;
    }

    QuizState.config    = config;
    QuizState.questions = questions;
    QuizState.current   = 0;
    QuizState.answers   = [];
    QuizState.score     = 0;
    QuizState.started   = true;

    renderQuestion();

  } catch (err) {
    console.error('Quiz start error:', err);
    qs.innerHTML = `<div class="empty"><h3>Error</h3><p>${err.message}</p></div>`;
  }
}

/* ---- RENDER QUESTION ---- */

function renderQuestion() {
  clearAutoNextTimer();

  if (isQuizComplete()) { renderResult(); return; }

  const qs    = document.getElementById('quizSection');
  const q     = QuizState.questions[QuizState.current];
  const total = QuizState.questions.length;
  const num   = QuizState.current + 1;
  const pct   = Math.round((QuizState.current / total) * 100);

  const typeLabel = { meaning:'📖 Meaning', synonym:'🔄 Synonym', antonym:'⚡ Antonym', example:'✏️ Fill Blank' }[q.type] || q.type;

  qs.innerHTML = `
<div class="quiz-active">
  <div class="quiz-status-bar">
    <button class="quiz-quit-btn" onclick="confirmQuitQuiz()">✕</button>
    <div class="quiz-status-center">
      <span class="quiz-q-num">Q ${num} / ${total}</span>
      <span class="quiz-score-badge">Score: ${QuizState.score}</span>
    </div>
    <span class="quiz-type-tag">${typeLabel}</span>
  </div>

  <div class="quiz-progress-wrap">
    <div class="quiz-progress-bar" style="width:${pct}%"></div>
  </div>

  <div class="quiz-card">
    <div class="quiz-letter-tag">${q.letter?.toUpperCase() || '?'}</div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options" id="quizOptions">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" data-opt="${escapeHtmlAttr(opt)}" onclick="handleAnswer(this,'${escapeHtmlAttr(opt)}')">
          <span class="quiz-opt-letter">${'ABCD'[i]}</span>
          <span class="quiz-opt-text">${escapeHtml(opt)}</span>
        </button>`).join('')}
    </div>
  </div>
</div>

<!-- SLIDE-UP REVIEW PANEL (hidden until answer given) -->
<div class="quiz-review-panel" id="quizReviewPanel" style="display:none">
  <div class="quiz-review-panel-inner" id="quizReviewPanelInner"></div>
</div>`;
}

function escapeHtmlAttr(str) {
  return String(str).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
}

/* ---- ANSWER HANDLING ---- */

function handleAnswer(btn, selected) {
  const optionsEl = document.getElementById('quizOptions');
  if (!optionsEl || optionsEl.classList.contains('answered')) return;
  optionsEl.classList.add('answered');

  const q         = QuizState.questions[QuizState.current];
  const isCorrect = submitAnswer(selected);

  // Style options
  optionsEl.querySelectorAll('.quiz-option').forEach(b => {
    b.disabled = true;
    const opt  = b.getAttribute('data-opt');
    if (opt === q.correct)          b.classList.add('correct');
    else if (opt === selected && !isCorrect) b.classList.add('wrong');
  });

  // Show review panel
  showReviewPanel(q, isCorrect);

  // Auto-next
  if (_autoNext) {
    const delay = _autoNextDelay;
    let remaining = delay;
    const bar = document.getElementById('autoNextBar');

    _autoNextTimer = setInterval(() => {
      remaining -= 100;
      if (bar) bar.style.width = `${(remaining / delay) * 100}%`;
      if (remaining <= 0) {
        clearAutoNextTimer();
        goNextQuestion();
      }
    }, 100);
  }
}

function showReviewPanel(q, isCorrect) {
  const panel      = document.getElementById('quizReviewPanel');
  const panelInner = document.getElementById('quizReviewPanelInner');
  if (!panel || !panelInner) return;

  panelInner.innerHTML = `
<div class="qrp-result ${isCorrect ? 'qrp-correct' : 'qrp-wrong'}">
  ${isCorrect ? '✓ Correct!' : '✗ Wrong!'}
</div>

${q.explanation.word ? `
<div class="qrp-word-row">
  <span class="qrp-word">${escapeHtml(q.explanation.word)}</span>
</div>` : ''}

${q.explanation.meaning ? `
<div class="qrp-detail-row">
  <span class="qrp-detail-label">Meaning</span>
  <span class="qrp-detail-val">${escapeHtml(q.explanation.meaning)}</span>
</div>` : ''}

${q.explanation.example ? `
<div class="qrp-detail-row">
  <span class="qrp-detail-label">Example</span>
  <em class="qrp-detail-val">${escapeHtml(q.explanation.example)}</em>
</div>` : ''}

${q.explanation.synonyms?.length ? `
<div class="qrp-detail-row">
  <span class="qrp-detail-label">Synonyms</span>
  <span class="qrp-detail-val">${q.explanation.synonyms.map(s=>escapeHtml(s)).join(', ')}</span>
</div>` : ''}

<div class="qrp-actions">
  ${_autoNext ? `
  <div class="auto-next-bar-wrap">
    <div class="auto-next-bar" id="autoNextBar" style="width:100%"></div>
  </div>
  <span class="auto-next-label">Auto next in 3s</span>` : ''}
  <button class="quiz-next-btn" onclick="clearAutoNextTimer(); goNextQuestion()">
    ${QuizState.current + 1 >= QuizState.questions.length ? 'See Results →' : 'Next →'}
  </button>
</div>`;

  panel.style.display = 'block';
  // Animate in
  requestAnimationFrame(() => panel.classList.add('qrp-visible'));
}

function clearAutoNextTimer() {
  if (_autoNextTimer) { clearInterval(_autoNextTimer); _autoNextTimer = null; }
}

function goNextQuestion() {
  clearAutoNextTimer();
  const panel = document.getElementById('quizReviewPanel');
  if (panel) {
    panel.classList.remove('qrp-visible');
    setTimeout(() => { panel.style.display = 'none'; }, 250);
  }
  setTimeout(() => { nextQuestion(); renderQuestion(); }, 200);
}

function confirmQuitQuiz() {
  clearAutoNextTimer();
  if (confirm('Quit quiz? Your progress will be lost.')) {
    QuizState.started = false;
    renderQuizHome();
  }
}

/* ---- RESULT ---- */

function renderResult() {
  const qs      = document.getElementById('quizSection');
  const total   = QuizState.questions.length;
  const correct = QuizState.score;
  const wrong   = total - correct;
  const pct     = Math.round((correct / total) * 100);
  const grade   = getGrade(pct);
  const weak    = computeWeakAreas(QuizState.answers);

  saveQuizAttempt({
    date: Date.now(), total, correct, wrong,
    percentage: pct, grade: grade.grade,
    weakTypes: weak.weakTypes, weakLetters: weak.weakLetters,
    config: QuizState.config,
  });

  const circ   = 2 * Math.PI * 52;
  const offset = circ * (1 - pct / 100);

  qs.innerHTML = `
<div class="quiz-result">
  <h2 class="result-title">Quiz Complete! 🎉</h2>

  <div class="result-ring-wrap">
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
      <circle cx="65" cy="65" r="52" fill="none"
        stroke="${grade.color}" stroke-width="10"
        stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
        stroke-linecap="round" transform="rotate(-90 65 65)"
        style="transition:stroke-dashoffset 1.2s ease"/>
    </svg>
    <div class="result-ring-inner">
      <div class="result-pct" style="color:${grade.color}">${pct}%</div>
      <div class="result-grade" style="color:${grade.color}">${grade.grade}</div>
    </div>
  </div>

  <div class="result-stats">
    <div class="result-stat"><div class="rs-num">${total}</div><div class="rs-label">Total</div></div>
    <div class="result-stat rs-correct"><div class="rs-num">${correct}</div><div class="rs-label">Correct</div></div>
    <div class="result-stat rs-wrong"><div class="rs-num">${wrong}</div><div class="rs-label">Wrong</div></div>
  </div>

  <div class="result-grade-label" style="color:${grade.color}">${grade.label}</div>

  ${(weak.weakTypes.length || weak.weakLetters.length) ? `
  <div class="result-weak">
    <div class="weak-title">📉 Areas to improve:</div>
    ${weak.weakTypes.length ? `<div class="weak-row"><span class="weak-label">Types: </span>${weak.weakTypes.map(t=>`<span class="weak-tag">${t}</span>`).join('')}</div>` : ''}
    ${weak.weakLetters.length ? `<div class="weak-row"><span class="weak-label">Letters: </span>${weak.weakLetters.map(l=>`<span class="weak-tag">${l}</span>`).join('')}</div>` : ''}
  </div>` : `<div class="result-weak"><div class="weak-title">🎯 No weak areas — perfect!</div></div>`}

  <div class="result-actions">
    <button class="quiz-start-btn" onclick="renderReview()">📋 Review</button>
    <button class="quiz-secondary-btn" onclick="renderQuizConfig()">🔄 New Quiz</button>
    <button class="quiz-secondary-btn" onclick="renderQuizHome()">🏠 Home</button>
  </div>
</div>`;
}

/* ---- REVIEW ---- */

function renderReview() {
  const qs = document.getElementById('quizSection');

  qs.innerHTML = `
<div class="quiz-review">
  <div class="quiz-config-header">
    <button class="quiz-back-btn" onclick="renderResult()">← Result</button>
    <h2>Answer Review</h2>
  </div>
  <div class="review-list">
    ${QuizState.answers.map((a,i) => `
    <div class="review-item ${a.isCorrect?'review-correct':'review-wrong'}">
      <div class="review-num">Q${i+1} · ${a.question.type}</div>
      <div class="review-q">${a.question.q}</div>
      <div class="review-answer-row">
        <div><span class="review-ans-label">Your answer: </span>
          <span class="${a.isCorrect?'review-ans-correct':'review-ans-wrong'}">${escapeHtml(a.selected)}</span></div>
        ${!a.isCorrect ? `<div><span class="review-ans-label">Correct: </span>
          <span class="review-ans-correct">${escapeHtml(a.correct)}</span></div>` : ''}
      </div>
      ${a.question.explanation.meaning ? `<div class="review-exp"><span class="review-exp-label">Meaning: </span>${escapeHtml(a.question.explanation.meaning)}</div>` : ''}
      ${a.question.explanation.example ? `<div class="review-exp"><span class="review-exp-label">Example: </span><em>${escapeHtml(a.question.explanation.example)}</em></div>` : ''}
    </div>`).join('')}
  </div>
</div>`;
}

/* ---- HISTORY MODAL ---- */

function showQuizHistoryModal() {
  const history = getQuizHistory();
  openModal({
    title: '📊 Quiz History',
    body: history.length ? `
<div class="quiz-history-list">
  ${history.map(a => {
    const g = getGrade(a.percentage);
    return `
<div class="history-item">
  <div class="history-row">
    <span class="history-date">${formatDate(a.date)}</span>
    <span class="history-grade" style="color:${g.color}">${g.grade}</span>
  </div>
  <div class="history-stats">
    <span>${a.correct}/${a.total} correct</span>
    <span class="history-pct">${a.percentage}%</span>
  </div>
  ${a.weakLetters?.length ? `<div class="history-weak">Weak: ${a.weakLetters.join(', ')}</div>` : ''}
</div>`;
  }).join('')}
</div>` : '<div class="empty"><p>No history yet. Take a quiz!</p></div>',
  });
}
