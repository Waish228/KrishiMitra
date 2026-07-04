import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl max-w-2xl w-full">
            <h2 className="text-xl font-bold text-red-500 mb-4">React App Crashed</h2>
            <div className="bg-slate-950 p-4 rounded text-red-400 font-mono text-sm overflow-auto max-h-64 mb-4">
              {this.state.error && this.state.error.toString()}
            </div>
            <div className="bg-slate-950 p-4 rounded text-gray-400 font-mono text-xs overflow-auto max-h-64">
              {this.state.errorInfo?.componentStack}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
