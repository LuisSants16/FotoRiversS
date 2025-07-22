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
    const newPhoto = {
      id: Date.now(),
      imageUrl: e.target.result,
      likes: 0,
      comments: []
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

    card.innerHTML = `
      <img src="${photo.imageUrl}" alt="Foto subida">
      <div class="likes">
        ❤️ ${photo.likes} 
        <button onclick="likePhoto(${photo.id})">Me gusta</button>
      </div>
      <div class="comment-section">
        <input type="text" id="name-${photo.id}" placeholder="Tu nombre (opcional)">
        <input type="text" id="comment-${photo.id}" placeholder="Escribe un comentario">
        <button onclick="addComment(${photo.id})">Comentar</button>
        <div class="comments" id="comments-${photo.id}">
          ${photo.comments.map(c => `<p><strong>${c.name}</strong>: ${c.text}</p>`).join("")}
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
