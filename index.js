const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔥 CONFIG MYSQL (IMPORTANTE: usar nombre del servicio Docker)
const dbConfig = {
  host: "mysql-cine", // ⚠️ NO IP
  user: "root",
  password: "root",
  database: "cine",
  port: 3306,
  connectTimeout: 10000,
};

let db;

// 🔥 CONEXIÓN CON REINTENTOS (FIX PRINCIPAL)
function connectDB() {
  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.log("❌ DB no lista, reintentando en 3s...");
      setTimeout(connectDB, 3000);
    } else {
      console.log("🔥 Conectado a MySQL");

      // 🔥 CREAR TABLA AUTOMÁTICA (FIX CRÍTICO)
      db.query(`
        CREATE TABLE IF NOT EXISTS peliculas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          titulo VARCHAR(255),
          año INT,
          imagen TEXT
        )
      `);
    }
  });

  db.on("error", (err) => {
    console.log("❌ DB error reconexión:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      connectDB();
    }
  });
}

connectDB();

// 🔥 FRONTEND
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 TEST
app.get("/test", (req, res) => {
  res.json({ ok: true, status: "Netflix API OK 🚀" });
});

// 🔥 GET TODAS LAS PELÍCULAS
app.get("/api/peliculas", (req, res) => {
  db.query("SELECT * FROM peliculas", (err, results) => {
    if (err) return res.status(500).json({ fatal: true, error: err });
    res.json(results);
  });
});

// 🔥 CREAR PELÍCULA
app.post("/api/peliculas", (req, res) => {
  const { titulo, año, imagen } = req.body;

  db.query(
    "INSERT INTO peliculas (titulo, año, imagen) VALUES (?, ?, ?)",
    [titulo, año, imagen],
    (err, result) => {
      if (err) return res.status(500).json({ fatal: true, error: err });
      res.json({ ok: true, id: result.insertId });
    }
  );
});

// 🔥 ACTUALIZAR
app.put("/api/peliculas/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, año, imagen } = req.body;

  db.query(
    "UPDATE peliculas SET titulo=?, año=?, imagen=? WHERE id=?",
    [titulo, año, imagen, id],
    (err) => {
      if (err) return res.status(500).json({ fatal: true, error: err });
      res.json({ ok: true });
    }
  );
});

// 🔥 DELETE
app.delete("/api/peliculas/:id", (req, res) => {
  db.query("DELETE FROM peliculas WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ fatal: true, error: err });
    res.json({ ok: true });
  });
});

// 🔥 SERVER
app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 API Netflix Pro corriendo en 3000");
});