// registroempresa.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formEmpresa");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("rol", "afiliado");

    try {
      const response = await fetch("http://localhost:3000/api/afiliados/registroempresa", {
        method: "POST",
        body: formData
      });

      // Intentar parsear JSON, pero manejar JSON mal formado
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error("Respuesta no-JSON:", err);
        alert("Respuesta inválida del servidor");
        return;
      }

      // Si el servidor respondió con error (4xx o 5xx)
      if (!response.ok) {
        const msg = data && (data.error || data.mensaje) ? (data.error || data.mensaje) : "Error al registrar negocio";
        alert("Error: " + msg);
        return;
      }

      // Éxito
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("rol", "afiliado");
      if (data.afiliado && data.afiliado.id) localStorage.setItem("id", data.afiliado.id);

      alert("Registro exitoso");
      window.location.href = "index.html";

    } catch (networkError) {
      console.error("Network error al POST /registroempresa:", networkError);
      alert("Error de conexión con el servidor");
    }
  });
});
