# SIVE – ElectroHogar

### Sistema Integral de Inventario y Ventas de Electrodomésticos

**Universidad Don Bosco · Análisis y Diseño de Sistemas Informáticos (ADS)**  
**Proyecto académico · Segundo avance (Fase 2) · Prototipo demostrativo**

> **Aviso:** ElectroHogar es una empresa ficticia y los registros utilizados son de demostración. El prototipo no es un sistema comercial ni una solución lista para producción.

## Contenido

1. [Descripción general](#descripción-general)
2. [Problema y justificación](#problema-y-justificación)
3. [Objetivos](#objetivos)
4. [Alcance y estado del proyecto](#alcance-y-estado-del-proyecto)
5. [Módulos y funcionamiento](#módulos-y-funcionamiento)
6. [Reglas de negocio y validaciones](#reglas-de-negocio-y-validaciones)
7. [Tecnologías y arquitectura](#tecnologías-y-arquitectura)
8. [Cómo ejecutar el prototipo](#cómo-ejecutar-el-prototipo)
9. [Modelo de datos y documentación de análisis](#modelo-de-datos-y-documentación-de-análisis)
10. [Casos de uso](#casos-de-uso)
11. [Evidencias de interfaz](#evidencias-de-interfaz)
12. [Pruebas funcionales sugeridas](#pruebas-funcionales-sugeridas)
13. [Criterios de evaluación](#criterios-de-evaluación)
14. [Limitaciones y mejoras futuras](#limitaciones-y-mejoras-futuras)
15. [Equipo y referencias](#equipo-y-referencias)

## Descripción general

**SIVE–ElectroHogar** es una propuesta académica de sistema web para apoyar la gestión de **productos, inventario, ventas y reportes** en *ElectroHogar*, una pequeña empresa ficticia dedicada a comercializar refrigeradoras, cocinas, lavadoras, televisores, microondas y otros electrodomésticos.

El proyecto combina el **análisis y diseño de un sistema de información** con un **prototipo web funcional inicial**. La Fase 2 se concentra en las operaciones esenciales y sus validaciones, dejando otras funcionalidades previstas para desarrollos posteriores.

## Problema y justificación

Como escenario de estudio, se plantea que la empresa utiliza registros manuales o archivos separados para administrar mercadería y ventas. Esta situación dificulta obtener existencias actualizadas, evitar registros duplicados y elaborar información administrativa de manera oportuna.

SIVE propone centralizar la consulta de productos, controlar entradas y salidas, validar las cantidades antes de vender y presentar indicadores básicos. El análisis y sus diagramas permiten comprobar la relación entre requerimientos, procesos, datos e interfaces antes de una implementación completa.

**Aclaración metodológica:** los procesos y necesidades empresariales corresponden a un escenario académico propuesto; no se presentan como resultados de entrevistas o pruebas de campo verificadas.

## Objetivos

**Objetivo general:** diseñar y desarrollar un prototipo funcional inicial de un sistema web de inventario y ventas para ElectroHogar, mediante el análisis de requerimientos, modelado de procesos y datos, y definición de interfaces de apoyo a la gestión comercial.

**Objetivos específicos:**

- Identificar y documentar requerimientos funcionales y no funcionales.
- Modelar procesos de productos, inventario y ventas mediante diagramas de flujo de datos, casos de uso, actividades y componentes.
- Proponer una estructura de base de datos relacional y demostrar operaciones esenciales con validaciones de negocio.

## Alcance y estado del proyecto

La primera etapa contempló funciones de usuarios, catálogos, proveedores, clientes, compras, inventario, ventas y reportes. El segundo avance prioriza los siguientes componentes:

| Área | Estado en el prototipo web | Descripción |
| --- | --- | --- |
| Panel de control | Implementado en demo | Indicadores de productos, unidades, ventas e importe acumulado. |
| Gestión de productos | Parcial | Registro, listado y eliminación condicionada; edición/desactivación pendientes. |
| Inventario | Implementado en demo | Entradas, salidas, registro de movimientos y comprobación de existencias. |
| Ventas | Implementado en demo | Venta de un producto por operación, cálculo del total y descuento de stock. |
| Reportes | Básico | Total vendido y alerta por stock bajo. |
| Autenticación y permisos | Pendiente | No existe control de acceso real por roles. |
| Proveedores, compras y clientes | Pendiente | Forman parte del alcance general, no de la demo actual. |
| Base de datos relacional integrada | Pendiente | El modelo SQLite es una evidencia separada y no se conecta al sitio web. |

**El porcentaje de avance exigido en la rúbrica (50 %) es un criterio de evaluación, no un porcentaje de cumplimiento técnico verificado.** Su acreditación depende de la revisión del docente.

## Módulos y funcionamiento

### 1. Inicio / Panel de control

Muestra el número de productos registrados, unidades disponibles, cantidad de ventas y ventas acumuladas. Incluye la opción **Restablecer datos de demostración**, que reinicia los datos locales después de solicitar confirmación.

### 2. Productos

Permite registrar productos con **SKU, nombre, precio y stock inicial**; consultar el catálogo; e intentar eliminar productos. Se rechazan SKU repetidos y valores inválidos. En el prototipo, no se permite eliminar productos con ventas registradas.

### 3. Registrar venta

El usuario selecciona un producto e ingresa una cantidad. El sistema verifica que sea un entero positivo y que exista stock suficiente; si la operación es válida, calcula el importe, registra la venta y descuenta las unidades. También registra la salida asociada en el historial de movimientos.

### 4. Inventario

Registra **entradas** y **salidas** de unidades por producto. Las salidas que exceden las existencias son rechazadas. El historial muestra el tipo de movimiento, producto, cantidad y fecha.

### 5. Reportes

Presenta el monto vendido y los productos con existencias bajas. En la demo, el umbral de alerta es **5 unidades o menos**.

## Reglas de negocio y validaciones

| Identificador | Regla | Situación |
| --- | --- | --- |
| RN-01 | Cada producto debe tener un SKU único. | Validación incluida en la demo. |
| RN-02 | La cantidad vendida debe ser un entero positivo y no superar el stock. | Validación incluida en la demo. |
| RN-03 | El importe se calcula a partir de cantidad × precio unitario. | Cálculo incluido en la demo para ventas de un solo producto. |
| RN-04 | Solo usuarios autorizados deben modificar inventario o consultar reportes. | Requisito de la solución futura; no implementado. |
| RN-05 | Venta y actualización de inventario deben ser una operación atómica. | Requisito de la solución productiva; la demo no utiliza transacciones de servidor. |

Se consideran también los siguientes atributos no funcionales para la solución completa: **seguridad, usabilidad, integridad, rendimiento, respaldos y compatibilidad**. La versión actual ofrece validaciones en el navegador, pero **no** ofrece autenticación, verificación de permisos ni garantías de integridad del lado servidor.

## Tecnologías y arquitectura

| Tecnología | Uso |
| --- | --- |
| HTML5 | Estructura de las pantallas y formularios. |
| CSS3 | Diseño visual y presentación adaptable. |
| JavaScript | Eventos, cálculos, validaciones y actualización de vistas. |
| `localStorage` | Persistencia local de datos de demostración en el navegador. |
| SQLite | Modelo relacional propuesto y conjunto independiente de datos de prueba (según documentación de Fase 2). |
| Git / GitHub | Control de versiones y colaboración del equipo. |

**Arquitectura de la demostración:** navegador → interfaz HTML/CSS/JavaScript → reglas de validación → `localStorage`.

**Arquitectura futura propuesta:** interfaz web → servidor de aplicaciones → base de datos relacional. La base SQLite documentada **no está conectada** a la interfaz web actual.

### Organización del repositorio

```text
SIVE-ElectroHogar/
├── index.html                   # Redirige a la demostración
├── SIVE_demo_ordenado.html      # Prototipo web ejecutable
├── css/                         # Carpeta de estilos del repositorio
├── js/                          # Carpeta de scripts del repositorio
└── README.md                    # Documentación general
```

> El prototipo `SIVE_demo_ordenado.html` incluye el código necesario para funcionar de manera autónoma. La presencia de las carpetas `css/` y `js/` no implica que la demo dependa de archivos externos de estas carpetas.

## Cómo ejecutar el prototipo

**Requisitos:** navegador moderno con JavaScript habilitado. Para la demo local no se requieren servidor, instalador ni base de datos externa.

**Opción A — Descargar el proyecto:**

1. En GitHub, seleccionar **Code → Download ZIP**.
2. Descomprimir la carpeta descargada.
3. Abrir `index.html` o directamente `SIVE_demo_ordenado.html` en el navegador.
4. Utilizar las pestañas de **Inicio**, **Productos**, **Registrar venta**, **Inventario** y **Reportes**.

**Opción B — Clonar con Git:**

```bash
git clone https://github.com/23patriciachavez-cmd/SIVE-ElectroHogar.git
cd SIVE-ElectroHogar
```

Luego abrir `index.html` en el navegador.

**Datos de demostración:** la interfaz inicia con **6 productos de muestra** cuando todavía no existen datos locales guardados. Los cambios permanecen en el navegador mediante `localStorage` hasta que se borren esos datos o se use la función de restablecimiento. **Estos 6 productos no deben confundirse con los 60 registros del archivo SQLite documentado por separado.**

## Modelo de datos y documentación de análisis

La documentación del segundo avance plantea un **modelo relacional con seis entidades**:

| Entidad | Propósito |
| --- | --- |
| `usuario` | Información de usuarios y roles en el modelo futuro. |
| `categoria` | Clasificación de productos. |
| `producto` | Catálogo, precio, existencias y stock mínimo. |
| `venta` | Encabezado y total de una venta. |
| `detalle_venta` | Productos, cantidades y subtotales por venta. |
| `movimiento` | Registro de variaciones de inventario. |

El informe de Fase 2 describe un **script `base_datos_sive.sql`** y una base **`sive_ejemplo.db`** con **60 productos sintéticos, 6 categorías y 2 usuarios de ejemplo**. Estos elementos pertenecen al paquete de documentación académica; **no se afirma que estén incluidos actualmente en este repositorio**.

Para verificar la cantidad de productos si se dispone de la base SQLite:

```sql
SELECT COUNT(*) FROM producto;
```

La documentación también incluye: investigación preliminar y requerimientos, matriz de trazabilidad, DFD de contexto (nivel 0), DFD de nivel 1, DFD de nivel 2 para registro de ventas, modelo entidad-relación, casos de uso, diagrama de actividades con carriles y diagrama de componentes.

## Casos de uso

| Código | Caso de uso | Actor propuesto | Relación con la demo |
| --- | --- | --- | --- |
| CU-01 | Iniciar sesión | Administrador / Vendedor | Diseñado; pendiente. |
| CU-02 | Gestionar productos | Administrador | Parcialmente demostrable. |
| CU-03 | Registrar movimiento de inventario | Administrador | Demostrable sin permisos por rol. |
| CU-04 | Registrar venta | Vendedor | Demostrable sin autenticación. |
| CU-05 | Generar reportes | Administrador | Reportes básicos demostrables. |
| CU-06 | Consultar productos | Vendedor | Catálogo visible; búsqueda por criterio pendiente de verificar/implementar. |

Los actores representan responsabilidades **conceptuales**, no perfiles de acceso activos en el prototipo.

## Evidencias de interfaz

La rúbrica solicita **una imagen de cada pantalla utilizada durante los casos de uso** y que la interfaz muestre los controles y resultados visibles en la interacción. Para documentarlas, se proponen los archivos siguientes:

| Pantalla | Evidencia recomendada | Estado |
| --- | --- | --- |
| Inicio | Indicadores generales | Captura por incorporar. |
| Productos | Formulario y tabla de productos | Captura por incorporar. |
| Registrar venta | Selección, cantidad y confirmación | Captura por incorporar. |
| Inventario | Formulario e historial de movimientos | Captura por incorporar. |
| Reportes | Totales y alertas por stock bajo | Captura por incorporar. |

**Ruta sugerida para las capturas:** `docs/capturas/`. Una vez incorporadas al repositorio, se pueden enlazar en esta sección, por ejemplo:

```markdown
![Panel de control](docs/capturas/01-inicio.png)
```

No se incluyen imágenes inventadas ni se presentan capturas pendientes como evidencias completadas.

## Pruebas funcionales sugeridas

Los siguientes casos están definidos en el documento académico como **pruebas previstas**. Ejecutarlos y adjuntar evidencia antes de declararlos aprobados.

| ID | Acción | Resultado esperado |
| --- | --- | --- |
| T01 | Registrar un producto con SKU nuevo | El producto aparece en el catálogo. |
| T02 | Registrar un SKU duplicado | Se rechaza el registro. |
| T03 | Vender una unidad disponible | Se registra la venta y disminuye el stock en 1. |
| T04 | Vender más unidades que las existentes | Se rechaza la venta. |
| T05 | Registrar entrada de 3 unidades | El stock aumenta en 3 y se registra movimiento. |
| T06 | Registrar salida superior al stock | Se rechaza la salida. |
| T07 | Consultar reportes | Se muestran indicadores y alertas. |
| T08 | Restablecer la demostración | Se recuperan los productos de muestra. |

## Criterios de evaluación

La evaluación de la Fase 2 se divide en **tres componentes**:

| Componente | Peso en la evaluación |
| --- | ---: |
| Sistema / software | **50 %** |
| Defensa del proyecto | **20 %** |
| Documento del segundo avance | **30 %** |
| **Total** | **100 %** |

### A. Sistema (50 %)

La rúbrica del sistema distribuye su propia puntuación así:

| Criterio | Peso dentro del sistema |
| --- | ---: |
| Correspondencia entre interfaces, análisis y modelado | 10 % |
| Imagen de cada pantalla que interviene en casos de uso | 20 % |
| Interfaz muestra lo visible durante la interacción | 5 % |
| Restricciones de seguridad, calidad y manejo de errores | 20 % |
| Cumplimiento de requisitos y operación sin fallos | 35 % |
| Presentación de un avance del 50 % | 10 % |
| **Total** | **100 %** |

### B. Defensa del proyecto (20 %)

La defensa contempla **postura y contacto visual**, **claridad y dominio del contenido**, **comprensión y capacidad para responder preguntas**, y **presentación personal formal**. La escala presentada por la rúbrica es: excelente (9–10), muy bueno (7–8), bueno (5–6) y deficiente (0–4).

### C. Documento del segundo avance (30 %)

La rúbrica del documento exige presentación formal y contenido ordenado. Sus criterios y pesos internos son:

| Criterio | Peso dentro del documento |
| --- | ---: |
| Formato del documento: fuente, títulos, interlineado, encabezado, portada e índice | 5 % |
| Organización secuencial de conceptos | 5 % |
| Modelo E-R y relacional completo | 10 % |
| Al menos 50 registros de prueba | 5 % |
| Actores adecuados en diagramas de casos de uso | 5 % |
| Casos de uso expresados con verbos en infinitivo | 5 % |
| Uso justificado de relaciones `include` y `extend` | 5 % |
| Orden y ortografía de diagramas | 5 % |
| Narrativa detallada de escenarios por caso de uso | 15 % |
| Diseños de interfaces con una imagen por pantalla de los casos de uso | 30 % |
| Calidad general de presentación y redacción | 5 % |
| Referencias en formato APA | 5 % |
| **Total** | **100 %** |

**Importante:** esta tabla describe criterios de evaluación; **no acredita su cumplimiento automáticamente**. En particular, las capturas y las pruebas deben documentarse, y la implementación de autenticación, búsqueda, roles y otras funciones pendientes no debe presentarse como terminada.

## Limitaciones y mejoras futuras

- El sitio es una **demo local**: los datos se guardan únicamente en el navegador utilizado.
- No dispone de backend, autenticación segura, roles reales ni auditoría completa.
- La base SQLite del informe es **independiente**, sin integración con `localStorage`.
- No contempla concurrencia multiusuario ni transacciones de base de datos.
- No incluye aún gestión completa de compras, proveedores o clientes.
- Se prevé ampliar las operaciones de productos, comprobantes, búsqueda y reportes.
- Para un sistema real se requieren validación de servidor, permisos, protección de credenciales, respaldo de datos y pruebas con usuarios.

## Equipo y referencias

**Equipo de proyecto (ADS):** Gabriel, José, Karla, Tania y Patricia.  
**Rol documentado:** José — Analista Consultor (AC). Los demás cargos deben confirmarse antes de publicarlos como asignaciones definitivas.

**Referencias de apoyo utilizadas en el informe académico:**

- Object Management Group (2017). *OMG Unified Modeling Language (UML), Version 2.5.1*. https://www.omg.org/spec/UML/2.5.1
- SQLite. *SQLite Documentation*. https://www.sqlite.org/docs.html
- MDN Web Docs. *HTML*. https://developer.mozilla.org/es/docs/Web/HTML
- MDN Web Docs. *JavaScript*. https://developer.mozilla.org/es/docs/Web/JavaScript
- MDN Web Docs. *Window: localStorage*. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

**Estado del repositorio:** prototipo académico en desarrollo, correspondiente al segundo avance del proyecto SIVE–ElectroHogar.
