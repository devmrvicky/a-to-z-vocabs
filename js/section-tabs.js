let currentSection = "vocabs";

function switchSection(section, btn) {
  currentSection = section;

  document
    .querySelectorAll(".section-tab")
    .forEach((tab) => tab.classList.remove("active"));

  btn.classList.add("active");

  if (section === "vocabs") {
    const savedLetter = localStorage.getItem("selectedLetter") || "a";

    loadWords(savedLetter);

    document.getElementById("alphabetFilter").style.display = "flex";
  } else {
    loadSection(section);

    document.getElementById("alphabetFilter").style.display = "none";
  }
}

async function loadSection(section) {
  try {
    const response = await fetch(`./data/${section}/${section}.json`);

    const data = await response.json();

    renderCards(data);
  } catch (error) {
    console.error(error);
  }
}
