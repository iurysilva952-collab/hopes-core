const fs = require('fs');
const path = require('path');

const couponsPath = path.join(__dirname, '..', 'database', 'coupons.json');

function readCoupons() {
    if (!fs.existsSync(couponsPath)) {
        fs.writeFileSync(couponsPath, JSON.stringify({}, null, 4));
    }

    const data = fs.readFileSync(couponsPath, 'utf8');
    return JSON.parse(data || '{}');
}

function saveCoupons(coupons) {
    fs.writeFileSync(couponsPath, JSON.stringify(coupons, null, 4));
}

function createCoupon(code, discount, expiresAt, createdBy) {
    const coupons = readCoupons();

    coupons[code.toUpperCase()] = {
        discount,
        expiresAt,
        createdBy,
        createdAt: Date.now()
    };

    saveCoupons(coupons);
}

function removeCoupon(code) {
    const coupons = readCoupons();
    delete coupons[code.toUpperCase()];
    saveCoupons(coupons);
}

function getCoupon(code) {
    const coupons = readCoupons();
    return coupons[code.toUpperCase()] || null;
}

function getAllCoupons() {
    return readCoupons();
}

module.exports = {
    createCoupon,
    removeCoupon,
    getCoupon,
    getAllCoupons
};