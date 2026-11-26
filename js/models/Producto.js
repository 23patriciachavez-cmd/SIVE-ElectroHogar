export class Producto {
    constructor(id, sku, nombre, categoria, precio, stock, stockMinimo = 5) {
        this.id = id;
        this.sku = sku.trim().toUpperCase();
        this.nombre = nombre.trim();
        this.categoria = categoria;
        this.precio = Number(precio);
        this.stock = Number(stock);
        this.stockMinimo = Number(stockMinimo);
        this.activo = true;
    }

    validar() {
        if (!this.sku || !this.nombre || !this.categoria) {
            throw new Error("Complete los campos obligatorios.");
        }

        if (!Number.isFinite(this.precio) || this.precio <= 0) {
            throw new Error("El precio debe ser mayor que cero.");
        }

        if (!Number.isInteger(this.stock) || this.stock < 0) {
            throw new Error("Las existencias deben ser un entero no negativo.");
        }

        if (!Number.isInteger(this.stockMinimo) || this.stockMinimo < 0) {
            throw new Error("El stock mínimo no es válido.");
        }

        return true;
    }

    actualizarStock(cantidad) {
        if (!Number.isInteger(cantidad)) {
            throw new Error("Cantidad inválida.");
        }

        if (this.stock + cantidad < 0) {
            throw new Error("Existencias insuficientes.");
        }

        this.stock += cantidad;
    }

    tieneStockBajo() {
        return this.stock <= this.stockMinimo;
    }

    desactivar() {
        this.activo = false;
    }

    activar() {
        this.activo = true;
    }
}