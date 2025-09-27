const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./backend/database.sqlite");

// Auto-create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vesselId TEXT,
      task TEXT NOT NULL,
      type TEXT,
      scheduledDate TEXT,
      status TEXT DEFAULT 'pending',
      cost REAL,
      notes TEXT
    )
  `);
});

module.exports = db;
