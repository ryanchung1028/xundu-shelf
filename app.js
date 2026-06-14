const books = window.books ?? [];
const sectionContent = new Set(["narrative"]);
const shelf = document.querySelector("#shelf");
const emptyState = document.querySelector("#emptyState");
const visibleCount = document.querySelector("#visibleCount");
const countLabel = document.querySelector("#countLabel");
const genreFilters = document.querySelector("#genreFilters");
const searchInput = document.querySelector("#searchInput");
const dialog = document.querySelector("#bookDialog");
const dialogContent = document.querySelector("#dialogContent");
const closeDialog = document.querySelector(".dialog-close");

let activeSection = "narrative";
let activeGenre = "全部";
let query = "";
let renderTimer = null;
let renderToken = 0;

const genres = [
  "全部",
  ...Array.from(
    new Set(
      books.flatMap((book) =>
        book.genre
          .split(/\s+/)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ),
  ),
];

const palette = [
  ["#223c39", "#7d2635"],
  ["#264a63", "#b8863b"],
  ["#526650", "#1f2524"],
  ["#7d2635", "#264a63"],
  ["#5d4b35", "#526650"],
];

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 },
);

function textIncludes(book, value) {
  const haystack = [book.title, book.author, book.country, book.language, book.period, book.genre]
    .join(" ")
    .toLowerCase();
  return haystack.includes(value.toLowerCase());
}

function getFilteredBooks() {
  if (!sectionContent.has(activeSection)) return [];
  return books.filter((book) => {
    const genreOk = activeGenre === "全部" || book.genre.includes(activeGenre);
    const queryOk = !query || textIncludes(book, query);
    return genreOk && queryOk;
  });
}

function fallbackCover(book, index, className = "") {
  const colors = palette[index % palette.length];
  return `
    <div class="fallback-cover ${className}" style="--fallback-a:${colors[0]};--fallback-b:${colors[1]}">
      <strong>${book.title}</strong>
      <span>${book.author}</span>
    </div>
  `;
}

function coverMarkup(book, index, className = "") {
  if (book.cover && book.coverStatus === "已核验") {
    return `<img src="${book.cover}" alt="《${book.title}》封面" loading="lazy" />`;
  }
  return fallbackCover(book, index, className);
}

function renderGenres() {
  genreFilters.innerHTML = genres
    .map(
      (genre) => `
        <button class="filter-chip ${genre === activeGenre ? "is-active" : ""}" data-genre="${genre}">
          ${genre}
        </button>
      `,
    )
    .join("");
}

function renderShelf() {
  renderToken += 1;
  const token = renderToken;
  if (renderTimer) {
    window.clearTimeout(renderTimer);
  }

  const list = getFilteredBooks();
  const isEmptySection = !sectionContent.has(activeSection);

  emptyState.hidden = !isEmptySection;
  shelf.hidden = isEmptySection;
  document.querySelector(".toolbar").hidden = isEmptySection;

  visibleCount.textContent = String(list.length);
  countLabel.textContent = activeGenre === "全部" ? "本在架" : `${activeGenre}`;

  if (isEmptySection) {
    shelf.innerHTML = "";
    return;
  }

  shelf.style.opacity = "0";
  shelf.style.transform = "translateY(8px)";

  renderTimer = window.setTimeout(() => {
    if (token !== renderToken) return;
    shelf.innerHTML = list
      .map(
        (book, index) => `
          <button class="book-card" type="button" data-id="${book.id}" style="transition-delay:${Math.min(index * 18, 260)}ms">
            <div class="book-cover">
              ${coverMarkup(book, index)}
              <span class="cover-status">${book.coverStatus === "已核验" ? "书目匹配" : "封面待核验"}</span>
            </div>
            <div>
              <h3 class="book-title">《${book.title}》</h3>
              <div class="book-meta">
                <span>${book.author} · ${book.country}</span>
                <span>${book.period}</span>
                <span class="tag-row">${book.genre
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((genre) => `<span class="tag">${genre}</span>`)
                  .join("")}</span>
              </div>
            </div>
          </button>
        `,
      )
      .join("");

    shelf.style.opacity = "1";
    shelf.style.transform = "translateY(0)";
    document.querySelectorAll(".book-card").forEach((card) => observer.observe(card));
  }, 120);
}

function openBook(id) {
  const book = books.find((item) => item.id === id);
  if (!book) return;
  const index = books.findIndex((item) => item.id === id);
  const source = book.source?.workUrl
    ? `<a class="source-link" href="${book.source.workUrl}" target="_blank" rel="noreferrer">Open Library 匹配记录</a>`
    : "无确切封面来源";

  dialogContent.innerHTML = `
    <div class="dialog-cover">${coverMarkup(book, index, "dialog-fallback")}</div>
    <div class="dialog-copy">
      <p class="eyebrow">${book.genre}</p>
      <h2>《${book.title}》</h2>
      <p>${book.author}，${book.country}，${book.language}写作。书单记录的出版/创作时间为：${book.period}。</p>
      <dl class="detail-list">
        <div><dt>作者</dt><dd>${book.author}</dd></div>
        <div><dt>国家</dt><dd>${book.country}</dd></div>
        <div><dt>语言</dt><dd>${book.language}</dd></div>
        <div><dt>体裁</dt><dd>${book.genre}</dd></div>
        <div><dt>封面</dt><dd>${book.coverStatus === "已核验" ? "Open Library 书名与作者匹配" : "待人工核验，未使用外部封面"} · ${source}</dd></div>
      </dl>
    </div>
  `;
  dialog.showModal();
}

renderGenres();
renderShelf();

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    activeSection = button.dataset.section;
    activeGenre = "全部";
    query = "";
    searchInput.value = "";
    renderGenres();
    renderShelf();
  });
});

genreFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-genre]");
  if (!button) return;
  activeGenre = button.dataset.genre;
  renderGenres();
  renderShelf();
});

searchInput.addEventListener("input", (event) => {
  query = event.target.value.trim();
  renderShelf();
});

shelf.addEventListener("click", (event) => {
  const card = event.target.closest("[data-id]");
  if (card) openBook(card.dataset.id);
});

closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
