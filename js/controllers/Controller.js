import { Producto } from "../models/Producto.js";
import { Usuario } from "../models/Usuario.js";
import { Cliente } from "../models/Cliente.js";
import { Proveedor } from "../models/Proveedor.js";
import { Inventario } from "../models/Inventario.js";
import { Venta } from "../models/Venta.js";
import { Compra } from "../models/Compra.js";
import { catalogoInicial } from "../models/Catalogo.js";

export class Controller {
    constructor(database, vista) {
        this.db = database;
        this.vista = vista;
        this.usuarioActual = null;
        this.ventaActual = null;
        this.compraActual = null;
    }

    async generarHash(clave) {
        const datos = new TextEncoder().encode(clave);
        const hash = await crypto.subtle.digest("SHA-256", datos);

        return Array.from(new Uint8Array(hash))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    // USUARIOS Y AUTENTICACION

    async registrarUsuario(datos) {
        if (!datos.clave || datos.clave.length < 8) {
            throw new Error(
                "La contraseña debe tener al menos 8 caracteres."
            );
        }

        const claveHash = await this.generarHash(datos.clave);

        const usuario = new Usuario(
            this.db.generarId("usuarios"),
            datos.nombre,
            datos.correo,
            claveHash,
            datos.rol
        );

        return this.db.insertar("usuarios", usuario);
    }

    async iniciarSesion(correo, clave) {
        const claveHash = await this.generarHash(clave);

        const usuario = this.db.obtenerTodos("usuarios").find(
            item =>
                item.correo === correo.trim().toLowerCase() &&
                item.claveHash === claveHash &&
                item.activo
        );

        if (!usuario) {
            throw new Error("Correo o contraseña incorrectos.");
        }

        this.usuarioActual = usuario;
        return usuario;
    }
    
    async actualizarUsuario(id, datos) {

        this.verificarPermiso("usuarios");

        id = Number(id);

        const usuario = this.db.buscarPorId("usuarios", id);

        if (!usuario) {
            throw new Error("Usuario no encontrado.");
        }

        if (id === this.usuarioActual.id) {
            throw new Error(
                "No puede editar su propia cuenta desde este módulo."
            );
        }

        const cambios = {
            nombre: datos.nombre.trim(),
            correo: datos.correo.trim().toLowerCase(),
            rol: datos.rol
        };

        if (datos.clave) {

            if (datos.clave.length < 8) {
                throw new Error(
                    "La contraseña debe tener al menos 8 caracteres."
                );
            }

            cambios.claveHash =
                await this.generarHash(datos.clave);
        }

        this.verificarPermiso("usuarios");

        return this.db.actualizar(
            "usuarios",
            id,
            cambios
        );
    }


    desactivarUsuario(id) {
        this.verificarPermiso("usuarios");

        id = Number(id);

        if (id === this.usuarioActual.id) {
            throw new Error(
                "No puede desactivar su propia cuenta."
            );
        }

        this.db.desactivar("usuarios", id);
    }

    activarUsuario(id) {
        this.verificarPermiso("usuarios");

        this.db.activar("usuarios", Number(id));
    }


    cerrarSesion() {
        this.usuarioActual = null;
        this.ventaActual = null;
        this.compraActual = null;
    }

    verificarPermiso(modulo) {
        if (!this.usuarioActual ||
            !this.usuarioActual.tienePermiso(modulo)) {
            throw new Error("No tiene permisos para esta operación.");
        }
    }

    // PRODUCTOS

    registrarProducto(datos) {
        this.verificarPermiso("productos");

        const producto = new Producto(
            this.db.generarId("productos"),
            datos.sku,
            datos.nombre,
            datos.categoria,
            datos.precio,
            datos.stock,
            datos.stockMinimo
        );

        return this.db.insertar("productos", producto);
    }

    actualizarProducto(id, datos) {
        this.verificarPermiso("productos");

        const cambios = {
            sku: datos.sku.trim().toUpperCase(),
            nombre: datos.nombre.trim(),
            categoria: datos.categoria,
            precio: Number(datos.precio),
            stockMinimo: Number(datos.stockMinimo)
        };

        return this.db.actualizar(
            "productos", Number(id), cambios
        );
    }

    desactivarProducto(id) {
        this.verificarPermiso("productos");
        this.db.desactivar("productos", Number(id));
    }

    activarProducto(id) {
        this.verificarPermiso("productos");
        this.db.activar("productos", Number(id));
    }

    buscarProductos(texto = "") {
        if (!this.usuarioActual ||
            !(
                this.usuarioActual.tienePermiso("productos") ||
                this.usuarioActual.tienePermiso("consulta-productos")
            )) {
            throw new Error("Acceso no autorizado.");
        }

        texto = texto.trim().toLowerCase();

        return this.db.obtenerTodos("productos").filter(
            producto =>
                (this.usuarioActual.rol === "administrador" ||
                    producto.activo) &&
                (
                    producto.nombre.toLowerCase().includes(texto) ||
                    producto.sku.toLowerCase().includes(texto) ||
                    producto.categoria.toLowerCase().includes(texto)
                )
        );
    }

    // CLIENTES
  

    cambiarEstadoPersona(tabla, id) {

        if (!["clientes", "proveedores"].includes(tabla)) {
            throw new Error("Módulo no válido.");
        }

        this.verificarPermiso(tabla);

        if (this.usuarioActual.rol !== "administrador") {
            throw new Error(
                "Solo el administrador puede cambiar el estado."
            );
        }

        id = Number(id);

        const persona = this.db.buscarPorId(tabla, id);

        if (!persona) {
            throw new Error("Registro no encontrado.");
        }

        if (persona.activo) {
            this.db.desactivar(tabla, id);
        } else {
            this.db.activar(tabla, id);
        }

        return persona;
    }


    registrarCliente(datos) {
        this.verificarPermiso("clientes");

        const cliente = new Cliente(
            this.db.generarId("clientes"),
            datos.nombre,
            datos.documento,
            datos.telefono || "",
            datos.correo || "",
            datos.direccion || ""
        );

        return this.db.insertar("clientes", cliente);
    }

    actualizarCliente(id, datos) {
        this.verificarPermiso("clientes");

        const cliente = new Cliente(
            Number(id),
            datos.nombre,
            datos.documento,
            datos.telefono || "",
            datos.correo || "",
            datos.direccion || ""
        );

        const { activo, ...cambios } = cliente;

        return this.db.actualizar(
            "clientes", Number(id), cambios
        );
    }

    // PROVEEDORES
   

    registrarProveedor(datos) {
        this.verificarPermiso("proveedores");

        const proveedor = new Proveedor(
            this.db.generarId("proveedores"),
            datos.nombre,
            datos.documento,
            datos.telefono || "",
            datos.correo || "",
            datos.direccion || ""
        );

        return this.db.insertar("proveedores", proveedor);
    }

    actualizarProveedor(id, datos) {
        this.verificarPermiso("proveedores");

        const proveedor = new Proveedor(
            Number(id),
            datos.nombre,
            datos.documento,
            datos.telefono || "",
            datos.correo || "",
            datos.direccion || ""
        );

        const { activo, ...cambios } = proveedor;

        return this.db.actualizar(
            "proveedores", Number(id), cambios
        );
    }


    // INVENTARIO
  

    registrarMovimiento(datos) {
        this.verificarPermiso("inventario");

        const producto = this.db.buscarPorId(
            "productos", Number(datos.productoId)
        );

        const movimiento = new Inventario(
            this.db.generarId("movimientos"),
            Number(datos.productoId),
            datos.tipo,
            datos.cantidad,
            datos.motivo,
            this.usuarioActual.id
        );

        movimiento.aplicarMovimiento(producto);

        return this.db.insertar("movimientos", movimiento);
    }

  
    // VENTAS
    

    iniciarVenta(clienteId) {
        this.verificarPermiso("ventas");

        const cliente = this.db.buscarPorId(
            "clientes", Number(clienteId)
        );

        if (!cliente || !cliente.activo) {
            throw new Error("Debe seleccionar un cliente válido.");
        }

        this.ventaActual = new Venta(
            this.db.generarId("ventas"),
            cliente.id,
            this.usuarioActual.id
        );

        return this.ventaActual;
    }

    agregarProductoVenta(productoId, cantidad) {
        this.verificarPermiso("ventas");

        if (!this.ventaActual) {
            throw new Error("Debe iniciar una venta.");
        }

        const producto = this.db.buscarPorId(
            "productos", Number(productoId)
        );

        this.ventaActual.agregarProducto(producto, cantidad);

        return this.ventaActual;
    }

    eliminarProductoVenta(productoId) {
        this.verificarPermiso("ventas");

        if (!this.ventaActual) {
            throw new Error("No hay una venta pendiente.");
        }

        this.ventaActual.eliminarProducto(Number(productoId));
    }

    confirmarVenta() {
        this.verificarPermiso("ventas");

        if (!this.ventaActual) {
            throw new Error("No hay una venta pendiente.");
        }

        const venta = this.ventaActual;

        const cliente = this.db.buscarPorId(
            "clientes", venta.clienteId
        );

        if (!cliente || !cliente.activo) {
            throw new Error("El cliente no está disponible.");
        }

        venta.confirmar(this.db.obtenerTodos("productos"));

        this.db.insertar("ventas", venta);

        for (const detalle of venta.detalles) {
            const movimiento = new Inventario(
                this.db.generarId("movimientos"),
                detalle.productoId,
                "salida",
                detalle.cantidad,
                "Venta #" + venta.id,
                this.usuarioActual.id
            );

            this.db.insertar("movimientos", movimiento);
        }

        this.ventaActual = null;
        return venta;
    }

    cancelarVenta() {
        this.verificarPermiso("ventas");

        if (this.ventaActual) {
            this.ventaActual.cancelar();
            this.ventaActual = null;
        }
    }

   
    // COMPRAS


    iniciarCompra(proveedorId) {
        this.verificarPermiso("compras");

        const proveedor = this.db.buscarPorId(
            "proveedores", Number(proveedorId)
        );

        if (!proveedor || !proveedor.activo) {
            throw new Error("Debe seleccionar un proveedor válido.");
        }

        this.compraActual = new Compra(
            this.db.generarId("compras"),
            proveedor.id,
            this.usuarioActual.id
        );

        return this.compraActual;
    }

    agregarProductoCompra(productoId, cantidad, costo) {
        this.verificarPermiso("compras");

        if (!this.compraActual) {
            throw new Error("Debe iniciar una compra.");
        }

        const producto = this.db.buscarPorId(
            "productos", Number(productoId)
        );

        this.compraActual.agregarProducto(
            producto, cantidad, costo
        );

        return this.compraActual;
    }

    eliminarProductoCompra(indice) {
        this.verificarPermiso("compras");

        if (!this.compraActual) {
            throw new Error("No hay una compra pendiente.");
        }

        this.compraActual.eliminarProducto(Number(indice));
    }

    confirmarCompra() {
        this.verificarPermiso("compras");

        if (!this.compraActual) {
            throw new Error("No hay una compra pendiente.");
        }

        const compra = this.compraActual;

        const proveedor = this.db.buscarPorId(
            "proveedores", compra.proveedorId
        );

        if (!proveedor || !proveedor.activo) {
            throw new Error("El proveedor no está disponible.");
        }

        compra.confirmar(this.db.obtenerTodos("productos"));

        this.db.insertar("compras", compra);

        for (const detalle of compra.detalles) {
            const movimiento = new Inventario(
                this.db.generarId("movimientos"),
                detalle.productoId,
                "entrada",
                detalle.cantidad,
                "Compra #" + compra.id,
                this.usuarioActual.id
            );

            this.db.insertar("movimientos", movimiento);
        }

        this.compraActual = null;
        return compra;
    }

    cancelarCompra() {
        this.verificarPermiso("compras");

        if (this.compraActual) {
            this.compraActual.cancelar();
            this.compraActual = null;
        }
    }

   
    // REPORTES Y PANEL DE CONTROL
    

    obtenerResumen() {
        this.verificarPermiso("inicio");

        const productos = this.db.obtenerTodos("productos");
        const ventas = this.db.obtenerTodos("ventas");
        const compras = this.db.obtenerTodos("compras");

        return {
            totalProductos: productos.filter(p => p.activo).length,

            totalUnidades: productos.reduce(
                (total, p) => total + p.stock, 0
            ),

            totalVentas: ventas.length,

            ingresos: ventas.reduce(
                (total, v) => total + v.total, 0
            ),

            totalCompras: compras.length,

            egresos: compras.reduce(
                (total, c) => total + c.total, 0
            ),

            stockBajo: productos.filter(
                p => p.activo && p.tieneStockBajo()
            ).length
        };
    }

    obtenerProductosStockBajo() {
        this.verificarPermiso("reportes");

        return this.db.obtenerTodos("productos").filter(
            producto =>
                producto.activo && producto.tieneStockBajo()
        );
    }

    obtenerReporteVentas() {
        this.verificarPermiso("reportes");
        return this.db.obtenerTodos("ventas");
    }

    obtenerReporteCompras() {
        this.verificarPermiso("reportes");
        return this.db.obtenerTodos("compras");
    }

    exportarDatos() {
        this.verificarPermiso("usuarios");

        this.vista.descargarArchivo(
            "SIVE-respaldo.json",
            this.db.exportarDatos()
        );
    }

    
    // DATOS INICIALES DE DEMOSTRACION
  

    async inicializarDatos() {
        if (this.db.obtenerTodos("productos").length === 0) {
            for (const datos of catalogoInicial) {
                const producto = new Producto(
                    this.db.generarId("productos"),
                    datos.sku,
                    datos.nombre,
                    datos.categoria,
                    datos.precio,
                    datos.stock,
                    datos.stockMinimo
                );

                this.db.insertar("productos", producto);
            }
        }
        if (this.db.obtenerTodos("usuarios").length === 0) {
            await this.registrarUsuario({
                nombre: "Administrador SIVE",
                correo: "admin@electrohogar.com",
                clave: "Admin123",
                rol: "administrador"
            });

            await this.registrarUsuario({
                nombre: "Vendedor SIVE",
                correo: "ventas@electrohogar.com",
                clave: "Ventas123",
                rol: "vendedor"
            });
        }

        if (this.db.obtenerTodos("clientes").length === 0) {
            const cliente = new Cliente(
                1,
                "Consumidor final",
                "CF-001",
                "",
                "",
                ""
            );

            this.db.insertar("clientes", cliente);
        }
    }
}