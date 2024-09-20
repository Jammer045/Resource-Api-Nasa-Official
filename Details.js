const apiKey = 'xnZPfpFePyUaAVIDEhOgyeQGEOZMCJZggJD3gLJm';

async function fetchImageDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');

    if (!date) {
        displayError('No date provided');
        return;
    }

    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Error in API response');
        }
        const data = await response.json();
        displayDetails(data);
    } catch (error) {
        console.error('Error:', error);
        displayError('Sorry, there was an error loading the image details. Please try again later.');
    }
}

function displayDetails(item) {
    const container = document.getElementById('details-container');
    container.innerHTML = `
        <div class="col-md-6 mb-4">
            <img src="${item.url}" class="details-image" alt="${item.title}">
        </div>
        <div class="col-md-6">
            <div class="details-content">
                <h2 class="details-title">${item.title}</h2>
                <p class="details-date">Date: ${item.date}</p>
                <p class="details-explanation">${item.explanation}</p>
                ${item.copyright ? `<p class="details-copyright">Copyright: ${item.copyright}</p>` : ''}
                <p>Media Type: ${item.media_type}</p>
                ${item.hdurl ? `<a href="${item.hdurl}" target="_blank" class="btn btn-secondary">View HD Image</a>` : ''}
            </div>
        </div>
    `;
}

function displayError(message) {
    const container = document.getElementById('details-container');
    container.innerHTML = `<div class="col-12"><p class="text-center text-danger">${message}</p></div>`;
}

fetchImageDetails();