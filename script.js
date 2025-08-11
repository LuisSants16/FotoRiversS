/* =========================================================
   FotoRiversS - Lógica principal
   ========================================================= */

let photos = JSON.parse(localStorage.getItem("photos")) || [];

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
  document.getElementById("modalTextoInput").value = "";
  document.getElementById("contador").textContent = "0";
}

function cerrarModalTexto() {
  document.getElementById("modalTexto").classList.add("hidden");
}

function actualizarContador() {
  const text = document.getElementById("modalTextoInput").value || "";
  document.getElementById("contador").textContent = text.length;
}

function publicarDesdeModal() {
  const text = (document.getElementById("modalTextoInput").value || "").trim();
  if (!text) {
    alert("Escribe algo para publicar");
    return;
  }

  const post = {
    id: Date.now(),
    imageUrl: null,
    text,
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

    const media =
      photo.imageUrl
        ? `<img src="${photo.imageUrl}" alt="Foto subida" onclick='abrirPopup(${JSON.stringify(
            photo
          )})'>`
        : `<p class="post-texto" onclick='abrirPopup(${JSON.stringify(
            photo
          )})'>${escapeHtml(photo.text || "")}</p>`;

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
  const isOpen = !target.classList.contains("hidden");
  document.querySelectorAll(".dropdown-menu").forEach((m) => m.classList.add("hidden"));
  if (!isOpen) target.classList.remove("hidden");
}

function eliminarFoto(photoId) {
  if (!confirm("¿Estás seguro que deseas eliminar esta publicación?")) return;
  photos = photos.filter((p) => p.id !== photoId);
  savePhotos();
  renderPhotos();
}

/* -------------------- Popup -------------------- */
function abrirPopup(photo) {
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

/* Abrir modal desde el botón del tab */
document.getElementById('btnAbrirModalFoto')
  .addEventListener('click', abrirModalFoto);


/* -------------------- Inicio -------------------- */
renderPhotos();
