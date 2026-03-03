const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verifica token
// Verifica token
const verificarToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ mensaje: "No hay token, acceso denegado" });
    }

    // Limpieza robusta del token
    const tokenLimpio = token.replace(/bearer\s+/i, "");

    try {
        const decodificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(403).json({ mensaje: "Token inválido" });
    }
};


// Solo admin
const soloAdmin = (req, res, next) => {
    if (!req.usuario)
        return res.status(403).json({ mensaje: "Token no válido" });

    if ((req.usuario.rol || "").toLowerCase() !== "admin") {
        return res.status(403).json({ mensaje: "No tienes permiso para acceder aquí" });
    }

    next();
};

module.exports = { verificarToken, soloAdmin };
