const apiKey = 'e5e85ba7c1ad61e14e7ddba1f510ceaa'; // Note: In production, use a backend proxy.

// DOM Elements
const locationInput = document.getElementById('locationInput');
const loadingBox = document.getElementById('loadingBox');
const resultBox = document.getElementById('resultBox');
const errorBox = document.getElementById('errorBox');
const errorMessage = document.getElementById('errorMessage');
const searchHistoryContainer = document.getElementById('searchHistory');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    // Optional: Load a default city
    // fetchWeatherData('London'); 
});

// Handle Enter Key
locationInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

async function getWeather() {
    const query = locationInput.value.trim();
    if (!query) return;

    // Reset UI
    resultBox.style.display = 'none';
    errorBox.style.display = 'none';
    loadingBox.style.display = 'block';

    try {
        await fetchWeatherData(query);
        saveToHistory(query);
    } catch (error) {
        loadingBox.style.display = 'none';
        errorBox.style.display = 'block';
        errorMessage.textContent = error.message;
    }
}

async function fetchWeatherData(query) {
    let url = '';

    // Simple check: if query contains numbers and is short, treat as ZIP (this is a basic heuristic)
    // For a robust global ZIP support, checking if it's purely numeric might be better, 
    // but many UK/CA postcodes contain letters. 
    // We'll let the API decide mostly, but for US ZIPs, the API prefers `zip={zip}`.
    
    const isZip = /^\d+$/.test(query);

    if (isZip) {
        url = `https://api.openweathermap.org/data/2.5/weather?zip=${query}&appid=${apiKey}&units=metric`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Location not found. Please try again.');
    }

    const data = await response.json();
    displayWeather(data);
}

function displayWeather(data) {
    loadingBox.style.display = 'none';
    resultBox.style.display = 'block';

    // Update Elements
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('tempDisplay').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    document.getElementById('humidityDisplay').textContent = `${data.main.humidity}%`;
    document.getElementById('windDisplay').textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // m/s to km/h
    document.getElementById('feelsDisplay').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('visibilityDisplay').textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Icon
    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // Date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);

    // Scroll to result (mobile friendly)
    document.getElementById('weatherSection').scrollIntoView({ behavior: 'smooth' });
}

/* --- History Feature --- */
function saveToHistory(query) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    
    // Remove if exists (to move to top)
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    
    // Add to front
    history.unshift(query);
    
    // Limit to 5
    if (history.length > 5) history.pop();
    
    localStorage.setItem('weatherHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    searchHistoryContainer.innerHTML = '';
    
    history.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'history-chip';
        chip.textContent = city;
        chip.onclick = () => {
             locationInput.value = city;
             getWeather();
        };
        searchHistoryContainer.appendChild(chip);
    });
}