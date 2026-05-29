const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '..', 'database', 'staffStats.json');

function readStats() {
    if (!fs.existsSync(statsPath)) {
        fs.writeFileSync(statsPath, JSON.stringify({}, null, 4));
    }

    const data = fs.readFileSync(statsPath, 'utf-8');
    return JSON.parse(data || '{}');
}

function saveStats(stats) {
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 4));
}

function addRating(staffId, rating) {
    if (!staffId) return;

    const stats = readStats();

    if (!stats[staffId]) {
        stats[staffId] = {
            tickets: 0,
            totalRating: 0
        };
    }

    stats[staffId].tickets += 1;
    stats[staffId].totalRating += Number(rating);

    saveStats(stats);
}

function getStats() {
    return readStats();
}

module.exports = {
    addRating,
    getStats
};