export class Venta {
    constructor(id, clienteId, usuarioId) {
        this.id = id;
        this.clienteId = clienteId;
        this.usuarioId = usuarioId;
        this.fecha = new Date().toISOString();
        this.detalles = [];
        this.total = 0;
        this.estado = "pendiente";
    }

    agregarProducto(producto, cantidad) {
        if (this.estado !== "pendiente") {
            throw new Error("La venta ya fue procesada.");
        }

        cantidad = Number(cantidad);

        if (!producto || !producto.activo) {
            throw new Error("Producto no disponible.");
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new Error("La cantidad debe ser un entero positivo.");
        }

        const detalle = this.detalles.find(
            item => item.productoId === producto.id
        );

        const cantidadTotal = cantidad + (detalle ? detalle.cantidad : 0);

        if (cantidadTotal > producto.stock) {
            throw new Error("Existencias insuficientes.");
        }

        if (detalle) {
            detalle.cantidad = cantidadTotal;
            detalle.subtotal = Number(
                (detalle.cantidad * detalle.precio).toFixed(2)
            );
        } else {
            this.detalles.push({
                productoId: producto.id,
                nombre: producto.nombre,
                cantidad: cantidad,
                precio: producto.precio,
                subtotal: Number((cantidad * producto.precio).toFixed(2))
            });
        }

        this.calcularTotal();
    }

    eliminarProducto(productoId) {
        if (this.estado !== "pendiente") {
            throw new Error("La venta ya fue procesada.");
        }

        this.detalles = this.detalles.filter(
            item => item.productoId !== productoId
        );

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
        if (!this.usuarioId) {
            throw new Error("Debe identificar al vendedor.");
        }

        if (this.detalles.length === 0) {
            throw new Error("Debe agregar al menos un producto.");
        }

        return true;
    }

    confirmar(productos) {
        if (this.estado !== "pendiente") {
            throw new Error("La venta ya fue procesada.");
        }

        this.validar();

        // Verificar existencias antes de modificar el inventario.
        for (const detalle of this.detalles) {
            const producto = productos.find(
                item => item.id === detalle.productoId
            );

            if (!producto || !producto.activo ||
                producto.stock < detalle.cantidad) {
                throw new Error(
                    "Existencias insuficientes: " + detalle.nombre
                );
            }
        }

        // Descontar las cantidades vendidas.
        for (const detalle of this.detalles) {
            const producto = productos.find(
                item => item.id === detalle.productoId
            );

            producto.actualizarStock(-detalle.cantidad);
        }

        this.estado = "confirmada";
        return true;
    }

    cancelar() {
        if (this.estado !== "pendiente") {
            throw new Error("No se puede cancelar esta venta.");
        }

        this.estado = "cancelada";
    }
}