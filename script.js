let cafes = [];
let map;
let markers = [];


// Hämta cafédata
fetch("cafes.json")
  .then(res => res.json())
  .then(data => {
    cafes = data;
    initMap();
    renderCafes(cafes);
    renderMarkers(cafes);
  });

const container = document.getElementById("cafe-container");
const buttons = document.querySelectorAll(".filters button");
const showAllBtn = document.getElementById("showAll");

// Filtreringsknappar
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    applyFilter(filter);
  });
});

// Publik skärmikon
const SCREEN_ICON = L.icon({
  iconUrl: "bilder/pin1.png",
  iconSize: [60, 60],
  iconAnchor: [24, 48],
  popupAnchor: [0, -40],
});

const SCREEN_LOCATION = [56.878785, 14.805145];

function initMap() {
  map = L.map("map").setView(SCREEN_LOCATION, 30);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(map);

  // Publik skärmmarkör
  L.marker(SCREEN_LOCATION, { icon: SCREEN_ICON })
    .addTo(map)
    .bindPopup("<strong>Du är här</strong><br>Stortorget, Växjö")
    .openPopup();
  // Visa koordinater i konsolen vid klick
  map.on("click", function (e) {
    console.log("Klickade på:", e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
  });
}

// 🔹 Rendera markörer
function renderMarkers(list) {
  markers.forEach(m => m.remove());
  markers = [];

  list.forEach(cafe => {
    const marker = L.marker([cafe.lat, cafe.lng])
      .addTo(map)
      .bindPopup(`<strong>${cafe.name}</strong><br>${cafe.price} – ${cafe.open ? "Öppet" : "Stängt"}`);

    // Klick på markör → visa kortet
    marker.on("click", () => {
      map.setView([cafe.lat, cafe.lng], 17);
      highlightCard(cafe.id);
    });

    markers.push(marker);
  });
}

// Visa endast valt kort + gör kartan mindre
function highlightCard(cafeId) {
  const allCards = document.querySelectorAll(".card");
  const mapElement = document.getElementById("map");

  allCards.forEach(card => {
    const isMatch = card.dataset.id == cafeId;
    const closeBtn = card.querySelector(".close-btn");

    if (isMatch) {
      card.classList.add("active");
      card.classList.remove("hidden");
      if (closeBtn) closeBtn.style.display = "block";
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      card.classList.add("hidden");
      card.classList.remove("active");
      if (closeBtn) closeBtn.style.display = "none";
    }
  });

  mapElement.classList.add("map-small");
}

//  Stäng aktivt kort och återställ
function closeActiveCard() {
  const mapElement = document.getElementById("map");

  document.querySelectorAll(".card").forEach(card => {
    card.classList.remove("active", "hidden");
    const closeBtn = card.querySelector(".close-btn");
    if (closeBtn) closeBtn.style.display = "none";
  });

  mapElement.classList.remove("map-small");
  map.setView(SCREEN_LOCATION, 15, { animate: true });
}

//  Visa alla kort igen (om knapp finns)
if (showAllBtn) {
  showAllBtn.addEventListener("click", closeActiveCard);
}

// Rendera kafékort
function renderCafes(list) {
  container.innerHTML = list.map(cafe => `
    <div class="card" data-id="${cafe.id}">
      <button class="close-btn" onclick="closeActiveCard()">×</button>

      <img src="${cafe.img}" alt="${cafe.name}">
      <div class="card-content">
        <h2>${cafe.name}</h2>
        <p class="address"><strong>Adress:</strong> ${cafe.address}</p>
        <p class="distance"><strong>Avstånd:</strong> ${cafe.distance} m</p>
        <p class="hours"><strong>Öppettider:</strong> ${cafe.hours}</p>

        <div class="features">
          <strong>Utbud:</strong>
          <div class="feature-icons">
            ${cafe.features.map(f => featureImage(f)).join("")}
          </div>
        </div>

        ${cafe.offers && cafe.offers.length > 0 ? `
          <div class="offers">
            <strong>Erbjudanden:</strong>
            <div class="offer-images">
              ${cafe.offers.map(o => `
                <div class="offer-item">
                  <img src="${o.img}" alt="${o.title}" title="${o.title}">
                  <p>${o.title}</p>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div class="status ${cafe.open ? "open" : "closed"}"></div>
      </div>
    </div>
  `).join("");
}

// 🔹 Funktion för ikoner (wifi, wc, tyst osv.)
function featureImage(f) {
  const base = "bilder";
  const size = 70;

  switch (f) {
    case "wifi": return `<img src="${base}/wifi.png" alt="Wifi" width="${size}" height="${size}" title="Wifi">`;
    case "wc": return `<img src="${base}/toalett.png" alt="Toalett" width="${size}" height="${size}" title="Toalett">`;
    case "quiet": return `<img src="${base}/tyst.png" alt="Tyst miljö" width="${size}" height="${size}" title="Tyst miljö">`;
    default: return "";
  }
}

//  Filtrering
function applyFilter(type) {
  let filtered = cafes;
  if (type === "open") filtered = cafes.filter(c => c.open);
  if (type === "wifi") filtered = cafes.filter(c => c.features.includes("wifi"));
  renderCafes(filtered);
  renderMarkers(filtered);
}

// 🔍 SÖKFUNKTION
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase().trim();
    const filtered = cafes.filter(cafe =>
      cafe.name.toLowerCase().includes(term) ||
      cafe.address.toLowerCase().includes(term) ||
      cafe.features.some(f => f.toLowerCase().includes(term))
    );

    renderCafes(filtered);
    renderMarkers(filtered);

    const mapElement = document.getElementById("map");
    if (term.length > 0 && filtered.length > 0) {
      mapElement.classList.add("map-small");
    } else {
      mapElement.classList.remove("map-small");
    }
  });
}



/* utan interaktion */
let timeout;

function resetTimer() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    window.location.href = "index.html"; 
  }, 600000); 
}


window.onload = resetTimer;
["mousemove", "keydown", "click", "touchstart"].forEach(evt => {
  document.addEventListener(evt, resetTimer);
});
