import { Component } from 'react'
import { CircleAlert } from 'lucide-react'
import { EmptyState } from './ui'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="pt-32">
        <EmptyState
          icon={CircleAlert}
          title="Something melted"
          text="This page hit an unexpected snag. Try again, or head back to the collection."
          action={
            <div className="flex gap-3">
              <button className="btn-gold" onClick={() => this.setState({ error: null })}>Try again</button>
              <a className="btn-ghost" href="#/shop">Shop</a>
            </div>
          }
        />
      </div>
    )
  }
}
