const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// ===============================================
// 🟢 Registro de empresa afiliada
// ===============================================
router.post(
  "/registroempresa",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "documento_legal", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // 🔹 Extraer campos del body
      const {
        nombre_comercial,
        razon_social,
        rfc,
        categoria,
        descripcion,
        email_publico,
        telefono,
        pagina_web,
        nombre_representante,
        banco_nombre,
        cuenta_clabe,
        nombre_membresia,
        precio_membresia,
        beneficios,
        contrasena,
        rol
      } = req.body;

      // 🔹 Validar campos obligatorios
      if (!nombre_comercial || !razon_social || !rfc || !email_publico || !contrasena) {
        return res.status(400).json({
          success: false,
          error: "Faltan campos obligatorios: nombre_comercial, razon_social, rfc, email_publico, contrasena."
        });
      }

      // 🔹 Limpiar campos
      const rfcTrim = rfc.trim().toUpperCase();
      const emailTrim = email_publico.trim().toLowerCase();
      const clabeTrim = cuenta_clabe ? cuenta_clabe.trim() : null;

      console.log("RFC a insertar:", `"${rfcTrim}"`);
      console.log("CLABE a insertar:", `"${clabeTrim}"`);
      console.log("Email a insertar:", `"${emailTrim}"`);

      // 🔹 Preparar URLs de archivos
      const url_logo = req.files?.logo ? "/uploads/" + req.files.logo[0].filename : null;
      const url_documento_legal = req.files?.documento_legal ? "/uploads/" + req.files.documento_legal[0].filename : null;

      // 🔹 Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashContrasena = await bcrypt.hash(contrasena, salt);

      const fecha_registro = new Date();
      const estatus = "pendiente";
      const rolFinal = rol || "afiliado";

      // 🔹 Insertar afiliado (PostgreSQL manejará la unicidad)
      const nuevoAfiliado = await pool.query(
        `INSERT INTO afiliados 
          (fecha_registro, nombre_comercial, razon_social, rfc, categoria, descripcion,
           email_publico, telefono, url_logo, pagina_web, nombre_representante,
           url_documento_legal, banco_nombre, cuenta_clabe, nombre_membresia, 
           precio_membresia, beneficios, estatus, contrasena, rol)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         RETURNING id, rol, nombre_comercial, razon_social, rfc, email_publico`,
        [
          fecha_registro,
          nombre_comercial,
          razon_social,
          rfcTrim,
          categoria,
          descripcion,
          emailTrim,
          telefono,
          url_logo,
          pagina_web,
          nombre_representante,
          url_documento_legal,
          banco_nombre,
          clabeTrim,
          nombre_membresia,
          precio_membresia,
          beneficios,
          estatus,
          hashContrasena,
          rolFinal
        ]
      );

      const afiliado = nuevoAfiliado.rows[0];

      // 🔹 Crear token JWT
      let token;
      if (process.env.JWT_SECRET) {
        token = jwt.sign({ id: afiliado.id, rol: afiliado.rol }, process.env.JWT_SECRET, { expiresIn: "7d" });
      }

      return res.status(201).json({
        success: true,
        mensaje: "Afiliado registrado correctamente",
        token,
        afiliado
      });

    } catch (error) {
      console.error("Error en /api/afiliados/registroempresa:", error);

      // 🔹 Detectar error de clave única
      if (error.code === "23505") {
        const detail = error.detail || "";
        let field = "campo único";
        if (detail.includes("rfc")) field = "rfc";
        else if (detail.includes("email_publico")) field = "email_publico";
        else if (detail.includes("cuenta_clabe")) field = "cuenta_clabe";

        return res.status(400).json({
          success: false,
          error: `Valor duplicado: ${field}. Ya existe un registro con ese valor.`
        });
      }

      return res.status(500).json({
        success: false,
        mensaje: "Error al registrar afiliado",
        error: error.message || String(error)
      });
    }
  }
);

module.exports = router;
