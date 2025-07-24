let photos = JSON.parse(localStorage.getItem("photos")) || []

function savePhotos() {
  localStorage.setItem("photos", JSON.stringify(photos))
}

function uploadPhoto() {
  const fileInput = document.getElementById("photoInput")
  const file = fileInput.files[0]
  if (!file) return alert("Selecciona una foto")

  const reader = new FileReader()
  reader.onload = function (e) {
    const now = new Date()
    const formattedDate = now.toLocaleDateString("es-PE") + " " + now.toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })

    const newPhoto = {
      id: Date.now(),
      imageUrl: e.target.result,
      likes: 0,
      comments: [],
      date: formattedDate
    }
    photos.unshift(newPhoto)
    savePhotos()
    renderPhotos()
    fileInput.value = ""
  }
  reader.readAsDataURL(file)
}

function renderPhotos() {
  const container = document.getElementById("photoContainer")
  container.innerHTML = ""

  photos.forEach((photo) => {
    const card = document.createElement("div")
    card.className = "photo-card"
    card.id = "post-" + photo.id

    card.innerHTML = `
      <img src="${photo.imageUrl}" alt="Foto subida" onclick='abrirPopup(${JSON.stringify(photo)})'>
      <p class="fecha-publicacion">📅 ${photo.date ? photo.date : "Foto antigua (sin fecha)"}</p>
      <div class="acciones-post">
        <div class="acciones-izquierda">
          <button onclick="likePhoto(${photo.id})" title="Me gusta">❤️ ${photo.likes}</button>
          <button onclick="abrirPopup(${JSON.stringify(photo)})" title="Comentarios">💬 ${photo.comments.length}</button>
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
    `
    container.appendChild(card)
  })
}

function likePhoto(id) {
  const photo = photos.find(p => p.id === id)
  if (photo) {
    photo.likes += 1
    savePhotos()
    renderPhotos()
  }
}

function compartirPost(id) {
  const url = window.location.href
  alert("Comparte este enlace con tus amigos:\n" + url + "#post-" + id)
}

function abrirPopup(photo) {
  const popup = document.getElementById("popup")
  const popupImage = document.getElementById("popupImage")
  const popupDetails = document.getElementById("popupDetails")

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
}

  popupImage.src = photo.imageUrl

  popupDetails.innerHTML = `
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
                <span class="username">${c.name}</span>
                <div class="bubble">${c.text}</div>
            </div>
            `).join("")
        }
      </div>
    </div>

    <div class="comment-section-popup">
      <input type="text" id="popup-name" placeholder="Tu nombre (opcional)">
      <input type="text" id="popup-comment" placeholder="Escribe un comentario">
      <button onclick="addCommentFromPopup(${photo.id})">Comentar</button>
    </div>
  `

  popup.classList.remove("hidden")
  document.body.classList.add("popup-open")
}

function addCommentFromPopup(photoId) {
  const name = document.getElementById("popup-name").value.trim() || "Anónimo"
  const text = document.getElementById("popup-comment").value.trim()
  if (text === "") return

  const photo = photos.find(p => p.id === photoId)
  if (photo) {
    photo.comments.push({ name, text })
    savePhotos()
    abrirPopup(photo)
    renderPhotos()
  }
}

function cerrarPopup() {
  document.getElementById("popup").classList.add("hidden")
  document.body.classList.remove("popup-open")
}

function toggleMenu(photoId) {
  const targetMenu = document.getElementById(`menu-${photoId}`);
  const isOpen = !targetMenu.classList.contains("hidden");

  document.querySelectorAll(".dropdown-menu").forEach(menu => {
    menu.classList.add("hidden");
  });

  if (!isOpen) {
    targetMenu.classList.remove("hidden");
  }
}

function eliminarFoto(photoId) {
  const confirmacion = confirm("¿Estás seguro que deseas eliminar esta foto?")
  if (confirmacion) {
    photos = photos.filter(p => p.id !== photoId)
    savePhotos()
    renderPhotos()
  }
}

renderPhotos()

window.addEventListener("scroll", () => {
  document.querySelectorAll(".dropdown-menu").forEach(menu => {
    menu.classList.add("hidden");
  });
});
