const themeToggle = document.querySelector("#theme-toggle");
const booksGrid = document.querySelector("#books-grid");
const libraryCount = document.querySelector("#library-count");

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
  localStorage.setItem("booksDimex-theme", nextTheme);
  updateThemeButton();
});

function escapeHtml(value = "") {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));
}

function renderBooks(books) {
  libraryCount.textContent = `${books.length} ${books.length === 1 ? "libro" : "libros"} para explorar`;
  booksGrid.innerHTML = books.map((book) => {
    const cover = book.imagen
      ? `<img src="${escapeHtml(book.imagen)}" alt="Portada de ${escapeHtml(book.titulo)}" loading="lazy" />`
      : `<div class="cover-placeholder">${bookIcon}<span>Portada próximamente</span></div>`;

    return `
      <a class="book-card" href="${escapeHtml(book.enlace)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${escapeHtml(book.titulo)}">
        <div class="book-cover">${cover}</div>
        <div class="book-content">
          <h3 class="book-title">${escapeHtml(book.titulo)}</h3>
          <p class="book-author">${escapeHtml(book.autor)}</p>
        </div>
      </a>`;
  }).join("");
}

async function loadBooks() {
  try {
    const response = await fetch("data/books.json");
    if (!response.ok) throw new Error("No se pudo cargar la biblioteca");
    const books = await response.json();
    renderBooks(books);
  } catch (error) {
    libraryCount.textContent = "No disponible";
    booksGrid.innerHTML = `<p class="error-state">No pudimos cargar los libros. Comprueba que el sitio se esté ejecutando desde un servidor web.</p>`;
    console.error(error);
  }
}

updateThemeButton();
loadBooks();
