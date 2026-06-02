const fs = require('fs');
const path = require('path');

const metaPath = path.join(__dirname, '..', 'database', 'meta.json');

function ensureMetaFile() {
    if (!fs.existsSync(metaPath)) {
        fs.writeFileSync(
            metaPath,
            JSON.stringify(
                {
                    monthlyGoal: 1000
                },
                null,
                4
            )
        );
    }
}

function readMeta() {
    ensureMetaFile();

    const data = fs.readFileSync(metaPath, 'utf8');

    return JSON.parse(data || '{}');
}

function saveMeta(meta) {
    fs.writeFileSync(
        metaPath,
        JSON.stringify(meta, null, 4)
    );
}

function getGoal() {
    const meta = readMeta();

    return Number(meta.monthlyGoal || 0);
}

function setGoal(value) {
    const meta = readMeta();

    meta.monthlyGoal = Number(value);

    saveMeta(meta);

    return meta;
}

module.exports = {
    getGoal,
    setGoal
};