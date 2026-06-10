/* =====================================================
   DIFFICULTY — used only via three-dot menu now
   (kept for backwards compat and direct calls)
===================================================== */

function markDifficulty(uid, level) {
  const current  = getWordDifficulty(uid);
  const newLevel = (current === level) ? 'unset' : level;
  setWordDifficulty(uid, newLevel);

  // Update card border
  const cardId = `card-${uid.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const card   = document.getElementById(cardId);
  if (card) {
    card.classList.remove('diff-easy','diff-medium','diff-hard');
    if (newLevel !== 'unset') card.classList.add(`diff-${newLevel}`);
  }
  return newLevel;
}
