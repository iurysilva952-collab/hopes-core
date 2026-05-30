const fs = require('fs');
const path = require('path');

const salesPath = path.join(__dirname, '..', 'database', 'sales.json');

function readSales() {
    if (!fs.existsSync(salesPath)) {
        fs.writeFileSync(salesPath, JSON.stringify([], null, 4));
    }

    const data = fs.readFileSync(salesPath, 'utf8');
    return JSON.parse(data || '[]');
}

function saveSales(sales) {
    fs.writeFileSync(salesPath, JSON.stringify(sales, null, 4));
}

function registerSale(clientId, service, value, status, createdBy) {
    const sales = readSales();

    const sale = {
        id: Date.now().toString(),
        clientId,
        service,
        value: Number(value),
        status,
        createdBy,
        createdAt: Date.now()
    };

    sales.push(sale);
    saveSales(sales);

    return sale;
}

function getSales() {
    return readSales();
}

module.exports = {
    registerSale,
    getSales
};