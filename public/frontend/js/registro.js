document.getElementById("formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const cumpleanos = document.getElementById("cumpleanos").value;
    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    const respuesta = await fetch("http://localhost:3000/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, contrasena, cumpleanos })
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
        // 🔥 Guardar sesión
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.afiliado.rol);
        localStorage.setItem("id", data.afiliado.id);

        alert("Usuario registrado correctamente");

        console.log("QR generado:", data.qr);
        console.log("URL del perfil:", data.url);

        // Redirigir al home
        window.location.href = "index.html";
    } else {
        alert("Error: " + data.mensaje);
    }
});
