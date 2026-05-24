let words = [];

let currentLetter = "a";
let allWords = [];
let totalWords = 0;

async function loadWords(letter = "a") {
  try {
    currentLetter = letter.toLowerCase();

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
  id="word-${d.n}"
  style="animation-delay:${Math.min(i * 20, 300)}ms"
>

  <!-- COMPACT HEADER -->

  <div class="compact-header" onclick="toggleCard(this)">

    <div class="compact-left">

      <div class="top-line">

        <span class="num">
          ${String(d.n).padStart(2, "0")}
        </span>

        <span class="word-inline">

          ${d.w}

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
            (${d.h})
          </span>

        </span>

      </div>

      <div class="compact-syno">

        <span class="compact-label">
          Syno :
        </span>

        ${d.syns.join(", ")}

      </div>

    </div>

    <!-- RIGHT ACTIONS -->

    <div class="card-actions">

      <button
        class="bookmark-btn ${isBookmarked(d.n) ? "active" : ""}"
        onclick="toggleBookmark(event, ${d.n})"
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
        d.pron
          ? `
        <div class="pronunciation-block">

          <div class="row-label">
            Pronunciation
          </div>

          <div class="pronunciation-text">
            ${d.pron}
          </div>

        </div>
      `
          : ""
      }

      <!-- EXAMPLE -->

      ${
        d.example
          ? `
        <div class="example-block">

          <div class="row-label">
            Example
          </div>

          <div class="example-text">
            ${d.example}
          </div>

        </div>
      `
          : ""
      }

      <!-- SYNONYMS -->

      <div class="syns-block">

        <div class="row-label">
          SSC Synonyms
        </div>

        <div class="syns-list">

          <span class="syn primary">
            ${d.syns[0]}
          </span>

          ${d.syns
            .slice(1)
            .map(
              (s) => `
            <span class="syn">
              ${s}
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
          ${d.exam || "SSC"}
        </div>

      </div>

    </div>

  </div>

</div>

`,
    )
    .join("");

  //   grid.innerHTML = data
  //     .map(
  //       (d, i) => `
  //   <div class="card collapsed" style="animation-delay:${Math.min(i * 20, 300)}ms">

  //     <!-- TOP SECTION -->
  //     <div class="compact-header" onclick="toggleCard(this)">

  //       <div class="compact-left">

  //         <div class="top-line">
  //           <span class="num">${String(d.n).padStart(2, "0")}</span>

  //           <span class="word-inline">
  //             ${d.w}
  //             <span class="inline-hindi">(${d.h})</span>
  //           </span>
  //         </div>

  //         <div class="compact-syno">
  //           <span class="compact-label">Syno :</span>
  //           ${d.syns.join(", ")}
  //         </div>

  //       </div>

  //       <button class="collapse-btn">
  //         <span class="arrow">›</span>
  //       </button>

  //     </div>

  //     <!-- EXPANDED CONTENT -->
  //     <div class="card-expand">

  //       <div class="card-header">
  //         <span class="num">${String(d.n).padStart(2, "0")}</span>

  //         <span class="word">${d.w}</span>

  //         ${d.exam ? `<span class="exam-tag">${d.exam.split(" ")[0]}</span>` : ""}
  //       </div>

  //       <div class="card-body">

  //         <div class="hindi-block">
  //           <div class="row-label">हिंदी अर्थ</div>
  //           <div class="hindi-text">${d.h}</div>
  //         </div>

  //         <div class="syns-block">
  //           <div class="row-label">SSC Synonyms</div>

  //           <div class="syns-list">
  //             <span class="syn primary">${d.syns[0]}</span>

  //             ${d.syns
  //               .slice(1)
  //               .map(
  //                 (s) => `
  //               <span class="syn">${s}</span>
  //             `,
  //               )
  //               .join("")}
  //           </div>
  //         </div>

  //       </div>
  //     </div>
  //   </div>
  // `,
  //     )
  //     .join("");
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

    localStorage.setItem("lastVisitedWord", id);
  }

  localStorage.setItem("bookmarkedWords", JSON.stringify(bookmarks));
}

/* =========================
   AUTO SCROLL
========================= */

function scrollToLastVisited() {
  const lastId = localStorage.getItem("lastVisitedWord");

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
loadWords("a");

document.getElementById("search").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    filterWords();
  }
});
