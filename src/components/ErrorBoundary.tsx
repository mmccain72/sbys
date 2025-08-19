import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development, but avoid exposing stack traces in production
    if (process.env.NODE_ENV === "development") {
      console.error("Uncaught error:", error, errorInfo);
    } else {
      // In production, log to error tracking service (e.g., Sentry)
      // Avoid exposing sensitive information
      console.error("Application error occurred");
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI or provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI (production-safe, no stack traces)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = "/"}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Go to Home
                </button>
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-600">
                    Dev Only: {this.state.error.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for product components
export class ProductErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("Product component error:", error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <p className="text-yellow-800">
              Unable to load this product. Please try again later.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = () => setError(null);
  const captureError = (error: Error) => setError(error);

  return { captureError, resetError };
};