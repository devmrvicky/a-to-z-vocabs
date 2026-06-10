/* =====================================================
   SEARCH — live filter across current grid
===================================================== */

function filterWords() {
  const q = document.getElementById('search')?.value.toLowerCase().trim();
  if (!q) { applyDifficultyFilter(); return; }

  const section = getCurrentSection();
  if (section === 'quiz') return;

  const cards = document.querySelectorAll('#grid .card');
  if (!cards.length) return;

  let found = false;
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    const match = text.includes(q);
    card.style.display = match ? '' : 'none';
    if (match && !found) {
      found = true;
      card.classList.remove('collapsed');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('search-highlight');
      setTimeout(() => card.classList.remove('search-highlight'), 2500);
    }
  });

  if (!found) showToast(`"${q}" not found in current view`);
}
