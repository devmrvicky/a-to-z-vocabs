let words = [];

let currentLetter = "a";
let allWords = [];

async function loadWords(letter = "a") {
  try {
    currentLetter = letter.toLowerCase();

    const response = await fetch(`./vocabs/${currentLetter}.json`);

    if (!response.ok) {
      throw new Error("JSON file not found");
    }

    const words = await response.json();

    allWords = words;

    renderCards(words);

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

// loadWords("a");

function createAlphabetFilters() {
  const container = document.getElementById("alphabetFilter");

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  container.innerHTML = letters
    .map(
      (letter) => `
    <button
      class="alphabet-btn ${letter === "A" ? "active" : ""}"
      onclick="loadWords('${letter.toLowerCase()}')"
    >
      ${letter}
    </button>
  `,
    )
    .join("");
}

function updateActiveLetter() {
  document.querySelectorAll(".alphabet-btn").forEach((btn) => {
    btn.classList.remove("active");

    if (btn.textContent.toLowerCase() === currentLetter) {
      btn.classList.add("active");
    }
  });
}

let currentFilter = "all";

function renderCards(data) {
  const grid = document.getElementById("grid");
  document.getElementById("count").textContent =
    `${data.length} word${data.length !== 1 ? "s" : ""}`;
  if (!data.length) {
    grid.innerHTML =
      '<div class="empty"><h3>No words found</h3><p>Try a different search or filter</p></div>';
    return;
  }
  grid.innerHTML = data
    .map(
      (d, i) => `
    <div class="card" style="animation-delay:${Math.min(i * 20, 300)}ms">
      <div class="card-header">
        <span class="num">${String(d.n).padStart(2, "0")}</span>
        <span class="word">${d.w}</span>
        ${d.exam ? `<span class="exam-tag">${d.exam.split(" ")[0]}</span>` : ""}
      </div>
      <div class="card-body">
        <div class="hindi-block">
          <div class="row-label">हिंदी अर्थ</div>
          <div class="hindi-text">${d.h}</div>
        </div>
        <div class="syns-block">
          <div class="row-label">SSC Synonyms</div>
          <div class="syns-list">
            <span class="syn primary">${d.syns[0]}</span>
            ${d.syns
              .slice(1)
              .map((s) => `<span class="syn">${s}</span>`)
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function filterWords() {
  const q = document.getElementById("search").value.toLowerCase().trim();
  let data = words;
  if (currentFilter !== "all") {
    data = data.filter(
      (d) => d.exam && d.exam.toUpperCase().includes(currentFilter),
    );
  }
  if (q) {
    data = data.filter(
      (d) =>
        d.w.toLowerCase().includes(q) ||
        d.h.includes(q) ||
        d.syns.some((s) => s.toLowerCase().includes(q)) ||
        (d.exam && d.exam.toLowerCase().includes(q)),
    );
  }
  renderCards(data);
}

function setFilter(f, btn) {
  currentFilter = f;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  filterWords();
}

//       async function loadWords() {
//   const response = await fetch('words.json');
//   const words = await response.json();

//   renderCards(words);
// }

// loadWords();

createAlphabetFilters();
loadWords("a");
