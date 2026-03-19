const API_KEY = "17bf2f8a2d734c7a6884a4960b345360";

const base_url = "https://api.themoviedb.org/3";
const img_url = "https://image.tmdb.org/t/p/w500";

const rowsContainer = document.getElementById("rows");
const searchInput = document.getElementById("search");
const dropdown = document.getElementById("search-dropdown");

function login() {
  const username = document.getElementById("username").value;
  if (!username) return alert("Enter username");
  localStorage.setItem("user", username);
  location.reload();
}

function logout() {
  localStorage.clear();
  location.reload();
}

if (!localStorage.getItem("user")) {
  document.getElementById("app").style.display = "none";
} else {
  document.getElementById("login-page").style.display = "none";
}


searchInput.addEventListener("input", async () => {
  const query = searchInput.value;

  if (query.length < 2) {
    dropdown.style.display = "none";
    return;
  }

  const res = await fetch(`${base_url}/search/movie?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();

  dropdown.innerHTML = data.results
    .filter(m => m.poster_path)
    .slice(0,5)
    .map(movie => `
      <div class="search-item" onclick="playTrailer(${movie.id})">
        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}">
        <span>${movie.title}</span>
      </div>
    `).join("");

  dropdown.style.display = "block";
});


const requests = [
  { title: "Trending", url: `/trending/movie/week?api_key=${API_KEY}` },
  { title: "Hindi Movies", url: `/discover/movie?api_key=${API_KEY}&with_original_language=hi` },
  { title: "Telugu Movies", url: `/discover/movie?api_key=${API_KEY}&with_original_language=te` }
];

async function loadRows() {
  for (let req of requests) {
    const res = await fetch(base_url + req.url);
    const data = await res.json();

    const row = document.createElement("div");

    row.innerHTML = `
      <h2>${req.title}</h2>
      <div class="row-posters">
        ${data.results.filter(m=>m.poster_path).map(movie => `
          <img src="${img_url + movie.poster_path}" 
               class="poster"
               onclick="playTrailer(${movie.id})">
        `).join("")}
      </div>
    `;

    rowsContainer.appendChild(row);
  }
}

loadRows();


async function playTrailer(id) {
  try {
    let res = await fetch(`${base_url}/movie/${id}/videos?api_key=${API_KEY}`);
    let data = await res.json();

    let trailer = data.results.find(v => v.site === "YouTube");

    if (!trailer) {
      res = await fetch(`${base_url}/tv/${id}/videos?api_key=${API_KEY}`);
      data = await res.json();
      trailer = data.results.find(v => v.site === "YouTube");
    }

    if (trailer) {
      document.getElementById("video").src =
        `https://www.youtube.com/embed/${trailer.key}`;
      document.getElementById("popup").style.display = "flex";
    } else {
      alert("Trailer not available");
    }

  } catch (e) {
    console.log(e);
    alert("Error loading trailer");
  }
}


document.getElementById("close").onclick = () => {
  document.getElementById("popup").style.display = "none";
  document.getElementById("video").src = "";
};