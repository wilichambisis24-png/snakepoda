import { BrowserRouter, Route, Routes } from 'react-router'
import { DisenoAcceso } from './componentes/DisenoAcceso'
import { DisenoApp } from './componentes/DisenoApp'
import { Funcionamiento } from './paginas/Funcionamiento'
import { Inicio } from './paginas/Inicio'
import { Login } from './paginas/Login'
import { NoEncontrada } from './paginas/NoEncontrada'
import { Registro } from './paginas/Registro'
import { Reservas } from './paginas/Reservas'
import { RutaProtegida, RutaPublica } from './rutas/Guardias'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas sin sesión */}
        <Route element={<RutaPublica />}>
          <Route element={<DisenoAcceso />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
          </Route>
        </Route>

        {/* Páginas que requieren iniciar sesión */}
        <Route element={<RutaProtegida />}>
          <Route element={<DisenoApp />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/funcionamiento" element={<Funcionamiento />} />
            <Route path="/reservas" element={<Reservas />} />
          </Route>
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </BrowserRouter>
  )
}
