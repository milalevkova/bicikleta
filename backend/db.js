const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bicikleta",
});

db.connect((err) => {
  if (err) {
    console.log("Greška pri spajanju baze:", err);
  } else {
    console.log("Spojeno na MySQL bazu!");
  }
});

module.exports = db;
