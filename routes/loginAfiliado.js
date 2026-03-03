const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/loginafiliado", async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // 1️⃣ Buscar afiliado por email_publico
        const result = await pool.query(
            "SELECT id, email_publico, contrasena, rol FROM afiliados WHERE email_publico = $1",
            [correo]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
        }

        const afiliado = result.rows[0];

        // 2️⃣ Comparar contraseña
        const passwordOk = await bcrypt.compare(contrasena, afiliado.contrasena);

        if (!passwordOk) {
            return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
        }

        // 3️⃣ Generar token
        const token = jwt.sign(
            {
                id: afiliado.id,
                rol: afiliado.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        // 4️⃣ Respuesta correcta (JSON)
        res.json({
            success: true,
            mensaje: "Login exitoso",
            token,
            usuario: {
                id: afiliado.id,
                correo: afiliado.email_publico,
                rol: afiliado.rol
            }
        });

    } catch (error) {
        console.error("Error login afiliado:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});

module.exports = router;
