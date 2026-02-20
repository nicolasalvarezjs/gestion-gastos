# Informe de Ingeniería Inversa: Gestión Hogar

> Generado el: 20 de febrero de 2026

---

## 1. 🗺️ Mapa Funcional del Producto (Visión de Negocio)

### Módulo: Autenticación
| Funcionalidad | Descripción | Acceso |
|---|---|---|
| Solicitar código OTP | El usuario ingresa su teléfono y recibe un código de verificación | Público (guestGuard) |
| Verificar código OTP | El usuario ingresa el código para obtener un JWT válido (7 días) | Público (guestGuard) |
| Logout | Limpia el token y redirige al login | Autenticado |

### Módulo: Gestión de Usuarios y Familia
| Funcionalidad | Descripción | Acceso |
|---|---|---|
| Crear usuario principal | ⚠️ **PENDIENTE DE DESARROLLO.** El endpoint existe pero no hay UI ni flujo implementado. Actualmente los usuarios se crean manualmente vía Postman en entornos de prueba. | Público (setup inicial) |
| Agregar teléfono secundario | Vincula otro miembro del hogar al usuario principal | Autenticado (JWT) |
| Eliminar teléfono secundario | Desvincula un miembro del grupo familiar | Autenticado (JWT) |
| Ver configuración | Panel de Settings con información del usuario y familia | Autenticado (authGuard) |

### Módulo: Registro de Gastos
| Funcionalidad | Descripción | Acceso |
|---|---|---|
| Crear gasto individual | Registra un gasto con descripción, monto, categoría y fecha | Autenticado (JWT) |
| Crear gastos en lote (bulk) | Registra múltiples gastos en una sola operación | Autenticado (JWT) |
| **Ingesta vía WhatsApp (n8n)** | El flujo principal de carga de gastos se realiza a través de un agente de n8n: el usuario envía un mensaje de WhatsApp, el agente interpreta el texto, consulta el endpoint `GET /categories?phone=...` para obtener las categorías del usuario y asigna automáticamente la más apropiada antes de hacer el `POST /expenses` | API Key / JWT (desde n8n) |
| Ver historial de gastos | Lista paginada de transacciones con filtros de fecha y rango | Autenticado (authGuard) |
| Eliminar gasto | Borra un gasto existente (con confirmación en UI) | Autenticado (authGuard) |
| Reclasificar categoría | Modifica la categoría de un gasto ya registrado | Autenticado (authGuard) |

### Módulo: Categorías
| Funcionalidad | Descripción | Acceso |
|---|---|---|
| Listar categorías | Muestra las categorías del grupo familiar | Autenticado (authGuard) |
| Crear categoría | Agrega una nueva categoría personalizada | Autenticado (authGuard) |
| Editar categoría | Modifica nombre/descripción de una categoría existente | Autenticado (authGuard) |
| Eliminar categoría | Borra una categoría (con confirmación en UI) | Autenticado (authGuard) |

### Módulo: Dashboard
| Funcionalidad | Descripción | Acceso |
|---|---|---|
| KPI de gasto total | Muestra el gasto del período actual vs. período anterior con delta % | Autenticado (authGuard) |
| Top categoría | Muestra la categoría con mayor gasto y su participación porcentual | Autenticado (authGuard) |
| Gráfico por categoría | Gráfico de barras del gasto agrupado por categoría | Autenticado (authGuard) |
| Tendencia diaria | Gráfico de línea con el gasto día a día del período seleccionado | Autenticado (authGuard) |
| Transacciones recientes | Lista las últimas 4 transacciones del período | Autenticado (authGuard) |
| Selector de mes | Permite cambiar el período analizado, afectando todos los widgets | Autenticado (authGuard) |

### Módulo: Análisis
| Funcionalidad | Descripción | Acceso |
|---|---|---|
| Resumen financiero del período | Total gastado, delta vs. período anterior, con selector de fecha custom | Autenticado (authGuard) |
| Gráfico de tendencia avanzado | Línea temporal del gasto con opciones mensual/semanal (UI) | Autenticado (authGuard) |
| Insights automáticos | Tarjetas con patrones detectados (promedio, comercio top, etc.) | Autenticado (authGuard) |
| Desglose de transacciones | Tabla paginada con fecha, comercio, subcategoría y monto | Autenticado (authGuard) |

### Módulo: Reportes
| Funcionalidad | Descripción | Acceso |
|---|---|---|
| Estadísticas del período | Total, ticket promedio, categoría principal y gasto más alto | Autenticado (authGuard) |
| Gasto por categoría | Tabla de distribución porcentual de gastos por categoría | Autenticado (authGuard) |
| Comercios principales | Top merchants del período | Autenticado (authGuard) |
| Filtros de período | Modo anual o rango de fechas personalizado | Autenticado (authGuard) |

---

## 2. 🏗️ Radiografía de Arquitectura (Visión Técnica)

### Base de Datos — ERD Deducido

El sistema usa **MongoDB** (vía Mongoose). Las entidades principales son:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│    User     │       │   Expense   │       │    Category     │
├─────────────┤       ├─────────────┤       ├─────────────────┤
│ phone (PK)  │──1:N──│ phone (FK)  │       │ phone (FK)      │
│ secondaryP[]│       │ description │       │ name            │
│ authCode    │       │ amount      │       │ description     │
│ codeExp     │       │ category    │       │ timestamps      │
│ timestamps  │       │ date        │       └─────────────────┘
└─────────────┘       │ isFamilyShrd│
                      │ timestamps  │
                      └─────────────┘
```

**Relaciones notables:**
- Un `User` tiene una lista embebida de teléfonos secundarios (`secondaryPhones[]`), modelando el "grupo familiar" sin una tabla de relaciones separada.
- `Expense.phone` referencia un teléfono — **no un ObjectId de User** — lo que implica que las consultas familiares requieren un `$in` con todos los teléfonos del grupo.
- `Category` se vincula también por `phone`, no por referencia de User.

**Índices definidos** en `expenses.schema.ts`:
- `{ date: -1 }`, `{ category: 1, date: -1 }`, `{ phone: 1, date: -1 }`

### Patrones de Diseño

| Patrón | Estado |
|---|---|
| **Service Layer** | ✅ Implementado. La lógica de negocio vive en `*Service`, los controladores son delgados. |
| **DTO + Validation** | ✅ Se usan DTOs con `class-validator` y `ValidationPipe` global. |
| **Repository Pattern** | ❌ No implementado. El `Model<T>` de Mongoose se inyecta directamente en los Services. |
| **CQRS** | ❌ No implementado. Operaciones de lectura y escritura conviven en el mismo Service. |
| **Guard-based Authorization** | ✅ Parcial. `authGuard` y `guestGuard` en el frontend; JWT Strategy global en el backend. |
| **Interceptor (Logging)** | ✅ `HttpLoggingInterceptor` aplicado globalmente. |
| **OnPush Change Detection** | ✅ Todos los componentes Angular usan `ChangeDetectionStrategy.OnPush`. |
| **Reactive (RxJS)** | ✅ El frontend usa observables, `async pipe` y streams reactivos consistentemente. |

### Integraciones Externas Detectadas

| Servicio | Evidencia | Propósito |
|---|---|---|
| **MongoDB Atlas** (o instancia propia) | `MONGO_URI` en `app.module.ts` | Base de datos principal |
| **Railway** | URL `gastos-back-stage.up.railway.app` en `environment.prod.ts` | Hosting del backend en producción |
| **Chart.js / ng2-charts** | `package.json` del frontend | Visualizaciones del dashboard y análisis |
| **Angular Service Worker** | `ngsw-config.json`, `angular.json` | PWA con cache offline |
| **Servicio OTP** (no identificado) | `AuthService.requestCode()` en `auth.controller.ts` | Envío de códigos de verificación — implementación real no visible en el workspace |
| **n8n** | Agente de automatización que consume los endpoints del backend | Orquesta el flujo de ingesta de gastos vía WhatsApp: recibe mensajes, interpreta el texto con IA, consulta `GET /categories` para seleccionar la categoría correcta y registra el gasto vía `POST /expenses` |
| **WhatsApp Business API** | Canal de entrada al agente n8n | Interfaz de usuario principal para el registro de gastos en tiempo real |

### Seguridad

- **Autenticación:** JWT firmado con `JWT_SECRET` (env var), expiración de 7 días. Estrategia Passport JWT en `auth.module.ts`.
- **Autorización:** El frontend usa `authGuard` / `guestGuard`. El backend valida ownership familiar llamando a `assertExpensePhoneBelongsToFamily()` antes de mutaciones.
- **Hardcoded fallback:** `process.env.JWT_SECRET ?? 'dev-jwt-secret'` — secret predecible en ausencia de env var.
- **CORS:** Habilitado globalmente con `app.enableCors()` sin restricción de origen en `main.ts`.

---

## 3. 🛠️ Análisis de Brechas y Deuda Técnica (Future Backlog)

### 🔴 Crítico / Seguridad

**[SEC-01] CORS completamente abierto**
En `main.ts`, `app.enableCors()` acepta cualquier origen. En producción esto permite peticiones cross-origin desde dominios maliciosos.
```
Tarea: Configurar allowedOrigins basado en env var (CORS_ORIGIN).
```

**[SEC-02] JWT Secret con fallback inseguro**
En `auth.module.ts`: `secret: process.env.JWT_SECRET ?? 'dev-jwt-secret'`. Si la variable de entorno no se configura en producción, los tokens son predecibles y forjables.
```
Tarea: Lanzar excepción (ConfigService con validación) si JWT_SECRET no está definido.
```

**[SEC-03] Creación de usuarios sin UI ni flujo de onboarding — PENDIENTE DE IMPLEMENTACIÓN**
`UsersController` expone `POST /users` para crear el usuario principal, pero no existe ningún flujo de frontend ni mecanismo de invitación implementado. Actualmente el alta de usuarios se realiza **manualmente a través de Postman** solo en entornos de prueba. El flujo completo de registro/onboarding está pendiente de diseño e implementación.
```
Tarea: Diseñar e implementar el flujo de onboarding completo (pantalla de registro,
       validación de teléfono, primer acceso) y proteger POST /users con rate limiting
       o un mecanismo de invitación para evitar registros no autorizados.
```

**[SEC-04] Código OTP hardcoded en frontend**
En `i18n.service.ts`: `'login.errorInvalidCode': 'Invalid code. Try 123456.'` — el código de prueba `123456` está documentado en la UI y en el `postman/README.md`.
```
Tarea: El código de bypass debe existir SOLO en tests/seeding, nunca en mensajes de UI.
```

---

### 🟡 Refactorización

**[REF-01] Lógica de negocio compleja directamente en Services con Mongoose**
Los services de `expenses.service.ts` construyen pipelines de agregación MongoDB (`PipelineStage[]`) directamente. Esto mezcla lógica de negocio con lógica de persistencia y dificulta el testing.
```
Tarea: Extraer la capa de acceso a datos en Repositories (ej: ExpenseRepository)
       e inyectarlos en los Services.
```

**[REF-02] Relación User-Expense por string de teléfono en lugar de ObjectId**
Las consultas de gastos familiares requieren `{ phone: { $in: familyPhones } }` — un array de strings. Si un teléfono cambia, los datos huérfanos no se actualizan automáticamente.
```
Tarea: Evaluar migración a referencia por ObjectId (User._id) para integridad referencial.
```

**[REF-03] Insights hardcodeados en el backend**
En `expenses.service.ts`, `getInsights()` retorna textos en español hardcodeado, ignorando la internacionalización del frontend.
```
Tarea: El backend debe retornar claves de traducción (titleKey, textKey) en lugar de
       strings en idioma específico.
```

**[REF-04] Subcategorías hardcodeadas en el frontend**
En `analysis.component.ts`, `getSubCategoryLabelKey()` tiene un `switch` con valores literales (`'Groceries'`, `'Snacks'`, `'Household'`). No escala cuando se agregan nuevas categorías.
```
Tarea: Las subcategorías deben derivarse del modelo de Categorías, no de un switch manual.
```

**[REF-05] CategoryMeta hardcodeada en DashboardComponent**
En `dashboard.component.ts`, el `Record<string, CategoryMeta>` con íconos y clases CSS está hardcodeado por nombre de categoría en inglés. Las categorías personalizadas del usuario no tendrán metadata visual.
```
Tarea: El modelo Category del backend debería incluir un campo icon/color,
       o la UI debe tener un fallback genérico para categorías desconocidas.
```

**[REF-06] Test unitario desactualizado**
En `app.spec.ts`, el test verifica `'Hello, gestion-front'` que no coincide con el componente `App` real.
```
Tarea: Reescribir los tests unitarios del frontend para reflejar la UI real.
```

---

### 🟢 Optimizaciones

**[OPT-01] N+1 implícito en getInsights()**
En `expenses.service.ts`, `getInsights()` primero llama a `getFamilyPhones()` (query a Users) y luego hace `find()` sobre Expenses. Cada llamada al endpoint implica al menos 2 round-trips a MongoDB.
```
Tarea: Consolidar en una sola aggregation con $lookup, o cachear familyPhones
       con un TTL corto (ej: Redis).
```

**[OPT-02] Lazy Loading de módulos Angular no implementado**
Todas las rutas en `app.routes.ts` cargan componentes directamente (eager loading), incrementando el bundle inicial.
```
Tarea: Convertir rutas a lazy loading:
       loadComponent: () => import('./features/analysis/analysis.component')
```

**[OPT-03] Múltiples suscripciones al mismo stream en el Dashboard**
En `dashboard.component.html`, `monthlySummary$ | async` se usa al menos 2 veces en el template, generando múltiples suscripciones HTTP.
```
Tarea: Usar shareReplay(1) en el observable o reestructurar el template
       con un único *ngIf="monthlySummary$ | async as summary".
```

**[OPT-04] Sin paginación real en el backend para Breakdown**
El endpoint `getBreakdown()` acepta un límite pero no un offset/cursor. Para usuarios con muchas transacciones, la paginación real no está implementada en el servidor.
```
Tarea: Agregar parámetros page/limit o cursor-based pagination en ExpensesQueryDto.
```

---

### 📝 Tareas Pendientes (TODOs detectados)

| ID | Ubicación | Descripción |
|---|---|---|
| TODO-01 | `analysis.component.html` — Botones toggle Mensual/Semanal | Los botones existen en la UI pero no tienen lógica funcional; siempre se muestra vista mensual. |
| TODO-02 | `app-sidebar.component.ts` — `analysisItem` separado del array `items` | El ítem de Analysis está declarado aparte del array de navegación, sugiriendo tratamiento especial pendiente de definir. |
| TODO-03 | `placeholder.component.ts` | Existe un componente `PlaceholderComponent` con mensaje "En desarrollo", indicando rutas/módulos planificados pero no implementados. |
| TODO-04 | `expenses.service.ts` — `getInsights()` | El límite hardcodeado de 200 documentos es arbitrario y no refleja un período específico. |
| TODO-05 | `app.spec.ts` | Test de renderizado verifica `'Hello, gestion-front'` — texto que no existe en el componente real. |
| TODO-06 | `users.controller.ts` / Sin pantalla de UI | Flujo completo de creación de usuarios pendiente de desarrollo. Actualmente solo operable vía Postman en entornos de prueba. |
| TODO-07 | Agente n8n (externo al repo) | Documentar y versionar los flujos de n8n que consumen la API. El comportamiento del agente (prompt, lógica de categorización, manejo de errores de WhatsApp) no está representado en el workspace actual. |
