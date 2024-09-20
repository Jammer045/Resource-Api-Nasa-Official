const apiKey = 'DEMO_KEY';

let allData = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchTwoMonthsAPOD() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endDate = today;

    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        allData = await response.json();
        displayAPOD(allData);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('apod-container').innerHTML = `<p class="error">Sorry, there was an error loading the images. Please try again later.</p>`;
    }
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function filterAndDisplayAPOD() {
    const currentMonthChecked = document.getElementById('current-month').checked;
    const lastMonthChecked = document.getElementById('last-month').checked;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const cosmosType = document.getElementById('cosmos-type').value.toLowerCase();

    const today = new Date();
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const filteredData = allData.filter(item => {
        const itemDate = new Date(item.date);
        const matchesMonth = (currentMonthChecked && itemDate >= firstDayOfCurrentMonth) ||
                             (lastMonthChecked && itemDate >= firstDayOfLastMonth && itemDate < firstDayOfCurrentMonth) ||
                             (!currentMonthChecked && !lastMonthChecked);
        
        const matchesSearch = item.title.toLowerCase().includes(searchTerm);
        
        const matchesType = !cosmosType || item.explanation.toLowerCase().includes(cosmosType);

        return matchesMonth && matchesSearch && matchesType;
    });

    if (filteredData.length === 0) {
        const container = document.getElementById('apod-container');
        container.innerHTML = '<p class="text-center">No se encontraron resultados para tu búsqueda.</p>';
    } else {
        displayAPOD(filteredData);
    }

    updateResultCount(filteredData.length);
}

function updateResultCount(count) {
    const resultCountElement = document.getElementById('result-count');
    if (resultCountElement) {
        resultCountElement.textContent = `${count} resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
        resultCountElement.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Asegúrate de llamar a filterAndDisplayAPOD cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    fetchTwoMonthsAPOD().then(() => {
        filterAndDisplayAPOD();
    });
});

function displayAPOD(data) {
    const container = document.getElementById('apod-container');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p class="text-center">No images found matching your criteria.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        const isFavorite = favorites.some(fav => fav.date === item.date);
        card.innerHTML = `
            <div class="card h-100">
                <img src="${item.url}" class="card-img-top" alt="${item.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">Date: ${item.date}</p>
                    <p class="card-text flex-grow-1">${item.explanation.substring(0, 100)}...</p>
                    <a href="details.html?date=${item.date}" class="btn btn-primary mt-auto">Details</a>
                </div>
                <button class="favorite-btn" data-date="${item.date}">
                    <i class="bi ${isFavorite ? 'bi-star-fill' : 'bi-star'}"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    addFavoriteListeners();
}

function addFavoriteListeners() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });
}

function toggleFavorite(event) {
    const date = event.currentTarget.dataset.date;
    const item = allData.find(item => item.date === date);
    const index = favorites.findIndex(fav => fav.date === date);
    const icon = event.currentTarget.querySelector('i');

    if (index === -1) {
        favorites.push(item);
        icon.classList.replace('bi-star', 'bi-star-fill');
    } else {
        favorites.splice(index, 1);
        icon.classList.replace('bi-star-fill', 'bi-star');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function showFavorites() {
    const container = document.getElementById('favorites-container');
    container.innerHTML = '';

    favorites.forEach(item => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'col-md-4 mb-3 favorite-item';
        favoriteItem.innerHTML = `
            <div class="card h-100">
                <img src="${item.url}" class="card-img-top" alt="${item.title}">
                <button class="remove-favorite-btn" data-date="${item.date}">
                    <i class="bi bi-x"></i>
                </button>
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                </div>
            </div>
        `;
        container.appendChild(favoriteItem);
    });

    addRemoveFavoriteListeners();
    new bootstrap.Modal(document.getElementById('favorites-modal')).show();
}

function addRemoveFavoriteListeners() {
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
        btn.addEventListener('click', removeFavorite);
    });
}

function removeFavorite(event) {
    const date = event.currentTarget.dataset.date;
    const index = favorites.findIndex(fav => fav.date === date);
    
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        event.currentTarget.closest('.favorite-item').remove();
        
        // Actualizar el botón de favoritos en la tarjeta principal si está visible
        const mainCardFavoriteBtn = document.querySelector(`.favorite-btn[data-date="${date}"]`);
        if (mainCardFavoriteBtn) {
            mainCardFavoriteBtn.querySelector('i').classList.replace('bi-star-fill', 'bi-star');
        }
        
        // Si no quedan favoritos, cerrar el modal
        if (favorites.length === 0) {
            bootstrap.Modal.getInstance(document.getElementById('favorites-modal')).hide();
        }
    }
}

// Event Listeners
document.getElementById('current-month').addEventListener('change', filterAndDisplayAPOD);
document.getElementById('last-month').addEventListener('change', filterAndDisplayAPOD);
document.getElementById('search-input').addEventListener('input', filterAndDisplayAPOD);
document.getElementById('cosmos-type').addEventListener('change', filterAndDisplayAPOD);
document.getElementById('show-favorites').addEventListener('click', showFavorites);

fetchTwoMonthsAPOD();