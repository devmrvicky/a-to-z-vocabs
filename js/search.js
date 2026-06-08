function filterWords() {
  const q = document.getElementById("search").value.toLowerCase().trim();

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

    if (wordText?.includes(q) || synoText?.includes(q)) {
      found = true;

      card.classList.remove("collapsed");

      card.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      card.classList.add("search-highlight");

      setTimeout(() => {
        card.classList.remove("search-highlight");
      }, 2500);
    }
  });

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
