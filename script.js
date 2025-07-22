// script.js

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

  photos.forEach((photo, index) => {
    const card = document.createElement("div")
    card.className = "photo-card"
    card.id = "post-" + photo.id

    card.innerHTML = `
    <img src="${photo.imageUrl}" alt="Foto subida" onclick='abrirPopup(${JSON.stringify(photo)})'>
    <p class="fecha-publicacion">📅 ${photo.date ? photo.date : "Foto antigua (sin fecha)"}</p>
    <div class="interacciones">
    <button onclick="likePhoto(${photo.id})" title="Me gusta">❤️ ${photo.likes}</button>
    <button onclick="document.getElementById('comment-${photo.id}').focus()" title="Comentar">
    💬 ${photo.comments.length}
    </button>
    <button onclick="compartirPost(${photo.id})" title="Compartir">🔗</button>
    </div>
    <div class="comment-section">
        <input type="text" id="name-${photo.id}" placeholder="Tu nombre (opcional)">
        <input type="text" id="comment-${photo.id}" placeholder="Escribe un comentario">
        <button onclick="addComment(${photo.id})">Comentar</button>
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

function addComment(id) {
  const nameInput = document.getElementById(`name-${id}`)
  const commentInput = document.getElementById(`comment-${id}`)
  const name = nameInput.value.trim() || "Anónimo"
  const text = commentInput.value.trim()

  if (text === "") return

  const photo = photos.find(p => p.id === id)
  if (photo) {
    photo.comments.push({ name, text })
    savePhotos()
    renderPhotos()
  }
}

// Inicializar al cargar
renderPhotos()

function compartirPost(id) {
  const url = window.location.href
  alert("Comparte este enlace con tus amigos:\n" + url + "#post-" + id)
}

function abrirPopup(photo) {
  const popup = document.getElementById("popup")
  const popupImage = document.getElementById("popupImage")
  const popupDetails = document.getElementById("popupDetails")

  popupImage.style.backgroundImage = `url(${photo.imageUrl})`
  popupDetails.innerHTML = `
    <p><strong>📅</strong> ${photo.date || "Sin fecha"}</p>
    <p><strong>❤️ Likes:</strong> ${photo.likes}</p>
    <div class="comments">
      <strong>💬 Comentarios:</strong>
      ${photo.comments.length === 0 ? "<p>No hay comentarios</p>" :
        photo.comments.map(c => `<p><strong>${c.name}</strong>: ${c.text}</p>`).join("")
      }
    </div>
  `

  popup.classList.remove("hidden")
}

function cerrarPopup() {
  document.getElementById("popup").classList.add("hidden")
}

