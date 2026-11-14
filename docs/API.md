# Contrato de la API — SNAKE PODA

Este documento describe lo que el frontend espera del backend. Si algo se cambia, hay que avisar al equipo del frontend: los tipos están en `src/api/tipos.ts`.

## Cómo se conecta el frontend

- El frontend lee la URL del backend de la variable `VITE_API_URL` (archivo `.env.local`, ver `.env.example`). Ejemplo: `VITE_API_URL=http://localhost:3000`.
- Si la variable está vacía, el frontend funciona en **modo simulado** con datos falsos en el navegador. Sirve para trabajar sin depender del backend.
- Todas las rutas empiezan con `/api`.
- El cuerpo de las peticiones y respuestas es JSON (`Content-Type: application/json`).
- **CORS:** permitir el origen del frontend en desarrollo, `http://localhost:5173`, y la cabecera `Authorization`.

## Autenticación

- Al iniciar sesión o registrarse, el backend devuelve un `token` (se recomienda JWT).
- En las rutas protegidas, el frontend envía `Authorization: Bearer <token>`.
- Si el token falta, es inválido o venció, responder **401**: el frontend cierra la sesión y manda al usuario al login.
- Las contraseñas se guardan cifradas (bcrypt o similar) y **nunca** se devuelven en una respuesta.

## Errores

Cualquier error responde con su código HTTP y este cuerpo:

```json
{ "mensaje": "Texto que se le muestra al usuario, en español" }
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos o incompletos |
| 401 | Sin sesión, token inválido, o correo/contraseña incorrectos |
| 403 | Con sesión pero sin permiso (p. ej. un cliente en una ruta de admin) |
| 404 | El recurso no existe |
| 409 | Conflicto (correo ya registrado, horario ya ocupado) |

## Tipos

```ts
type Rol = 'cliente' | 'admin'

interface Usuario {
  id: string
  nombre: string
  email: string
  telefono?: string
  rol: Rol
}

interface Sesion {
  token: string
  usuario: Usuario
}
```

## Fase 1 — Autenticación (confirmado, el frontend ya lo usa)

### `POST /api/auth/registro`

Crea una cuenta. Siempre con rol `cliente`; los administradores se crean directamente en la base de datos.

Petición:

```json
{ "nombre": "Ana Pérez", "email": "ana@correo.com", "telefono": "70000000", "password": "secreto123" }
```

`telefono` es opcional. La contraseña tiene al menos 6 caracteres.

Respuesta **201**: un objeto `Sesion`. Ya inicia la sesión, así que no hace falta llamar a login después.
Errores: **400** si faltan datos, **409** si el correo ya existe.

### `POST /api/auth/login`

Petición:

```json
{ "email": "ana@correo.com", "password": "secreto123" }
```

Respuesta **200**: un objeto `Sesion`.
Error: **401** con `"mensaje": "Correo o contraseña incorrectos."`

### `GET /api/auth/me` 🔒

Devuelve el `Usuario` dueño del token. El frontend lo llama al abrir la app para confirmar que la sesión sigue siendo válida.

Respuesta **200**: un objeto `Usuario`. Error: **401**.

## Fase 3 — Reservas (confirmado, el frontend ya lo usa)

Solo `PATCH /api/reservas/:id/estado` queda como borrador: el frontend lo usará en la Fase 4 (panel del administrador).

```ts
type EstadoReserva = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'

interface Reserva {
  id: string
  clienteId: string
  clienteNombre: string   // para la vista del administrador
  fecha: string           // "2026-11-20" (AAAA-MM-DD)
  hora: string            // "09:00" (HH:mm, 24 h)
  direccion: string
  cantidadArboles: number
  alturaAproximada: number // metros
  notas?: string
  estado: EstadoReserva
  creadaEn: string        // fecha ISO 8601
}
```

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /api/disponibilidad?fecha=AAAA-MM-DD` 🔒 | cliente, admin | Horarios libres de ese día |
| `GET /api/reservas` 🔒 | cliente, admin | El cliente ve solo las suyas; el admin ve todas |
| `POST /api/reservas` 🔒 | cliente | Crea una reserva en estado `pendiente` |
| `PATCH /api/reservas/:id/cancelar` 🔒 | dueño, admin | Pasa la reserva a `cancelada` |
| `PATCH /api/reservas/:id/estado` 🔒 | admin | *Borrador, Fase 4.* Cuerpo `{ "estado": "confirmada" }`; cambia el estado |

🔒 = requiere `Authorization: Bearer <token>`.

### Reglas de la agenda

Así funciona el modo simulado del frontend (`src/api/simulado/reservasSimulado.ts`). Si el backend usa otros valores, avisar para ajustar el formulario.

- Hay **un solo equipo de poda**: cada horario de cada día admite una sola reserva que no esté `cancelada`.
- Horarios de inicio: `08:00`, `10:00`, `12:00`, `14:00` y `16:00`. Cada visita dura unas 2 horas.
- Se atiende de **lunes a sábado**. El domingo no tiene horarios.
- Se puede reservar desde hoy hasta **60 días** adelante. Los horarios de hoy que ya pasaron no se ofrecen.

### `GET /api/disponibilidad?fecha=2026-11-20` 🔒

Respuesta **200**:

```json
{ "fecha": "2026-11-20", "horarios": ["08:00", "12:00", "16:00"] }
```

Solo incluye los horarios libres. Un domingo, una fecha pasada o una fecha a más de 60 días devuelven `"horarios": []`.
Error: **400** si la fecha no tiene el formato `AAAA-MM-DD`.

### `GET /api/reservas` 🔒

Respuesta **200**: un arreglo de `Reserva`. El orden no importa: el frontend las ordena.

### `POST /api/reservas` 🔒

Petición:

```json
{
  "fecha": "2026-11-20",
  "hora": "10:00",
  "direccion": "Calle Los Pinos 245, Zona Sur",
  "cantidadArboles": 2,
  "alturaAproximada": 12.5,
  "notas": "Hay cables de luz cerca de una rama."
}
```

`notas` es opcional. El backend completa `id`, `clienteId` y `clienteNombre` (a partir del token), `estado: "pendiente"` y `creadaEn`.

Respuesta **201**: la `Reserva` creada.

Errores:

| Código | Cuándo |
|---|---|
| 400 | Fecha pasada, a más de 60 días o domingo; hora fuera de los horarios de atención o que ya pasó; dirección de menos de 8 caracteres; `cantidadArboles` no entero o fuera de 1–50; `alturaAproximada` fuera de 2–40 m; `notas` de más de 500 caracteres |
| 403 | Quien reserva es un administrador |
| 409 | El horario ya está ocupado. El frontend vuelve a pedir la disponibilidad |

### `PATCH /api/reservas/:id/cancelar` 🔒

Sin cuerpo. Respuesta **200**: la `Reserva` actualizada, con `"estado": "cancelada"`.

Errores:

| Código | Cuándo |
|---|---|
| 403 | Un cliente intenta cancelar la reserva de otra persona |
| 404 | La reserva no existe |
| 409 | La reserva ya está `completada` o `cancelada` |
