import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Lo que se muestra si algo dentro falla (por ejemplo, la escena 3D). */
  respaldo: ReactNode
}

/** Evita que un error en una parte de la página deje toda la pantalla en blanco. */
export class LimiteError extends Component<Props, { hayError: boolean }> {
  state = { hayError: false }

  static getDerivedStateFromError() {
    return { hayError: true }
  }

  render() {
    return this.state.hayError ? this.props.respaldo : this.props.children
  }
}
