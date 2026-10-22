
/*
 * SIVE - ElectroHogar
 * Funcionalidad inicial de la página web
 */

// Esperar a que el documento HTML termine de cargar
document.addEventListener("DOMContentLoaded", function () {

    // Obtener el botón y el espacio para el mensaje
    const boton = document.getElementById("btnBienvenida");
    const mensaje = document.getElementById("mensaje");

    // Detectar cuando el usuario presiona el botón
    boton.addEventListener("click", function () {

        // Mostrar el mensaje de bienvenida
        mensaje.textContent =
            "¡Bienvenido a SIVE-ElectroHogar! " +
            "El sistema está listo para iniciar.";

    });

});
