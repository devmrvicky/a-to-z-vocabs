/* =========================
   BOOKMARK SYSTEM
========================= */

function getBookmarks() {
  return JSON.parse(localStorage.getItem("bookmarkedWords") || "[]");
}

function isBookmarked(id) {
  return getBookmarks().includes(id);
}

function toggleBookmark(event, id) {
  event.stopPropagation();

  let bookmarks = getBookmarks();

  const btn = event.currentTarget;

  const lastVisited = localStorage.getItem("lastVisitedWord");

  if (bookmarks.includes(id)) {
    bookmarks = bookmarks.filter((x) => x !== id);

    btn.classList.remove("active");

    if (Number(lastVisited) === id) {
      localStorage.removeItem("lastVisitedWord");
    }
  } else {
    bookmarks.push(id);

    btn.classList.add("active");

    localStorage.setItem(
      "lastVisitedWord",
      JSON.stringify({
        letter: currentLetter,
        wordId: id,
      }),
    );
  }

  localStorage.setItem("bookmarkedWords", JSON.stringify(bookmarks));
}

/* =========================
   AUTO SCROLL
========================= */

function scrollToLastVisited() {
  const saved = JSON.parse(localStorage.getItem("lastVisitedWord"));

  if (!saved) return;

  if (saved.letter !== currentLetter) return;

  const lastId = saved.wordId;

  if (!lastId) return;

  setTimeout(() => {
    const el = document.getElementById(`word-${lastId}`);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      el.classList.remove("collapsed");
    }
  }, 500);
}