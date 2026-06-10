/* =====================================================
   QUIZ ENGINE — question generation, scoring, analytics
===================================================== */

const QuizState = {
  config:    null,
  questions: [],
  current:   0,
  answers:   [],
  score:     0,
  started:   false,
};

/* ---- HISTORY ---- */

function getQuizHistory()  { return JSON.parse(localStorage.getItem('quizHistory') || '[]'); }

function saveQuizAttempt(attempt) {
  const h = getQuizHistory();
  h.unshift(attempt);
  localStorage.setItem('quizHistory', JSON.stringify(h.slice(0, 50)));
}

/* ---- GENERATORS ---- */

function makeMeaningQuestion(word, pool) {
  const answer = word.english || word.hindi;
  if (!answer) return null;

  const distractors = pickRandom(
    pool.filter(w => w._uid !== word._uid && (w.english || w.hindi)),
    3
  ).map(w => w.english || w.hindi);

  if (distractors.length < 3) return null;

  return {
    type: 'meaning', word: word.word, letter: word._letter,
    q: `What is the meaning of <strong>${escapeHtml(word.word)}</strong>?`,
    options: shuffleArray([answer, ...distractors]),
    correct: answer,
    explanation: {
      word: word.word, meaning: word.english || word.hindi,
      example: word.exampleEn, synonyms: word.synonyms,
    },
  };
}

function makeSynonymQuestion(word, pool) {
  if (!word.synonyms?.length) return null;
  const answer = pickRandom(word.synonyms, 1)[0];
  const distractors = pickRandom(
    pool.filter(w => w._uid !== word._uid && w.synonyms?.length),
    3
  ).map(w => pickRandom(w.synonyms, 1)[0]);
  if (distractors.length < 3) return null;
  return {
    type: 'synonym', word: word.word, letter: word._letter,
    q: `Choose the <strong>synonym</strong> of <strong>${escapeHtml(word.word)}</strong>.`,
    options: shuffleArray([answer, ...distractors]),
    correct: answer,
    explanation: { word: word.word, meaning: word.english || word.hindi, example: word.exampleEn, synonyms: word.synonyms },
  };
}

function makeAntonymQuestion(word, pool) {
  if (!word.antonyms?.length) return null;
  const answer = pickRandom(word.antonyms, 1)[0];
  const distractors = pickRandom(
    pool.filter(w => w._uid !== word._uid && w.antonyms?.length),
    3
  ).map(w => pickRandom(w.antonyms, 1)[0]);
  if (distractors.length < 3) return null;
  return {
    type: 'antonym', word: word.word, letter: word._letter,
    q: `Choose the <strong>antonym</strong> of <strong>${escapeHtml(word.word)}</strong>.`,
    options: shuffleArray([answer, ...distractors]),
    correct: answer,
    explanation: { word: word.word, meaning: word.english || word.hindi, example: word.exampleEn, synonyms: word.synonyms },
  };
}

function makeExampleQuestion(word, pool) {
  if (!word.exampleEn) return null;
  const re = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`, 'gi');
  const blanked = word.exampleEn.replace(re, '______');
  if (blanked === word.exampleEn) return null;
  const distractors = pickRandom(pool.filter(w => w._uid !== word._uid), 3).map(w => w.word);
  if (distractors.length < 3) return null;
  return {
    type: 'example', word: word.word, letter: word._letter,
    q: `Which word fits?<br><em class="quiz-blank-sentence">"${escapeHtml(blanked)}"</em>`,
    options: shuffleArray([word.word, ...distractors]),
    correct: word.word,
    explanation: { word: word.word, meaning: word.english || word.hindi, example: word.exampleEn, synonyms: word.synonyms },
  };
}

/* ---- MAIN GENERATOR ---- */

function generateQuestions(wordPool, config) {
  const { questionTypes, difficultyFilter, numQuestions, shuffle, wordRange } = config;

  // 1. Apply difficulty filter
  let pool = wordPool;
  if (difficultyFilter !== 'all') {
    const filtered = pool.filter(w => getWordDifficulty(w._uid) === difficultyFilter);
    if (filtered.length >= 4) pool = filtered; // need at least 4 for distractors
  }

  // 2. Apply word range
  if (wordRange) {
    const ranged = pool.filter(w => {
      const n = Number(w.id);
      return n >= wordRange.start && n <= wordRange.end;
    });
    if (ranged.length >= 4) pool = ranged;
  }

  // 3. Build generators
  const generators = [];
  if (questionTypes.includes('meaning'))  generators.push(makeMeaningQuestion);
  if (questionTypes.includes('synonym'))  generators.push(makeSynonymQuestion);
  if (questionTypes.includes('antonym'))  generators.push(makeAntonymQuestion);
  if (questionTypes.includes('example'))  generators.push(makeExampleQuestion);
  if (!generators.length) generators.push(makeMeaningQuestion);

  const shuffledPool = shuffleArray([...pool]);
  const questions    = [];
  const usedUids     = new Set();

  for (const word of shuffledPool) {
    if (numQuestions !== 'all' && questions.length >= Number(numQuestions)) break;
    if (usedUids.has(word._uid)) continue;

    for (const gen of shuffleArray([...generators])) {
      const q = gen(word, pool);
      if (q) { questions.push(q); usedUids.add(word._uid); break; }
    }
  }

  return shuffle ? shuffleArray(questions) : questions;
}

/* ---- SCORING ---- */

function submitAnswer(selected) {
  const q         = QuizState.questions[QuizState.current];
  const isCorrect = selected === q.correct;
  if (isCorrect) QuizState.score++;
  QuizState.answers.push({ question: q, selected, correct: q.correct, isCorrect });
  return isCorrect;
}

function nextQuestion()  { QuizState.current++; }
function isQuizComplete() { return QuizState.current >= QuizState.questions.length; }

function computeWeakAreas(answers) {
  const typeErr = {}, letterErr = {};
  answers.forEach(a => {
    if (!a.isCorrect) {
      typeErr[a.question.type]   = (typeErr[a.question.type]   || 0) + 1;
      const l = (a.question.letter || '?').toUpperCase();
      letterErr[l] = (letterErr[l] || 0) + 1;
    }
  });
  return {
    weakTypes:   Object.entries(typeErr).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]),
    weakLetters: Object.entries(letterErr).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0]),
  };
}
