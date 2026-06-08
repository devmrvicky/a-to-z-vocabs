/* =========================
   SECTION TAB SYSTEM
   Manages: vocabs | syns | ows | idioms | quiz
========================= */

let _currentSection = 'vocabs';

function getCurrentSection() {
  return _currentSection;
}

/**
 * Switch to a section.
 * Each section controls which DOM elements are visible and what data is loaded.
 */
function switchSection(section) {
  _currentSection = section;

  // Update tab highlight
  document.querySelectorAll('.section-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.section === section);
  });

  const alphabetFilter  = document.getElementById('alphabetFilter');
  const grid            = document.getElementById('grid');
  const quizSection     = document.getElementById('quizSection');
  const controls        = document.getElementById('controls');
  const diffFilters     = document.getElementById('difficultyFilters');

  // Hide everything first, then show what's needed
  alphabetFilter.style.display = 'none';
  grid.style.display            = 'none';
  quizSection.style.display     = 'none';
  diffFilters.style.display     = 'none';
  controls.style.display        = 'flex';

  switch (section) {
    case 'vocabs': {
      alphabetFilter.style.display = 'flex';
      grid.style.display            = 'grid';
      diffFilters.style.display     = 'flex';
      // Reload saved letter
      const savedLetter = localStorage.getItem('selectedLetter') || 'a';
      loadWords(savedLetter);
      break;
    }

    case 'syns':
    case 'ows':
    case 'idioms': {
      grid.style.display = 'grid';
      grid.innerHTML     = `
        <div class="empty">
          <h3>Coming Soon</h3>
          <p>This section's data is being prepared. Check back soon!</p>
        </div>`;
      // When data files exist, swap the above two lines for:
      // loadSection(section);
      break;
    }

    case 'quiz': {
      controls.style.display  = 'none';
      quizSection.style.display = 'block';
      renderQuizHome();
      break;
    }
  }
}

// Boot: wire up tab buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
});
