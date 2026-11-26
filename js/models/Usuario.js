export class Usuario {
    constructor(id, nombre, correo, claveHash, rol) {
        this.id = id;
        this.nombre = nombre.trim();
        this.correo = correo.trim().toLowerCase();
        this.claveHash = claveHash;
        this.rol = rol;
        this.activo = true;
    }

    validar() {
        if (!this.nombre || !this.correo || !this.claveHash) {
            throw new Error("Complete los campos obligatorios.");
        }

        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoCorreo.test(this.correo)) {
            throw new Error("El correo electrónico no es válido.");
        }

        if (!["administrador", "vendedor"].includes(this.rol)) {
            throw new Error("El rol seleccionado no es válido.");
        }

        return true;
    }

    tienePermiso(modulo) {
        if (!this.activo) {
            return false;
        }

        const permisos = {
            administrador: [
                "inicio",
                "productos",
                "inventario",
                "ventas",
                "clientes",
                "proveedores",
                "compras",
                "reportes",
                "usuarios"
            ],
            vendedor: [
                "inicio",
                "consulta-productos",
                "ventas",
                "clientes"
            ]
        };

        return permisos[this.rol]?.includes(modulo) || false;
    }

    desactivar() {
        this.activo = false;
    }

    activar() {
        this.activo = true;
    }
}