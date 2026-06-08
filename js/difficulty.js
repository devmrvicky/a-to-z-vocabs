/* =========================
   DIFFICULTY SYSTEM
========================= */

/**
 * Mark a word with a difficulty level and update UI.
 * uid format: "letter-id"  e.g. "a-5"
 */
function markDifficulty(uid, level, clickedBtn) {
  const current = getWordDifficulty(uid);

  // Toggle off if same level clicked
  const newLevel = (current === level) ? 'unset' : level;
  setWordDifficulty(uid, newLevel);

  // Update button states in this card
  const card = clickedBtn.closest('.card');
  if (!card) return;

  card.querySelectorAll('.diff-btn').forEach(btn => {
    btn.classList.remove('diff-easy-active', 'diff-medium-active', 'diff-hard-active');
  });

  if (newLevel !== 'unset') {
    clickedBtn.classList.add(`diff-${newLevel}-active`);
  }

  // Update card border class
  card.classList.remove('diff-easy', 'diff-medium', 'diff-hard');
  if (newLevel !== 'unset') {
    card.classList.add(`diff-${newLevel}`);
  }
}
