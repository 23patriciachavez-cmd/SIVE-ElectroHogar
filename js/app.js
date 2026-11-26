
import { Database } from "./models/Database.js";
import { Vista } from "./views/Vista.js";
import { Controller } from "./controllers/Controller.js";

// =====================================
// INICIALIZACION DE LA ARQUITECTURA MVC
// =====================================

const database = new Database();
const vista = new Vista();
const controller = new Controller(database, vista);

// =====================================
// INICIO DE LA APLICACION
// =====================================

async function iniciarAplicacion() {
    try {
        await controller.inicializarDatos();

        mostrarLogin();

        document.getElementById("formLogin")
            .addEventListener("submit", iniciarSesion);

        document.getElementById("btnCerrarSesion")
            .addEventListener("click", cerrarSesion);

        document.querySelectorAll("[data-modulo]")
            .forEach(boton => {
                boton.addEventListener("click", () => {
                    navegar(boton.dataset.modulo);
                });
            });

    } catch (error) {
        vista.mostrarError(error.message);
    }
}

// =====================================
// AUTENTICACION
// =====================================

function mostrarLogin() {
    document.getElementById("login").hidden = false;
    document.getElementById("aplicacion").hidden = true;
}

async function iniciarSesion(evento) {
    evento.preventDefault();

    try {
        const datos = vista.obtenerDatosFormulario("formLogin");

        const usuario = await controller.iniciarSesion(
            datos.correo,
            datos.clave
        );

        document.getElementById("login").hidden = true;
        document.getElementById("aplicacion").hidden = false;

        document.getElementById("nombreUsuario").textContent =
            usuario.nombre;

        document.getElementById("rolUsuario").textContent =
            usuario.rol;

        configurarMenu(usuario);

        navegar("inicio");

        vista.limpiarFormulario("formLogin");

        vista.mostrarMensaje("Bienvenido al sistema SIVE.");

    } catch (error) {
        vista.mostrarError(error.message);
    }
}

function cerrarSesion() {
    controller.cerrarSesion();

    document.getElementById("contenido").innerHTML = "";

    mostrarLogin();

    vista.mostrarMensaje("Sesión cerrada correctamente.");
}

function configurarMenu(usuario) {
    document.querySelectorAll("[data-modulo]")
        .forEach(boton => {
            boton.hidden = !usuario.tienePermiso(
                boton.dataset.modulo
            );
        });
}

// =====================================
// NAVEGACION ENTRE MODULOS
// =====================================

function navegar(modulo) {
    try {
        controller.verificarPermiso(modulo);

        document.querySelectorAll("[data-modulo]")
            .forEach(boton => {
                boton.classList.toggle(
                    "activo",
                    boton.dataset.modulo === modulo
                );
            });

        switch (modulo) {
            case "inicio":
                mostrarInicio();
                break;

            case "productos":
            case "consulta-productos":
                mostrarProductos();
                break;

            case "inventario":
                mostrarInventario();
                break;

            case "clientes":
                mostrarPersonas("clientes");
                break;

            case "proveedores":
                mostrarPersonas("proveedores");
                break;

            case "ventas":
                mostrarTransaccion("ventas");
                break;

            case "compras":
                mostrarTransaccion("compras");
                break;

            case "reportes":
                mostrarReportes();
                break;

            case "usuarios":
                mostrarUsuarios();
                break;

            default:
                throw new Error("Módulo no disponible.");
        }

    } catch (error) {
        vista.mostrarError(error.message);
    }
}

// =====================================
// PANEL PRINCIPAL
// =====================================

function mostrarInicio() {
    const resumen = controller.obtenerResumen();

    vista.mostrarModulo(`
        <h1>Panel de control</h1>

        <p>Resumen general de SIVE ElectroHogar</p>

        <div class="indicadores">

            <div class="tarjeta">
                <h3>Productos activos</h3>
                <strong>${resumen.totalProductos}</strong>
            </div>

            <div class="tarjeta">
                <h3>Unidades disponibles</h3>
                <strong>${resumen.totalUnidades}</strong>
            </div>

            <div class="tarjeta">
                <h3>Ventas realizadas</h3>
                <strong>${resumen.totalVentas}</strong>
            </div>

            <div class="tarjeta">
                <h3>Ingresos por ventas</h3>

                <strong>
                    ${vista.formatearMoneda(resumen.ingresos)}
                </strong>
            </div>

            <div class="tarjeta">
                <h3>Compras realizadas</h3>
                <strong>${resumen.totalCompras}</strong>
            </div>

            <div class="tarjeta">
                <h3>Egresos por compras</h3>

                <strong>
                    ${vista.formatearMoneda(resumen.egresos)}
                </strong>
            </div>

            <div class="tarjeta">
                <h3>Productos con stock bajo</h3>
                <strong>${resumen.stockBajo}</strong>
            </div>

        </div>
    `);
}

// =====================================
// MODULO DE PRODUCTOS
// =====================================

function mostrarProductos() {
    const administrador =
        controller.usuarioActual.rol === "administrador";

    vista.mostrarModulo(`
        <h1>Gestión de productos</h1>

        ${administrador ? `

            <form id="formProducto" class="formulario">

                <input type="hidden" name="id">

                <input name="sku"
                    placeholder="Código SKU" required>

                <input name="nombre"
                    placeholder="Nombre del producto" required>

                <input name="categoria"
                    placeholder="Categoría" required>

                <input name="precio" type="number"
                    min="0.01" step="0.01"
                    placeholder="Precio" required>

                <input name="stock" type="number"
                    min="0" step="1"
                    placeholder="Stock inicial" required>

                <input name="stockMinimo" type="number"
                    min="0" step="1" value="5"
                    placeholder="Stock mínimo" required>

                <button type="submit">
                    Guardar producto
                </button>

                <button type="reset">
                    Limpiar
                </button>

            </form>

        ` : ""}

        <input id="buscarProducto"
            placeholder="Buscar por nombre, SKU o categoría">

        <div id="tablaProductos"></div>
    `);

    function cargarTabla(texto = "") {

        const productos = controller.buscarProductos(texto);

        const encabezados = [
            "ID",
            "SKU",
            "Producto",
            "Categoría",
            "Precio",
            "Stock",
            "Estado"
        ];

        if (administrador) {
            encabezados.push("Acciones");
        }

        const filas = productos.map(p => [
            p.id,
            p.sku,
            p.nombre,
            p.categoria,
            vista.formatearMoneda(p.precio),
            p.stock,
            p.activo ? "Activo" : "Inactivo"
        ]);

        document.getElementById("tablaProductos").innerHTML =
            vista.crearTabla(encabezados, filas);

        if (administrador) {

            const registros = document.querySelectorAll(
                "#tablaProductos tbody tr"
            );

            productos.forEach((producto, indice) => {

                const fila = registros[indice];

                fila.style.cursor = "pointer";

                // Mostrar los datos para editar el producto.

                fila.addEventListener("click", () => {

                    const formulario =
                        document.getElementById("formProducto");

                    Object.keys(producto).forEach(campo => {

                        const elemento =
                            formulario.elements.namedItem(campo);

                        if (elemento) {
                            elemento.value = producto[campo];
                        }

                    });

                    // El stock se modifica desde Inventario.

                    formulario.elements.namedItem("stock")
                        .readOnly = true;

                });

                // Aplicar estilo al estado del producto.

                fila.cells[6].className = producto.activo
                    ? "estado-activo"
                    : "estado-inactivo";

                // Botón de activación y desactivación.

                const celda = fila.insertCell();

                const boton = document.createElement("button");

                boton.type = "button";

                boton.textContent = producto.activo
                    ? "Desactivar"
                    : "Activar";

                boton.className = producto.activo
                    ? "btn-desactivar"
                    : "btn-activar";

                boton.addEventListener("click", evento => {

                    evento.stopPropagation();

                    try {

                        if (producto.activo) {

                            if (!vista.confirmar(
                                "¿Desea desactivar este producto?"
                            )) return;

                            controller.desactivarProducto(
                                producto.id
                            );

                            vista.mostrarMensaje(
                                "Producto desactivado correctamente."
                            );

                        } else {

                            controller.activarProducto(
                                producto.id
                            );

                            vista.mostrarMensaje(
                                "Producto activado correctamente."
                            );
                        }

                        limpiarFormularioProducto();

                        cargarTabla(
                            document.getElementById(
                                "buscarProducto"
                            ).value
                        );

                    } catch (error) {
                        vista.mostrarError(error.message);
                    }

                });

                celda.appendChild(boton);

            });
        }
    }

    function limpiarFormularioProducto() {

        const formulario =
            document.getElementById("formProducto");

        if (formulario) {

            formulario.reset();

            formulario.elements.namedItem("id").value = "";

            formulario.elements.namedItem("stock")
                .readOnly = false;
        }
    }

    document.getElementById("buscarProducto")
        .addEventListener("input", evento => {
            cargarTabla(evento.target.value);
        });

    if (administrador) {

        const formulario =
            document.getElementById("formProducto");

        formulario.addEventListener("reset", () => {

            formulario.elements.namedItem("stock")
                .readOnly = false;

        });

        formulario.addEventListener("submit", evento => {

            evento.preventDefault();

            try {

                const datos =
                    vista.obtenerDatosFormulario("formProducto");

                if (datos.id) {

                    controller.actualizarProducto(
                        datos.id,
                        datos
                    );

                } else {

                    controller.registrarProducto(datos);
                }

                limpiarFormularioProducto();

                cargarTabla(
                    document.getElementById(
                        "buscarProducto"
                    ).value
                );

                vista.mostrarMensaje("Producto guardado.");

            } catch (error) {
                vista.mostrarError(error.message);
            }

        });
    }

    cargarTabla();
}

// =====================================
// MODULO DE INVENTARIO
// =====================================

function mostrarInventario() {

    const productos = database.obtenerTodos("productos");

    const movimientos = database.obtenerTodos("movimientos");

    vista.mostrarModulo(`
        <h1>Control de inventario</h1>

        <form id="formInventario" class="formulario">

            <select name="productoId" required>
                ${vista.crearOpciones(productos)}
            </select>

            <select name="tipo" required>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
            </select>

            <input name="cantidad" type="number"
                min="1" step="1"
                placeholder="Cantidad" required>

            <select name="motivo"
                id="motivoMovimiento" required>

                <option value="">
                    Seleccione un motivo
                </option>

            </select>

            <input name="otroMotivo"
                id="otroMotivo"
                placeholder="Especifique el motivo" hidden>

            <button type="submit">
                Registrar movimiento
            </button>

        </form>

        <h2>Historial de movimientos</h2>

        ${vista.crearTabla(
            [
                [
                  "Fecha",
                  "Producto",
                  "Tipo",
                  "Cantidad",
                  "Motivo",
                  "Usuario responsable"
],
            ],

            movimientos.map(m => [

                vista.formatearFecha(m.fecha),

                database.buscarPorId(
                    "productos",
                    m.productoId
                )?.nombre || "Producto",

                m.tipo,

                m.cantidad,

                m.motivo,

database.buscarPorId(
    "usuarios",
    m.usuarioId
)?.nombre || "Usuario no disponible"

            ])
        )}
    `);

    // Motivos preestablecidos de inventario.

    const motivos = {

        entrada: [
            "Reabastecimiento de mercadería",
            "Devolución de cliente",
            "Ajuste de inventario",
            "Traslado de mercadería",
            "Otro"
        ],

        salida: [
            "Mercadería dañada",
            "Devolución al proveedor",
            "Pérdida de mercadería",
            "Ajuste de inventario",
            "Traslado de mercadería",
            "Otro"
        ]
    };

    const tipoMovimiento = document.querySelector(
        '#formInventario select[name="tipo"]'
    );

    const motivoMovimiento =
        document.getElementById("motivoMovimiento");

    const otroMotivo =
        document.getElementById("otroMotivo");

    function cargarMotivos() {

        motivoMovimiento.innerHTML =
            '<option value="">Seleccione un motivo</option>';

        motivos[tipoMovimiento.value].forEach(motivo => {

            motivoMovimiento.add(
                new Option(motivo, motivo)
            );

        });

        otroMotivo.hidden = true;
        otroMotivo.required = false;
        otroMotivo.value = "";
    }

    tipoMovimiento.addEventListener(
        "change",
        cargarMotivos
    );

    motivoMovimiento.addEventListener("change", () => {

        const esOtro =
            motivoMovimiento.value === "Otro";

        otroMotivo.hidden = !esOtro;
        otroMotivo.required = esOtro;

        if (!esOtro) {
            otroMotivo.value = "";
        }

    });

    cargarMotivos();

    document.getElementById("formInventario")
        .addEventListener("submit", evento => {

            evento.preventDefault();

            try {

                const datos =
                    vista.obtenerDatosFormulario("formInventario");

                if (datos.motivo === "Otro") {

                    datos.motivo = datos.otroMotivo.trim();

                    if (!datos.motivo) {
                        throw new Error(
                            "Debe especificar el motivo."
                        );
                    }
                }

                controller.registrarMovimiento(datos);

                mostrarInventario();

                vista.mostrarMensaje("Movimiento registrado.");

            } catch (error) {
                vista.mostrarError(error.message);
            }

        });
}

// =====================================
// CLIENTES Y PROVEEDORES
// =====================================


function mostrarPersonas(tabla) {

    controller.verificarPermiso(tabla);

    const esCliente = tabla === "clientes";

    const administrador =
        controller.usuarioActual.rol === "administrador";

    const registros = database.obtenerTodos(tabla);

    vista.mostrarModulo(`

        <h1>Gestión de ${tabla}</h1>

        <form id="formPersona" class="formulario">

            <input type="hidden" name="id">

            <input name="nombre"
                placeholder="Nombre" required>

            <input name="documento"
                placeholder="Documento" required>

            <input name="telefono"
                placeholder="Teléfono">

            <input name="correo" type="email"
                placeholder="Correo electrónico">

            <input name="direccion"
                placeholder="Dirección">

            <button id="btnGuardarPersona" type="submit">
                Guardar
            </button>

            <button type="reset">
                Limpiar
            </button>

        </form>

        <div class="tabla-responsive">

            <table class="tabla">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th>Dirección</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>

                </thead>

                <tbody>

                    ${registros.length === 0 ? `

                        <tr>
                            <td colspan="8">
                                No hay registros disponibles.
                            </td>
                        </tr>

                    ` : registros.map(p => `

                        <tr>

                            <td>${p.id}</td>

                            <td>
                                ${vista.escaparHTML(p.nombre)}
                            </td>

                            <td>
                                ${vista.escaparHTML(p.documento)}
                            </td>

                            <td>
                                ${vista.escaparHTML(p.telefono)}
                            </td>

                            <td>
                                ${vista.escaparHTML(p.correo)}
                            </td>

                            <td>
                                ${vista.escaparHTML(p.direccion)}
                            </td>

                            <td>

                                <span class="${p.activo
                                    ? "estado-activo"
                                    : "estado-inactivo"}">

                                    ${p.activo
                                        ? "Activo"
                                        : "Inactivo"}

                                </span>

                            </td>

                            <td>

                                <div class="acciones-usuario">

                                    <button
                                        type="button"
                                        class="btn-editar"
                                        data-editar-persona="${p.id}">

                                        Editar

                                    </button>

                                    ${administrador ? `

                                        <button
                                            type="button"

                                            class="${p.activo
                                                ? "btn-desactivar"
                                                : "btn-activar"}"

                                            data-estado-persona="${p.id}">

                                            ${p.activo
                                                ? "Desactivar"
                                                : "Activar"}

                                        </button>

                                    ` : ""}

                                </div>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `);

    const formulario =
        document.getElementById("formPersona");

    const btnGuardar =
        document.getElementById("btnGuardarPersona");

    // =====================================
    // EDITAR CLIENTES Y PROVEEDORES
    // =====================================

    document.querySelectorAll("[data-editar-persona]")
        .forEach(boton => {

            boton.addEventListener("click", () => {

                const id =
                    Number(boton.dataset.editarPersona);

                const persona =
                    database.buscarPorId(tabla, id);

                if (!persona) {

                    vista.mostrarError(
                        "Registro no encontrado."
                    );

                    return;
                }

                Object.keys(persona).forEach(campo => {

                    const elemento =
                        formulario.elements.namedItem(campo);

                    if (elemento) {
                        elemento.value = persona[campo];
                    }

                });

                btnGuardar.textContent =
                    "Actualizar registro";

                formulario.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            });

        });

    // =====================================
    // LIMPIAR FORMULARIO
    // =====================================

    formulario.addEventListener("reset", () => {

        btnGuardar.textContent = "Guardar";

    });

    // =====================================
    // GUARDAR O ACTUALIZAR REGISTROS
    // =====================================

    formulario.addEventListener("submit", evento => {

        evento.preventDefault();

        try {

            const datos =
                vista.obtenerDatosFormulario("formPersona");

            if (esCliente) {

                if (datos.id) {

                    controller.actualizarCliente(
                        datos.id,
                        datos
                    );

                } else {

                    controller.registrarCliente(datos);
                }

            } else {

                if (datos.id) {

                    controller.actualizarProveedor(
                        datos.id,
                        datos
                    );

                } else {

                    controller.registrarProveedor(datos);
                }
            }

            mostrarPersonas(tabla);

            vista.mostrarMensaje(
                "Registro guardado correctamente."
            );

        } catch (error) {

            vista.mostrarError(error.message);

        }

    });

    // =====================================
    // ACTIVAR Y DESACTIVAR REGISTROS
    // =====================================

    document.querySelectorAll("[data-estado-persona]")
        .forEach(boton => {

            boton.addEventListener("click", () => {

                try {

                    const id =
                        Number(boton.dataset.estadoPersona);

                    const persona =
                        database.buscarPorId(tabla, id);

                    if (!persona) {
                        throw new Error(
                            "Registro no encontrado."
                        );
                    }

                    const accion = persona.activo
                        ? "desactivar"
                        : "activar";

                    const confirmado = vista.confirmar(
                        "¿Está seguro de " +
                        accion +
                        " este registro?"
                    );

                    if (!confirmado) return;

                    const actualizado =
                        controller.cambiarEstadoPersona(
                            tabla,
                            id
                        );

                    vista.mostrarMensaje(

                        actualizado.activo

                            ? "Registro activado correctamente."

                            : "Registro desactivado correctamente."

                    );

                    mostrarPersonas(tabla);

                } catch (error) {

                    vista.mostrarError(error.message);

                }

            });

        });
}


// =====================================
// MODULOS DE VENTAS Y COMPRAS
// =====================================

function mostrarTransaccion(modulo) {

    const esVenta = modulo === "ventas";

    const personas = database.obtenerTodos(
        esVenta ? "clientes" : "proveedores"
    );

    const productos = database.obtenerTodos("productos");

    const transaccion = esVenta
        ? controller.ventaActual
        : controller.compraActual;

    vista.mostrarModulo(`
        <h1>Gestión de ${modulo}</h1>

        ${!transaccion ? `

            <form id="formIniciar" class="formulario">

                <select name="personaId" required>
                    ${vista.crearOpciones(personas)}
                </select>

                <button type="submit">
                    Nueva ${esVenta ? "venta" : "compra"}
                </button>

            </form>

        ` : `

            <p>
                <strong>
                    ${esVenta ? "Cliente" : "Proveedor"}:
                </strong>

                ${vista.escaparHTML(
                    personas.find(p =>
                        p.id === (
                            esVenta
                                ? transaccion.clienteId
                                : transaccion.proveedorId
                        )
                    )?.nombre || "No disponible"
                )}
            </p>

            <form id="formDetalle" class="formulario">

                <select name="productoId" required>
                    ${vista.crearOpciones(productos)}
                </select>

                <input name="cantidad" type="number"
                    min="1" step="1"
                    placeholder="Cantidad" required>

                ${!esVenta ? `

                    <input name="costo" type="number"
                        min="0.01" step="0.01"
                        placeholder="Costo unitario" required>

                ` : ""}

                <button type="submit">
                    Agregar producto
                </button>

            </form>

            <div id="tablaDetalles">

                ${vista.crearTabla(

                    [
                        "Producto",
                        "Cantidad",
                        "Precio/Costo",
                        "Subtotal",
                        "Acciones"
                    ],

                    transaccion.detalles.map(d => [

                        d.nombre,

                        d.cantidad,

                        vista.formatearMoneda(
                            esVenta
                                ? d.precio
                                : d.costoUnitario
                        ),

                        vista.formatearMoneda(d.subtotal)

                    ])
                )}

            </div>

            <h2>
                Total:
                ${vista.formatearMoneda(transaccion.total)}
            </h2>

            <button id="btnConfirmar" type="button">
                Confirmar
            </button>

            <button id="btnCancelar" type="button">
                Cancelar
            </button>

        `}

        <h2>Historial de ${modulo}</h2>

        ${vista.crearTabla(

            [
                "ID",
                "Fecha",
                "Total",
                "Estado"
            ],

            database.obtenerTodos(modulo).map(t => [

                t.id,

                vista.formatearFecha(t.fecha),

                vista.formatearMoneda(t.total),

                t.estado

            ])
        )}
    `);

    function ejecutar(operacion) {

        try {

            operacion();

            mostrarTransaccion(modulo);

        } catch (error) {

            vista.mostrarError(error.message);
        }
    }

    if (!transaccion) {

        // Iniciar una nueva venta o compra.

        document.getElementById("formIniciar")
            .addEventListener("submit", evento => {

                evento.preventDefault();

                const datos =
                    vista.obtenerDatosFormulario("formIniciar");

                ejecutar(() => {

                    if (esVenta) {

                        controller.iniciarVenta(
                            datos.personaId
                        );

                    } else {

                        controller.iniciarCompra(
                            datos.personaId
                        );
                    }

                });

            });

    } else {

        // Agregar productos a la transacción.

        document.getElementById("formDetalle")
            .addEventListener("submit", evento => {

                evento.preventDefault();

                const datos =
                    vista.obtenerDatosFormulario("formDetalle");

                ejecutar(() => {

                    if (esVenta) {

                        controller.agregarProductoVenta(
                            datos.productoId,
                            datos.cantidad
                        );

                    } else {

                        controller.agregarProductoCompra(
                            datos.productoId,
                            datos.cantidad,
                            datos.costo
                        );
                    }

                });

            });

        // =====================================
        // RETIRAR PRODUCTOS DE VENTAS Y COMPRAS
        // =====================================

        const filasDetalles = document.querySelectorAll(
            "#tablaDetalles tbody tr"
        );

        transaccion.detalles.forEach((detalle, indice) => {

            const celda =
                filasDetalles[indice].insertCell();

            const boton = document.createElement("button");

            boton.type = "button";

            boton.textContent = "Retirar";

            boton.className = "btn-desactivar";

            boton.addEventListener("click", () => {

                ejecutar(() => {

                    if (esVenta) {

                        controller.eliminarProductoVenta(
                            detalle.productoId
                        );

                    } else {

                        controller.eliminarProductoCompra(
                            indice
                        );
                    }

                    vista.mostrarMensaje(
                        "Producto retirado correctamente."
                    );

                });

            });

            celda.appendChild(boton);

        });

        // Confirmar la transacción.

        document.getElementById("btnConfirmar")
            .addEventListener("click", () => {

                ejecutar(() => {

                    if (esVenta) {

                        controller.confirmarVenta();

                    } else {

                        controller.confirmarCompra();
                    }

                    vista.mostrarMensaje(
                        "Operación registrada correctamente."
                    );

                });

            });

        // Cancelar la transacción.

        document.getElementById("btnCancelar")
            .addEventListener("click", () => {

                ejecutar(() => {

                    if (esVenta) {

                        controller.cancelarVenta();

                    } else {

                        controller.cancelarCompra();
                    }

                    vista.mostrarMensaje(
                        "Operación cancelada correctamente."
                    );

                });

            });
    }
}

// =====================================
// MODULO DE REPORTES
// =====================================


function mostrarReportes() {

    controller.verificarPermiso("reportes");

    const ventas = controller.obtenerReporteVentas();

    const compras = controller.obtenerReporteCompras();

    const stockBajo = controller.obtenerProductosStockBajo();

    let ventasFiltradas = [...ventas];

    let comprasFiltradas = [...compras];

    vista.mostrarModulo(`

        <h1>Reportes del sistema</h1>

        <p>
            Consulta y exportación de información comercial.
        </p>

        <form id="formReportes" class="formulario">

            <div class="campo">

                <label for="fechaDesde">
                    Fecha desde
                </label>

                <input type="date" id="fechaDesde"
                    name="fechaDesde">

            </div>

            <div class="campo">

                <label for="fechaHasta">
                    Fecha hasta
                </label>

                <input type="date" id="fechaHasta"
                    name="fechaHasta">

            </div>

            <button type="submit">
                Filtrar reportes
            </button>

            <button type="button" id="btnLimpiarFiltro">
                Limpiar filtros
            </button>

        </form>

        <div id="resumenReportes"
            class="indicadores">
        </div>

        <div class="reporte-encabezado">

            <h2>Reporte de ventas</h2>

            <button id="btnExportarVentas"
                type="button" class="btn-exportar">

                Exportar CSV

            </button>

        </div>

        <div id="reporteVentas"></div>

        <div class="reporte-encabezado">

            <h2>Reporte de compras</h2>

            <button id="btnExportarCompras"
                type="button" class="btn-exportar">

                Exportar CSV

            </button>

        </div>

        <div id="reporteCompras"></div>

        <div class="reporte-encabezado">

            <h2>Productos con stock bajo</h2>

            <button id="btnExportarStock"
                type="button" class="btn-exportar">

                Exportar CSV

            </button>

        </div>

        <div id="reporteStock"></div>

        <button id="btnImprimirReporte"
            type="button">

            Imprimir / Guardar PDF

        </button>

    `);

    // =====================================
    // ACTUALIZAR REPORTES
    // =====================================

    function actualizarReportes() {

        const ingresos = ventasFiltradas.reduce(
            (total, venta) => total + venta.total,
            0
        );

        const egresos = comprasFiltradas.reduce(
            (total, compra) => total + compra.total,
            0
        );

        document.getElementById(
            "resumenReportes"
        ).innerHTML = `

            <div class="tarjeta">

                <h3>Ventas realizadas</h3>

                <strong>${ventasFiltradas.length}</strong>

            </div>

            <div class="tarjeta">

                <h3>Ingresos por ventas</h3>

                <strong>
                    ${vista.formatearMoneda(ingresos)}
                </strong>

            </div>

            <div class="tarjeta">

                <h3>Compras realizadas</h3>

                <strong>${comprasFiltradas.length}</strong>

            </div>

            <div class="tarjeta">

                <h3>Egresos por compras</h3>

                <strong>
                    ${vista.formatearMoneda(egresos)}
                </strong>

            </div>

            <div class="tarjeta">

                <h3>Productos con stock bajo</h3>

                <strong>${stockBajo.length}</strong>

            </div>

        `;

        // Reporte de ventas.

        document.getElementById(
            "reporteVentas"
        ).innerHTML = vista.crearTabla(

            [
                "ID",
                "Fecha",
                "Cliente",
                "Vendedor",
                "Total"
            ],

            ventasFiltradas.map(v => [

                v.id,

                vista.formatearFecha(v.fecha),

                database.buscarPorId(
                    "clientes",
                    v.clienteId
                )?.nombre || "No disponible",

                database.buscarPorId(
                    "usuarios",
                    v.usuarioId
                )?.nombre || "No disponible",

                vista.formatearMoneda(v.total)

            ])
        );

        // Reporte de compras.

        document.getElementById(
            "reporteCompras"
        ).innerHTML = vista.crearTabla(

            [
                "ID",
                "Fecha",
                "Proveedor",
                "Usuario responsable",
                "Total"
            ],

            comprasFiltradas.map(c => [

                c.id,

                vista.formatearFecha(c.fecha),

                database.buscarPorId(
                    "proveedores",
                    c.proveedorId
                )?.nombre || "No disponible",

                database.buscarPorId(
                    "usuarios",
                    c.usuarioId
                )?.nombre || "No disponible",

                vista.formatearMoneda(c.total)

            ])
        );

        // Reporte de stock bajo.

        document.getElementById(
            "reporteStock"
        ).innerHTML = vista.crearTabla(

            [
                "SKU",
                "Producto",
                "Categoría",
                "Stock",
                "Stock mínimo"
            ],

            stockBajo.map(p => [

                p.sku,
                p.nombre,
                p.categoria,
                p.stock,
                p.stockMinimo

            ])
        );
    }

    // =====================================
    // FILTRAR REPORTES POR FECHAS
    // =====================================

    document.getElementById("formReportes")
        .addEventListener("submit", evento => {

            evento.preventDefault();

            try {

                const desde =
                    document.getElementById(
                        "fechaDesde"
                    ).value;

                const hasta =
                    document.getElementById(
                        "fechaHasta"
                    ).value;

                if (desde && hasta && desde > hasta) {

                    throw new Error(
                        "La fecha inicial no puede ser mayor que la fecha final."
                    );
                }

                const inicio = desde
                    ? new Date(desde + "T00:00:00")
                    : null;

                const fin = hasta
                    ? new Date(hasta + "T23:59:59.999")
                    : null;

                function filtrar(registros) {

                    return registros.filter(registro => {

                        const fecha =
                            new Date(registro.fecha);

                        return (
                            (!inicio || fecha >= inicio) &&
                            (!fin || fecha <= fin)
                        );

                    });
                }

                ventasFiltradas = filtrar(ventas);

                comprasFiltradas = filtrar(compras);

                actualizarReportes();

                vista.mostrarMensaje(
                    "Reportes filtrados correctamente."
                );

            } catch (error) {

                vista.mostrarError(error.message);

            }

        });

    // =====================================
    // LIMPIAR FILTROS
    // =====================================

    document.getElementById("btnLimpiarFiltro")
        .addEventListener("click", () => {

            document.getElementById("formReportes")
                .reset();

            ventasFiltradas = [...ventas];

            comprasFiltradas = [...compras];

            actualizarReportes();

            vista.mostrarMensaje(
                "Filtros eliminados correctamente."
            );

        });

    // =====================================
    // EXPORTAR ARCHIVOS CSV
    // =====================================

    function exportarCSV(nombre, encabezados, filas) {

        function prepararCelda(valor) {

            let texto = String(valor ?? "");

            // Evitar que Excel interprete texto como fórmulas.

            if (/^[\s]*[=+\-@]/.test(texto)) {
                texto = "'" + texto;
            }

            return '"' + texto.replace(/"/g, '""') + '"';
        }

        const contenido = [encabezados, ...filas]

            .map(fila =>
                fila.map(prepararCelda).join(",")
            )

            .join("\r\n");

        vista.descargarArchivo(

            nombre,

            "\uFEFF" + contenido,

            "text/csv;charset=utf-8;"

        );

        vista.mostrarMensaje(
            "Reporte exportado correctamente."
        );
    }

    // Exportar reporte de ventas.

    document.getElementById("btnExportarVentas")
        .addEventListener("click", () => {

            exportarCSV(

                "SIVE-Reporte-Ventas.csv",

                [
                    "ID",
                    "Fecha",
                    "Cliente",
                    "Vendedor",
                    "Total USD"
                ],

                ventasFiltradas.map(v => [

                    v.id,

                    vista.formatearFecha(v.fecha),

                    database.buscarPorId(
                        "clientes",
                        v.clienteId
                    )?.nombre || "No disponible",

                    database.buscarPorId(
                        "usuarios",
                        v.usuarioId
                    )?.nombre || "No disponible",

                    v.total.toFixed(2)

                ])
            );

        });

    // Exportar reporte de compras.

    document.getElementById("btnExportarCompras")
        .addEventListener("click", () => {

            exportarCSV(

                "SIVE-Reporte-Compras.csv",

                [
                    "ID",
                    "Fecha",
                    "Proveedor",
                    "Usuario responsable",
                    "Total USD"
                ],

                comprasFiltradas.map(c => [

                    c.id,

                    vista.formatearFecha(c.fecha),

                    database.buscarPorId(
                        "proveedores",
                        c.proveedorId
                    )?.nombre || "No disponible",

                    database.buscarPorId(
                        "usuarios",
                        c.usuarioId
                    )?.nombre || "No disponible",

                    c.total.toFixed(2)

                ])
            );

        });

    // Exportar reporte de stock bajo.

    document.getElementById("btnExportarStock")
        .addEventListener("click", () => {

            exportarCSV(

                "SIVE-Reporte-Stock-Bajo.csv",

                [
                    "SKU",
                    "Producto",
                    "Categoría",
                    "Stock",
                    "Stock mínimo"
                ],

                stockBajo.map(p => [

                    p.sku,
                    p.nombre,
                    p.categoria,
                    p.stock,
                    p.stockMinimo

                ])
            );

        });

    // =====================================
    // IMPRIMIR O GUARDAR REPORTE EN PDF
    // =====================================

    document.getElementById("btnImprimirReporte")
        .addEventListener("click", () => {

            window.print();

        });

    actualizarReportes();
}

// =====================================
// MODULO DE USUARIOS
// =====================================


function mostrarUsuarios() {

    controller.verificarPermiso("usuarios");

    const usuarios = database.obtenerTodos("usuarios");

    vista.mostrarModulo(`

        <h1>Gestión de usuarios</h1>

        <form id="formUsuario" class="formulario">

            <input type="hidden" name="id">

            <input name="nombre"
                placeholder="Nombre completo" required>

            <input name="correo" type="email"
                placeholder="Correo electrónico" required>

            <input name="clave" type="password"
                minlength="8"
                placeholder="Contraseña"
                autocomplete="new-password" required>

            <select name="rol" required>

                <option value="administrador">
                    Administrador
                </option>

                <option value="vendedor">
                    Vendedor
                </option>

            </select>

            <button id="btnGuardarUsuario" type="submit">
                Registrar usuario
            </button>

            <button id="btnCancelarEdicion"
                type="button" hidden>

                Cancelar edición

            </button>

        </form>

        <div class="tabla-responsive">

            <table class="tabla">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>

                </thead>

                <tbody>

                    ${usuarios.map(u => `

                        <tr>

                            <td>${u.id}</td>

                            <td>
                                ${vista.escaparHTML(u.nombre)}
                            </td>

                            <td>
                                ${vista.escaparHTML(u.correo)}
                            </td>

                            <td>
                                ${vista.escaparHTML(u.rol)}
                            </td>

                            <td>

                                <span class="${u.activo
                                    ? "estado-activo"
                                    : "estado-inactivo"}">

                                    ${u.activo
                                        ? "Activo"
                                        : "Inactivo"}

                                </span>

                            </td>

                            <td>

                                ${u.id === controller.usuarioActual.id

                                    ? `<span>Sesión actual</span>`

                                    : `

                                        <div class="acciones-usuario">

                                            <button
                                                type="button"
                                                class="btn-editar"
                                                data-editar-id="${u.id}">

                                                Editar

                                            </button>

                                            <button
                                                type="button"

                                                class="${u.activo
                                                    ? "btn-desactivar"
                                                    : "btn-activar"}"

                                                data-usuario-id="${u.id}"

                                                data-accion="${u.activo
                                                    ? "desactivar"
                                                    : "activar"}">

                                                ${u.activo
                                                    ? "Desactivar"
                                                    : "Activar"}

                                            </button>

                                        </div>
                                    `
                                }

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

        <button id="btnRespaldo" type="button">
            Exportar respaldo JSON
        </button>

    `);

    const formulario =
        document.getElementById("formUsuario");

    const btnGuardar =
        document.getElementById("btnGuardarUsuario");

    const btnCancelar =
        document.getElementById("btnCancelarEdicion");

    // =====================================
    // EDITAR USUARIOS
    // =====================================

    document.querySelectorAll("[data-editar-id]")
        .forEach(boton => {

            boton.addEventListener("click", () => {

                const id = Number(boton.dataset.editarId);

                const usuario =
                    database.buscarPorId("usuarios", id);

                if (!usuario) {
                    vista.mostrarError("Usuario no encontrado.");
                    return;
                }

                formulario.elements.namedItem("id").value =
                    usuario.id;

                formulario.elements.namedItem("nombre").value =
                    usuario.nombre;

                formulario.elements.namedItem("correo").value =
                    usuario.correo;

                formulario.elements.namedItem("rol").value =
                    usuario.rol;

                const campoClave =
                    formulario.elements.namedItem("clave");

                campoClave.value = "";

                campoClave.required = false;

                campoClave.placeholder =
                    "Nueva contraseña (opcional)";

                btnGuardar.textContent =
                    "Actualizar usuario";

                btnCancelar.hidden = false;

                formulario.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            });

        });

    // =====================================
    // CANCELAR EDICION
    // =====================================

    btnCancelar.addEventListener("click", () => {

        formulario.reset();

        formulario.elements.namedItem("id").value = "";

        const campoClave =
            formulario.elements.namedItem("clave");

        campoClave.required = true;

        campoClave.placeholder = "Contraseña";

        btnGuardar.textContent = "Registrar usuario";

        btnCancelar.hidden = true;

    });

    // =====================================
    // REGISTRAR O ACTUALIZAR USUARIO
    // =====================================

    formulario.addEventListener("submit", async evento => {

        evento.preventDefault();

        try {

            controller.verificarPermiso("usuarios");

            const datos =
                vista.obtenerDatosFormulario("formUsuario");

            btnGuardar.disabled = true;

            if (datos.id) {

                await controller.actualizarUsuario(
                    datos.id,
                    datos
                );

                vista.mostrarMensaje(
                    "Usuario actualizado correctamente."
                );

            } else {

                await controller.registrarUsuario(datos);

                vista.mostrarMensaje(
                    "Usuario registrado correctamente."
                );

            }

            mostrarUsuarios();

        } catch (error) {

            vista.mostrarError(error.message);

        } finally {

            btnGuardar.disabled = false;

        }

    });

    // =====================================
    // ACTIVAR Y DESACTIVAR USUARIOS
    // =====================================

    document.querySelectorAll("[data-usuario-id]")
        .forEach(boton => {

            boton.addEventListener("click", () => {

                try {

                    const id =
                        Number(boton.dataset.usuarioId);

                    const accion =
                        boton.dataset.accion;

                    if (accion === "desactivar") {

                        const confirmado = vista.confirmar(
                            "¿Está seguro de desactivar este usuario?"
                        );

                        if (!confirmado) return;

                        controller.desactivarUsuario(id);

                        vista.mostrarMensaje(
                            "Usuario desactivado correctamente."
                        );

                    } else {

                        controller.activarUsuario(id);

                        vista.mostrarMensaje(
                            "Usuario activado correctamente."
                        );

                    }

                    mostrarUsuarios();

                } catch (error) {

                    vista.mostrarError(error.message);

                }

            });

        });

    // =====================================
    // EXPORTAR RESPALDO JSON
    // =====================================

    document.getElementById("btnRespaldo")
        .addEventListener("click", () => {

            try {

                controller.exportarDatos();

            } catch (error) {

                vista.mostrarError(error.message);

            }

        });
}

// =====================================
// EJECUCION DE LA APLICACION
// =====================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAplicacion
    );

} else {

    iniciarAplicacion();
}
