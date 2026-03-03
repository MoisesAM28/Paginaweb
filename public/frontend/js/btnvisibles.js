//BOTON DE CERRAR SESION Y INICIO DE SESION VISIBLE O INVISIBLE CUANDO ALGUIEN ESTA LOGEADO
document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btnLogin");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    const token = localStorage.getItem("token");

    if (token) {
        // Hay usuario logeado
        if (btnLogin) btnLogin.style.display = "none";
        if (btnCerrarSesion) btnCerrarSesion.style.display = "inline-block";
    } else {
        // No hay usuario logeado
        if (btnLogin) btnLogin.style.display = "inline-block";
        if (btnCerrarSesion) btnCerrarSesion.style.display = "none";
    }

    // Cerrar sesión
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
});
//BOTON DE CERRAR SESION Y INICIO DE SESION VISIBLE O INVISIBLE CUANDO ALGUIEN ESTA LOGEADO


//BOTON DE PERFIL VISIBLE O INVISIBLE CUANDO ALGUIEN ESTA LOGEADO

document.addEventListener("DOMContentLoaded", () => {

    const btnperfil = document.getElementById("btnperfil");
    

    const isLogged = localStorage.getItem("token");

    if (isLogged) {
        // Usuario logeado
        btnperfil.style.display = "inline-block";
    } else {
        // Usuario NO logeado
        btnperfil.style.display = "none";
        
    } 
});
//BOTON DE PERFIL VISIBLE O INVISIBLE CUANDO ALGUIEN ESTA LOGEADO


//SI EL USUARIO ES ADMIN PUEDE LEER CODIGO
document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem("rol");
    const btnQR = document.getElementById("btnLeerQR");

    // Si NO es admin → ocultar el botón
    if (rol !== "admin" ) {
        btnQR.style.display = "none";
    }
});
//SI EL USUARIO ES ADMIN PUEDE LEER CODIGO