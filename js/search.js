/* =========================
   SEARCH SYSTEM
========================= */

/**
 * Global search: works across vocabulary cards currently in the DOM.
 * For vocab tab: searches word text and synonyms.
 * Triggered on Enter key press.
 */
function filterWords() {
  const q = document.getElementById('search').value.toLowerCase().trim();
  if (!q) return;

  const section = getCurrentSection();

  // Quiz section: do nothing
  if (section === 'quiz') return;

  const cards = document.querySelectorAll('#grid .card');
  if (!cards.length) return;

  let found = false;
  cards.forEach(card => {
    const wordText = card.querySelector('.word-inline')?.innerText.toLowerCase() || '';
    const synoText = card.querySelector('.compact-syno')?.innerText.toLowerCase() || '';
    const bodyText = card.querySelector('.card-body')?.innerText.toLowerCase() || '';

    const match = wordText.includes(q) || synoText.includes(q) || bodyText.includes(q);

    if (match && !found) {
      found = true;
      card.classList.remove('collapsed');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('search-highlight');
      setTimeout(() => card.classList.remove('search-highlight'), 2500);
    }
  });

  if (!found) {
    showSearchNotFound(q);
  }
}

function showSearchNotFound(q) {
  const existing = document.getElementById('searchToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'searchToast';
  toast.className = 'search-toast';
  toast.textContent = `"${q}" not found in current view`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
