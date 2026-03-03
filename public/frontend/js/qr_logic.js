let scanner;

document.getElementById("btnCamara").addEventListener("click", () => {
    document.getElementById("reader").style.display = "block";

    scanner = new Html5Qrcode("reader");

    scanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        qrCodeMessage => {

            // Mostrar lo que leyó (opcional)
            document.getElementById("btnResultado").innerText = "QR detectado";

            // Detener la cámara antes de redirigir
            scanner.stop().then(() => {
                // Redirección automática
                window.location.href = qrCodeMessage;
            }).catch(err => console.log(err));
        },
        errorMessage => {
            // Errores de lectura
        }
    ).catch(err => console.error(err));
});
