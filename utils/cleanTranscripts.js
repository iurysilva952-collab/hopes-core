const fs = require('fs');
const path = require('path');

function cleanOldTranscripts() {
    const transcriptsPath = path.join(__dirname, '..', 'transcripts');

    if (!fs.existsSync(transcriptsPath)) return;

    const files = fs.readdirSync(transcriptsPath);
    const now = Date.now();
    const maxAge = 1000 * 60 * 60 * 24 * 7;

    for (const file of files) {
        const filePath = path.join(transcriptsPath, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Transcript antigo removido: ${file}`);
        }
    }
}

module.exports = {
    cleanOldTranscripts
};
