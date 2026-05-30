const fs = require('fs');
const path = require('path');

const historyPath = path.join(__dirname, '..', 'database', 'clientHistory.json');

function readHistory() {
    if (!fs.existsSync(historyPath)) {
        fs.writeFileSync(historyPath, JSON.stringify({}, null, 4));
    }

    const data = fs.readFileSync(historyPath, 'utf8');
    return JSON.parse(data || '{}');
}

function saveHistory(history) {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 4));
}

function registerTicket(userId) {
    const history = readHistory();

    if (!history[userId]) {
        history[userId] = {
            tickets: 0,
            ratings: 0,
            lastTicket: null
        };
    }

    history[userId].tickets += 1;
    history[userId].lastTicket = Date.now();

    saveHistory(history);
}

function registerRating(userId) {
    const history = readHistory();

    if (!history[userId]) {
        history[userId] = {
            tickets: 0,
            ratings: 0,
            lastTicket: null
        };
    }

    history[userId].ratings += 1;

    saveHistory(history);
}

function getClientHistory(userId) {
    const history = readHistory();
    return history[userId] || null;
}

module.exports = {
    registerTicket,
    registerRating,
    getClientHistory
};