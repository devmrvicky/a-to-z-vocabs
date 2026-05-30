let words = [];

let currentLetter = "a";
let allWords = [];
let totalWords = 0;

async function loadWords(letter = "a") {
  try {
    currentLetter = letter.toLowerCase();

    localStorage.setItem("selectedLetter", currentLetter);

    const response = await fetch(`./vocabs/${currentLetter}.json`);

    if (!response.ok) {
      throw new Error("JSON file not found");
    }

    const words = await response.json();

    allWords = words;
    updateLetterCount(letter, words.length);

    renderCards(words);
    scrollToLastVisited();

    updateActiveLetter();
  } catch (error) {
    console.error("Error loading vocabulary:", error);

    document.getElementById("grid").innerHTML = `
      <div class="empty">
        <h3>No words found</h3>
        <p>${letter.toUpperCase()} vocabulary file is not available.</p>
      </div>
    `;
  }
}

function createAlphabetFilters() {
  const container = document.getElementById("alphabetFilter");

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  container.innerHTML = letters
    .map((letter) => {
      return `
        <button
          class="alphabet-btn ${letter === "A" ? "active" : ""}"
          data-letter="${letter.toLowerCase()}"
          onclick="loadWords('${letter.toLowerCase()}')"
        >

          <span class="letter-name">
            ${letter}
          </span>

          <span class="letter-count">
            
          </span>

        </button>
      `;
    })
    .join("");
}

function updateActiveLetter() {
  document.querySelectorAll(".alphabet-btn").forEach((btn) => {
    btn.classList.remove("active");

    const btnLetter = btn.dataset.letter;

    if (btnLetter === currentLetter) {
      btn.classList.add("active");

      // AUTO SCROLL ACTIVE BUTTON

      btn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  });
}

function updateLetterCount(letter, count) {
  const btn = document.querySelector(`[data-letter="${letter}"]`);

  if (!btn) return;

  const countEl = btn.querySelector(".letter-count");

  countEl.textContent = count;
}

let currentFilter = "all";

function renderCards(data) {
  const grid = document.getElementById("grid");
  // update total words count
  // document.querySelector("#word-count").textContent = data.length;
  if (!data.length) {
    grid.innerHTML =
      '<div class="empty"><h3>No words found</h3><p>Try a different search or filter</p></div>';
    return;
  }

  grid.innerHTML = data
    .map(
      (d, i) => `

<div 
  class="card collapsed"
  id="word-${d.id || d.n || d.n}"
  style="animation-delay:${Math.min(i * 20, 300)}ms"
>

  <!-- COMPACT HEADER -->

  <div class="compact-header" onclick="toggleCard(this)">

    <div class="compact-left">

      <div class="top-line">

        <span class="num">
          ${String(d.id || d.n).padStart(2, "0")}
        </span>

        <span class="word-inline">

          ${d.word || d.w}

          ${
            d.pos
              ? `
            <span class="pos-inline">
              (${d.pos})
            </span>
          `
              : ""
          }

          <span class="inline-hindi">
            (${d.meaning?.hindi || d.h})
          </span>

        </span>

      </div>

      <div class="compact-syno">

        <span class="compact-label">
          Syno :
        </span>

        ${d.synonyms?.join(", ") || d.syns}

      </div>

    </div>

    <!-- RIGHT ACTIONS -->

    <div class="card-actions">

      <button
        class="bookmark-btn ${isBookmarked(d.id || d.n) ? "active" : ""}"
        onclick="toggleBookmark(event, ${d.id || d.n})"
      >
        ★
      </button>

      <button class="collapse-btn">
        <span class="arrow">›</span>
      </button>

    </div>

  </div>

  <!-- EXPANDED SECTION -->

  <div class="card-expand">

    <div class="card-body">

      <!-- PRONUNCIATION -->

      ${
        d.pronunciation?.ipa
          ? `
        <div class="pronunciation-block">

          <div class="row-label">
            Pronunciation
          </div>

          <div class="pronunciation-text">
            ${d.pronunciation.ipa}
          </div>
          <div class="phonetic-text">
  ${d.pronunciation.phonetic}
</div>

        </div>
      `
          : ""
      }

      <!-- MEANING -->
      <!--<div class="meaning-block">

  <div class="row-label">
    English Meaning
  </div>

  <div class="meaning-text">
    ${d.meaning?.english}
  </div>

</div>

<div class="meaning-block">

  <div class="row-label">
    Hindi Meaning
  </div>

  <div class="meaning-text">
    ${d.meaning?.hindi || d.h}
  </div>

</div> -->

      <!-- EXAMPLE -->

      <div class="example-block">

  <div class="row-label">
    Example
  </div>

  <div class="example-text">
    ${d.example?.english}
  </div>

  <div class="example-hindi">
    ${d.example?.hindi}
  </div>

</div>

      <!-- SYNONYMS -->
<!--<div class="syns-block">

  <div class="row-label">
    Synonyms
  </div>

  <div class="syns-list">

    ${(d.synonyms || d.syns)
      ?.map(
        (word) => `
      <span class="syn">
        ${word}
      </span>
    `,
      )
      .join("")}

  </div>

</div>-->
<!-- ANTONYM -->
<div class="antonym-block">

  <div class="row-label">
    Antonyms
  </div>

  <div class="syns-list">

    ${d.antonyms
      ?.map(
        (word) => `
      <span class="syn antonym">
        ${word}
      </span>
    `,
      )
      .join("")}

  </div>

</div>

      <!-- EXAM -->

      <div class="exam-section">

        <div class="row-label">
          Exam Source
        </div>

        <div class="exam-source">
          ${d.exam_sources?.join(", ")}
        </div>

      </div>

    </div>

  </div>

</div>

`,
    )
    .join("");
}

function toggleCard(header) {
  const card = header.closest(".card");
  card.classList.toggle("collapsed");
}

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

  /* REMOVE BOOKMARK */

  if (bookmarks.includes(id)) {
    bookmarks = bookmarks.filter((x) => x !== id);

    btn.classList.remove("active");

    // REMOVE LAST VISITED
    // IF SAME WORD

    if (Number(lastVisited) === id) {
      localStorage.removeItem("lastVisitedWord");
    }
  } else {
    /* ADD BOOKMARK */
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

function filterWords() {
  const q = document.getElementById("search").value.toLowerCase().trim();

  // EMPTY SEARCH

  if (!q) return;

  const cards = document.querySelectorAll(".card");

  let found = false;

  cards.forEach((card) => {
    const wordText = card
      .querySelector(".word-inline")
      ?.innerText.toLowerCase();

    const synoText = card
      .querySelector(".compact-syno")
      ?.innerText.toLowerCase();

    // MATCH CONDITION

    if (wordText?.includes(q) || synoText?.includes(q)) {
      found = true;

      // OPEN CARD

      card.classList.remove("collapsed");

      // SCROLL

      card.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // HIGHLIGHT

      card.classList.add("search-highlight");

      setTimeout(() => {
        card.classList.remove("search-highlight");
      }, 2500);
    }
  });

  // NOT FOUND

  if (!found) {
    alert("Word not found");
  }
}

function setFilter(f, btn) {
  currentFilter = f;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  filterWords();
}

createAlphabetFilters();

const savedLetter = localStorage.getItem("selectedLetter");

loadWords(savedLetter || "a");

document.getElementById("search").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    filterWords();
  }
});
