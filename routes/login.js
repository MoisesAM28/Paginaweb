const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// LOGIN
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  try {
    const user = await pool.query(
      "SELECT * FROM perfiles WHERE correo = $1",
      [correo]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = user.rows[0];

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // Token
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, tipo: "perfil" },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.json({
      success: true,
      mensaje: "Login exitoso",
      token,
      id: usuario.id,
      rol: usuario.rol,
      tipo: "perfil"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
});


module.exports = router;
