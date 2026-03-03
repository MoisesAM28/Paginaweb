const express = require("express");
const router = express.Router();
const { registrar, login } = require("../controllers/authController");
const { verificarToken, soloAdmin } = require("../middleware/auth");

// Registro de usuarios
router.post("/registro", registrar);

// Login
router.post("/login", login);

// Ruta protegida (solo usuarios con token válido)
router.get("/perfil", verificarToken, (req, res) => {
    return res.json({
        mensaje: "Acceso permitido",
        usuario: req.usuario
    });
});

// Ruta solo para ADMIN
router.get("/admin", verificarToken, soloAdmin, (req, res) => {
    return res.json({
        mensaje: "Bienvenido admin",
        usuario: req.usuario
    });
});

module.exports = router;
