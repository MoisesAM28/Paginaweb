const express = require("express");
const router = express.Router();
const pool = require("../db");

// OBTENER PERFIL POR ID
router.get("/perfil/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const result = await pool.query(
      "SELECT * FROM perfiles WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    res.json(result.rows[0]); // ✅ JSON válido
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
