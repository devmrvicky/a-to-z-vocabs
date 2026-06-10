/* =====================================================
   BOOKMARK SYSTEM
===================================================== */

function getBookmarks() {
  return JSON.parse(localStorage.getItem('bookmarkedWords') || '[]');
}

function isBookmarked(uid) {
  return getBookmarks().includes(uid);
}

function toggleBookmark(event, uid) {
  event.stopPropagation();
  let bookmarks = getBookmarks();
  const btn     = event.currentTarget;
  const adding  = !bookmarks.includes(uid);

  if (adding) {
    bookmarks.push(uid);
    btn.classList.add('active');
    const parts  = uid.split('-');
    const letter = parts[0];
    localStorage.setItem('lastVisitedWord', JSON.stringify({ letter, wordId: uid }));
  } else {
    bookmarks = bookmarks.filter(x => x !== uid);
    btn.classList.remove('active');
  }
  localStorage.setItem('bookmarkedWords', JSON.stringify(bookmarks));
}

function scrollToLastVisited() {
  const saved = JSON.parse(localStorage.getItem('lastVisitedWord') || 'null');
  if (!saved || saved.letter !== currentLetter) return;

  const uid    = saved.wordId;
  const cardId = `card-${uid.replace(/[^a-zA-Z0-9]/g, '-')}`;

  setTimeout(() => {
    const el = document.getElementById(cardId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('collapsed');
    }
  }, 400);
}
