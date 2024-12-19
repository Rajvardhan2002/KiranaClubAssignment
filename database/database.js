const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(":memory:");

const initDB = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          job_id TEXT PRIMARY KEY,
          status TEXT
        )
      `);
      db.run(
        `
        CREATE TABLE IF NOT EXISTS job_results (
          job_id TEXT,
          store_id TEXT,
          perimeter REAL,
          FOREIGN KEY (job_id) REFERENCES jobs (job_id)
        )
      `,
        resolve
      );
    });
  });
};

const queryDB = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

const insertDB = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports = { initDB, queryDB, insertDB };
