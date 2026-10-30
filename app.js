const themeToggle = document.querySelector("#theme-toggle");
const booksGrid = document.querySelector("#books-grid");
const libraryCount = document.querySelector("#library-count");
const categoryFilters = document.querySelector("#category-filters");
let allBooks = [];
let activeCategory = "todos";

const bookIcon = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5.5 5.5A2.5 2.5 0 0 1 8 3h10.5v16H8a2.5 2.5 0 0 0-2.5 2.5v-16Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M5.5 5.5A2.5 2.5 0 0 1 8 8h10.5M5.5 21.5A2.5 2.5 0 0 1 8 19h10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

function updateThemeButton() {
  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  themeToggle.querySelector(".theme-label").textContent = isDark ? "Modo claro" : "Modo oscuro";
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  try { localStorage.setItem("booksDimex-theme", nextTheme); } catch {}
  updateThemeButton();
});

function escapeHtml(value = "") {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));
}

function renderBooks(books) {
  const categoryLabel = categoryFilters.querySelector('[aria-pressed="true"]').textContent;
  libraryCount.textContent = activeCategory === "todos"
    ? `${books.length} ${books.length === 1 ? "libro" : "libros"} para explorar`
    : `${books.length} de ${allBooks.length} libros · ${categoryLabel}`;
  if (!books.length) {
    booksGrid.innerHTML = `<p class="empty-state">Todavía no hay libros en este tema. Explora los demás filtros.</p>`;
    return;
  }
  booksGrid.innerHTML = books.map((book) => {
    const resource = book.recurso || (/\.pdf(?:$|[?#])/i.test(book.enlace) ? "PDF" : "Página externa");
    const placeholder = `<div class="cover-placeholder" aria-hidden="true">${bookIcon}<span>Portada no disponible</span></div>`;
    const cover = book.imagen
      ? `${placeholder}<img src="${escapeHtml(book.imagen)}" alt="Portada de ${escapeHtml(book.titulo)}" loading="lazy" decoding="async" />`
      : placeholder;

    return `
      <a class="book-card" href="${escapeHtml(book.enlace)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(resource)} · Se abre en una pestaña nueva" aria-label="Abrir ${escapeHtml(book.titulo)}, de ${escapeHtml(book.autor)} (${escapeHtml(resource)}, nueva pestaña)">
        <div class="book-cover">${cover}</div>
        <div class="book-content">
          <h3 class="book-title">${escapeHtml(book.titulo)}</h3>
          <p class="book-author">${escapeHtml(book.autor)}</p>
        </div>
      </a>`;
  }).join("");
  booksGrid.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => image.remove(), { once: true });
  });
}

function applyFilter() {
  renderBooks(activeCategory === "todos"
    ? allBooks
    : allBooks.filter((book) => book.categoria === activeCategory));
}

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button || button.disabled) return;
  activeCategory = button.dataset.category;
  categoryFilters.querySelectorAll("button").forEach((filter) => {
    filter.setAttribute("aria-pressed", String(filter === button));
  });
  applyFilter();
});

async function loadBooks() {
  booksGrid.setAttribute("aria-busy", "true");
  libraryCount.textContent = "Cargando libros...";
  booksGrid.innerHTML = `<div class="loading-state">Preparando tu biblioteca<span class="loading-dots">...</span></div>`;
  categoryFilters.querySelectorAll("button").forEach((button) => { button.disabled = true; });
  try {
    const response = await fetch("data/books.json");
    if (!response.ok) throw new Error("No se pudo cargar la biblioteca");
    allBooks = await response.json();
    applyFilter();
    categoryFilters.querySelectorAll("button").forEach((button) => { button.disabled = false; });
  } catch (error) {
    libraryCount.textContent = "No disponible";
    booksGrid.innerHTML = `<div class="error-state">No pudimos cargar la biblioteca. Vuelve a intentarlo.<button class="retry-button" id="retry-books" type="button">Reintentar</button></div>`;
    booksGrid.querySelector("#retry-books").addEventListener("click", loadBooks);
    console.error(error);
  } finally {
    booksGrid.setAttribute("aria-busy", "false");
  }
}

updateThemeButton();
loadBooks();
