export class Cliente {
    constructor(id, nombre, documento, telefono, correo, direccion) {
        this.id = id;
        this.nombre = nombre.trim();
        this.documento = documento.trim();
        this.telefono = telefono.trim();
        this.correo = correo.trim().toLowerCase();
        this.direccion = direccion.trim();
        this.activo = true;
    }

    validar() {
        if (!this.nombre || !this.documento) {
            throw new Error("El nombre y documento son obligatorios.");
        }

        if (this.telefono && !/^[0-9+\s()-]{8,20}$/.test(this.telefono)) {
            throw new Error("El número de teléfono no es válido.");
        }

        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (this.correo && !formatoCorreo.test(this.correo)) {
            throw new Error("El correo electrónico no es válido.");
        }

        return true;
    }

    actualizarDatos(nombre, documento, telefono, correo, direccion) {
        const cliente = new Cliente(
            this.id, nombre, documento, telefono, correo, direccion
        );

        cliente.validar();

        this.nombre = cliente.nombre;
        this.documento = cliente.documento;
        this.telefono = cliente.telefono;
        this.correo = cliente.correo;
        this.direccion = cliente.direccion;
    }

    desactivar() {
        this.activo = false;
    }

    activar() {
        this.activo = true;
    }
}