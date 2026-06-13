// ===================================
// THEME TOGGLE
// ===================================
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference or default to 'dark'
const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Add a subtle animation to the button
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 300);
});

// ===================================
// STOPWATCH FUNCTIONALITY
// ===================================
const timeDisplay = document.querySelector('.time-display');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const clearLapsBtn = document.getElementById('clearLapsBtn');

const lapList = document.getElementById('lapList');

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let laps = [];

// Format time with leading zeros
function formatTime(value, digits = 2) {
    return String(value).padStart(digits, '0');
}

// Update the time display
function updateDisplay() {
    const totalMilliseconds = elapsedTime;
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);

    hoursEl.textContent = formatTime(hours);
    minutesEl.textContent = formatTime(minutes);
    secondsEl.textContent = formatTime(seconds);
    millisecondsEl.textContent = formatTime(milliseconds);
}

// Start the stopwatch
function start() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);

        isRunning = true;
        timeDisplay.classList.add('running');

        // Update button states
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        lapBtn.disabled = false;
    }
}

// Pause the stopwatch
function pause() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        timeDisplay.classList.remove('running');

        // Update button states
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        lapBtn.disabled = true;
    }
}

// Reset the stopwatch
function reset() {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = 0;
    startTime = 0;

    updateDisplay();
    timeDisplay.classList.remove('running');

    // Update button states
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    lapBtn.disabled = true;

    // Clear laps
    laps = [];
    renderLaps();
}

// Record a lap time
function recordLap() {
    if (isRunning) {
        const lapTime = elapsedTime;
        laps.push(lapTime);
        renderLaps();
    }
}

// Clear all laps
function clearLaps() {
    laps = [];
    renderLaps();
}

// Render lap times
function renderLaps() {
    if (laps.length === 0) {
        lapList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <p>No lap times recorded yet</p>
            </div>
        `;
        clearLapsBtn.disabled = true;
        return;
    }

    clearLapsBtn.disabled = false;

    // Find fastest and slowest laps (excluding first lap)
    let fastestIndex = -1;
    let slowestIndex = -1;

    if (laps.length > 1) {
        const lapDurations = laps.map((lap, index) => {
            if (index === 0) return lap;
            return lap - laps[index - 1];
        });

        const durationsWithoutFirst = lapDurations.slice(1);
        const minDuration = Math.min(...durationsWithoutFirst);
        const maxDuration = Math.max(...durationsWithoutFirst);

        fastestIndex = lapDurations.indexOf(minDuration);
        slowestIndex = lapDurations.indexOf(maxDuration);
    }

    // Render laps in reverse order (newest first)
    lapList.innerHTML = laps
        .map((lapTime, index) => {
            const lapNumber = index + 1;
            const hours = Math.floor(lapTime / 3600000);
            const minutes = Math.floor((lapTime % 3600000) / 60000);
            const seconds = Math.floor((lapTime % 60000) / 1000);
            const milliseconds = Math.floor((lapTime % 1000) / 10);

            const timeString = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}.${formatTime(milliseconds)}`;

            let badgeHTML = '';
            let itemClass = 'lap-item';

            if (index === fastestIndex && laps.length > 1) {
                badgeHTML = '<span class="lap-badge fastest">Fastest</span>';
                itemClass += ' fastest';
            } else if (index === slowestIndex && laps.length > 1) {
                badgeHTML = '<span class="lap-badge slowest">Slowest</span>';
                itemClass += ' slowest';
            }

            return `
                <div class="${itemClass}">
                    <span class="lap-number">Lap ${lapNumber}</span>
                    <span class="lap-time">${timeString}</span>
                    ${badgeHTML}
                </div>
            `;
        })
        .reverse()
        .join('');
}

// Event listeners
startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', recordLap);
clearLapsBtn.addEventListener('click', clearLaps);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space: Start/Pause
    if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
            pause();
        } else {
            start();
        }
    }

    // L: Record lap
    if (e.code === 'KeyL' && isRunning) {
        e.preventDefault();
        recordLap();
    }

    // R: Reset
    if (e.code === 'KeyR' && !isRunning) {
        e.preventDefault();
        reset();
    }
});

// Initialize display
updateDisplay();
clearLapsBtn.disabled = true;
