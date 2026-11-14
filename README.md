# SNAKE PODA — Frontend

Página web para ofrecer el servicio de poda en altura con un robot serpiente que trepa el tronco, se enrosca en las ramas y las poda por presión. Tiene control de acceso y dos secciones:

1. **Funcionamiento:** demostración 3D del producto.
2. **Reservas:** agenda de citas para los clientes.

> El nombre del producto es provisional. Se cambia en un solo lugar: `src/config.ts`.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173

Sin backend, la app funciona en **modo simulado**: guarda los datos en el navegador e incluye dos cuentas de prueba.

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | cliente@demo.com | cliente123 |
| Administrador | admin@snakepoda.com | admin123 |

## Conectar con el backend

1. Copia `.env.example` como `.env.local`.
2. Escribe la URL del backend, por ejemplo `VITE_API_URL=http://localhost:3000`.
3. Reinicia `npm run dev`.

Lo que el frontend espera del backend (rutas, datos y errores) está en [docs/API.md](docs/API.md).

## Tecnologías

React, TypeScript y Vite · React Router (páginas) · Zustand (sesión y estado de la demo) · Three.js, React Three Fiber y Rapier (simulación 3D).

## Estructura

```
src/
├── api/          Llamadas al backend y modo simulado (api/simulado/)
├── componentes/  Partes reutilizables: diseño de páginas, logo
├── demo/         Simulación 3D del robot (sección Funcionamiento)
├── contenido/    Textos del producto
├── paginas/      Una pantalla por archivo
├── reservas/     Formulario, lista, fechas y reglas de las reservas
├── rutas/        Protección de páginas según la sesión y el rol
├── store/        Estado global (sesión)
└── config.ts     Nombre del producto y URL del backend
```

## Fases

- [x] **Fase 1:** base de la app, login, registro, páginas protegidas y navegación.
- [x] **Fase 2:** sección Funcionamiento con la simulación 3D del robot.
- [x] **Fase 3:** sección Reservas: agendar, ver y cancelar citas.
- [ ] **Fase 4:** panel del administrador para gestionar todas las reservas.
- [ ] **Fase 5:** conexión con el backend real, ajustes finales y publicación.
