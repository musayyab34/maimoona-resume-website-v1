import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  onFail: () => void
  children: ReactNode
}

/**
 * §6 guardrail: if the WebGL layer throws for any reason, the descent
 * quietly becomes the static site — never a blank page.
 */
export class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    const detail = error instanceof Error ? (error.stack ?? error.message) : String(error)
    console.warn(`3D scene failed; falling back to the static site. ${detail}`)
    this.props.onFail()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
