/* =====================================================
   APP.JS — Boot sequence
===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Build A–Z filter buttons
  createAlphabetFilters();

  // 2. Wire search (Enter key)
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') filterWords();
    });
    searchInput.addEventListener('input', e => {
      if (!e.target.value.trim()) applyDifficultyFilter();
    });
  }

  // 3. Restore last section
  const savedSection = localStorage.getItem('activeSection') || 'vocabs';
  setTimeout(() => switchSection(savedSection), 0);
});
