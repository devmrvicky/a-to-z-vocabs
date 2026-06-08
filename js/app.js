/* =========================
   APP ENTRY POINT
   Boot sequence: alphabet filter → restore section → load data
========================= */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Build A-Z buttons
  createAlphabetFilters();

  // 2. Wire search input
  document.getElementById('search').addEventListener('keydown', e => {
    if (e.key === 'Enter') filterWords();
  });

  // 3. Restore saved section or default to 'vocabs'
  const savedSection = localStorage.getItem('activeSection') || 'vocabs';

  // Section tabs are wired in section-tabs.js DOMContentLoaded,
  // but we need to trigger the initial switch after everything is ready.
  // Use minimal timeout to ensure section-tabs.js listener fired first.
  setTimeout(() => switchSection(savedSection), 0);
});

// Persist active section across refreshes
const _origSwitchSection = typeof switchSection === 'function' ? switchSection : null;
// Override is in section-tabs.js; here we add persistence:
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem('activeSection', btn.dataset.section);
    });
  });
});
