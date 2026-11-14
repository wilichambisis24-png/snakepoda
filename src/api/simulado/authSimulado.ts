import { ApiError, type DatosLogin, type DatosRegistro, type Sesion, type Usuario } from '../tipos'
import { esperar, generarId, guardar, leer } from './almacen'

// Solo para el modo simulado: las contraseñas se guardan en texto plano en el navegador.
// El backend real debe guardarlas cifradas (bcrypt o similar).
interface UsuarioGuardado extends Usuario {
  password: string
}

const CLAVE_USUARIOS = 'snakepoda.simulado.usuarios'

/** Cuentas de prueba que existen siempre en el modo simulado. */
export const CUENTAS_DEMO = [
  { etiqueta: 'Cliente', email: 'cliente@demo.com', password: 'cliente123' },
  { etiqueta: 'Administrador', email: 'admin@snakepoda.com', password: 'admin123' },
] as const

const USUARIOS_INICIALES: UsuarioGuardado[] = [
  {
    id: 'u-cliente-demo',
    nombre: 'Cliente Demo',
    email: 'cliente@demo.com',
    telefono: '70000000',
    rol: 'cliente',
    password: 'cliente123',
  },
  {
    id: 'u-admin-demo',
    nombre: 'Administrador',
    email: 'admin@snakepoda.com',
    rol: 'admin',
    password: 'admin123',
  },
]

function usuarios(): UsuarioGuardado[] {
  return leer(CLAVE_USUARIOS, USUARIOS_INICIALES)
}

function sinPassword({ id, nombre, email, telefono, rol }: UsuarioGuardado): Usuario {
  return { id, nombre, email, telefono, rol }
}

// El token simulado lleva el id del usuario: "simulado.<id>.<aleatorio>".
function crearSesion(usuario: UsuarioGuardado): Sesion {
  return { token: `simulado.${usuario.id}.${generarId('t')}`, usuario: sinPassword(usuario) }
}

export async function login({ email, password }: DatosLogin): Promise<Sesion> {
  await esperar()
  const usuario = usuarios().find((u) => u.email === email.trim().toLowerCase())
  if (!usuario || usuario.password !== password) {
    throw new ApiError(401, 'Correo o contraseña incorrectos.')
  }
  return crearSesion(usuario)
}

export async function registro(datos: DatosRegistro): Promise<Sesion> {
  await esperar()
  const lista = usuarios()
  const email = datos.email.trim().toLowerCase()
  if (lista.some((u) => u.email === email)) {
    throw new ApiError(409, 'Ya existe una cuenta con ese correo.')
  }
  const nuevo: UsuarioGuardado = {
    id: generarId('u'),
    nombre: datos.nombre.trim(),
    email,
    telefono: datos.telefono?.trim() || undefined,
    rol: 'cliente',
    password: datos.password,
  }
  guardar(CLAVE_USUARIOS, [...lista, nuevo])
  return crearSesion(nuevo)
}

/** Usuario dueño del token simulado. Lanza 401 si el token no es válido. */
export function usuarioDeToken(token: string | null): Usuario {
  const id = token?.split('.')[1]
  const usuario = usuarios().find((u) => u.id === id)
  if (!usuario) throw new ApiError(401, 'Tu sesión expiró. Vuelve a iniciar sesión.')
  return sinPassword(usuario)
}

export async function perfil(token: string | null): Promise<Usuario> {
  await esperar(200)
  return usuarioDeToken(token)
}
