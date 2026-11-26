export class Vista {
    constructor() {
        this.contenedor = document.getElementById("contenido");
    }

    obtenerElemento(id) {
        return document.getElementById(id);
    }

    escaparHTML(valor) {
        const elemento = document.createElement("div");
        elemento.textContent = String(valor ?? "");
        return elemento.innerHTML;
    }

    mostrarModulo(html) {
        this.contenedor.innerHTML = html;
    }

    mostrarMensaje(mensaje, tipo = "success") {
        const alerta = document.createElement("div");

        alerta.className = `alerta alerta-${tipo}`;
        alerta.textContent = mensaje;
        alerta.setAttribute("role", "alert");

        document.body.appendChild(alerta);

        setTimeout(() => {
            alerta.remove();
        }, 4000);
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, "error");
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(valor);
    }

    formatearFecha(fecha) {
        return new Date(fecha).toLocaleString("es-SV");
    }

    obtenerDatosFormulario(id) {
        const formulario = this.obtenerElemento(id);
        const datos = new FormData(formulario);

        return Object.fromEntries(datos.entries());
    }

    limpiarFormulario(id) {
        const formulario = this.obtenerElemento(id);

        if (formulario) {
            formulario.reset();
        }
    }

    confirmar(mensaje) {
        return window.confirm(mensaje);
    }

    crearTabla(encabezados, filas) {
        const columnas = encabezados.map(
            encabezado =>
                `<th>${this.escaparHTML(encabezado)}</th>`
        ).join("");

        const contenido = filas.length
            ? filas.map(fila => `
                <tr>
                    ${fila.map(celda =>
                        `<td>${this.escaparHTML(celda)}</td>`
                    ).join("")}
                </tr>
            `).join("")
            : `
                <tr>
                    <td colspan="${encabezados.length}">
                        No hay registros disponibles.
                    </td>
                </tr>
            `;

        return `
            <div class="tabla-responsive">
                <table class="tabla">
                    <thead>
                        <tr>${columnas}</tr>
                    </thead>
                    <tbody>
                        ${contenido}
                    </tbody>
                </table>
            </div>
        `;
    }

    crearOpciones(registros, campo = "nombre") {
        return `
            <option value="">Seleccione una opción</option>
            ${registros
                .filter(registro => registro.activo !== false)
                .map(registro => `
                    <option value="${this.escaparHTML(registro.id).replace(/"/g, "&quot;")}">
                        ${this.escaparHTML(registro[campo])}
                    </option>
                `).join("")}
        `;
    }

    actualizarIndicador(id, valor) {
        const elemento = this.obtenerElemento(id);

        if (elemento) {
            elemento.textContent = valor;
        }
    }

    descargarArchivo(nombre, contenido, tipo = "application/json") {
        const archivo = new Blob([contenido], { type: tipo });
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement("a");

        enlace.href = url;
        enlace.download = nombre;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}