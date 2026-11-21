const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'gymspace.db');
const db = new DatabaseSync(dbPath);

// Kích hoạt ràng buộc khóa ngoại
db.exec('PRAGMA foreign_keys = ON;');

// Khởi tạo bảng theo schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
}

// Chèn dữ liệu mẫu theo seed.sql
const seedPath = path.join(__dirname, 'seed.sql');
if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    db.exec(seedSql);
}

console.log('✅ SQLite Database GymSpace initialized successfully at:', dbPath);

module.exports = db;
