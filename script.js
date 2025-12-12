async function getWeather(){
      const zip = document.getElementById('zipInput').value.trim();
      const country = document.getElementById('countryInput').value.trim();
      const resultBox = document.getElementById('resultBox');
      const loadingBox = document.getElementById('loadingBox');

      resultBox.style.display = 'none';
      resultBox.classList.remove('error');
      loadingBox.style.display = 'block';

      if(!zip || !country){
        loadingBox.style.display = 'none';
        resultBox.style.display = 'block';
        resultBox.classList.add('error');
        resultBox.innerHTML = 'ZIP and country are required';
        return;
      }

      const apiKey = 'e5e85ba7c1ad61e14e7ddba1f510ceaa';
      const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},${country}&appid=${apiKey}`;

      try{
        const response = await fetch(url);
        if(!response.ok){
          throw new Error('Invalid location or no data found');
        }

        const data = await response.json();

        const kelvin = data.main.temp;
        const celsius = (kelvin - 273.15).toFixed(2);
        const desc = data.weather[0].description;
        const humidity = data.main.humidity;
        const city = data.name;

        loadingBox.style.display = 'none';
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div class="weather-value"><strong>City:</strong> ${city}</div>
          <div class="weather-value"><strong>Temperature:</strong> ${celsius} °C</div>
          <div class="weather-value"><strong>Description:</strong> ${desc}</div>
          <div class="weather-value"><strong>Humidity:</strong> ${humidity}%</div>
        `;

      } catch(error){
        loadingBox.style.display = 'none';
        resultBox.style.display = 'block';
        resultBox.classList.add('error');
        resultBox.innerHTML = error.message;
      }
    }