/* =====================================================
   SECTION TABS — controls all section switching
===================================================== */

let _currentSection = 'vocabs';

function getCurrentSection() {
  return _currentSection;
}

function switchSection(section) {
  _currentSection = section;
  localStorage.setItem('activeSection', section);

  // Tab highlights
  document.querySelectorAll('.section-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.section === section);
  });

  const alphabetFilter = document.getElementById('alphabetFilter');
  const grid           = document.getElementById('grid');
  const quizSection    = document.getElementById('quizSection');
  const controls       = document.getElementById('controls');
  const diffFilters    = document.getElementById('difficultyFilters');
  const filterBtn      = document.getElementById('filterToggleBtn');
  const fab            = document.getElementById('addWordFab');

  // Reset visibility
  alphabetFilter.style.display  = 'none';
  grid.style.display             = 'none';
  quizSection.style.display      = 'none';
  diffFilters.style.display      = 'none';
  controls.style.display         = 'flex';
  if (filterBtn) filterBtn.style.display = 'none';
  if (fab)       fab.style.display       = 'flex';

  switch (section) {
    case 'vocabs':
      alphabetFilter.style.display  = 'flex';
      grid.style.display             = 'grid';
      diffFilters.style.display      = 'flex';
      if (filterBtn) filterBtn.style.display = 'inline-flex';
      loadWords(localStorage.getItem('selectedLetter') || 'a');
      break;

    case 'syns':
    case 'ows':
    case 'idioms':
      grid.style.display = 'grid';
      if (filterBtn) filterBtn.style.display = 'inline-flex';
      loadSection(section);
      break;

    case 'quiz':
      controls.style.display    = 'none';
      quizSection.style.display = 'block';
      if (fab) fab.style.display = 'none';
      renderQuizHome();
      break;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
});
