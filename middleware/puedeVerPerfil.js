module.exports = (req, res, next) => {
    const usuario = req.usuario;
    const idSolicitado = parseInt(req.params.id);

    if (usuario.rol === "admin") {
        return next();
    }

    if (usuario.id === idSolicitado) {
        return next();
    }

    return res.status(403).json({ mensaje: "No tienes permiso para ver este perfil" });
};
