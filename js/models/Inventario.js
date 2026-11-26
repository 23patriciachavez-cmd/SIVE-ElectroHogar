export class Inventario {
    constructor(id, productoId, tipo, cantidad, motivo, usuarioId) {
        this.id = id;
        this.productoId = productoId;
        this.tipo = tipo;
        this.cantidad = Number(cantidad);
        this.motivo = motivo.trim();
        this.usuarioId = usuarioId;
        this.fecha = new Date().toISOString();
    }

    validar() {
        if (!this.productoId || !this.usuarioId) {
            throw new Error("Debe seleccionar un producto y un usuario.");
        }

        if (!["entrada", "salida"].includes(this.tipo)) {
            throw new Error("El tipo de movimiento no es válido.");
        }

        if (!Number.isInteger(this.cantidad) || this.cantidad <= 0) {
            throw new Error("La cantidad debe ser un entero positivo.");
        }

        if (!this.motivo) {
            throw new Error("Debe indicar el motivo del movimiento.");
        }

        return true;
    }

    aplicarMovimiento(producto) {
        this.validar();

        if (!producto || producto.id !== this.productoId) {
            throw new Error("El producto no existe o no corresponde.");
        }

        if (!producto.activo) {
            throw new Error("El producto está desactivado.");
        }

        if (this.tipo === "entrada") {
            producto.actualizarStock(this.cantidad);
        } else {
            producto.actualizarStock(-this.cantidad);
        }

        return producto.stock;
    }
}