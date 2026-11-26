export class Compra {
    constructor(id, proveedorId, usuarioId) {
        this.id = id;
        this.proveedorId = proveedorId;
        this.usuarioId = usuarioId;
        this.fecha = new Date().toISOString();
        this.detalles = [];
        this.total = 0;
        this.estado = "pendiente";
    }

    agregarProducto(producto, cantidad, costoUnitario) {
        if (this.estado !== "pendiente") {
            throw new Error("La compra ya fue procesada.");
        }

        cantidad = Number(cantidad);
        costoUnitario = Number(costoUnitario);

        if (!producto || !producto.activo) {
            throw new Error("El producto no está disponible.");
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new Error("La cantidad debe ser un entero positivo.");
        }

        if (!Number.isFinite(costoUnitario) || costoUnitario <= 0) {
            throw new Error("El costo unitario debe ser mayor que cero.");
        }

        this.detalles.push({
            productoId: producto.id,
            nombre: producto.nombre,
            cantidad: cantidad,
            costoUnitario: costoUnitario,
            subtotal: Number((cantidad * costoUnitario).toFixed(2))
        });

        this.calcularTotal();
    }

    eliminarProducto(indice) {
        if (this.estado !== "pendiente") {
            throw new Error("La compra ya fue procesada.");
        }

        if (!Number.isInteger(indice) ||
            indice < 0 || indice >= this.detalles.length) {
            throw new Error("Detalle de compra inválido.");
        }

        this.detalles.splice(indice, 1);
        this.calcularTotal();
    }

    calcularTotal() {
        this.total = Number(
            this.detalles.reduce(
                (total, item) => total + item.subtotal, 0
            ).toFixed(2)
        );

        return this.total;
    }

    validar() {
        if (!this.proveedorId || !this.usuarioId) {
            throw new Error("Debe seleccionar un proveedor y un usuario.");
        }

        if (this.detalles.length === 0) {
            throw new Error("Debe agregar al menos un producto.");
        }

        return true;
    }

    confirmar(productos) {
        if (this.estado !== "pendiente") {
            throw new Error("La compra ya fue procesada.");
        }

        this.validar();

        // Verificar los productos antes de actualizar el inventario.
        for (const detalle of this.detalles) {
            const producto = productos.find(
                item => item.id === detalle.productoId
            );

            if (!producto || !producto.activo) {
                throw new Error(
                    "Producto no disponible: " + detalle.nombre
                );
            }
        }

        // Incrementar las existencias de los productos comprados.
        for (const detalle of this.detalles) {
            const producto = productos.find(
                item => item.id === detalle.productoId
            );

            producto.actualizarStock(detalle.cantidad);
        }

        this.estado = "confirmada";
        return true;
    }

    cancelar() {
        if (this.estado !== "pendiente") {
            throw new Error("No se puede cancelar esta compra.");
        }

        this.estado = "cancelada";
    }
}