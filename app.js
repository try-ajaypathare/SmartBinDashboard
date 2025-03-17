// Firebase configuration
const firebaseConfig = {
    databaseURL: 'https://smart-bin-fb214-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    updateChartsTheme();
});

// Initialize charts
const fillLevelCtx = document.getElementById('fillLevelChart').getContext('2d');
const airQualityCtx = document.getElementById('airQualityChart').getContext('2d');

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100
        }
    }
};

const fillLevelChart = new Chart(fillLevelCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            borderColor: '#2196F3',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(33, 150, 243, 0.1)'
        }]
    },
    options: chartOptions
});

const airQualityChart = new Chart(airQualityCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            borderColor: '#4CAF50',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(76, 175, 80, 0.1)'
        }]
    },
    options: chartOptions
});

// Update fill level progress bar
function updateFillLevel(level) {
    const progressBar = document.getElementById('fill-level-progress');
    const levelText = document.getElementById('fill-level-text');
    const alert = document.getElementById('fill-alert');

    progressBar.style.width = `${level}%`;
    levelText.textContent = `${level}%`;

    if (level <= 50) {
        progressBar.style.backgroundColor = 'var(--success-color)';
    } else if (level <= 80) {
        progressBar.style.backgroundColor = 'var(--warning-color)';
    } else {
        progressBar.style.backgroundColor = 'var(--danger-color)';
    }

    alert.classList.toggle('hidden', level < 90);
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Update history table
function updateHistoryTable(records) {
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';

    Object.entries(records)
        .slice(-5)
        .reverse()
        .forEach(([id, record]) => {
            const row = document.createElement('tr');
            const time = new Date(record.timestamp).toLocaleTimeString();
            const status = record.fillLevel >= 90 ? '⚠️ Critical' : 
                          record.fillLevel >= 80 ? '⚡ High' : 
                          record.fillLevel >= 50 ? '🔶 Medium' : '✅ Normal';

            row.innerHTML = `
                <td>${time}</td>
                <td>${record.fillLevel}%</td>
                <td>${record.airQuality}</td>
                <td>${status}</td>
            `;
            tbody.appendChild(row);
        });
}

// Update charts theme
function updateChartsTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#F8F9FA' : '#212529';

    [fillLevelChart, airQualityChart].forEach(chart => {
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.grid.color = isDark ? '#343A40' : '#E9ECEF';
        chart.options.scales.y.grid.color = isDark ? '#343A40' : '#E9ECEF';
        chart.update();
    });
}

// Real-time data listeners
database.ref('/dustbin').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        updateFillLevel(data.fillLevel);
        document.getElementById('air-quality-text').textContent = data.airQuality;
        document.getElementById('location-display').querySelector('span').textContent = data.location;

        // Update battery status if available
        if (data.batteryLevel) {
            const batteryIcon = getBatteryIcon(data.batteryLevel);
            document.getElementById('battery-percentage').innerHTML = 
                `${batteryIcon} ${data.batteryLevel}%`;
        }

        // Update last update time
        const now = new Date();
        document.getElementById('last-update').textContent = 
            `Last Update: ${now.toLocaleTimeString()}`;
    }
});

database.ref('/history/records').on('value', (snapshot) => {
    const records = snapshot.val();
    if (records) {
        updateHistoryTable(records);

        // Update charts
        const data = Object.values(records).slice(-20);
        const timestamps = data.map(record => 
            new Date(record.timestamp).toLocaleTimeString()
        );
        const fillLevels = data.map(record => record.fillLevel);
        const airQuality = data.map(record => 
            record.airQuality === 'Smells Fresh' ? 100 : 50
        );

        fillLevelChart.data.labels = timestamps;
        fillLevelChart.data.datasets[0].data = fillLevels;
        fillLevelChart.update();

        airQualityChart.data.labels = timestamps;
        airQualityChart.data.datasets[0].data = airQuality;
        airQualityChart.update();
    }
});

// Helper function to get battery icon
function getBatteryIcon(level) {
    if (level >= 80) return '<i class="fas fa-battery-full"></i>';
    if (level >= 60) return '<i class="fas fa-battery-three-quarters"></i>';
    if (level >= 40) return '<i class="fas fa-battery-half"></i>';
    if (level >= 20) return '<i class="fas fa-battery-quarter"></i>';
    return '<i class="fas fa-battery-empty"></i>';
}

// Initial theme setup
updateChartsTheme();