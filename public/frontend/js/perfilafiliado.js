document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const idAfiliado = localStorage.getItem("idUsuario");
    const rol = localStorage.getItem("rol");
    const tipo = localStorage.getItem("tipo");

    // 🔒 Validaciones de seguridad
    if (!token || !idAfiliado || rol !== "afiliado" || tipo !== "afiliado") {
        alert("Acceso no autorizado");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(
            `http://localhost:3000/api/afiliados/perfil/${idAfiliado}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (!res.ok) {
            document.getElementById("profileData").innerHTML =
                `<p>Error: ${data.mensaje || "No se pudo cargar el perfil"}</p>`;
            return;
        }

        // 🧱 Pintar perfil afiliado
        document.getElementById("profileData").innerHTML = `
            <div class="profile-item"><b>Nombre comercial:</b> ${data.nombre_comercial}</div>
            <div class="profile-item"><b>Razón social:</b> ${data.razon_social}</div>
            <div class="profile-item"><b>RFC:</b> ${data.rfc}</div>
            <div class="profile-item"><b>Categoría:</b> ${data.categoria}</div>
            <div class="profile-item"><b>Descripción:</b> ${data.descripcion}</div>
            <div class="profile-item"><b>Email público:</b> ${data.email_publico}</div>
            <div class="profile-item"><b>Teléfono:</b> ${data.telefono}</div>
            <div class="profile-item"><b>Membresía:</b> ${data.nombre_membresia}</div>
            <div class="profile-item"><b>Precio:</b> $${data.precio_membresia}</div>

            <div class="profile-item">
                <b>Logo:</b><br>
                <img src="http://localhost:3000${data.logo}" class="logo">

            </div>
        `;

    } catch (error) {
        console.error(error);
        document.getElementById("profileData").innerHTML =
            "<p>Error de conexión con el servidor</p>";
    }
});
