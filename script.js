let currentUserPin = localStorage.getItem('userPin');
let selectedMood = "";

const feedbackMessages = [
    "Thank you for sharing.. Your feelings are valid and heard. ✨",
    "You showed up for yourself today, and that's a huge win. ❤️",
    "Proud of you for taking this moment of reflection. You deserve this peace🤍",
    "Your safe space is always here for you. Rest well tonight. 🌙",
    "Writing it down is the first step to clarity. You're doing great🕊️",
    "No matter how big or small the thought, it mattered because it was yours💖",
    "Be gentle with yourself today. You are doing the best you can..❤️‍🩹",
    "Every entry is a piece of your journey. Thank you for documenting it🤍"
];
function getFeedback() {
    // Math.random() picks a number between 0 and 1
    // We multiply it by the length of our list to pick an entry
    const randomIndex = Math.floor(Math.random() * feedbackMessages.length);
    return feedbackMessages[randomIndex];
}

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
    // 1. Determine what the user wrote or selected
    const text = (type === 'detailed') ? document.getElementById('journalText').value : type;
    
    // 2. Create the data object (THE SKELETON)
    const entry = {
        mood: selectedMood,
        content: text,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now() // This is the 'ID' used for deleting!
    };

    // 3. Save to the browser's memory
    let entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    entries.unshift(entry); // Add new entry to the start of the list
    localStorage.setItem('journalEntries', JSON.stringify(entries));

    // 4. Update the positive feedback message
    const randomIndex = Math.floor(Math.random() * feedbackMessages.length);
    const randomMsg = feedbackMessages[randomIndex];
    
    document.getElementById('feedback-msg').innerText = randomMsg;

    // 5. Refresh all visual parts
    renderCalendar();
    renderHistory();
    
    // 6. Switch to the dashboard and draw the graph
    showScreen('screen-dashboard');
    setTimeout(() => {
        renderGraph();
    }, 50);

    // 7. Clear the input box for next time
    document.getElementById('journalText').value = "";
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
    const monthDisplay = document.getElementById('monthDisplay');
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    
    grid.innerHTML = ""; // Clear grid

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // 1. Display Month Name and Year
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    monthDisplay.innerText = `${monthNames[month]} ${year}`;

    // 2. Get details for the grid
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // What day of week month starts
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 3. Add Empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        grid.appendChild(emptyDiv);
    }

    // 4. Create the actual days
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        if (i === now.getDate()) dayDiv.classList.add('current-day');

        // Look for entry
        const dateString = new Date(year, month, i).toLocaleDateString();
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

// --- VIEW PAST ENTRIES (With Delete Button) ---
function renderHistory() {
    const list = document.getElementById('history-list');
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    
    if (entries.length === 0) {
        list.innerHTML = "<p style='color: #94a3b8;'>No entries yet. Your journey starts here.</p>";
        return;
    }

    list.innerHTML = entries.map(e => `
        <div class="history-card">
            <button class="delete-btn" onclick="deleteEntry(${e.timestamp})">Delete</button>
            <span class="history-mood">${e.mood}</span>
            <div class="history-date">${e.date} at ${e.time}</div>
            <p>${e.content}</p>
        </div>
    `).join('');
}

// --- DELETE LOGIC ---
function deleteEntry(timestamp) {
    if (confirm("Are you sure you want to delete this memory?")) {
        let entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        
        // Filter out the entry with the matching timestamp
        entries = entries.filter(e => e.timestamp !== timestamp);
        
        // Save the new list back to localStorage
        localStorage.setItem('journalEntries', JSON.stringify(entries));
        
        // Refresh everything on the dashboard
        renderHistory();
        renderCalendar();
        renderGraph();
    }
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
// 1. LOGOUT: Just locks the screen
function logout() {
    showScreen('screen-login');
    document.getElementById('pinInput').value = ""; // Clear the input
}

// 2. RESET PIN: Changes the PIN but keeps your journal entries
function resetPin() {
    const oldPin = prompt("Enter your current 4-digit PIN:");
    
    if (oldPin === currentUserPin) {
        const newPin = prompt("Enter your NEW 4-digit PIN:");
        if (newPin && newPin.length === 4) {
            localStorage.setItem('userPin', newPin);
            currentUserPin = newPin;
            alert("PIN updated successfully! ✨");
        } else {
            alert("Invalid PIN. It must be 4 digits.");
        }
    } else {
        alert("Incorrect current PIN.");
    }
}

// 3. DELETE ACCOUNT: Wipes EVERYTHING
function deleteAccount() {
    const confirmation = confirm("WARNING: This will permanently delete all your entries and your PIN. This cannot be undone. Are you sure?");
    
    if (confirmation) {
        const finalCheck = confirm("Last chance! Do you want to download a backup first?");
        if (finalCheck) {
            downloadJournal(); // Force a backup for safety
        }
        
        // Wipe LocalStorage
        localStorage.clear();
        
        // Reload the page to start from scratch
        location.reload();
    }
}