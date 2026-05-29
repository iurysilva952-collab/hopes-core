const fs = require('fs');
const path = require('path');

const licensesPath = path.join(__dirname, '..', 'database', 'licenses.json');

function readLicenses() {
    if (!fs.existsSync(licensesPath)) {
        fs.writeFileSync(licensesPath, JSON.stringify({}, null, 4));
    }

    const data = fs.readFileSync(licensesPath, 'utf8');
    return JSON.parse(data || '{}');
}

function saveLicenses(licenses) {
    fs.writeFileSync(licensesPath, JSON.stringify(licenses, null, 4));
}

function generateLicenseKey() {
    const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HOPES-${part()}-${part()}-${part()}`;
}

function createLicense(ownerId, product, createdBy) {
    const licenses = readLicenses();
    const key = generateLicenseKey();

    licenses[key] = {
        ownerId,
        product,
        active: true,
        createdBy,
        createdAt: Date.now()
    };

    saveLicenses(licenses);
    return key;
}

function getLicense(key) {
    const licenses = readLicenses();
    return licenses[key.toUpperCase()] || null;
}

function revokeLicense(key) {
    const licenses = readLicenses();
    const licenseKey = key.toUpperCase();

    if (!licenses[licenseKey]) return false;

    licenses[licenseKey].active = false;
    saveLicenses(licenses);

    return true;
}

module.exports = {
    createLicense,
    getLicense,
    revokeLicense
};