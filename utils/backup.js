const fs = require('fs');
const path = require('path');

function backupDatabase() {
    const databasePath = path.join(__dirname, '..', 'database');
    const backupPath = path.join(__dirname, '..', 'backups');

    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath);
    }

    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupPath, `database-backup-${date}.json`);

    const files = fs.readdirSync(databasePath).filter(file => file.endsWith('.json'));

    const backupData = {};

    for (const file of files) {
        const filePath = path.join(databasePath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        backupData[file] = JSON.parse(content || '{}');
    }

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 4));

    console.log(`✅ Backup criado: ${backupFile}`);
}

module.exports = {
    backupDatabase
};