 const state = {
            weather: null,
            forecast: [],
            particles: [],
            unit: 'C',
            language: 'en',
            isListening: false,
            map: null,
            aqi: null,
            selectedDate: null,
            tempChart: null,
            rainChart: null
        };

        const translations = {
            en: {
                voiceAssistant: 'Voice Assistant',
                listening: 'Listening...',
                searchPlaceholder: 'Search for a city...'
            },
            hi: {
                voiceAssistant: 'वॉयस असिस्टेंट',
                listening: 'सुन रहा है...',
                searchPlaceholder: 'शहर खोजें...'
            },
            bn: {
                voiceAssistant: 'ভয়েস সহায়ক',
                listening: 'শুনছি...',
                searchPlaceholder: 'শহর খুঁজুন...'
            },
            es: {
                voiceAssistant: 'Asistente de Voz',
                listening: 'Escuchando...',
                searchPlaceholder: 'Buscar una ciudad...'
            },
            fr: {
                voiceAssistant: 'Assistant Vocal',
                listening: 'Écoute...',
                searchPlaceholder: 'Rechercher une ville...'
            }
        };

        // Initialize
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadDemoData();
                initParticles();
                animateParticles();
                createCharts();
                checkNightMode();
                initDatePicker();
                
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('app').classList.remove('hidden');
                
                // Initialize map after UI is visible
                setTimeout(() => {
                    initMap();
                }, 500);
            }, 1000);
        });

        // Date Picker
        function initDatePicker() {
            const datePicker = document.getElementById('date-picker');
            const today = new Date();
            const maxDate = new Date();
            maxDate.setDate(today.getDate() + 14);

            datePicker.min = today.toISOString().split('T')[0];
            datePicker.max = maxDate.toISOString().split('T')[0];
            datePicker.value = today.toISOString().split('T')[0];

            datePicker.addEventListener('change', (e) => {
                const selectedDate = new Date(e.target.value);
                const daysDiff = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysDiff >= 0 && daysDiff < state.forecast.length) {
                    loadWeatherForDate(daysDiff);
                } else {
                    loadWeatherForDate(daysDiff);
                }
            });
        }

        function loadWeatherForDate(dayIndex) {
            if (dayIndex === 0) {
                loadDemoData();
                updateUI();
                updateAQI();
                displayAlerts([]);
                createCharts();
                return;
            }

            const baseForecast = state.forecast[Math.min(dayIndex, state.forecast.length - 1)];
            
            state.weather.temp = baseForecast.high - 2;
            state.weather.condition = baseForecast.icon === '☀️' ? 'sunny' : 
                                     baseForecast.icon === '🌧️' ? 'rain' : 
                                     baseForecast.icon === '❄️' ? 'snow' : 'cloudy';
            state.weather.description = baseForecast.icon === '☀️' ? 'Clear Sky' : 
                                       baseForecast.icon === '🌧️' ? 'Rainy' : 
                                       baseForecast.icon === '❄️' ? 'Snowy' : 'Cloudy';
            state.weather.feelsLike = state.weather.temp - 2;
            state.weather.humidity = 50 + Math.floor(Math.random() * 30);
            state.weather.windSpeed = 5 + Math.floor(Math.random() * 20);
            state.weather.visibility = 8 + Math.floor(Math.random() * 5);
            state.weather.pressure = 1000 + Math.floor(Math.random() * 30);

            const latitude = state.weather.lat;
            let sunriseHour, sunriseMin, sunsetHour, sunsetMin;
            
            if (latitude > 23) {
                sunriseHour = 5 + Math.floor(Math.random() * 2);
                sunsetHour = 18 + Math.floor(Math.random() * 2);
            } else if (latitude > -23) {
                sunriseHour = 6;
                sunsetHour = 18;
            } else {
                sunriseHour = 5 + Math.floor(Math.random() * 3);
                sunsetHour = 17 + Math.floor(Math.random() * 2);
            }
            
            sunriseMin = Math.floor(Math.random() * 60);
            sunsetMin = Math.floor(Math.random() * 60);
            
            state.weather.sunrise = `${sunriseHour}:${sunriseMin.toString().padStart(2, '0')} AM`;
            state.weather.sunset = `${sunsetHour - 12}:${sunsetMin.toString().padStart(2, '0')} PM`;

            const futureAqi = 30 + Math.floor(Math.random() * 120);
            state.aqi.index = futureAqi;
            
            if (futureAqi <= 50) {
                state.aqi.category = 'Good';
                state.aqi.healthSuggestion = '✅ Air quality is expected to be satisfactory.';
            } else if (futureAqi <= 100) {
                state.aqi.category = 'Moderate';
                state.aqi.healthSuggestion = '⚠️ Air quality will be acceptable for most people.';
            } else {
                state.aqi.category = 'Unhealthy';
                state.aqi.healthSuggestion = '🚨 Air quality may be unhealthy. Plan indoor activities.';
            }

            state.aqi.pm25 = Math.floor(futureAqi * 0.5) + 5;
            state.aqi.pm10 = Math.floor(futureAqi * 0.8) + 10;
            state.aqi.co = (Math.random() * 2 + 0.1).toFixed(1);
            state.aqi.no2 = Math.floor(futureAqi * 0.6) + 5;

            updateUI();
            updateAQI();
            initParticles();
            createCharts();
            
            const dateStr = new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).toLocaleDateString();
            displayAlerts([{
                type: 'info',
                message: `📅 Showing weather forecast for ${dateStr}`
            }]);
        }

        // Demo Data
        function loadDemoData() {
            state.weather = {
                city: 'San Francisco',
                temp: 18,
                condition: 'cloudy',
                description: 'Partly Cloudy',
                humidity: 65,
                windSpeed: 12,
                visibility: 10,
                pressure: 1013,
                feelsLike: 16,
                sunrise: '6:30 AM',
                sunset: '7:45 PM',
                lat: 37.7749,
                lon: -122.4194
            };

            state.aqi = {
                index: 42,
                category: 'Good',
                pm25: 12,
                pm10: 25,
                co: 0.3,
                no2: 18,
                healthSuggestion: '✅ Air quality is satisfactory. Enjoy outdoor activities!'
            };

            state.forecast = [
                { day: 'Mon', high: 20, low: 14, icon: '☀️', rainProb: 10 },
                { day: 'Tue', high: 19, low: 13, icon: '⛅', rainProb: 20 },
                { day: 'Wed', high: 17, low: 12, icon: '🌧️', rainProb: 80 },
                { day: 'Thu', high: 18, low: 13, icon: '☁️', rainProb: 30 },
                { day: 'Fri', high: 21, low: 15, icon: '☀️', rainProb: 5 },
                { day: 'Sat', high: 22, low: 16, icon: '☀️', rainProb: 0 },
                { day: 'Sun', high: 20, low: 14, icon: '⛅', rainProb: 15 }
            ];

            updateUI();
            updateAQI();
            displayAlerts([]);
        }

        // Update UI
        function updateUI() {
            const { weather, forecast } = state;
            const unit = state.unit === 'C' ? '°C' : '°F';
            
            const temp = state.unit === 'C' ? weather.temp : (weather.temp * 9/5) + 32;
            const feelsLike = state.unit === 'C' ? weather.feelsLike : (weather.feelsLike * 9/5) + 32;

            document.getElementById('location').textContent = weather.city;
            
            // Update temperature with special styling for cold temps
            const tempElement = document.getElementById('temperature');
            tempElement.textContent = `${Math.round(temp)}${unit}`;
            tempElement.className = 'temperature';
            if (weather.temp < 0) {
                tempElement.classList.add('freezing');
            } else if (weather.temp < 10) {
                tempElement.classList.add('cold');
            }
            
            document.getElementById('description').textContent = weather.description;
            document.getElementById('feels-like').textContent = `Feels like ${Math.round(feelsLike)}${unit}`;
            document.getElementById('humidity').textContent = `${weather.humidity}%`;
            document.getElementById('wind-speed').textContent = `${weather.windSpeed} km/h`;
            document.getElementById('visibility').textContent = `${weather.visibility} km`;
            document.getElementById('pressure').textContent = `${weather.pressure} hPa`;
            document.getElementById('sunrise').textContent = weather.sunrise;
            document.getElementById('sunset').textContent = weather.sunset;

            const iconMap = {
                sunny: '☀️',
                cloudy: '☁️',
                rain: '🌧️',
                snow: '❄️'
            };
            document.getElementById('main-icon').textContent = iconMap[weather.condition] || '☁️';

            const container = document.getElementById('app');
            container.className = `weather-container ${weather.condition}`;

            const forecastGrid = document.getElementById('forecast-grid');
            forecastGrid.innerHTML = forecast.map((day, idx) => {
                const high = state.unit === 'C' ? day.high : (day.high * 9/5) + 32;
                const low = state.unit === 'C' ? day.low : (day.low * 9/5) + 32;
                return `
                <div class="forecast-item" style="animation-delay: ${idx * 50}ms">
                    <div class="forecast-day">${day.day}</div>
                    <div class="forecast-icon">${day.icon}</div>
                    <div class="forecast-temp-high">${Math.round(high)}°</div>
                    <div class="forecast-temp-low">${Math.round(low)}°</div>
                    <div class="rain-probability">💧 ${day.rainProb}%</div>
                </div>
            `}).join('');
        }

        // Update AQI
        function updateAQI() {
            const { aqi } = state;
            
            document.getElementById('aqi-number').textContent = aqi.index;
            document.getElementById('aqi-label').textContent = aqi.category;
            document.getElementById('pm25').textContent = `${aqi.pm25} µg/m³`;
            document.getElementById('pm10').textContent = `${aqi.pm10} µg/m³`;
            document.getElementById('co').textContent = `${aqi.co} ppm`;
            document.getElementById('no2').textContent = `${aqi.no2} µg/m³`;
            document.getElementById('health-suggestion').textContent = aqi.healthSuggestion;

            const aqiElement = document.getElementById('aqi-number');
            aqiElement.className = 'aqi-number';
            
            if (aqi.index <= 50) {
                aqiElement.classList.add('aqi-good');
            } else if (aqi.index <= 100) {
                aqiElement.classList.add('aqi-moderate');
            } else if (aqi.index <= 200) {
                aqiElement.classList.add('aqi-unhealthy');
            } else {
                aqiElement.classList.add('aqi-hazardous');
            }
        }

        // Display Alerts
        function displayAlerts(alerts) {
            const container = document.getElementById('alerts-container');
            if (alerts && alerts.length > 0) {
                container.innerHTML = alerts.map(alert => `
                    <div class="alerts-banner">
                        <div class="alert-icon">⚠️</div>
                        <div class="alert-text">${alert.message}</div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '';
            }
        }

        // Night Mode
        function checkNightMode() {
            const hour = new Date().getHours();
            if (hour >= 20 || hour < 6) {
                document.body.classList.add('night-mode');
            }
        }

        // Particles
        function initParticles() {
            const canvas = document.getElementById('particles-canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const count = state.weather.condition === 'rain' ? 100 : 
                         state.weather.condition === 'snow' ? 80 : 50;

            state.particles = [];
            for (let i = 0; i < count; i++) {
                state.particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: state.weather.condition === 'rain' ? Math.random() * 5 + 3 :
                            state.weather.condition === 'snow' ? Math.random() * 2 + 1 :
                            Math.random() * 0.5,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }

        function animateParticles() {
            const canvas = document.getElementById('particles-canvas');
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            state.particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.y > canvas.height) {
                    p.y = 0;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x < 0 || p.x > canvas.width) {
                    p.x = Math.random() * canvas.width;
                }
            });

            requestAnimationFrame(animateParticles);
        }

        // Initialize Map - FIXED VERSION WITH BETTER ERROR HANDLING
        function initMap() {
            const { weather } = state;
            
            const mapElement = document.getElementById('weather-map');
            if (!mapElement) {
                console.error('Map element not found');
                return;
            }

            // Ensure container is ready
            if (mapElement.offsetWidth === 0) {
                console.log('Map container not ready, retrying...');
                setTimeout(() => initMap(), 200);
                return;
            }

            // Remove existing map if any
            if (state.map) {
                try {
                    state.map.off();
                    state.map.remove();
                } catch (e) {
                    console.log('Map removal:', e);
                }
                state.map = null;
            }

            // Clear any existing content
            mapElement.innerHTML = '';

            try {
                // Create map with proper initialization
                state.map = L.map('weather-map', {
                    center: [weather.lat, weather.lon],
                    zoom: 10,
                    zoomControl: true,
                    scrollWheelZoom: true,
                    dragging: true
                });

                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                    minZoom: 3
                }).addTo(state.map);

                // Add custom weather marker
                const weatherIcon = L.divIcon({
                    className: 'custom-weather-marker',
                    html: `<div style="font-size: 40px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));">${document.getElementById('main-icon').textContent}</div>`,
                    iconSize: [50, 50],
                    iconAnchor: [25, 25]
                });

                const marker = L.marker([weather.lat, weather.lon], {
                    icon: weatherIcon,
                    title: weather.city
                }).addTo(state.map);
                
                // Create detailed popup
                const tempDisplay = state.unit === 'C' ? 
                    `${weather.temp}°C` : 
                    `${Math.round((weather.temp * 9/5) + 32)}°F`;
                
                marker.bindPopup(`
                    <div style="text-align: center; padding: 8px; min-width: 150px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">${document.getElementById('main-icon').textContent}</div>
                        <b style="font-size: 18px; display: block; margin-bottom: 4px;">${weather.city}</b>
                        <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 4px 0;">${tempDisplay}</div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">${weather.description}</div>
                        <div style="font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 4px; margin-top: 4px;">
                            💧 ${weather.humidity}% | 💨 ${weather.windSpeed} km/h
                        </div>
                    </div>
                `).openPopup();

                // Add weather condition circle
                const circleColor = weather.condition === 'rain' ? '#3b82f6' : 
                                   weather.condition === 'sunny' ? '#fb923c' : 
                                   weather.condition === 'snow' ? '#93c5fd' : '#6b7280';

                L.circle([weather.lat, weather.lon], {
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: 0.2,
                    radius: 20000,
                    weight: 2
                }).addTo(state.map);

                // Add wind direction indicator (pointing in wind direction)
                const windEndLat = weather.lat + 0.08 * Math.cos(Math.random() * Math.PI * 2);
                const windEndLon = weather.lon + 0.08 * Math.sin(Math.random() * Math.PI * 2);
                
                L.polyline([
                    [weather.lat, weather.lon],
                    [windEndLat, windEndLon]
                ], {
                    color: 'white',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '10, 5'
                }).addTo(state.map);

                // Add arrow head for wind direction
                L.circleMarker([windEndLat, windEndLon], {
                    radius: 6,
                    fillColor: 'white',
                    fillOpacity: 0.9,
                    color: 'white',
                    weight: 2
                }).addTo(state.map).bindTooltip(`Wind: ${weather.windSpeed} km/h`, {
                    permanent: false,
                    direction: 'top'
                });

                // Force map to render properly with multiple attempts
                setTimeout(() => {
                    if (state.map) {
                        state.map.invalidateSize();
                    }
                }, 100);
                
                setTimeout(() => {
                    if (state.map) {
                        state.map.invalidateSize();
                        state.map.setView([weather.lat, weather.lon], 10);
                    }
                }, 400);

                console.log('Map initialized successfully for', weather.city);
            } catch (error) {
                console.error('Map initialization error:', error);
                // Fallback display
                mapElement.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(255,255,255,0.1); border-radius: 1rem; color: white; font-size: 18px;">
                        <div style="text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 15px;">🗺️</div>
                            <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${weather.city}</div>
                            <div style="font-size: 16px; opacity: 0.9; margin-bottom: 8px;">${weather.description}</div>
                            <div style="font-size: 14px; opacity: 0.7;">
                                📍 Lat: ${weather.lat.toFixed(4)}, Lon: ${weather.lon.toFixed(4)}
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Create Charts - FIXED VERSION
        function createCharts() {
            // Destroy existing charts
            if (state.tempChart) {
                state.tempChart.destroy();
                state.tempChart = null;
            }
            if (state.rainChart) {
                state.rainChart.destroy();
                state.rainChart = null;
            }

            const baseTemp = state.weather.temp;
            
            // Generate realistic 24-hour temperature data (every 3 hours)
            const tempData = [];
            const hourLabels = [];
            
            // Temperature variation based on weather condition
            let tempVariation = 5; // Default variation
            if (state.weather.condition === 'sunny') {
                tempVariation = 8; // Larger day-night variation
            } else if (state.weather.condition === 'cloudy') {
                tempVariation = 4; // Smaller variation
            } else if (state.weather.condition === 'rain') {
                tempVariation = 3; // Minimal variation
            }
            
            for (let hour = 0; hour < 24; hour += 3) {
                let temp;
                // Simulate realistic daily temperature cycle
                if (hour === 0 || hour === 21) temp = baseTemp - tempVariation * 0.8;      // Midnight/9PM - cool
                else if (hour === 3) temp = baseTemp - tempVariation;                      // 3 AM - coldest
                else if (hour === 6) temp = baseTemp - tempVariation * 0.6;                // 6 AM - sunrise
                else if (hour === 9) temp = baseTemp;                                      // 9 AM - warming
                else if (hour === 12) temp = baseTemp + tempVariation * 0.6;               // Noon - hot
                else if (hour === 15) temp = baseTemp + tempVariation * 0.8;               // 3 PM - hottest
                else if (hour === 18) temp = baseTemp + tempVariation * 0.2;               // 6 PM - cooling
                
                // Convert to selected unit
                const displayTemp = state.unit === 'C' ? Math.round(temp) : Math.round((temp * 9/5) + 32);
                tempData.push(displayTemp);
                
                // Format hour labels
                const ampm = hour < 12 ? 'AM' : 'PM';
                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                hourLabels.push(`${displayHour}${ampm}`);
            }

            // Temperature Chart
            const tempCtx = document.getElementById('temp-chart');
            if (tempCtx) {
                state.tempChart = new Chart(tempCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: hourLabels,
                        datasets: [{
                            label: `Temperature (°${state.unit})`,
                            data: tempData,
                            borderColor: 'rgba(251, 146, 60, 1)',
                            backgroundColor: 'rgba(251, 146, 60, 0.2)',
                            tension: 0.4,
                            fill: true,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            pointBackgroundColor: 'rgba(251, 146, 60, 1)',
                            pointBorderColor: 'white',
                            pointBorderWidth: 2,
                            pointHoverBackgroundColor: 'rgba(251, 146, 60, 1)',
                            pointHoverBorderColor: 'white',
                            pointHoverBorderWidth: 3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        plugins: {
                            legend: { 
                                display: true,
                                labels: { 
                                    color: 'white',
                                    font: { size: 14, weight: 'bold' },
                                    padding: 15
                                } 
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                titleColor: 'white',
                                bodyColor: 'white',
                                borderColor: 'rgba(251, 146, 60, 1)',
                                borderWidth: 2,
                                padding: 12,
                                displayColors: false,
                                titleFont: { size: 14, weight: 'bold' },
                                bodyFont: { size: 13 },
                                callbacks: {
                                    title: (context) => `${context[0].label}`,
                                    label: (context) => `Temperature: ${context.parsed.y}°${state.unit}`,
                                    afterLabel: (context) => {
                                        const idx = context.dataIndex;
                                        if (idx === tempData.indexOf(Math.max(...tempData))) return '🔥 Hottest';
                                        if (idx === tempData.indexOf(Math.min(...tempData))) return '❄️ Coldest';
                                        return '';
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                ticks: { 
                                    color: 'white',
                                    font: { size: 12, weight: 'bold' },
                                    callback: (value) => value + '°',
                                    padding: 8
                                },
                                grid: { 
                                    color: 'rgba(255, 255, 255, 0.15)',
                                    lineWidth: 1
                                },
                                border: { display: false }
                            },
                            x: {
                                ticks: { 
                                    color: 'white',
                                    font: { size: 11, weight: 'bold' },
                                    padding: 8
                                },
                                grid: { 
                                    color: 'rgba(255, 255, 255, 0.1)',
                                    lineWidth: 1
                                },
                                border: { display: false }
                            }
                        }
                    }
                });
            }

            // Rain Probability Chart
            const rainData = state.forecast.map(day => day.rainProb);
            const dayLabels = state.forecast.map(day => day.day);

            const rainCtx = document.getElementById('rain-chart');
            if (rainCtx) {
                state.rainChart = new Chart(rainCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: dayLabels,
                        datasets: [{
                            label: 'Rain Probability (%)',
                            data: rainData,
                            backgroundColor: rainData.map(val => 
                                val > 70 ? 'rgba(37, 99, 235, 0.8)' :     // High - dark blue
                                val > 40 ? 'rgba(59, 130, 246, 0.7)' :    // Medium - medium blue
                                'rgba(96, 165, 250, 0.6)'                  // Low - light blue
                            ),
                            borderColor: rainData.map(val => 
                                val > 70 ? 'rgba(37, 99, 235, 1)' : 
                                val > 40 ? 'rgba(59, 130, 246, 1)' : 
                                'rgba(96, 165, 250, 1)'
                            ),
                            borderWidth: 2,
                            borderRadius: 10,
                            borderSkipped: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        plugins: {
                            legend: { 
                                display: true,
                                labels: { 
                                    color: 'white',
                                    font: { size: 14, weight: 'bold' },
                                    padding: 15
                                } 
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                titleColor: 'white',
                                bodyColor: 'white',
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 2,
                                padding: 12,
                                displayColors: false,
                                titleFont: { size: 14, weight: 'bold' },
                                bodyFont: { size: 13 },
                                callbacks: {
                                    title: (context) => `${context[0].label}`,
                                    label: (context) => `Rain Chance: ${context.parsed.y}%`,
                                    afterLabel: (context) => {
                                        const val = context.parsed.y;
                                        if (val > 70) return '⛈️ High Chance - Bring Umbrella!';
                                        if (val > 40) return '🌧️ Moderate Chance';
                                        if (val > 0) return '🌤️ Low Chance';
                                        return '☀️ No Rain Expected';
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: { 
                                    color: 'white',
                                    font: { size: 12, weight: 'bold' },
                                    callback: (value) => value + '%',
                                    stepSize: 20,
                                    padding: 8
                                },
                                grid: { 
                                    color: 'rgba(255, 255, 255, 0.15)',
                                    lineWidth: 1
                                },
                                border: { display: false }
                            },
                            x: {
                                ticks: { 
                                    color: 'white',
                                    font: { size: 12, weight: 'bold' },
                                    padding: 8
                                },
                                grid: { 
                                    display: false
                                },
                                border: { display: false }
                            }
                        }
                    }
                });
            }

            console.log('Charts created successfully');
        }

        // Voice Assistant
        function initVoiceAssistant() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                speak('Sorry, speech recognition is not supported in your browser. Please try Chrome or Edge.');
                alert('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
                return;
            }

            const recognition = new SpeechRecognition();
            
            const langMap = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'bn': 'bn-IN',
                'es': 'es-ES',
                'fr': 'fr-FR'
            };
            
            recognition.lang = langMap[state.language] || 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                state.isListening = true;
                document.getElementById('voice-btn').classList.add('listening');
                document.getElementById('voice-text').textContent = translations[state.language].listening;
            };

            recognition.onend = () => {
                state.isListening = false;
                document.getElementById('voice-btn').classList.remove('listening');
                document.getElementById('voice-text').textContent = translations[state.language].voiceAssistant;
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                state.isListening = false;
                document.getElementById('voice-btn').classList.remove('listening');
                document.getElementById('voice-text').textContent = translations[state.language].voiceAssistant;
                
                if (event.error === 'no-speech') {
                    speak('I did not hear anything. Please try again.');
                } else if (event.error === 'not-allowed') {
                    speak('Microphone access denied. Please enable microphone permissions.');
                } else {
                    speak('Sorry, there was an error. Please try again.');
                }
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                handleVoiceCommand(transcript);
            };

            try {
                recognition.start();
            } catch (error) {
                console.error('Failed to start recognition:', error);
                speak('Failed to start voice recognition. Please try again.');
            }
        }

        function handleVoiceCommand(command) {
            let response = '';

            if (command.includes('weather') || command.includes('temperature') || command.includes('मौसम') || command.includes('तापमान') || command.includes('আবহাওয়া') || command.includes('তাপমাত্রা')) {
                const unit = state.unit === 'C' ? 'degrees Celsius' : 'degrees Fahrenheit';
                const temp = state.unit === 'C' ? state.weather.temp : Math.round((state.weather.temp * 9/5) + 32);
                response = `The current temperature in ${state.weather.city} is ${temp} ${unit}. The weather is ${state.weather.description}. Humidity is ${state.weather.humidity} percent and wind speed is ${state.weather.windSpeed} kilometers per hour.`;
            } 
            else if (command.includes('forecast') || command.includes('tomorrow') || command.includes('week') || command.includes('पूर्वानुमान') || command.includes('कल') || command.includes('পূর্বাভাস') || command.includes('আগামীকাল')) {
                const tomorrow = state.forecast[1];
                response = `Tomorrow's forecast for ${state.weather.city}: High of ${tomorrow.high} degrees, low of ${tomorrow.low} degrees, with ${tomorrow.rainProb} percent chance of rain.`;
            }
            else if (command.includes('air quality') || command.includes('pollution') || command.includes('aqi') || command.includes('वायु गुणवत्ता') || command.includes('বায়ুর গুণমান') || command.includes('দূষণ')) {
                response = `The air quality index in ${state.weather.city} is ${state.aqi.index}, which is ${state.aqi.category}. ${state.aqi.healthSuggestion}`;
            }
            else if (command.includes('sunrise') || command.includes('sunset') || command.includes('सूर्योदय') || command.includes('সূর্যোদয়') || command.includes('সূর্যাস্ত')) {
                response = `In ${state.weather.city}, sunrise is at ${state.weather.sunrise} and sunset is at ${state.weather.sunset}.`;
            }
            else if (command.includes('search') || command.includes('find') || command.includes('show') || command.includes('खोज') || command.includes('খুঁজুন')) {
                const words = command.split(' ');
                const cityIndex = words.findIndex(w => w === 'for' || w === 'weather' || w === 'in');
                if (cityIndex !== -1 && words[cityIndex + 1]) {
                    const city = words.slice(cityIndex + 1).join(' ');
                    document.getElementById('search-input').value = city;
                    searchWeather();
                    response = `Searching weather for ${city}...`;
                } else {
                    response = 'Please say the city name. For example, say "search for Delhi" or "show weather in Mumbai".';
                }
            }
            else if (command.includes('help') || command.includes('what can') || command.includes('मदद') || command.includes('সাহায্য')) {
                response = 'I can help you with weather information. You can ask about current weather, temperature, forecast, air quality, sunrise and sunset times, or search for a specific city.';
            }
            else {
                response = `I heard "${command}". Try saying "What's the weather?", "Show forecast", "Air quality", or "Search for Delhi".`;
            }

            speak(response);
        }

        function speak(text) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            const langMap = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'bn': 'bn-IN',
                'es': 'es-ES',
                'fr': 'fr-FR'
            };
            
            utterance.lang = langMap[state.language] || 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            const voices = window.speechSynthesis.getVoices();
            const targetLang = utterance.lang.split('-')[0];
            const voice = voices.find(v => v.lang.startsWith(targetLang)) || voices[0];
            if (voice) {
                utterance.voice = voice;
            }

            window.speechSynthesis.speak(utterance);
        }

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }

        // Search
        function searchWeather() {
            const input = document.getElementById('search-input');
            const city = input.value.trim();
            
            if (!city) return;

            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('app').classList.add('hidden');

            setTimeout(() => {
                const cityLower = city.toLowerCase().trim();
                state.weather.city = city;
                
                // Predefined cities database with realistic temperature ranges
                const cityData = {
                    'kashmir': { lat: 34.0837, lon: 74.7973, min: -8, max: 15, zone: 'Mountain' },
                    'srinagar': { lat: 34.0837, lon: 74.7973, min: -4, max: 18, zone: 'Mountain' },
                    'darjeeling': { lat: 27.0360, lon: 88.2627, min: 2, max: 18, zone: 'Hill Station' },
                    'shimla': { lat: 31.1048, lon: 77.1734, min: -2, max: 20, zone: 'Hill Station' },
                    'manali': { lat: 32.2396, lon: 77.1887, min: -5, max: 15, zone: 'Mountain' },
                    'ladakh': { lat: 34.1526, lon: 77.5771, min: -20, max: 10, zone: 'Cold Desert' },
                    'leh': { lat: 34.1526, lon: 77.5771, min: -15, max: 12, zone: 'Cold Desert' },
                    'gulmarg': { lat: 34.0484, lon: 74.3805, min: -10, max: 8, zone: 'High Mountain' },
                    'auli': { lat: 30.5239, lon: 79.5640, min: -8, max: 10, zone: 'High Mountain' },
                    'nainital': { lat: 29.3803, lon: 79.4636, min: 0, max: 20, zone: 'Hill Station' },
                    'mussoorie': { lat: 30.4598, lon: 78.0644, min: 1, max: 22, zone: 'Hill Station' },
                    'delhi': { lat: 28.7041, lon: 77.1025, min: 8, max: 42, zone: 'Subtropical' },
                    'mumbai': { lat: 19.0760, lon: 72.8777, min: 18, max: 36, zone: 'Coastal' },
                    'kolkata': { lat: 22.5726, lon: 88.3639, min: 15, max: 38, zone: 'Tropical' },
                    'moscow': { lat: 55.7558, lon: 37.6173, min: -15, max: 25, zone: 'Continental' },
                    'london': { lat: 51.5074, lon: -0.1278, min: 2, max: 25, zone: 'Temperate' },
                    'new york': { lat: 40.7128, lon: -74.0060, min: -10, max: 32, zone: 'Continental' },
                    'tokyo': { lat: 35.6762, lon: 139.6503, min: 0, max: 35, zone: 'Temperate' }
                };
                
                let baseTemp, climateZone, foundCity = null;
                
                // Find matching city
                for (const [key, value] of Object.entries(cityData)) {
                    if (cityLower.includes(key) || key.includes(cityLower)) {
                        foundCity = value;
                        state.weather.lat = value.lat;
                        state.weather.lon = value.lon;
                        climateZone = value.zone;
                        
                        // Calculate seasonal temperature
                        const month = new Date().getMonth();
                        const tempRange = foundCity.max - foundCity.min;
                        const midTemp = foundCity.min + tempRange / 2;
                        
                        let seasonFactor = 0;
                        if (value.lat > 0) {
                            if (month >= 11 || month <= 2) seasonFactor = -0.3;
                            else if (month >= 6 && month <= 8) seasonFactor = 0.3;
                        }
                        
                        baseTemp = Math.round(midTemp + (tempRange * seasonFactor) + (Math.random() * 6 - 3));
                        baseTemp = Math.max(foundCity.min, Math.min(foundCity.max, baseTemp));
                        break;
                    }
                }
                
                if (!foundCity) {
                    // Random location
                    const baseLat = 37.7749 + (Math.random() - 0.5) * 100;
                    state.weather.lat = baseLat;
                    state.weather.lon = -122.4194 + (Math.random() - 0.5) * 360;
                    
                    if (Math.abs(baseLat) > 66) {
                        climateZone = 'Polar';
                        baseTemp = Math.floor(Math.random() * 35) - 30;
                    } else if (Math.abs(baseLat) > 45) {
                        climateZone = 'Cold Temperate';
                        baseTemp = Math.floor(Math.random() * 30) - 15;
                    } else if (Math.abs(baseLat) > 23) {
                        climateZone = 'Temperate';
                        baseTemp = Math.floor(Math.random() * 25);
                    } else {
                        climateZone = 'Tropical';
                        baseTemp = Math.floor(Math.random() * 20) + 15;
                    }
                }
                
                state.weather.temp = baseTemp;
                state.weather.climateZone = climateZone;
                
                // Weather condition based on temperature
                if (state.weather.temp < -5) {
                    state.weather.condition = Math.random() > 0.3 ? 'snow' : 'cloudy';
                    state.weather.description = state.weather.condition === 'snow' ? 'Snowy' : 'Overcast';
                } else if (state.weather.temp < 10) {
                    state.weather.condition = ['cloudy', 'rain'][Math.floor(Math.random() * 2)];
                    state.weather.description = state.weather.condition === 'rain' ? 'Cold Rain' : 'Cloudy';
                } else if (state.weather.temp < 20) {
                    state.weather.condition = ['sunny', 'cloudy', 'rain'][Math.floor(Math.random() * 3)];
                    if (state.weather.condition === 'sunny') state.weather.description = 'Partly Sunny';
                    else if (state.weather.condition === 'cloudy') state.weather.description = 'Partly Cloudy';
                    else state.weather.description = 'Light Rain';
                } else {
                    state.weather.condition = Math.random() > 0.3 ? 'sunny' : 'cloudy';
                    state.weather.description = state.weather.condition === 'sunny' ? 'Clear Sky' : 'Partly Cloudy';
                }
                
                // Update weather details
                state.weather.humidity = 40 + Math.floor(Math.random() * 50);
                state.weather.windSpeed = 5 + Math.floor(Math.random() * 25);
                state.weather.visibility = 5 + Math.floor(Math.random() * 10);
                state.weather.pressure = 990 + Math.floor(Math.random() * 40);
                state.weather.feelsLike = state.weather.temp - Math.floor(Math.random() * 5);
                
                // Update sunrise/sunset based on latitude
                const latitude = state.weather.lat;
                let sunriseHour, sunriseMin, sunsetHour, sunsetMin;
                
                if (latitude > 23) {
                    sunriseHour = 5 + Math.floor(Math.random() * 2);
                    sunsetHour = 18 + Math.floor(Math.random() * 2);
                } else if (latitude > -23) {
                    sunriseHour = 6;
                    sunsetHour = 18;
                } else {
                    sunriseHour = 5 + Math.floor(Math.random() * 3);
                    sunsetHour = 17 + Math.floor(Math.random() * 2);
                }
                
                sunriseMin = Math.floor(Math.random() * 60);
                sunsetMin = Math.floor(Math.random() * 60);
                
                state.weather.sunrise = `${sunriseHour}:${sunriseMin.toString().padStart(2, '0')} AM`;
                state.weather.sunset = `${sunsetHour - 12}:${sunsetMin.toString().padStart(2, '0')} PM`;

                // Generate new AQI data based on city (simulate different pollution levels)
                state.aqi.index = Math.floor(Math.random() * 200) + 20; // Range: 20-220
                
                // Update AQI category based on index
                if (state.aqi.index <= 50) {
                    state.aqi.category = 'Good';
                    state.aqi.healthSuggestion = '✅ Air quality is satisfactory. Enjoy outdoor activities!';
                } else if (state.aqi.index <= 100) {
                    state.aqi.category = 'Moderate';
                    state.aqi.healthSuggestion = '⚠️ Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor activities.';
                } else if (state.aqi.index <= 150) {
                    state.aqi.category = 'Unhealthy for Sensitive Groups';
                    state.aqi.healthSuggestion = '⚠️ Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
                } else if (state.aqi.index <= 200) {
                    state.aqi.category = 'Unhealthy';
                    state.aqi.healthSuggestion = '🚨 Everyone may begin to experience health effects. Sensitive groups should avoid outdoor activities.';
                } else {
                    state.aqi.category = 'Very Unhealthy';
                    state.aqi.healthSuggestion = '🚨 Health alert: everyone may experience serious health effects. Avoid outdoor activities!';
                }
                
                // Update individual pollutants based on AQI index
                // PM2.5 (Fine particulate matter) - typically 40-60% of AQI
                state.aqi.pm25 = Math.floor(state.aqi.index * 0.5) + Math.floor(Math.random() * 15);
                
                // PM10 (Coarse particulate matter) - typically 60-90% of AQI  
                state.aqi.pm10 = Math.floor(state.aqi.index * 0.75) + Math.floor(Math.random() * 20);
                
                // CO (Carbon Monoxide) - measured in ppm, varies 0.1 to 5.0+
                if (state.aqi.index <= 50) {
                    state.aqi.co = (Math.random() * 0.5 + 0.1).toFixed(1);
                } else if (state.aqi.index <= 100) {
                    state.aqi.co = (Math.random() * 1.5 + 0.5).toFixed(1);
                } else if (state.aqi.index <= 150) {
                    state.aqi.co = (Math.random() * 2 + 1.5).toFixed(1);
                } else {
                    state.aqi.co = (Math.random() * 3 + 2.5).toFixed(1);
                }
                
                // NO2 (Nitrogen Dioxide) - typically 30-70% of AQI
                state.aqi.no2 = Math.floor(state.aqi.index * 0.5) + Math.floor(Math.random() * 25);

                // Update forecast for the new city
                state.forecast = [
                    { day: 'Mon', high: state.weather.temp + Math.floor(Math.random() * 5), low: state.weather.temp - Math.floor(Math.random() * 5), icon: ['☀️', '⛅', '☁️'][Math.floor(Math.random() * 3)], rainProb: Math.floor(Math.random() * 40) },
                    { day: 'Tue', high: state.weather.temp + Math.floor(Math.random() * 5), low: state.weather.temp - Math.floor(Math.random() * 5), icon: ['☀️', '⛅', '☁️'][Math.floor(Math.random() * 3)], rainProb: Math.floor(Math.random() * 50) },
                    { day: 'Wed', high: state.weather.temp + Math.floor(Math.random() * 5), low: state.weather.temp - Math.floor(Math.random() * 5), icon: ['⛅', '☁️', '🌧️'][Math.floor(Math.random() * 3)], rainProb: Math.floor(Math.random() * 80) + 20 },
                    { day: 'Thu', high: state.weather.temp + Math.floor(Math.random() * 5), low: state.weather.temp - Math.floor(Math.random() * 5), icon: ['☁️', '⛅'][Math.floor(Math.random() * 2)], rainProb: Math.floor(Math.random() * 60) },
                    { day: 'Fri', high: state.weather.temp + Math.floor(Math.random() * 6), low: state.weather.temp - Math.floor(Math.random() * 4), icon: ['☀️', '⛅'][Math.floor(Math.random() * 2)], rainProb: Math.floor(Math.random() * 30) },
                    { day: 'Sat', high: state.weather.temp + Math.floor(Math.random() * 6), low: state.weather.temp - Math.floor(Math.random() * 4), icon: ['☀️', '⛅'][Math.floor(Math.random() * 2)], rainProb: Math.floor(Math.random() * 20) },
                    { day: 'Sun', high: state.weather.temp + Math.floor(Math.random() * 5), low: state.weather.temp - Math.floor(Math.random() * 5), icon: ['☀️', '⛅', '☁️'][Math.floor(Math.random() * 3)], rainProb: Math.floor(Math.random() * 40) }
                ];

                updateUI();
                updateAQI();
                initParticles();
                createCharts();
                
                // Show temperature info alert
                let tempInfo = '';
                if (state.weather.temp < 0) {
                    tempInfo = `❄️ Freezing temperatures detected in ${city}`;
                } else if (state.weather.temp < 10) {
                    tempInfo = `🌡️ Cold weather in ${city} (${state.weather.climateZone})`;
                } else if (state.weather.temp > 30) {
                    tempInfo = `🔥 Hot weather in ${city} (${state.weather.climateZone})`;
                }
                
                if (tempInfo) {
                    displayAlerts([{ type: 'info', message: tempInfo }]);
                    setTimeout(() => displayAlerts([]), 5000); // Clear after 5 seconds
                }
                
                // Fix map reinitialization with proper cleanup
                if (state.map) {
                    try {
                        state.map.off();
                        state.map.remove();
                        state.map = null;
                    } catch (e) {
                        console.log('Map cleanup:', e);
                    }
                }
                
                // Clear map container
                const mapContainer = document.getElementById('weather-map');
                mapContainer.innerHTML = '';
                
                // Reinitialize map after a short delay
                setTimeout(() => {
                    initMap();
                }, 300);

                document.getElementById('loading').classList.add('hidden');
                document.getElementById('app').classList.remove('hidden');
            }, 800);
        }

        // Event Listeners
        document.getElementById('unit-toggle').addEventListener('click', () => {
            state.unit = state.unit === 'C' ? 'F' : 'C';
            updateUI();
            createCharts();
        });

        document.getElementById('lang-select').addEventListener('change', (e) => {
            state.language = e.target.value;
            document.getElementById('search-input').placeholder = translations[state.language].searchPlaceholder;
            document.getElementById('voice-text').textContent = translations[state.language].voiceAssistant;
        });

        document.getElementById('voice-btn').addEventListener('click', initVoiceAssistant);
        document.getElementById('search-btn').addEventListener('click', searchWeather);
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchWeather();
        });

        window.addEventListener('resize', () => {
            const canvas = document.getElementById('particles-canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
            
            if (state.map) {
                setTimeout(() => {
                    state.map.invalidateSize();
                }, 200);
            }
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
