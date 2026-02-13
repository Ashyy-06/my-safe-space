let currentUserPin = localStorage.getItem('userPin');
let selectedMood = "";

const feedbackMessages = [
    "Thank you for sharing. Your feelings are valid. ✨",
    "You showed up for yourself today. That's a win. ❤️",
    "Proud of you for taking this moment of reflection.",
    "Your safe space is always here for you. Rest well."
];

// Logic to show/hide screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// Check PIN on Load
window.onload = () => {
    if (!currentUserPin) document.getElementById('login-title').innerText = "Create Your PIN";
};

function handleLogin() {
    const pinVal = document.getElementById('pinInput').value;
    if (!currentUserPin) {
        localStorage.setItem('userPin', pinVal);
        currentUserPin = pinVal;
        showScreen('screen-mood');
    } else if (pinVal === currentUserPin) {
        // --- CALL THE CALENDAR HERE ---
        renderCalendar(); 
        // ------------------------------
        showScreen('screen-mood');
    } else {
        alert("Incorrect PIN.");
    }
}

function selectMood(emoji, name) {
    selectedMood = emoji;
    document.getElementById('decision-title').innerText = `Feeling ${emoji} today?`;
    showScreen('screen-decision');
}

function showBranch(wantsToWrite) {
    wantsToWrite ? showScreen('screen-write') : showScreen('screen-quick');
}

function saveEntry(type) {
    const text = (type === 'detailed') ? document.getElementById('journalText').value : type;
    const entry = {
        mood: selectedMood,
        content: text,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    let entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    entries.unshift(entry);
    localStorage.setItem('journalEntries', JSON.stringify(entries));

    // Pick a random feedback message
    document.getElementById('feedback-msg').innerText = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
    
    // --- CALL THE CALENDAR HERE ---
    renderCalendar(); 
    // ------------------------------

    showScreen('screen-dashboard');
}

function lockJournal() {
    document.getElementById('pinInput').value = "";
    document.getElementById('journalText').value = "";
    showScreen('screen-login');
}

function downloadJournal() {
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    let text = "MY JOURNAL\n\n";
    entries.forEach(e => text += `${e.date} ${e.time}\nMood: ${e.mood}\nEntry: ${e.content}\n\n---\n\n`);
    
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "MyJournalBackup.txt";
    link.click();
}
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    grid.innerHTML = ""; // Clear old calendar

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        // Check if today is the day
        if (i === now.getDate()) dayDiv.classList.add('current-day');

        // Check if we have a mood for this date
        const dateString = new Date(now.getFullYear(), now.getMonth(), i).toLocaleDateString();
        const entryForDay = entries.find(e => e.date === dateString);

        dayDiv.innerHTML = `<span>${i}</span>`;
        if (entryForDay) {
            dayDiv.innerHTML += `<span class="day-mood">${entryForDay.mood}</span>`;
        }

        grid.appendChild(dayDiv);
    }
}

// IMPORTANT: Add renderCalendar() inside your handleLogin and saveEntry functions 
// so it refreshes the view whenever you enter or save!
// --- TAB NAVIGATION ---
function showTab(tabName) {
    document.getElementById('calendar-view').classList.add('hidden');
    document.getElementById('graph-view').classList.add('hidden');
    document.getElementById('history-view').classList.add('hidden');

    document.getElementById(tabName + '-view').classList.remove('hidden');
    
    if(tabName === 'history') renderHistory();
    if(tabName === 'graph') renderGraph();
}

// --- VIEW PAST ENTRIES ---
function renderHistory() {
    const list = document.getElementById('history-list');
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    list.innerHTML = entries.map(e => `
        <div class="history-card">
            <span class="history-mood">${e.mood}</span>
            <div class="history-date">${e.date} at ${e.time}</div>
            <p>${e.content}</p>
        </div>
    `).join('');
}

// --- MOOD ANALYSIS GRAPH ---
function renderGraph() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    
    // Reverse entries to show chronological order, take last 7
    const lastSeven = [...entries].reverse().slice(-7);
    
    // Map Emojis to Numbers: Happy (3), Neutral/Tired (2), Sad/Angry (1)
    const moodMap = { '😊': 3, '✨': 3, '😴': 2, '😔': 1, '😠': 1 };

    const labels = lastSeven.map(e => e.date.split('/')[0] + '/' + e.date.split('/')[1]);
    const data = lastSeven.map(e => moodMap[e.mood] || 2);

    // Destroy existing chart if it exists to avoid glitching
    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Level',
                data: data,
                borderColor: '#6366f1',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }]
        },
        options: {
            scales: { y: { min: 1, max: 3, ticks: { stepSize: 1 } } }
        }
    });
}