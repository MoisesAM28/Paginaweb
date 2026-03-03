document.addEventListener("DOMContentLoaded", () => {
  const btnPerfil = document.getElementById("btnperfil");
  if (!btnPerfil) return;

  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo"); // perfil | afiliado
  const rol  = localStorage.getItem("rol");  // cliente | admin

  // 🔒 No logueado
  if (!token) {
    btnPerfil.href = "login.html";
    return;
  }

  // 🏪 AFILIADO
  if (tipo === "afiliado") {
    btnPerfil.href = "perfilafiliado.html";
    return;
  }

  // 👤 CLIENTE o ADMIN
  if (tipo === "perfil") {
    btnPerfil.href = "perfiles.html";
    return;
  }

  // 🧯 fallback
  btnPerfil.href = "login.html";
});
