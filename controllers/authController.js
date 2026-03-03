const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registrar = async (req, res) => {
    const { nombre, correo, contrasena, cumpleanos } = req.body;

    try {
        const existe = await pool.query(
            "SELECT * FROM perfiles WHERE correo = $1",
            [correo]
        );

        if (existe.rows.length > 0)
            return res.status(409).json({ mensaje: "Correo ya registrado" });

        const hash = await bcrypt.hash(contrasena, 10);

        await pool.query(
            `INSERT INTO perfiles (nombre, correo, contrasena, cumpleanos, rol)
             VALUES ($1, $2, $3, $4, $5)`,
            [nombre, correo, hash, cumpleanos, "usuario"]
        );

        res.status(201).json({ mensaje: "Usuario registrado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM perfiles WHERE correo = $1",
            [correo]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ mensaje: "Usuario no encontrado" });

        const usuario = result.rows[0];

        const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!coincide)
            return res.status(401).json({ mensaje: "Contraseña incorrecta" });

        // 🔥 CLAVE ARREGLADA: Ahora usa JWT_SECRET
        const token = jwt.sign(
            {
                id: usuario.id,
                rol: usuario.rol,
                nombre: usuario.nombre,
                correo: usuario.correo,
                cumpleanos: usuario.cumpleanos
            },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
        );

        res.json({
            mensaje: "Login correcto",
            token,
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol,
                cumpleanos: usuario.cumpleanos
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
