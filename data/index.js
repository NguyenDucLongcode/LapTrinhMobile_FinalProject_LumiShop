/* eslint-env node */
// data/index.js
// Nạp toàn bộ các file JSON độc lập trong thư mục data/ làm nguồn dữ liệu cho JSON Server
const path = require('path');
const fs = require('fs');

module.exports = () => {
  const read = (filename) => {
    try {
      const p = path.join(__dirname, filename);
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (_e) {
      return [];
    }
  };

  return {
    categories: read('categories.json'),
    products: read('products.json'),
    users: read('users.json'),
    vouchers: read('vouchers.json'),
    orders: read('orders.json'),
  };
};
