import { Producto } from "./Producto.js";
import { Usuario } from "./Usuario.js";
import { Cliente } from "./Cliente.js";
import { Proveedor } from "./Proveedor.js";
import { Inventario } from "./Inventario.js";
import { Venta } from "./Venta.js";
import { Compra } from "./Compra.js";

export class Database {
    constructor() {
        this.storageKey = "SIVE_ElectroHogar_Fase3";

        this.modelos = {
            productos: Producto,
            usuarios: Usuario,
            clientes: Cliente,
            proveedores: Proveedor,
            movimientos: Inventario,
            ventas: Venta,
            compras: Compra
        };

        this.datos = this.cargar();
    }

    cargar() {
        const registros = localStorage.getItem(this.storageKey);

        const estructura = {
            productos: [],
            usuarios: [],
            clientes: [],
            proveedores: [],
            movimientos: [],
            ventas: [],
            compras: []
        };

        if (!registros) {
            return estructura;
        }

        const datos = JSON.parse(registros);

        for (const tabla in estructura) {
            const Modelo = this.modelos[tabla];

            estructura[tabla] = (datos[tabla] || []).map(
                registro => Object.assign(
                    Object.create(Modelo.prototype),
                    registro
                )
            );
        }

        return estructura;
    }

    guardar() {
        localStorage.setItem(
            this.storageKey,
            JSON.stringify(this.datos)
        );
    }

    verificarTabla(tabla) {
        if (!Object.hasOwn(this.modelos, tabla)) {
            throw new Error("Tabla no válida.");
        }
    }

    obtenerTodos(tabla) {
        this.verificarTabla(tabla);
        return this.datos[tabla];
    }

    buscarPorId(tabla, id) {
        this.verificarTabla(tabla);

        return this.datos[tabla].find(
            registro => registro.id === id
        );
    }

    generarId(tabla) {
        this.verificarTabla(tabla);

        const registros = this.datos[tabla];

        return registros.reduce(
            (maximo, registro) =>
                Math.max(maximo, Number(registro.id) || 0),
            0
        ) + 1;
    }

    verificarDuplicados(tabla, registro) {
        const camposUnicos = {
            productos: "sku",
            usuarios: "correo",
            clientes: "documento",
            proveedores: "documento"
        };

        const campo = camposUnicos[tabla];

        if (!campo) return;

        const duplicado = this.datos[tabla].some(
            item => item.id !== registro.id &&
            String(item[campo]).trim().toLowerCase() ===
            String(registro[campo]).trim().toLowerCase()
        );

        if (duplicado) {
            throw new Error(
                "Ya existe un registro con el mismo " + campo + "."
            );
        }
    }

    insertar(tabla, registro) {
        this.verificarTabla(tabla);

        if (!registro.id) {
            registro.id = this.generarId(tabla);
        }

        if (this.buscarPorId(tabla, registro.id)) {
            throw new Error("El identificador ya existe.");
        }

        if (typeof registro.validar === "function") {
            registro.validar();
        }

        this.verificarDuplicados(tabla, registro);

        this.datos[tabla].push(registro);
        this.guardar();

        return registro;
    }

    actualizar(tabla, id, cambios) {
        this.verificarTabla(tabla);

        const registro = this.buscarPorId(tabla, id);

        if (!registro) {
            throw new Error("Registro no encontrado.");
        }

        const Modelo = this.modelos[tabla];

        const actualizado = Object.assign(
            Object.create(Modelo.prototype),
            registro,
            cambios,
            { id: id }
        );

        if (typeof actualizado.validar === "function") {
            actualizado.validar();
        }

        this.verificarDuplicados(tabla, actualizado);

        Object.assign(registro, actualizado);
        this.guardar();

        return registro;
    }

    desactivar(tabla, id) {
        const registro = this.buscarPorId(tabla, id);

        if (!registro) {
            throw new Error("Registro no encontrado.");
        }

        if (typeof registro.desactivar !== "function") {
            throw new Error("El registro no admite desactivación.");
        }

        registro.desactivar();
        this.guardar();
    }

    activar(tabla, id) {
        const registro = this.buscarPorId(tabla, id);

        if (!registro) {
            throw new Error("Registro no encontrado.");
        }

        if (typeof registro.activar !== "function") {
            throw new Error("El registro no admite activación.");
        }

        registro.activar();
        this.guardar();
    }

    exportarDatos() {
        return JSON.stringify(this.datos, null, 4);
    }
}