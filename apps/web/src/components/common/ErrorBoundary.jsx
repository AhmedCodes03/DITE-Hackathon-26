import React from "react";
import { captureException } from "../../lib/sentry";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, _info) {
    captureException(error).catch(() => {});
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-fallback">
          <div
            className="surface-panel"
            style={{
              maxWidth: "480px",
              margin: "80px auto",
              padding: "40px",
              textAlign: "center"
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "48px",
                color: "var(--color-error, #d32f2f)",
                marginBottom: "16px",
                display: "block"
              }}
            >
              error_outline
            </span>
            <h2 className="page-title" style={{ marginBottom: "8px" }}>
              Something went wrong
            </h2>
            <p className="page-subtitle" style={{ marginBottom: "24px" }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              className="interactive"
              onClick={this.handleReset}
              style={{ marginRight: "12px" }}
            >
              Try Again
            </button>
            <button
              className="interactive"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
