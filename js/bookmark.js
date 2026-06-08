/* =========================
   BOOKMARK SYSTEM
========================= */

function getBookmarks() {
  return JSON.parse(localStorage.getItem('bookmarkedWords') || '[]');
}

function isBookmarked(uid) {
  return getBookmarks().includes(uid);
}

function toggleBookmark(event, uid) {
  event.stopPropagation();

  let bookmarks = getBookmarks();
  const btn = event.currentTarget;

  if (bookmarks.includes(uid)) {
    bookmarks = bookmarks.filter(x => x !== uid);
    btn.classList.remove('active');
  } else {
    bookmarks.push(uid);
    btn.classList.add('active');
    // Store last visited: parse uid = "letter-id"
    const [letter] = uid.split('-');
    localStorage.setItem('lastVisitedWord', JSON.stringify({ letter, wordId: uid }));
  }

  localStorage.setItem('bookmarkedWords', JSON.stringify(bookmarks));
}

/* =========================
   AUTO SCROLL TO LAST VISITED
========================= */

function scrollToLastVisited() {
  const saved = JSON.parse(localStorage.getItem('lastVisitedWord') || 'null');
  if (!saved) return;
  if (saved.letter !== currentLetter) return;

  // wordId stored as "letter-id" e.g. "a-5"
  const parts = saved.wordId.split('-');
  const id = parts[parts.length - 1];

  setTimeout(() => {
    const el = document.getElementById(`word-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('collapsed');
    }
  }, 500);
}
