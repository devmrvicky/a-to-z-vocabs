/* =========================
   QUIZ UI
   Renders: home, config, active quiz, result, review, history
========================= */

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/* ---- RENDER: HOME SCREEN ---- */

function renderQuizHome() {
  const qs = document.getElementById('quizSection');
  const history = getQuizHistory();
  const lastAttempt = history[0];

  qs.innerHTML = `
<div class="quiz-home">
  <div class="quiz-home-hero">
    <div class="quiz-hero-icon">🧠</div>
    <h2 class="quiz-home-title">Quiz Mode</h2>
    <p class="quiz-home-subtitle">Test your vocabulary knowledge with adaptive quizzes</p>
  </div>

  <div class="quiz-home-cards">
    <div class="quiz-home-card" onclick="renderQuizConfig()">
      <div class="qhc-icon">⚡</div>
      <div class="qhc-title">Start Quiz</div>
      <div class="qhc-desc">Custom quiz with your settings</div>
    </div>

    <div class="quiz-home-card" onclick="startHardWordsQuiz()">
      <div class="qhc-icon">🔥</div>
      <div class="qhc-title">Hard Words Practice</div>
      <div class="qhc-desc">Quiz only your marked Hard words</div>
    </div>

    <div class="quiz-home-card" onclick="showQuizHistory()">
      <div class="qhc-icon">📊</div>
      <div class="qhc-title">Quiz History</div>
      <div class="qhc-desc">${history.length} previous attempt${history.length !== 1 ? 's' : ''}</div>
    </div>
  </div>

  ${lastAttempt ? `
  <div class="quiz-last-attempt">
    <div class="qla-label">Last Attempt</div>
    <div class="qla-row">
      <span>${formatDate(lastAttempt.date)}</span>
      <span class="qla-score">${lastAttempt.correct}/${lastAttempt.total} — ${lastAttempt.percentage}%</span>
      <span class="qla-grade" style="color:${getGrade(lastAttempt.percentage).color}">${getGrade(lastAttempt.percentage).grade}</span>
    </div>
  </div>` : ''}
</div>`;
}

/* ---- RENDER: CONFIG SCREEN ---- */

function renderQuizConfig() {
  const qs = document.getElementById('quizSection');

  qs.innerHTML = `
<div class="quiz-config">
  <div class="quiz-config-header">
    <button class="quiz-back-btn" onclick="renderQuizHome()">← Back</button>
    <h2>Quiz Configuration</h2>
  </div>

  <!-- 1. Number of Questions -->
  <div class="config-group">
    <div class="config-label">1. Number of Questions</div>
    <select class="config-select" id="cfg-num">
      <option value="10">10 Questions</option>
      <option value="20" selected>20 Questions</option>
      <option value="30">30 Questions</option>
      <option value="50">50 Questions</option>
      <option value="100">100 Questions</option>
      <option value="all">All Questions</option>
    </select>
  </div>

  <!-- 2. Difficulty Filter -->
  <div class="config-group">
    <div class="config-label">2. Difficulty Filter</div>
    <div class="config-radio-group" id="cfg-diff">
      <label class="config-radio active-radio"><input type="radio" name="diff" value="all" checked> All</label>
      <label class="config-radio"><input type="radio" name="diff" value="easy"> Easy</label>
      <label class="config-radio"><input type="radio" name="diff" value="medium"> Medium</label>
      <label class="config-radio"><input type="radio" name="diff" value="hard"> Hard</label>
    </div>
  </div>

  <!-- 3. Question Types -->
  <div class="config-group">
    <div class="config-label">3. Question Types</div>
    <div class="config-checks" id="cfg-types">
      <label class="config-check"><input type="checkbox" value="meaning" checked> Meaning Based</label>
      <label class="config-check"><input type="checkbox" value="synonym" checked> Synonym Based</label>
      <label class="config-check"><input type="checkbox" value="antonym" checked> Antonym Based</label>
      <label class="config-check"><input type="checkbox" value="example"> Example Based</label>
    </div>
  </div>

  <!-- 4. Letter Selection -->
  <div class="config-group">
    <div class="config-label">4. Letter Selection</div>
    <div class="config-letter-controls">
      <button class="cfg-letter-ctrl-btn" onclick="selectAllLetters()">Select All</button>
      <button class="cfg-letter-ctrl-btn" onclick="clearAllLetters()">Clear All</button>
    </div>
    <div class="config-letters" id="cfg-letters">
      ${ALL_LETTERS.map(l => `
        <label class="config-letter-btn">
          <input type="checkbox" value="${l.toLowerCase()}" checked>
          ${l}
        </label>
      `).join('')}
    </div>
  </div>

  <!-- 5. Shuffle -->
  <div class="config-group">
    <div class="config-label">5. Shuffle Questions</div>
    <label class="config-toggle">
      <input type="checkbox" id="cfg-shuffle" checked>
      <span class="toggle-track"><span class="toggle-thumb"></span></span>
      <span class="toggle-label">Shuffle ON</span>
    </label>
  </div>

  <button class="quiz-start-btn" onclick="startQuizFromConfig()">
    Start Quiz →
  </button>
</div>`;

  // Wire toggle label
  document.getElementById('cfg-shuffle').addEventListener('change', function() {
    this.closest('label').querySelector('.toggle-label').textContent =
      this.checked ? 'Shuffle ON' : 'Shuffle OFF';
  });

  // Wire radio style
  document.querySelectorAll('#cfg-diff input[type=radio]').forEach(r => {
    r.addEventListener('change', () => {
      document.querySelectorAll('#cfg-diff .config-radio').forEach(l => l.classList.remove('active-radio'));
      r.closest('label').classList.add('active-radio');
    });
  });
}

function selectAllLetters() {
  document.querySelectorAll('#cfg-letters input[type=checkbox]').forEach(c => c.checked = true);
}

function clearAllLetters() {
  document.querySelectorAll('#cfg-letters input[type=checkbox]').forEach(c => c.checked = false);
}

/* ---- START FROM CONFIG ---- */

async function startQuizFromConfig() {
  const numQ   = document.getElementById('cfg-num').value;
  const diff   = document.querySelector('#cfg-diff input[type=radio]:checked').value;
  const types  = [...document.querySelectorAll('#cfg-types input:checked')].map(c=>c.value);
  const letters= [...document.querySelectorAll('#cfg-letters input:checked')].map(c=>c.value);
  const shuffle= document.getElementById('cfg-shuffle').checked;

  if (!types.length) { alert('Please select at least one question type.'); return; }
  if (!letters.length) { alert('Please select at least one letter.'); return; }

  const config = { numQuestions: numQ, difficultyFilter: diff, questionTypes: types, letters, shuffle };
  await startQuiz(config);
}

async function startHardWordsQuiz() {
  const config = {
    numQuestions:    'all',
    difficultyFilter:'hard',
    questionTypes:   ['meaning','synonym','antonym'],
    letters:         ALL_LETTERS.map(l=>l.toLowerCase()),
    shuffle:         true,
    isHardMode:      true,
  };
  await startQuiz(config);
}

/* ---- START QUIZ ---- */

async function startQuiz(config) {
  const qs = document.getElementById('quizSection');
  qs.innerHTML = '<div class="quiz-loading"><div class="quiz-spinner"></div><p>Generating questions…</p></div>';

  try {
    const wordPool = await fetchVocabLetters(config.letters);

    if (!wordPool.length) {
      qs.innerHTML = '<div class="empty"><h3>No words available</h3><p>Try selecting more letters.</p></div>';
      return;
    }

    const questions = generateQuestions(wordPool, config);

    if (!questions.length) {
      qs.innerHTML = `
        <div class="empty">
          <h3>Couldn't generate questions</h3>
          <p>Not enough data for the selected filters. Try different settings.</p>
          <button class="quiz-start-btn" style="margin-top:16px" onclick="renderQuizConfig()">← Back to Config</button>
        </div>`;
      return;
    }

    // Reset state
    QuizState.config    = config;
    QuizState.questions = questions;
    QuizState.current   = 0;
    QuizState.answers   = [];
    QuizState.score     = 0;
    QuizState.started   = true;

    renderQuestion();

  } catch (err) {
    console.error('Quiz generation error:', err);
    qs.innerHTML = `<div class="empty"><h3>Error</h3><p>${err.message}</p></div>`;
  }
}

/* ---- RENDER: ACTIVE QUESTION ---- */

function renderQuestion() {
  if (isQuizComplete()) {
    renderResult();
    return;
  }

  const qs     = document.getElementById('quizSection');
  const q      = QuizState.questions[QuizState.current];
  const total  = QuizState.questions.length;
  const num    = QuizState.current + 1;
  const pct    = Math.round((QuizState.current / total) * 100);

  const typeLabel = {
    meaning: '📖 Meaning',
    synonym: '🔄 Synonym',
    antonym: '⚡ Antonym',
    example: '✏️ Fill Blank',
  }[q.type] || q.type;

  qs.innerHTML = `
<div class="quiz-active">
  <!-- HEADER -->
  <div class="quiz-status-bar">
    <button class="quiz-quit-btn" onclick="confirmQuitQuiz()">✕ Quit</button>
    <div class="quiz-status-center">
      <span class="quiz-q-num">Question ${num} / ${total}</span>
      <span class="quiz-score-badge">Score: ${QuizState.score}</span>
    </div>
    <span class="quiz-type-tag">${typeLabel}</span>
  </div>

  <!-- PROGRESS BAR -->
  <div class="quiz-progress-wrap">
    <div class="quiz-progress-bar" style="width:${pct}%"></div>
  </div>

  <!-- QUESTION -->
  <div class="quiz-card">
    <div class="quiz-letter-tag">${q.letter?.toUpperCase() || ''}</div>
    <div class="quiz-question">${q.q}</div>

    <div class="quiz-options" id="quizOptions">
      ${q.options.map((opt, i) => `
        <button
          class="quiz-option"
          data-opt="${escapeAttr(opt)}"
          onclick="handleAnswer(this, '${escapeAttr(opt)}')"
        >
          <span class="quiz-opt-letter">${'ABCD'[i]}</span>
          <span class="quiz-opt-text">${opt}</span>
        </button>
      `).join('')}
    </div>

    <div class="quiz-feedback" id="quizFeedback" style="display:none"></div>
  </div>
</div>`;
}

function escapeAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

/* ---- ANSWER HANDLING ---- */

function handleAnswer(btn, selected) {
  // Prevent double-answer
  const optionsEl = document.getElementById('quizOptions');
  if (!optionsEl || optionsEl.classList.contains('answered')) return;
  optionsEl.classList.add('answered');

  const q = QuizState.questions[QuizState.current];
  const isCorrect = submitAnswer(selected);

  // Style all options
  optionsEl.querySelectorAll('.quiz-option').forEach(b => {
    b.disabled = true;
    const opt = b.getAttribute('data-opt');
    if (opt === q.correct) {
      b.classList.add('correct');
    } else if (opt === selected && !isCorrect) {
      b.classList.add('wrong');
    }
  });

  // Show feedback
  const fb = document.getElementById('quizFeedback');
  fb.style.display = 'block';
  fb.innerHTML = `
<div class="quiz-fb-result ${isCorrect ? 'quiz-fb-correct' : 'quiz-fb-wrong'}">
  ${isCorrect ? '✓ Correct!' : '✗ Wrong!'}
</div>
${q.explanation.word ? `
<div class="quiz-explanation">
  <div class="qexp-row"><span class="qexp-label">Word</span> <strong>${q.explanation.word}</strong></div>
  ${q.explanation.meaning ? `<div class="qexp-row"><span class="qexp-label">Meaning</span> ${q.explanation.meaning}</div>` : ''}
  ${q.explanation.example ? `<div class="qexp-row"><span class="qexp-label">Example</span> <em>${q.explanation.example}</em></div>` : ''}
</div>` : ''}
<button class="quiz-next-btn" onclick="goNextQuestion()">
  ${QuizState.current + 1 >= QuizState.questions.length ? 'See Results →' : 'Next Question →'}
</button>`;
}

function goNextQuestion() {
  nextQuestion();
  renderQuestion();
}

/* ---- QUIT ---- */

function confirmQuitQuiz() {
  if (confirm('Quit the quiz? Your progress will be lost.')) {
    QuizState.started = false;
    renderQuizHome();
  }
}

/* ---- RENDER: RESULT SCREEN ---- */

function renderResult() {
  const qs      = document.getElementById('quizSection');
  const total   = QuizState.questions.length;
  const correct = QuizState.score;
  const wrong   = total - correct;
  const pct     = Math.round((correct / total) * 100);
  const grade   = getGrade(pct);
  const weak    = computeWeakAreas(QuizState.answers);

  // Save to history
  const attempt = {
    date:       Date.now(),
    total,
    correct,
    wrong,
    percentage: pct,
    grade:      grade.grade,
    weakTypes:  weak.weakTypes,
    weakLetters:weak.weakLetters,
    config:     QuizState.config,
  };
  saveQuizAttempt(attempt);

  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - pct / 100);

  qs.innerHTML = `
<div class="quiz-result">
  <div class="result-header">
    <h2 class="result-title">Quiz Complete! 🎉</h2>
  </div>

  <!-- SCORE RING -->
  <div class="result-ring-wrap">
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
      <circle
        cx="65" cy="65" r="52" fill="none"
        stroke="${grade.color}" stroke-width="10"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        stroke-linecap="round"
        transform="rotate(-90 65 65)"
        style="transition: stroke-dashoffset 1s ease"
      />
    </svg>
    <div class="result-ring-inner">
      <div class="result-pct" style="color:${grade.color}">${pct}%</div>
      <div class="result-grade" style="color:${grade.color}">${grade.grade}</div>
    </div>
  </div>

  <!-- STATS -->
  <div class="result-stats">
    <div class="result-stat">
      <div class="rs-num">${total}</div>
      <div class="rs-label">Total</div>
    </div>
    <div class="result-stat rs-correct">
      <div class="rs-num">${correct}</div>
      <div class="rs-label">Correct</div>
    </div>
    <div class="result-stat rs-wrong">
      <div class="rs-num">${wrong}</div>
      <div class="rs-label">Wrong</div>
    </div>
  </div>

  <div class="result-grade-label" style="color:${grade.color}">${grade.label}</div>

  <!-- WEAK AREAS -->
  ${(weak.weakTypes.length || weak.weakLetters.length) ? `
  <div class="result-weak">
    <div class="weak-title">📉 You struggled with:</div>
    ${weak.weakTypes.length ? `
    <div class="weak-row">
      <span class="weak-label">Question Types:</span>
      ${weak.weakTypes.map(t=>`<span class="weak-tag">${t}</span>`).join('')}
    </div>` : ''}
    ${weak.weakLetters.length ? `
    <div class="weak-row">
      <span class="weak-label">Letter Groups:</span>
      ${weak.weakLetters.map(l=>`<span class="weak-tag">${l}</span>`).join('')}
    </div>` : ''}
  </div>` : '<div class="result-weak"><div class="weak-title">🎯 No weak areas — excellent work!</div></div>'}

  <!-- ACTIONS -->
  <div class="result-actions">
    <button class="quiz-start-btn" onclick="renderReview()">📋 Review Answers</button>
    <button class="quiz-secondary-btn" onclick="renderQuizConfig()">🔄 New Quiz</button>
    <button class="quiz-secondary-btn" onclick="renderQuizHome()">🏠 Home</button>
  </div>
</div>`;
}

/* ---- RENDER: REVIEW MODE ---- */

function renderReview() {
  const qs = document.getElementById('quizSection');

  const reviewHTML = QuizState.answers.map((a, i) => `
<div class="review-item ${a.isCorrect ? 'review-correct' : 'review-wrong'}">
  <div class="review-num">Q${i+1} — ${a.question.type.charAt(0).toUpperCase()+a.question.type.slice(1)}</div>
  <div class="review-q">${a.question.q}</div>

  <div class="review-answer-row">
    <div class="review-your">
      <span class="review-ans-label">Your Answer:</span>
      <span class="${a.isCorrect ? 'review-ans-correct' : 'review-ans-wrong'}">${a.selected}</span>
    </div>
    ${!a.isCorrect ? `
    <div class="review-correct-ans">
      <span class="review-ans-label">Correct:</span>
      <span class="review-ans-correct">${a.correct}</span>
    </div>` : ''}
  </div>

  ${a.question.explanation.meaning ? `
  <div class="review-exp">
    <span class="review-exp-label">Meaning:</span> ${a.question.explanation.meaning}
  </div>` : ''}
  ${a.question.explanation.example ? `
  <div class="review-exp">
    <span class="review-exp-label">Example:</span> <em>${a.question.explanation.example}</em>
  </div>` : ''}
</div>`).join('');

  qs.innerHTML = `
<div class="quiz-review">
  <div class="quiz-config-header">
    <button class="quiz-back-btn" onclick="renderResult()">← Back to Result</button>
    <h2>Answer Review</h2>
  </div>
  <div class="review-list">
    ${reviewHTML || '<div class="empty"><p>No answers to review.</p></div>'}
  </div>
</div>`;
}

/* ---- QUIZ HISTORY MODAL ---- */

function showQuizHistory() {
  const modal   = document.getElementById('quizHistoryModal');
  const content = document.getElementById('quizHistoryContent');
  const history = getQuizHistory();

  if (!history.length) {
    content.innerHTML = '<div class="empty"><p>No quiz history yet. Take a quiz first!</p></div>';
  } else {
    content.innerHTML = history.map((a, i) => {
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
    ${a.config?.letters?.length ? `<span>${a.config.letters.length} letters</span>` : ''}
  </div>
  ${a.weakLetters?.length ? `<div class="history-weak">Weak: ${a.weakLetters.join(', ')}</div>` : ''}
</div>`;
    }).join('');
  }

  modal.style.display = 'flex';
}

function closeQuizHistoryModal(event) {
  const modal = document.getElementById('quizHistoryModal');
  if (!event || event.target === modal || event.type !== 'click') {
    modal.style.display = 'none';
  }
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('quizHistoryModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
});
