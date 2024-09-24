const pokemonInput = document.getElementById("pokemonInput");
const pokemonData = document.getElementById("pokemonData");
const pokemonName = document.getElementById("pokemonName");
const pokemonImage = document.getElementById("pokemonImage");
const pokemonTypes = document.getElementById("pokemonTypes");
const pokemonAbilities = document.getElementById("pokemonAbilities");
const pokemonStats = document.getElementById("pokemonStats");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");

const pokemonCache = new Map();
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

updateSearchHistory();

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = pokemonInput.value.trim().toLowerCase();
  if (!query) return;
  await fetchPokemon(query);
  updateSearchHistory(query);
  pokemonInput.value = "";
});

async function fetchPokemon(query) {
  loading.classList.remove("hidden");
  pokemonData.classList.add("hidden");
  error.classList.add("hidden");

  if (pokemonCache.has(query)) {
    displayPokemon(pokemonCache.get(query));
    loading.classList.add("hidden");
    return;
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!response.ok) {
      throw new Error("Pokémon not found");
    }
    const data = await response.json();
    pokemonCache.set(query, data);
    displayPokemon(data);
  } catch (err) {
    showError();
  } finally {
    loading.classList.add("hidden");
  }
}

async function displayPokemon(data) {
  pokemonName.textContent = data.name;
  pokemonImage.src = await data.sprites.front_default;

  pokemonTypes.textContent = data.types
    .map((type) => type.type.name)
    .join(", ");

  pokemonAbilities.textContent = data.abilities
    .map((ability) => ability.ability.name)
    .join(", ");

  pokemonStats.innerHTML = "";
  data.stats.forEach((stat) => {
    const li = document.createElement("li");
    li.textContent = `${stat.stat.name}: ${stat.base_stat}`;
    pokemonStats.appendChild(li);
  });

  pokemonData.classList.remove("hidden");
}

function showError() {
  error.classList.remove("hidden");
}

function updateSearchHistory(query) {
  if (query) {
    if (!searchHistory.includes(query)) {
      searchHistory.push(query);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
  }

  historyList.innerHTML = "";

  searchHistory.forEach((historyItem) => {
    const li = document.createElement("li");
    li.textContent = historyItem;
    li.addEventListener("click", () => fetchPokemon(historyItem));
    historyList.appendChild(li);
  });

  clearHistoryButton.disabled = searchHistory.length === 0;
}

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem("searchHistory");
  searchHistory = [];
  updateSearchHistory();
});

updateSearchHistory();
