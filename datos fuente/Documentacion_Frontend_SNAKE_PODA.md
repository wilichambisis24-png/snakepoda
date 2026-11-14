# SNAKE PODA: documentación del frontend

**Equipo Serpiente** · Instituto Técnico TECBA · Sistemas Informáticos · Redes de Computadoras II
Práctica grupal UT5 y UT6 · Docente: Ing. José Luis Yacelly R.
Estado al 14 de noviembre de 2026.

## 1. Qué es

SNAKE PODA es la página web del servicio de poda en altura con un robot con forma de serpiente. El robot trepa por el tronco, avanza por la rama, se enrosca en ella y la corta por presión. El operario lo controla desde el suelo.

El robot todavía no existe físicamente, así que la web lo **demuestra con una simulación 3D**. Además, los clientes pueden **agendar el servicio**.

Este documento describe el **frontend**: lo que ve y usa la persona en el navegador. El backend (API y base de datos) lo desarrolla otro integrante. Lo que el frontend espera del backend está en [`docs/API.md`](../docs/API.md).

Repositorio: https://github.com/wilichambisis24-png/snakepoda

## 2. Avance por fases

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Base de la app, inicio de sesión, registro, páginas protegidas y menú | Terminada |
| 2 | Sección Funcionamiento: simulación 3D del robot | Terminada |
| 3 | Sección Reservas: agendar, ver y cancelar citas. Página de inicio con la presentación del grupo | Terminada |
| 4 | Panel del administrador: confirmar reservas y marcarlas como completadas | Pendiente |
| 5 | Conexión con el backend real y publicación en Cloudflare Pages | Pendiente |

## 3. Cómo ejecutarlo

Se necesita Node.js (versión 22 o superior) y npm.

```bash
npm install     # solo la primera vez
npm run dev     # abre http://localhost:5173
```

Otros comandos:

| Comando | Para qué sirve |
|---|---|
| `npm run build` | Revisa los tipos y genera la versión para publicar en la carpeta `dist/` |
| `npm run preview` | Muestra en el navegador la versión generada con `build` |
| `npm run lint` | Revisa el código en busca de errores comunes |

### Cuentas de prueba

Mientras no haya backend, la app funciona en **modo simulado** (ver la sección 7) y trae estas cuentas:

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | cliente@demo.com | cliente123 |
| Administrador | admin@snakepoda.com | admin123 |

También se puede crear una cuenta nueva desde "Crear cuenta". Las cuentas nuevas siempre tienen rol cliente.

## 4. Páginas

| Página | Dirección | Quién entra |
|---|---|---|
| Iniciar sesión | `/login` | Personas sin sesión |
| Crear cuenta | `/registro` | Personas sin sesión |
| Inicio | `/` | Cliente y administrador |
| Funcionamiento | `/funcionamiento` | Cliente y administrador |
| Reservas | `/reservas` | Cliente y administrador |

- Si alguien sin sesión abre una página protegida, va al login. Después de entrar vuelve a la página que quería ver.
- La sesión sigue abierta al recargar la página.
- Una dirección que no existe muestra "Página no encontrada".

### Inicio: presentación del grupo

- **Portada:** el nombre del grupo, el producto y un dibujo del robot. Debajo, una ficha con la carrera, la práctica, el docente y el dominio.
- **Nuestro equipo:** una tarjeta por integrante con su rol y sus tareas.
- **El proyecto en tres ideas:** el problema, la solución y la plataforma.
- **Cómo llega la página a tu pantalla:** diagrama Navegador → Cloudflare → Vercel → Neon, con los puertos y dominios de la guía UT5/UT6.

Los nombres de los integrantes se escriben en `src/contenido/equipo.ts`. Un integrante sin nombre aparece como "Por confirmar".

### Funcionamiento: simulación 3D

Un árbol con 4 ramas (A, B, C y D) y el robot serpiente en el suelo, junto al operario.

1. Se elige una rama, en el panel o haciendo clic sobre ella en el árbol.
2. Se presiona **Iniciar poda**. El robot cumple 4 pasos y el panel indica en cuál va:
   1. Trepa en espiral por el tronco.
   2. Avanza por la rama hasta el punto de corte.
   3. Se enrosca y aprieta hasta cortarla. La parte cortada cae al suelo con física real.
   4. Se desenrosca y baja.
3. Se puede repetir con otra rama hasta podarlas todas.

Controles:
- Pausar o continuar.
- Velocidad ×0.5, ×1 o ×2.
- Reiniciar.
- Cámara que sigue al robot y botón para centrar la vista.
- Con el ratón: arrastrar gira la vista y la rueda acerca. En el celular: pellizcar acerca.

Si el navegador no puede mostrar gráficos 3D, la página muestra un aviso en lugar de quedar en blanco.

### Reservas

**El cliente** ve el formulario a la izquierda y sus reservas a la derecha.

- Para agendar:
  1. Elige la fecha. Luego ve **solo los horarios libres** de ese día.
  2. Completa la dirección, la cantidad de árboles, la altura aproximada en metros y, si quiere, notas.
  3. La reserva se crea en estado **pendiente**.
- Sus reservas se dividen en **Próximas** e **Historial**. Cada una muestra su estado con un color.
- Puede **cancelar** una reserva próxima. Antes, la página pide confirmar.
- Si otra persona toma el mismo horario un momento antes, aparece un aviso y se vuelven a cargar los horarios libres.

**El administrador** ve las reservas de **todos** los clientes, con el nombre de cada uno, en dos columnas: Próximas e Historial. Puede cancelarlas, pero no crear reservas. Confirmarlas y marcarlas como completadas llega en la fase 4.

## 5. Roles y permisos

| Acción | Cliente | Administrador |
|---|---|---|
| Ver Inicio y Funcionamiento | Sí | Sí |
| Crear una reserva | Sí | No |
| Ver reservas | Solo las suyas | Todas |
| Cancelar una reserva pendiente o confirmada | Solo las suyas | Todas |
| Confirmar o completar una reserva | No | Sí (fase 4) |

## 6. Reglas de la agenda

- Hay **un solo equipo de poda**, así que cada horario admite una sola reserva activa.
- Horarios de llegada: **08:00, 10:00, 12:00, 14:00 y 16:00**. Cada visita dura unas 2 horas.
- Se atiende de **lunes a sábado**.
- Se reserva desde hoy hasta **60 días** adelante. Los horarios de hoy que ya pasaron no aparecen.
- Datos válidos:
  - La dirección tiene al menos 8 caracteres.
  - Se pueden pedir de 1 a 50 árboles.
  - La altura va de 2 a 40 m.
  - Las notas tienen como máximo 500 caracteres.
- Estados de una reserva: **pendiente** (recién creada), **confirmada**, **completada** y **cancelada**. Solo se pueden cancelar las pendientes y las confirmadas.

Estas reglas están en `src/reservas/reglas.ts` y en el modo simulado. El backend debe aplicar las mismas.

## 7. Modo simulado y conexión con el backend

El frontend no depende del backend para funcionar:

- **Modo simulado:** se activa cuando no hay una URL de backend configurada. Los usuarios y las reservas se guardan en el navegador (localStorage). Así se puede desarrollar y presentar sin servidor. Incluye 3 reservas de ejemplo.
- **Backend real:**
  1. Copiar `.env.example` como `.env.local`.
  2. Escribir la dirección del backend en esa copia, por ejemplo `VITE_API_URL=http://localhost:3000` (en producción, `https://api.snakepoda.com`).
  3. Reiniciar `npm run dev`.

Con el backend real:
- El frontend envía el token de sesión en la cabecera `Authorization: Bearer <token>`.
- Si el backend responde 401 (sesión vencida), el frontend cierra la sesión y lleva al login.

Rutas que usa el frontend. El detalle de cada una está en [`docs/API.md`](../docs/API.md).

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/auth/registro` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Confirmar que la sesión sigue válida |
| GET | `/api/disponibilidad?fecha=AAAA-MM-DD` | Horarios libres de un día |
| GET | `/api/reservas` | Lista de reservas |
| POST | `/api/reservas` | Crear una reserva |
| PATCH | `/api/reservas/:id/cancelar` | Cancelar una reserva |
| PATCH | `/api/reservas/:id/estado` | Cambiar el estado (fase 4) |

## 8. Tecnologías

| Para qué | Herramienta |
|---|---|
| Base de la aplicación | React 19 + TypeScript + Vite 8 |
| Páginas y rutas | React Router 7 |
| Estado (sesión y simulación) | Zustand 5 |
| Gráficos 3D | Three.js con React Three Fiber y Drei |
| Física (la rama que cae) | Rapier (@react-three/rapier) |
| Revisión de código | ESLint |

La simulación 3D se descarga solo al abrir la página Funcionamiento. Así, el login y las otras páginas cargan rápido.

## 9. Organización del código

```
src/
├── api/          Llamadas al backend y modo simulado (api/simulado/)
├── componentes/  Partes reutilizables: diseño de páginas, logo, íconos
├── contenido/    Textos del producto y datos del equipo (equipo.ts)
├── demo/         Simulación 3D del robot
├── paginas/      Una pantalla por archivo
├── reservas/     Formulario, lista, fechas y reglas de las reservas
├── rutas/        Protección de páginas según la sesión y el rol
├── store/        Estado global de la sesión
├── config.ts     Nombre del producto y URL del backend
└── index.css     Estilos de toda la app
```

El nombre del producto se cambia en un solo lugar: `src/config.ts`.

## 10. Pruebas realizadas

- La app compila sin errores de tipos (`npm run build`) y pasa la revisión de `npm run lint`.
- Acceso, probado en Chrome:
  - Las páginas protegidas sin sesión llevan al login.
  - Un correo o contraseña incorrectos muestran un error.
  - Después del login vuelve a la página pedida.
  - La sesión sigue al recargar.
  - Cerrar sesión, crear cuenta (con la validación de contraseñas) y la página 404 funcionan.
  - En celular no hay desplazamiento horizontal.
- Simulación 3D: carga las 4 ramas sin errores. Si el navegador no tiene 3D, muestra el aviso.
- Reservas: 25 pruebas automáticas de las reglas, todas correctas:
  - Horarios ocupados y liberados al cancelar.
  - Domingos, fechas pasadas y fechas a más de 60 días.
  - Datos inválidos y horario tomado dos veces.
  - Permisos de cliente y administrador.
  - Cancelar dos veces.
- Revisión visual de Inicio (computadora y celular) y de las reservas del administrador.

## 11. Pendientes

- Escribir los nombres de los integrantes en `src/contenido/equipo.ts`.
- Fase 4: panel del administrador para confirmar reservas y marcarlas como completadas.
- Fase 5: conectar con el backend real, que debe aplicar las reglas de la sección 6, y publicar en Cloudflare Pages con el dominio snakepoda.com.
