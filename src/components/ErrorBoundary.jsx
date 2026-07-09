import { Component } from 'react';
import StateMessage from './ui/StateMessage.jsx';

/**
 * Class component by necessity: React exposes no hook equivalent of
 * componentDidCatch. This is the only class in the codebase.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // In a real product this is where the report would go to Sentry et al.
    console.error('Unhandled render error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <StateMessage
          tone="error"
          title="Something went wrong"
          description="An unexpected error stopped this page from rendering. Reloading usually fixes it."
          action={{ label: 'Reload page', onClick: () => window.location.reload() }}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
