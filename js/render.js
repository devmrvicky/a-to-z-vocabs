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
