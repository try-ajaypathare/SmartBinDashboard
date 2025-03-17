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
});

// Chart initialization
const ctx = document.getElementById('fillLevelChart').getContext('2d');
const fillLevelChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Fill Level %',
            data: [],
            borderColor: '#FF4B4B',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

// Update fill level progress bar
function updateFillLevel(level) {
    const progressBar = document.getElementById('fill-level-progress');
    const levelText = document.getElementById('fill-level-text');
    const alert = document.getElementById('fill-alert');

    progressBar.style.width = `${level}%`;
    levelText.textContent = `${level}%`;

    // Update color based on level
    if (level <= 50) {
        progressBar.style.backgroundColor = 'var(--success-color)';
    } else if (level <= 80) {
        progressBar.style.backgroundColor = 'var(--warning-color)';
    } else {
        progressBar.style.backgroundColor = 'var(--danger-color)';
    }

    // Show alert if level is above 90%
    alert.classList.toggle('hidden', level < 90);
}

// Update history table
function updateHistoryTable(records) {
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';

    Object.entries(records).slice(-10).forEach(([id, record]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.timestamp}</td>
            <td>${record.fillLevel}%</td>
            <td>${record.airQuality}</td>
        `;
        tbody.appendChild(row);
    });
}

// Real-time data listeners
database.ref('/dustbin').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        updateFillLevel(data.fillLevel);
        document.getElementById('air-quality-text').textContent = data.airQuality;
        document.getElementById('location-display').textContent = data.location;
    }
});

database.ref('/history/records').on('value', (snapshot) => {
    const records = snapshot.val();
    if (records) {
        updateHistoryTable(records);
        
        // Update chart
        const timestamps = [];
        const fillLevels = [];
        
        Object.values(records).slice(-20).forEach(record => {
            timestamps.push(record.timestamp);
            fillLevels.push(record.fillLevel);
        });

        fillLevelChart.data.labels = timestamps;
        fillLevelChart.data.datasets[0].data = fillLevels;
        fillLevelChart.update();
    }
});
