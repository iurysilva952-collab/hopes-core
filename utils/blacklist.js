const fs = require('fs');
const path = require('path');

const blacklistPath = path.join(__dirname, '..', 'database', 'blacklist.json');

function readBlacklist() {
    if (!fs.existsSync(blacklistPath)) {
        fs.writeFileSync(blacklistPath, JSON.stringify([], null, 4));
    }

    const data = fs.readFileSync(blacklistPath, 'utf8');
    return JSON.parse(data || '[]');
}

function saveBlacklist(list) {
    fs.writeFileSync(
        blacklistPath,
        JSON.stringify(list, null, 4)
    );
}

function isBlacklisted(userId) {
    const list = readBlacklist();
    return list.includes(userId);
}

function addBlacklist(userId) {
    const list = readBlacklist();

    if (!list.includes(userId)) {
        list.push(userId);
        saveBlacklist(list);
    }
}

function removeBlacklist(userId) {
    const list = readBlacklist().filter(
        id => id !== userId
    );

    saveBlacklist(list);
}

module.exports = {
    readBlacklist,
    isBlacklisted,
    addBlacklist,
    removeBlacklist
};