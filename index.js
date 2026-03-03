const express = require("express");
const cors = require("cors");
const pool = require("./db");
const QRCode = require("qrcode");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


const loginAfiliadoRoutes = require("./routes/loginAfiliado");
app.use("/api", loginAfiliadoRoutes);


// ===============================
// 1. IMPORTAR RUTAS Y MIDDLEWARES
// ===============================
const loginRoutes = require("./routes/login");
const perfilRoutes = require("./routes/perfil");
const afiliadosRoutes = require("./routes/afiliados");
const { verificarToken, soloAdmin } = require("./middleware/auth");

// ===============================
// 2. MONTAR RUTAS API
// ===============================
app.use("/api", loginRoutes);
app.use("/api", perfilRoutes);
app.use("/api/afiliados", afiliadosRoutes);

// ===============================
// 3. SERVIR FRONTEND
// ===============================
app.use(express.static(path.join(__dirname, "public", "frontend")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "frontend", "index.html"));
});


// ===============================
// 🔐 Middleware propio para token
// ===============================
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ mensaje: "Token no proporcionado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({ mensaje: "Token inválido" });

        req.user = usuario; // 🔥 UNIFICADO
        next();
    });
}

// ===============================
// 📌 Incrementar contador de QR
// ===============================
app.post("/api/qr-scan/:id", async (req, res) => {
    const id = req.params.id;

    try {
        await pool.query(
            "UPDATE perfiles SET veces_qr = veces_qr + 1 WHERE id = $1",
            [id]
        );

        res.json({ success: true, mensaje: "Contador incrementado" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, mensaje: "Error al actualizar contador" });
    }
});

// ===============================
// 📌 Obtener perfil por ID 
// ===============================
app.get("/api/perfil/:id", verificarToken, async (req, res) => {
    const perfilId = Number(req.params.id);
    const usuario = req.user;   // 🔥 CORREGIDO

    if (isNaN(perfilId)) {
        return res.status(400).json({ mensaje: "ID inválido" });
    }

    // Solo admin ve otros perfiles
    if (usuario.rol !== "admin" && usuario.id !== perfilId) {
        return res.status(403).json({ mensaje: "No tienes permiso para ver este perfil" });
    }

    try {
        const result = await pool.query(
            "SELECT id, nombre, correo, cumpleanos, rol, qr_text, creado_en FROM perfiles WHERE id = $1",
            [perfilId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: "Perfil no encontrado" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});

// ===============================
// 🔵 Perfil del usuario logueado
// ===============================
app.get("/api/perfil", verificarToken, async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT id, nombre, correo, cumpleanos, rol, qr_text, creado_en FROM perfiles WHERE id = $1",
            [req.user.id]  // 🔥 CORREGIDO
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.json({ usuario: user.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});

// ===============================
// 👑 Ruta solo admin
// ===============================
app.get("/api/admin-page", verificarToken, soloAdmin, (req, res) => {
    res.json({ autorizado: true });
});

// ===============================
// Perfil de afiliado por ID
// ===============================
app.get("/api/afiliados/perfil/:id", authenticateToken, async (req, res) => {
    const afiliadoId = Number(req.params.id);

    if (isNaN(afiliadoId)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    const usuarioId = req.user.id;
    const rol = req.user.rol;

    if (rol === "afiliado" && usuarioId !== afiliadoId) {
        return res.status(403).json({ error: "No tienes permiso" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM afiliados WHERE id = $1",
            [afiliadoId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Afiliado no encontrado." });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// ===============================
// Registrar usuario
// ===============================
app.post("/api/registro", async (req, res) => {
    const { nombre, correo, contrasena, cumpleanos } = req.body;

    try {
        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ success: false, mensaje: "Faltan datos" });
        }

        const existe = await pool.query(
            "SELECT * FROM perfiles WHERE correo = $1",
            [correo]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ success: false, mensaje: "El usuario ya existe" });
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        const nuevo = await pool.query(
            `INSERT INTO perfiles (nombre, correo, contrasena, cumpleanos)
             VALUES ($1, $2, $3, $4) RETURNING id, rol`,
            [nombre, correo, contrasenaEncriptada, cumpleanos]
        );

        const idUsuario = nuevo.rows[0].id;

        const urlPerfil = `http://localhost:${process.env.PORT}/api/perfil/${idUsuario}`;
        const qrBase64 = await QRCode.toDataURL(urlPerfil);

        await pool.query(
            "UPDATE perfiles SET qr_text = $1 WHERE id = $2",
            [qrBase64, idUsuario]
        );

        res.json({
            success: true,
            mensaje: "Registro exitoso",
            id: idUsuario,
            qr: qrBase64,
            url: urlPerfil
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error al registrar usuario");
    }
});

// ===============================
// Iniciar servidor
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    // Esto te dirá 3000 en tu PC y un número raro en Render, es normal.
    console.log(`Servidor funcionando en el puerto: ${PORT}`);
});
