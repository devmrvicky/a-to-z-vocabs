createAlphabetFilters();

const savedLetter = localStorage.getItem("selectedLetter");

loadWords(savedLetter || "a");

document.getElementById("search").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    filterWords();
  }
});
