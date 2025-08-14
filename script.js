/* =========================================================
   FotoRiversS - Lógica principal
   ========================================================= */

let photos = JSON.parse(localStorage.getItem("photos")) || [];
let openPostId = null;
const MAX_CHARS = 350;

/* -------------------- Utilidades -------------------- */
function savePhotos() {
  localStorage.setItem("photos", JSON.stringify(photos));
}

function nowFormatted() {
  const now = new Date();
  return (
    now.toLocaleDateString("es-PE") +
    " " +
    now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  );
}

// == Colores para texto ==
let currentTextBg = "#f2f2f2";
let currentTextFg = "#222";

// HSL -> RGB
function hslToRgb(h, s, l){
  s /= 100; l /= 100;
  const k = n => (n + h/30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)));
  return [Math.round(255*f(0)), Math.round(255*f(8)), Math.round(255*f(4))];
}

// Determina negro/blanco según brillo (YIQ)
function idealTextColorFromRgb(r,g,b){
  const yiq = (r*299 + g*587 + b*114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}

// Aplica el color al textarea del modal
function setModalTextColor(hue){
  // puedes ajustar S y L si quieres más/menos saturación o luminosidad
  const s = 85, l = 55;                      // vibrante y medio-claro
  const [r,g,b] = hslToRgb(hue, s, l);
  currentTextBg = `rgb(${r}, ${g}, ${b})`;
  currentTextFg = idealTextColorFromRgb(r,g,b);

  const ta = document.getElementById("modalTextoInput");
  if (ta){
    ta.style.backgroundColor = currentTextBg;
    ta.style.color = currentTextFg;
  }
}

/* -------------------- Publicar (FOTO) -------------------- */
function publicar() {
  const fileInput = document.getElementById("photoInput");
  const file = fileInput?.files?.[0];

  if (!file) {
    alert("Selecciona una imagen");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const post = {
      id: Date.now(),
      imageUrl: e.target.result,
      text: null,
      likes: 0,
      comments: [],
      date: nowFormatted(),
    };
    photos.unshift(post);
    savePhotos();
    renderPhotos();
    fileInput.value = "";
  };
  reader.readAsDataURL(file);
}

/* -------------------- Publicar (TEXTO - Modal) -------------------- */

function abrirModalTexto() {
  document.getElementById("modalTexto").classList.remove("hidden");
  document.body.classList.add("popup-open");

  const ta = document.getElementById("modalTextoInput");
  const contador = document.getElementById("contador");
  if (ta) {
    ta.value = "";
    ta.setAttribute("maxlength", String(MAX_CHARS));
  }
  if (contador) contador.textContent = `0/${MAX_CHARS}`;

  const slider = document.getElementById("colorRange");
  if (slider){
    slider.value = 0;
    setModalTextColor(0);
  }
}

function cerrarModalTexto() {
  document.getElementById("modalTexto").classList.add("hidden");
  document.body.classList.remove("popup-open");
}

function actualizarContador() {
  const ta = document.getElementById("modalTextoInput");
  const contador = document.getElementById("contador");
  const text = ta.value || "";
  if (text.length > MAX_CHARS) ta.value = text.slice(0, MAX_CHARS);
  contador.textContent = `${ta.value.length}/${MAX_CHARS}`;
}

function publicarDesdeModal() {
  const text = (document.getElementById("modalTextoInput").value || "").trim();
  if (!text) { alert("Escribe algo para publicar"); return; }

  const post = {
    id: Date.now(),
    imageUrl: null,
    text,
    bgColor: currentTextBg,     // << guarda colores
    fgColor: currentTextFg,     // <<
    likes: 0,
    comments: [],
    date: nowFormatted(),
  };


  photos.unshift(post);
  savePhotos();
  renderPhotos();
  cerrarModalTexto();
}

/* -------------------- Tabs -------------------- */
function mostrarTab(tab) {
  const tabFoto = document.getElementById("tab-foto");
  if (tab === "texto") {
    abrirModalTexto();
    tabFoto.classList.add("hidden");
  } else {
    tabFoto.classList.remove("hidden");
    abrirModalFoto(); // << aquí abre la ventana emergente
  }
}

/* -------------------- Render del feed -------------------- */
function renderPhotos() {
  const container = document.getElementById("photoContainer");
  container.innerHTML = "";

  photos.forEach((photo) => {
    const card = document.createElement("div");
    card.className = "photo-card";
    card.id = "post-" + photo.id;

    // En renderPhotos(): añade loading="lazy" y data-open
    const media =
      photo.imageUrl
        ? `<img src="${photo.imageUrl}" alt="Foto subida" loading="lazy" data-open="${photo.id}">`
        : `<p class="post-texto" style="background:${photo.bgColor||'#1a1a1a'};color:${photo.fgColor||'#eee'}" data-open="${photo.id}">${escapeHtml(photo.text||"")}</p>`;

    // Listener global (una sola vez, cerca del DOMContentLoaded)
    document.addEventListener('click', (e) => {
      const id = e.target.closest('[data-open]')?.getAttribute('data-open');
      if (!id) return;
      const p = photos.find(x => String(x.id) === String(id));
      if (p) abrirPopup(p);
    });

    card.innerHTML = `
      ${media}
      <p class="fecha-publicacion">📅 ${photo.date || "Sin fecha"}</p>

      <div class="acciones-post">
        <div class="acciones-izquierda">
          <button onclick="likePhoto(${photo.id})" title="Me gusta">❤️ ${photo.likes}</button>
          <button onclick="abrirPopup(${JSON.stringify(
            photo
          )})" title="Comentarios">💬 ${photo.comments.length}</button>
          <button onclick="compartirPost(${photo.id})" title="Compartir">🔗</button>
        </div>
        <div class="acciones-derecha">
          <div class="menu-wrapper">
            <button class="menu-btn" onclick="toggleMenu(${photo.id})">⋯</button>
            <div id="menu-${photo.id}" class="dropdown-menu hidden">
              <button onclick="eliminarFoto(${photo.id})">🗑️ Eliminar</button>
              <button onclick="alert('Gracias por reportar este contenido.')">🚩 Reportar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/* -------------------- Interacciones del post -------------------- */
function likePhoto(id) {
  const p = photos.find((x) => x.id === id);
  if (!p) return;
  p.likes += 1;
  savePhotos();
  renderPhotos();
}

function compartirPost(id) {
  const url = window.location.href.split("#")[0];
  alert("Comparte este enlace con tus amigos:\n" + url + "#post-" + id);
}

function toggleMenu(photoId) {
  const target = document.getElementById(`menu-${photoId}`);
  const wasOpen = !target.classList.contains("hidden");
  document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.add("hidden"));
  if (wasOpen) return;

  target.classList.remove("hidden");
  const rect = target.getBoundingClientRect();
  target.style.top = ""; target.style.bottom = "";
  if (rect.bottom > window.innerHeight) target.style.bottom = "35px";
  else target.style.top = "35px";
}

function eliminarFoto(photoId) {
  if (!confirm("¿Estás seguro que deseas eliminar esta publicación?")) return;
  photos = photos.filter((p) => p.id !== photoId);
  savePhotos();
  renderPhotos();
}

/* -------------------- Popup -------------------- */
function abrirPopup(photo) {

  openPostId = photo.id;

  const popup = document.getElementById("popup");
  const popupImage = document.getElementById("popupImage");
  const popupTextBox = document.getElementById("popupText");     // << nuevo
  const popupDetails = document.getElementById("popupDetails");

  // Columna izquierda: imagen O texto grande
  if (photo.imageUrl) {
    // Mostrar imagen, ocultar lona de texto
    popupTextBox.classList.add("hidden");
    popupTextBox.textContent = "";

    popupImage.classList.remove("hidden");
    popupImage.onload = function () {
      const aspectRatio = popupImage.naturalWidth / popupImage.naturalHeight;
      const maxHeight = window.innerHeight * 0.85;
      if (aspectRatio > 2.5) {
        popupImage.style.height = maxHeight + "px";
        popupImage.style.width = "auto";
      } else {
        popupImage.style.height = "auto";
        popupImage.style.width = "100%";
      }
    };
    popupImage.src = photo.imageUrl;
  } else {
    // Mostrar lona de texto, ocultar imagen
    popupImage.classList.add("hidden");
    popupImage.removeAttribute("src");
    popupTextBox.classList.remove("hidden");
    popupTextBox.textContent = photo.text || "";
    popupTextBox.style.backgroundColor = photo.bgColor || "#f2f2f2";
    popupTextBox.style.color = photo.fgColor || "#222";

    popupTextBox.classList.remove("hidden");
    popupTextBox.textContent = photo.text || ""; // seguro con escapeHtml si prefieres
  }

  // Panel derecho (detalles/comentarios)
  const textBlock = ""; // ya no ponemos el texto aquí; va en la lona de la izquierda
  popupDetails.innerHTML = `
    ${textBlock}
    <p><strong>📅</strong> ${photo.date || "Sin fecha"}</p>
    <p><strong>❤️ Likes:</strong> ${photo.likes}</p>

    <div class="comments-scroll">
      <strong>💬 Comentarios:</strong>
      <div class="comments-list">
        ${
          photo.comments.length === 0
            ? "<p>No hay comentarios</p>"
            : photo.comments.map(c => `
              <div class="comment">
                <span class="username">${escapeHtml(c.name)}</span>
                <div class="bubble">${escapeHtml(c.text)}</div>
              </div>`).join("")
        }
      </div>
    </div>

    <div class="comment-section-popup">
      <input type="text" id="popup-name" placeholder="Tu nombre (opcional)">
      <input type="text" id="popup-comment" placeholder="Escribe un comentario">
      <button onclick="addCommentFromPopup(${photo.id})">Comentar</button>
    </div>
  `;

  popup.classList.remove("hidden");
  document.body.classList.add("popup-open");
}

function addCommentFromPopup(photoId) {
  const name = (document.getElementById("popup-name").value || "").trim() || "Anónimo";
  const text = (document.getElementById("popup-comment").value || "").trim();
  if (!text) return;

  const p = photos.find((x) => x.id === photoId);
  if (!p) return;

  p.comments.push({ name, text });
  savePhotos();
  abrirPopup(p); // re-render popup
  renderPhotos(); // actualiza contador 💬
}

function cerrarPopup() {

  openPostId = null;

  document.getElementById("popup").classList.add("hidden");
  document.body.classList.remove("popup-open");
}

/* -------------------- Listeners globales -------------------- */
document.addEventListener("click", (e) => {
  // Cerrar menús si hago click fuera
  if (!e.target.closest(".menu-wrapper")) {
    document.querySelectorAll(".dropdown-menu").forEach((m) => m.classList.add("hidden"));
  }
});

window.addEventListener("scroll", () => {
  document.querySelectorAll(".dropdown-menu").forEach((m) => m.classList.add("hidden"));
});

// Cerrar con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cerrarPopup();
    cerrarModalTexto();
    cerrarModalFoto();
  }
});

// Enviar comentario con ENTER cuando el foco está en #popup-comment
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'popup-comment') {
    if (openPostId !== null) {
      e.preventDefault(); // evita efectos raros
      addCommentFromPopup(openPostId);
    }
  }
});

// Inicializa el slider y el fondo del modal de texto
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("colorRange");
  if (slider){
    // estado inicial
    setModalTextColor(parseInt(slider.value || "0", 10));
    slider.addEventListener("input", (e) => {
      setModalTextColor(parseInt(e.target.value || "0", 10));
    });
  }
});

/* -------------------- Seguridad básica de texto -------------------- */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ==================== Modal CREAR FOTO ==================== */
function resetPreviewModalFoto() {
  const img = document.getElementById('previewImagen');
  const ph  = document.getElementById('previewPlaceholder');
  img.src = '';
  img.classList.add('hidden');
  ph.classList.remove('hidden');
  const input = document.getElementById('inputFotoModal');
  if (input) input.value = '';
}

function abrirModalFoto() {
  resetPreviewModalFoto();
  document.getElementById('modalFoto').classList.remove('hidden');
  document.body.classList.add('popup-open');
}

function cerrarModalFoto() {
  document.getElementById('modalFoto').classList.add('hidden');
  document.body.classList.remove('popup-open');
}

function publicarDesdeModalFoto() {
  const input = document.getElementById('inputFotoModal');
  const file = input?.files?.[0];
  if (!file) { alert('Selecciona una imagen'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const post = {
      id: Date.now(),
      imageUrl: e.target.result,
      text: null,
      likes: 0,
      comments: [],
      date: nowFormatted(),
    };
    photos.unshift(post);
    savePhotos();
    renderPhotos();
    cerrarModalFoto();
  };
  reader.readAsDataURL(file);
}

/* Preview de la imagen en el modal */
document.getElementById('inputFotoModal').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) { resetPreviewModalFoto(); return; }
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = document.getElementById('previewImagen');
    const ph  = document.getElementById('previewPlaceholder');
    img.src = ev.target.result;
    img.classList.remove('hidden');
    ph.classList.add('hidden');
  };
  reader.readAsDataURL(file);
});

document.addEventListener("DOMContentLoaded", renderPhotos);