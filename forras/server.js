require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 5000;


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fogado",
});

db.connect((err) => {
  if (err) {
    console.error("Adatbázis kapcsolat hiba:", err.message);
  } else {
    console.log("Sikeres MySQL kapcsolat!");
  }
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Üdvözlöm a szerveren!");
  });
  

app.get("/szobak", (req, res) => {
  db.query("SELECT sznev, agy FROM szobak", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.get("/kihasznaltsag", (req, res) => {
  db.query(
    `SELECT f.szoba, COUNT(f.vendeg) AS vendegek, 
            SUM(DATEDIFF(f.tav, f.erk)) AS vendegejszakak
     FROM foglalasok f
     GROUP BY f.szoba
     ORDER BY vendegejszakak ASC, vendegek ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});


app.get("/foglalasok/:szobaId", (req, res) => {
  const szobaId = req.params.szobaId;
  db.query(
    `SELECT v.vnev, f.erk, f.tav 
     FROM foglalasok f 
     JOIN vendegek v ON f.vendeg = v.vsorsz 
     WHERE f.szoba = ? 
     ORDER BY v.vnev ASC`,
    [szobaId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});


/* app.post("/foglalas", (req, res) => {
  const { vendeg, szoba, erk, tav, fo } = req.body;
  db.query(
    `INSERT INTO foglalasok (vendeg, szoba, erk, tav, fo) VALUES (?, ?, ?, ?, ?)`,
    [vendeg, szoba, erk, tav, fo],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Sikeres foglalás!", id: result.insertId });
    }
  );
});
*/

app.listen(PORT, () => {
  console.log(`Szerver fut:`);
});
