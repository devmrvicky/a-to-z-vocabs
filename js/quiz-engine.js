/* =========================
   QUIZ ENGINE
   Handles: question generation, scoring, history, review
========================= */

/* ---- STATE ---- */
const QuizState = {
  config:      null,   // quiz config from config screen
  questions:   [],     // generated questions
  current:     0,      // index of current question
  answers:     [],     // { question, selected, correct, isCorrect }
  score:       0,
  started:     false,
};

/* ---- HISTORY ---- */

function getQuizHistory() {
  return JSON.parse(localStorage.getItem('quizHistory') || '[]');
}

function saveQuizAttempt(attempt) {
  const history = getQuizHistory();
  history.unshift(attempt); // newest first
  // keep max 50 attempts
  localStorage.setItem('quizHistory', JSON.stringify(history.slice(0, 50)));
}

/* ---- QUESTION GENERATORS ---- */

/**
 * Build a "meaning" question: "What is the meaning of X?"
 */
function makeMeaningQuestion(word, pool) {
  if (!word.english && !word.hindi) return null;

  const correctAnswer = word.english || word.hindi;

  // Distractors: pick 3 other words' meanings
  const distractors = pickRandom(
    pool.filter(w => w.id !== word.id && (w.english || w.hindi)),
    3
  ).map(w => w.english || w.hindi);

  if (distractors.length < 3) return null;

  const options = shuffleArray([correctAnswer, ...distractors]);

  return {
    type:    'meaning',
    word:    word.word,
    letter:  word._letter,
    q:       `What is the meaning of <strong>${word.word}</strong>?`,
    options,
    correct: correctAnswer,
    explanation: {
      word:    word.word,
      meaning: word.english || word.hindi,
      example: word.exampleEn,
    },
  };
}

/**
 * Build a "synonym" question.
 */
function makeSynonymQuestion(word, pool) {
  if (!word.synonyms.length) return null;

  const correctAnswer = pickRandom(word.synonyms, 1)[0];

  const distractors = pickRandom(
    pool.filter(w => w.id !== word.id && w.synonyms.length),
    3
  ).map(w => pickRandom(w.synonyms, 1)[0]);

  if (distractors.length < 3) return null;

  const options = shuffleArray([correctAnswer, ...distractors]);

  return {
    type:    'synonym',
    word:    word.word,
    letter:  word._letter,
    q:       `Choose the <strong>synonym</strong> of <strong>${word.word}</strong>.`,
    options,
    correct: correctAnswer,
    explanation: {
      word:    word.word,
      meaning: word.english || word.hindi,
      example: word.exampleEn,
    },
  };
}

/**
 * Build an "antonym" question.
 */
function makeAntonymQuestion(word, pool) {
  if (!word.antonyms.length) return null;

  const correctAnswer = pickRandom(word.antonyms, 1)[0];

  const distractors = pickRandom(
    pool.filter(w => w.id !== word.id && w.antonyms.length),
    3
  ).map(w => pickRandom(w.antonyms, 1)[0]);

  if (distractors.length < 3) return null;

  const options = shuffleArray([correctAnswer, ...distractors]);

  return {
    type:    'antonym',
    word:    word.word,
    letter:  word._letter,
    q:       `Choose the <strong>antonym</strong> of <strong>${word.word}</strong>.`,
    options,
    correct: correctAnswer,
    explanation: {
      word:    word.word,
      meaning: word.english || word.hindi,
      example: word.exampleEn,
    },
  };
}

/**
 * Build an "example / fill-in-the-blank" question.
 */
function makeExampleQuestion(word, pool) {
  if (!word.exampleEn) return null;

  // Replace the word (case-insensitive) with blanks
  const re = new RegExp(`\\b${word.word}\\b`, 'gi');
  const blanked = word.exampleEn.replace(re, '______');
  if (blanked === word.exampleEn) return null; // word not found in example

  const correctAnswer = word.word;

  const distractors = pickRandom(
    pool.filter(w => w.id !== word.id),
    3
  ).map(w => w.word);

  if (distractors.length < 3) return null;

  const options = shuffleArray([correctAnswer, ...distractors]);

  return {
    type:    'example',
    word:    word.word,
    letter:  word._letter,
    q:       `Which word best fits this sentence?<br><em class="quiz-blank-sentence">"${blanked}"</em>`,
    options,
    correct: correctAnswer,
    explanation: {
      word:    word.word,
      meaning: word.english || word.hindi,
      example: word.exampleEn,
    },
  };
}

/* ---- MAIN GENERATOR ---- */

/**
 * Generate questions from a pool of normalized words, per config.
 *
 * @param {Array}  wordPool   - normalized word objects (already letter-filtered)
 * @param {Object} config     - quiz configuration from the config screen
 * @returns {Array}           - question objects
 */
function generateQuestions(wordPool, config) {
  const {
    questionTypes,
    difficultyFilter,
    numQuestions,
    shuffle,
  } = config;

  // 1. Apply difficulty filter
  let pool = wordPool;
  if (difficultyFilter !== 'all') {
    pool = pool.filter(w => {
      const uid = `${w._letter}-${w.id}`;
      return getWordDifficulty(uid) === difficultyFilter;
    });
    if (!pool.length) pool = wordPool; // fallback to full pool
  }

  // 2. Try to generate one question per word (round-robin types)
  const generators = [];
  if (questionTypes.includes('meaning'))  generators.push(makeMeaningQuestion);
  if (questionTypes.includes('synonym'))  generators.push(makeSynonymQuestion);
  if (questionTypes.includes('antonym'))  generators.push(makeAntonymQuestion);
  if (questionTypes.includes('example'))  generators.push(makeExampleQuestion);

  if (!generators.length) generators.push(makeMeaningQuestion);

  // Shuffle pool to ensure variety
  const shuffledPool = shuffleArray([...pool]);

  const questions = [];
  const usedWordIds = new Set();

  for (const word of shuffledPool) {
    if (numQuestions !== 'all' && questions.length >= Number(numQuestions)) break;

    // Don't repeat same word
    if (usedWordIds.has(word.id + word._letter)) continue;

    // Try each generator type in order (or rotated)
    const genCopy = shuffleArray([...generators]);
    for (const gen of genCopy) {
      const q = gen(word, pool);
      if (q) {
        questions.push(q);
        usedWordIds.add(word.id + word._letter);
        break;
      }
    }
  }

  // 3. Shuffle final question list if requested
  return shuffle ? shuffleArray(questions) : questions;
}

/* ---- SCORING ---- */

function submitAnswer(selectedOption) {
  const q = QuizState.questions[QuizState.current];
  const isCorrect = selectedOption === q.correct;

  if (isCorrect) QuizState.score++;

  QuizState.answers.push({
    question: q,
    selected: selectedOption,
    correct:  q.correct,
    isCorrect,
  });

  return isCorrect;
}

function nextQuestion() {
  QuizState.current++;
}

function isQuizComplete() {
  return QuizState.current >= QuizState.questions.length;
}

/* ---- WEAK AREAS ---- */

function computeWeakAreas(answers) {
  const typeErrors    = {};
  const letterErrors  = {};

  answers.forEach(a => {
    if (!a.isCorrect) {
      const t = a.question.type;
      const l = a.question.letter?.toUpperCase() || '?';
      typeErrors[t]   = (typeErrors[t]   || 0) + 1;
      letterErrors[l] = (letterErrors[l] || 0) + 1;
    }
  });

  const weakTypes   = Object.entries(typeErrors).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);
  const weakLetters = Object.entries(letterErrors).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0]);

  return { weakTypes, weakLetters };
}
