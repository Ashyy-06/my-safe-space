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

    // Show Feedback
    document.getElementById('feedback-msg').innerText = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
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