const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/bicikli", (req, res) => {
  db.query("SELECT * FROM bicikl", (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.json(data);
    }
  });
});

app.listen(3000, () => {
  console.log("Server radi na portu 3000");
});
