let currentLetter = "a";
let allWords = [];

async function loadWords(letter = "a") {
  try {
    currentLetter = letter.toLowerCase();

    localStorage.setItem("selectedLetter", currentLetter);

    const response = await fetch(`./data/vocabs/${currentLetter}.json`);

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
